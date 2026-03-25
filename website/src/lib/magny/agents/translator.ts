import { createAdminClient } from "@/lib/supabase/admin";

// ============================================================
// Types
// ============================================================

interface TranslatorInput {
  pipelineRunId: string;
  pipelineStepId: string;
}

interface TranslatorOutput {
  translatedCount: number;
  skippedCount: number;
  totalItems: number;
}

interface NewsItemRow {
  id: string;
  title: string;
  summary: string | null;
  metadata: Record<string, unknown>;
}

interface TranslatedItem {
  id: string;
  title: string;
  summary: string;
}

// ============================================================
// Constants
// ============================================================

const BATCH_SIZE = 10;

const SYSTEM_PROMPT = `You are a professional translator. Translate news headlines and summaries from English (or any language) to Brazilian Portuguese (pt-BR).

Rules:
- Keep proper nouns, brand names, and technical terms that are commonly used in English (e.g. "AI", "machine learning", "startup", "cloud") as-is or use the accepted pt-BR form.
- If the text is ALREADY in pt-BR, return it unchanged.
- Maintain the original meaning and tone. Keep it natural — avoid literal translations that sound robotic.
- Keep translations concise — do not add or remove information.
- Remove any trailing artifacts like "[…]", "[...]", "Read Article", or incomplete sentences ending with "…"

Return a JSON object with a "translations" array: { "translations": [{ "id": "uuid", "title": "translated title", "summary": "translated summary" }] }`;

// ============================================================
// HTML Entity Cleanup
// ============================================================

/** Common HTML numeric and named entities found in RSS feeds. */
const HTML_ENTITIES: Record<string, string> = {
  "&#8217;": "\u2019", // right single quote '
  "&#8216;": "\u2018", // left single quote '
  "&#8220;": "\u201C", // left double quote "
  "&#8221;": "\u201D", // right double quote "
  "&#8230;": "\u2026", // ellipsis …
  "&#160;":  " ",       // non-breaking space
  "&#233;":  "\u00E9", // é
  "&#8364;": "\u20AC", // €
  "&#39;":   "'",
  "&amp;":   "&",
  "&quot;":  '"',
  "&lt;":    "<",
  "&gt;":    ">",
  "&nbsp;":  " ",
  "&apos;":  "'",
};

/**
 * Decodes known HTML entities and cleans up trailing RSS artifacts
 * like "[…]", "[...]", and "Read Article".
 */
function cleanHtmlArtifacts(text: string): string {
  let cleaned = text;

  // Replace known named/numeric entities
  for (const [entity, replacement] of Object.entries(HTML_ENTITIES)) {
    cleaned = cleaned.replaceAll(entity, replacement);
  }

  // Decode any remaining numeric entities (decimal &#NNN; and hex &#xHHH;)
  cleaned = cleaned.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
    String.fromCodePoint(parseInt(hex, 16))
  );
  cleaned = cleaned.replace(/&#(\d+);/g, (_, dec) =>
    String.fromCodePoint(parseInt(dec, 10))
  );

  // Remove trailing artifacts
  cleaned = cleaned.replace(/\s*\[\u2026\]\s*$/, "");  // […]
  cleaned = cleaned.replace(/\s*\[\.{3}\]\s*$/, "");    // [...]
  cleaned = cleaned.replace(/\s*Read Article\s*$/i, "");

  return cleaned.trim();
}

// ============================================================
// Pipeline Step Logger
// ============================================================

