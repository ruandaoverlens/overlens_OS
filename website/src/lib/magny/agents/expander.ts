import { createAdminClient } from "@/lib/supabase/admin";

interface ExpanderInput {
  pipelineRunId: string;
  pipelineStepId: string;
}

interface ExpanderOutput {
  totalSourcesAdded: number;
  itemsExpanded: number;
}

interface OpenAISource {
  url: string;
  title: string;
  type: "article" | "statistic" | "report" | "official_statement";
  content_summary: string;
  data_points: Record<string, unknown>;
  divergence: string | null;
}

interface OpenAIExpansionResult {
  sources: OpenAISource[];
  verification_status: "confirmed" | "partially_confirmed" | "disputed";
  notes: string;
}

const SYSTEM_PROMPT = `You are a research analyst performing source expansion and cross-verification.

For the given news item, find 2-3 additional credible sources that:
1. Confirm or contextualize the original claim
2. Provide additional data, statistics, or expert opinions
3. Represent different perspectives if applicable

For each source, return:
- url: the source URL (use real, well-known publication URLs)
- title: descriptive title
- type: "article" | "statistic" | "report" | "official_statement"
- content_summary: 2-3 sentences of relevant content
- data_points: any specific numbers, dates, or facts (as JSON object)
- divergence: note if this source contradicts the original (null if consistent)

Return JSON: { "sources": [...], "verification_status": "confirmed" | "partially_confirmed" | "disputed", "notes": "string" }`;

async function expandNewsItem(
  newsItemId: string,
  title: string,
  summary: string | null,
  originalUrl: string | null
): Promise<OpenAIExpansionResult | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }

  const userMessage = [
    `News Item: ${title}`,
    originalUrl ? `Original URL: ${originalUrl}` : null,
    summary ? `Summary: ${summary}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `OpenAI API error ${response.status}: ${errorText}`
    );
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI returned an empty response");
  }

  const parsed: OpenAIExpansionResult = JSON.parse(content);
  return parsed;
}

async function updatePipelineStep(
  stepId: string,
  fields: {
    status?: string;
    started_at?: string;
    completed_at?: string;
    error_message?: string;
    output_data?: Record<string, unknown>;
    logs?: unknown[];
  }
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("pipeline_steps")
    .update(fields)
    .eq("id", stepId);

  if (error) {
    console.error("[Expander] Failed to update pipeline_step:", error.message);
  }
}

export async function runExpander(
  input: ExpanderInput
): Promise<ExpanderOutput> {
  const { pipelineRunId, pipelineStepId } = input;
  const supabase = createAdminClient();
  const logs: string[] = [];

  const log = (message: string) => {
    const entry = `[${new Date().toISOString()}] ${message}`;
    console.log(`[Expander] ${message}`);
    logs.push(entry);
  };

  // Mark step as running
  await updatePipelineStep(pipelineStepId, {
    status: "running",
    started_at: new Date().toISOString(),
  });

  log(`Starting expander for pipeline run ${pipelineRunId}`);

  // 1. Fetch selected news_items for this pipeline run
  const { data: selectedItems, error: fetchError } = await supabase
    .from("news_items")
    .select("id, title, summary, original_url")
    .eq("pipeline_run_id", pipelineRunId)
    .eq("is_selected", true);

  if (fetchError) {
    const errMsg = `Failed to fetch selected news items: ${fetchError.message}`;
    log(errMsg);
    await updatePipelineStep(pipelineStepId, {
      status: "failed",
      completed_at: new Date().toISOString(),
      error_message: errMsg,
      logs: logs,
    });
    throw new Error(errMsg);
  }

  if (!selectedItems || selectedItems.length === 0) {
    log("No selected news items found for this pipeline run.");
    await updatePipelineStep(pipelineStepId, {
      status: "completed",
      completed_at: new Date().toISOString(),
      output_data: { totalSourcesAdded: 0, itemsExpanded: 0 },
      logs: logs,
    });
    return { totalSourcesAdded: 0, itemsExpanded: 0 };
  }

  log(`Found ${selectedItems.length} selected news item(s) to expand.`);

  let totalSourcesAdded = 0;
  let itemsExpanded = 0;

  // 2. Process each selected item sequentially
  for (let i = 0; i < selectedItems.length; i++) {
    const item = selectedItems[i];
    log(
      `[${i + 1}/${selectedItems.length}] Expanding item "${item.title}" (${item.id})`
    );

    let expansionResult: OpenAIExpansionResult | null = null;

    try {
      expansionResult = await expandNewsItem(
        item.id,
        item.title,
        item.summary ?? null,
        item.original_url ?? null
      );
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      log(
        `  Failed to expand item "${item.title}": ${errMsg}. Skipping.`
      );
      continue;
    }

    if (!expansionResult || !Array.isArray(expansionResult.sources)) {
      log(`  Unexpected response format for item "${item.title}". Skipping.`);
      continue;
    }

    log(
      `  Received ${expansionResult.sources.length} source(s). Verification: ${expansionResult.verification_status}.`
    );
    if (expansionResult.notes) {
      log(`  Notes: ${expansionResult.notes}`);
    }

    // 3. Save news_sources records
    const sourcesToInsert = expansionResult.sources.map((source) => ({
      news_item_id: item.id,
      url: source.url ?? null,
      title: source.title ?? null,
      type: source.type ?? null,
      content_summary: source.content_summary ?? null,
      data_points: source.data_points ?? {},
    }));

    if (sourcesToInsert.length > 0) {
      const { error: insertError, data: insertedSources } = await supabase
        .from("news_sources")
        .insert(sourcesToInsert)
        .select("id");

      if (insertError) {
        log(
          `  Failed to insert sources for item "${item.title}": ${insertError.message}. Skipping.`
        );
        continue;
      }

      const insertedCount = insertedSources?.length ?? 0;
      totalSourcesAdded += insertedCount;
      itemsExpanded += 1;
      log(`  Saved ${insertedCount} source(s) to database.`);
    } else {
      log(`  No sources to save for item "${item.title}".`);
    }
  }

  log(
    `Expander complete. Items expanded: ${itemsExpanded}, total sources added: ${totalSourcesAdded}.`
  );

  // 4. Update pipeline_step to completed
  await updatePipelineStep(pipelineStepId, {
    status: "completed",
    completed_at: new Date().toISOString(),
    output_data: { totalSourcesAdded, itemsExpanded },
    logs: logs,
  });

  return { totalSourcesAdded, itemsExpanded };
}