async function updatePipelineStep(
  pipelineStepId: string,
  update: {
    status?: "pending" | "running" | "completed" | "failed";
    logMessage?: string;
    outputData?: Record<string, unknown>;
    errorMessage?: string;
  }
) {
  const supabase = createAdminClient();

  const { data: current, error: fetchError } = await supabase
    .from("pipeline_steps")
    .select("logs")
    .eq("id", pipelineStepId)
    .single();

  if (fetchError) {
    console.error("[Translator] Failed to fetch pipeline step for update:", fetchError);
    return;
  }

  const existingLogs: Array<{ ts: string; message: string }> = Array.isArray(
    current?.logs
  )
    ? (current.logs as Array<{ ts: string; message: string }>)
    : [];

  const newLogs = update.logMessage
    ? [
        ...existingLogs,
        { ts: new Date().toISOString(), message: update.logMessage },
      ]
    : existingLogs;

  const patch: Record<string, unknown> = { logs: newLogs };
  if (update.status) patch.status = update.status;
  if (update.status === "running" && !patch.started_at)
    patch.started_at = new Date().toISOString();
  if (update.status === "completed" || update.status === "failed")
    patch.completed_at = new Date().toISOString();
  if (update.outputData) patch.output_data = update.outputData;
  if (update.errorMessage) patch.error_message = update.errorMessage;

  const { error: updateError } = await supabase
    .from("pipeline_steps")
    .update(patch)
    .eq("id", pipelineStepId);

  if (updateError) {
    console.error("[Translator] Failed to update pipeline step:", updateError);
  }
}

// ============================================================
// OpenAI Translation Call
// ============================================================

async function translateBatch(items: NewsItemRow[]): Promise<TranslatedItem[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }

  const userPrompt = items
    .map(
      (item) =>
        `ID: ${item.id}\nTitle: ${item.title}\nSummary: ${item.summary ?? "(no summary)"}`
    )
    .join("\n\n---\n\n");

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
        {
          role: "user",
          content: `Translate the following ${items.length} news items to pt-BR:\n\n${userPrompt}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    }),
    signal: AbortSignal.timeout(60_000),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `OpenAI API request failed with status ${response.status}: ${errorBody}`
    );
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("OpenAI returned an empty response");
  }

  const parsed = JSON.parse(content) as { translations?: TranslatedItem[] };

  if (!Array.isArray(parsed?.translations)) {
    throw new Error(
      `OpenAI response missing 'translations' array: ${content}`
    );
  }

  return parsed.translations;
}

// ============================================================
// Main: runTranslator (resumable)
// ============================================================

export async function runTranslator(
  input: TranslatorInput
): Promise<TranslatorOutput> {
  const { pipelineRunId, pipelineStepId } = input;
  const supabase = createAdminClient();

  console.log(`[Translator] Starting — pipeline_run_id=${pipelineRunId}`);

  await updatePipelineStep(pipelineStepId, {
    status: "running",
    logMessage: "Translator agent started",
  });

  // 1. Fetch ALL news_items for this pipeline run
  const { data: allItems, error: fetchError } = await supabase
    .from("news_items")
    .select("id, title, summary, metadata")
    .eq("pipeline_run_id", pipelineRunId);

  if (fetchError) {
    const msg = `Failed to fetch news items: ${fetchError.message}`;
    console.error(`[Translator] ${msg}`);
    await updatePipelineStep(pipelineStepId, {
      status: "failed",
      logMessage: msg,
      errorMessage: fetchError.message,
    });
    throw new Error(msg);
  }

  const items = (allItems ?? []) as NewsItemRow[];

  if (items.length === 0) {
    console.log("[Translator] No news items to translate");
    await updatePipelineStep(pipelineStepId, {
      status: "completed",
      logMessage: "No news items found — nothing to translate",
      outputData: { translatedCount: 0, skippedCount: 0, totalItems: 0 },
    });
    return { translatedCount: 0, skippedCount: 0, totalItems: 0 };
  }

  // 2. Split into already-translated and pending items
  const alreadyTranslated = items.filter(
    (item) => (item.metadata as Record<string, unknown>)?.translated_at
  );
  const pendingItems = items.filter(
    (item) => !(item.metadata as Record<string, unknown>)?.translated_at
  );

  if (alreadyTranslated.length > 0) {
    console.log(
      `[Translator] Resuming — ${alreadyTranslated.length} already translated, ${pendingItems.length} remaining`
    );
    await updatePipelineStep(pipelineStepId, {
      logMessage: `Resuming — ${alreadyTranslated.length}/${items.length} already translated, ${pendingItems.length} remaining`,
    });
  }

  if (pendingItems.length === 0) {
    console.log("[Translator] All items already translated (resume path)");
    await updatePipelineStep(pipelineStepId, {
      status: "completed",
      logMessage: `All ${items.length} items already translated`,
      outputData: {
        translatedCount: alreadyTranslated.length,
        skippedCount: 0,
        totalItems: items.length,
      },
    });
    return {
      translatedCount: alreadyTranslated.length,
      skippedCount: 0,
      totalItems: items.length,
    };
  }

  console.log(`[Translator] Found ${pendingItems.length} items to process`);

  // 3. Clean HTML entities and RSS artifacts on pending items
  let cleanedCount = 0;
  for (const item of pendingItems) {
    const cleanTitle = cleanHtmlArtifacts(item.title);
    const cleanSummary = item.summary ? cleanHtmlArtifacts(item.summary) : null;

    if (cleanTitle !== item.title || cleanSummary !== item.summary) {
      cleanedCount++;
      item.title = cleanTitle;
      item.summary = cleanSummary;

      await supabase
        .from("news_items")
        .update({ title: cleanTitle, summary: cleanSummary })
        .eq("id", item.id);
    }
  }

  if (cleanedCount > 0) {
    console.log(`[Translator] Cleaned HTML artifacts from ${cleanedCount} items`);
    await updatePipelineStep(pipelineStepId, {
      logMessage: `Cleaned HTML artifacts from ${cleanedCount}/${pendingItems.length} items`,
    });
  }

  await updatePipelineStep(pipelineStepId, {
    logMessage: `Found ${pendingItems.length} news items to translate`,
  });

  // 4. Process in batches — mark each item as translated immediately
  let translatedCount = alreadyTranslated.length;
  let skippedCount = 0;

  for (let i = 0; i < pendingItems.length; i += BATCH_SIZE) {
    const batch = pendingItems.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(pendingItems.length / BATCH_SIZE);

    console.log(
      `[Translator] Processing batch ${batchNum}/${totalBatches} (${batch.length} items)`
    );

    try {
      const translations = await translateBatch(batch);

      // Build a map of id -> translated content
      const translationMap = new Map<string, TranslatedItem>();
      for (const t of translations) {
        if (t.id && t.title) {
          translationMap.set(t.id, t);
        }
      }

      // Update each item in the database and mark as translated
      for (const original of batch) {
        const translated = translationMap.get(original.id);
        const now = new Date().toISOString();

        if (!translated) {
          // Still mark as translated so we don't retry it
          await supabase
            .from("news_items")
            .update({
              metadata: { ...original.metadata, translated_at: now },
            })
            .eq("id", original.id);
          skippedCount++;
          continue;
        }

        const titleChanged = translated.title !== original.title;
        const summaryChanged =
          translated.summary !== (original.summary ?? "");

        if (!titleChanged && !summaryChanged) {
          // Already in pt-BR — mark translated and skip
          await supabase
            .from("news_items")
            .update({
              metadata: { ...original.metadata, translated_at: now },
            })
            .eq("id", original.id);
          skippedCount++;
          continue;
        }

        const { error: updateError } = await supabase
          .from("news_items")
          .update({
            title: translated.title,
            summary: translated.summary || original.summary,
            metadata: { ...original.metadata, translated_at: now },
          })
          .eq("id", original.id);

        if (updateError) {
          console.error(
            `[Translator] Failed to update item ${original.id}:`,
            updateError
          );
          continue;
        }

        translatedCount++;
      }

      await updatePipelineStep(pipelineStepId, {
        logMessage: `Batch ${batchNum}/${totalBatches}: ${translationMap.size} translated, ${batch.length - translationMap.size} skipped`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[Translator] Batch ${batchNum} failed:`, message);
      await updatePipelineStep(pipelineStepId, {
        logMessage: `Batch ${batchNum}/${totalBatches} failed: ${message}`,
      });
      // Re-throw to let orchestrator handle retries
      throw err;
    }
  }

  // 5. Mark step as completed
  console.log(
    `[Translator] Done — ${translatedCount} translated, ${skippedCount} skipped (already pt-BR or unchanged)`
  );

  await updatePipelineStep(pipelineStepId, {
    status: "completed",
    logMessage: `Translator completed — ${translatedCount} translated, ${skippedCount} skipped`,
    outputData: {
      translatedCount,
      skippedCount,
      totalItems: items.length,
    },
  });

  return {
    translatedCount,
    skippedCount,
    totalItems: items.length,
  };
}
