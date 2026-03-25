import { createAdminClient } from "@/lib/supabase/admin";

interface SelectorInput {
  pipelineRunId: string;
  pipelineStepId: string;
}

interface SelectorOutput {
  selectedCount: number;
  totalEvaluated: number;
}

interface NewsItem {
  id: string;
  title: string;
  summary: string | null;
  original_url: string | null;
  category: string | null;
  relevance_score: number | null;
  confidence_level: string | null;
  time_horizon: string | null;
}

interface ItemScores {
  utilidade_pratica: number;
  novidade_real: number;
  impacto_ecossistema: number;
  relevancia_vanguarda: number;
  potencial_inspiracao: number;
}

interface SelectionEntry {
  news_item_id: string;
  total_score: number;
  scores: ItemScores;
  justification: string;
}

interface OpenAISelectionResponse {
  selections: SelectionEntry[];
}

const SYSTEM_PROMPT = `Você é um curador sênior de inteligência para a comunidade Vanguarda — fundadores, makers e criadores que usam IA/tech para construir.

O seu viés é UTILITARISTA: priorize o que é útil, inspira, alerta, provoca e move à ação.

Avalie cada notícia nos 5 critérios abaixo (nota 1-10 cada). O critério "Utilidade Prática" tem PESO DOBRADO no total.

1. **Utilidade Prática** (peso 2x) — Pode ser usado para decidir, construir ou evitar erro? Há algo acionável?
2. **Novidade Real** — Mudança genuína vs repetição de tendência conhecida?
3. **Impacto no Ecossistema** — Efeito em mercados, ferramentas, comportamentos?
4. **Relevância Vanguarda** — Alinhamento com os 3 pilares (tecnologia, negócios, criação)?
5. **Potencial de Inspiração/Alerta** — Move à ação? Provoca reflexão estratégica?

Selecione as TOP 10 notícias. REGRA DE DIVERSIDADE OBRIGATÓRIA:
- MÍNIMO 3 itens por categoria (tecnologia, negocios, criacao) — os 3 pilares DEVEM estar presentes
- MÁXIMO 4 itens por categoria — nenhum pilar domina o relatório

O total_score deve ser calculado como: (utilidade_pratica * 2) + novidade_real + impacto_ecossistema + relevancia_vanguarda + potencial_inspiracao (máximo 60).

Retorne JSON: { "selections": [{ "news_item_id": "uuid", "total_score": number, "scores": { "utilidade_pratica": n, "novidade_real": n, "impacto_ecossistema": n, "relevancia_vanguarda": n, "potencial_inspiracao": n }, "justification": "string em português" }] }`;

const MIN_ITEMS_PER_CATEGORY = 3;
const MAX_ITEMS_PER_CATEGORY = 4;
const TOP_N = 10;
/** Max items to send to the LLM for evaluation (pre-filtered by relevance_score). */
const MAX_ITEMS_FOR_LLM = 50;

function buildUserPrompt(items: NewsItem[]): string {
  const formatted = items
    .map((item, index) => {
      return [
        `Item ${index + 1}`,
        `ID: ${item.id}`,
        `Title: ${item.title}`,
        `Category: ${item.category ?? "unknown"}`,
        `Summary: ${item.summary ?? "(no summary)"}`,
        `URL: ${item.original_url ?? "(no url)"}`,
        `Confidence: ${item.confidence_level ?? "unknown"}`,
        `Time Horizon: ${item.time_horizon ?? "unknown"}`,
      ].join("\n");
    })
    .join("\n\n---\n\n");

  return `Here are ${items.length} news items to evaluate:\n\n${formatted}\n\nEvaluate all items and return the top 10 selection as described in your instructions.`;
}

const PILARES = ["tecnologia", "negocios", "criacao"] as const;

/**
 * Two-pass diversity algorithm:
 * 1. First pass: fill the floor (MIN_ITEMS_PER_CATEGORY) for each pilar, picking top-scored items
 * 2. Second pass: fill remaining slots (up to TOP_N) by global score, respecting the ceiling
 */
function enforceCategoryDiversity(
  selections: SelectionEntry[],
  items: NewsItem[]
): SelectionEntry[] {
  const itemCategoryMap = new Map<string, string>();
  for (const item of items) {
    itemCategoryMap.set(item.id, item.category ?? "tecnologia");
  }

  // Sort by total_score descending
  const sorted = [...selections].sort((a, b) => b.total_score - a.total_score);

  const selected: SelectionEntry[] = [];
  const selectedIds = new Set<string>();
  const categoryCount = new Map<string, number>();

  // Pass 1: Fill the floor for each pilar
  for (const pilar of PILARES) {
    const pilarItems = sorted.filter(
      (e) => itemCategoryMap.get(e.news_item_id) === pilar && !selectedIds.has(e.news_item_id)
    );
    const toTake = Math.min(MIN_ITEMS_PER_CATEGORY, pilarItems.length);
    for (let i = 0; i < toTake; i++) {
      selected.push(pilarItems[i]);
      selectedIds.add(pilarItems[i].news_item_id);
      categoryCount.set(pilar, (categoryCount.get(pilar) ?? 0) + 1);
    }
  }

  // Pass 2: Fill remaining slots by global score, respecting ceiling
  for (const entry of sorted) {
    if (selected.length >= TOP_N) break;
    if (selectedIds.has(entry.news_item_id)) continue;

    const category = itemCategoryMap.get(entry.news_item_id) ?? "tecnologia";
    const count = categoryCount.get(category) ?? 0;

    if (count < MAX_ITEMS_PER_CATEGORY) {
      selected.push(entry);
      selectedIds.add(entry.news_item_id);
      categoryCount.set(category, count + 1);
    }
  }

  // Fallback: if still under TOP_N (unlikely), fill from any remaining
  if (selected.length < TOP_N) {
    for (const entry of sorted) {
      if (selected.length >= TOP_N) break;
      if (selectedIds.has(entry.news_item_id)) continue;
      selected.push(entry);
      selectedIds.add(entry.news_item_id);
    }
  }

  return selected;
}

async function callOpenAI(
  items: NewsItem[]
): Promise<OpenAISelectionResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }

  const userPrompt = buildUserPrompt(items);

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
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `OpenAI API request failed with status ${response.status}: ${errorBody}`
    );
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("OpenAI returned an empty response");
  }

  let parsed: OpenAISelectionResponse;
  try {
    parsed = JSON.parse(content) as OpenAISelectionResponse;
  } catch {
    throw new Error(`Failed to parse OpenAI JSON response: ${content}`);
  }

  if (!Array.isArray(parsed?.selections)) {
    throw new Error(
      `OpenAI response missing 'selections' array: ${JSON.stringify(parsed)}`
    );
  }

  return parsed;
}

export async function runSelector(
  input: SelectorInput
): Promise<SelectorOutput> {
  const { pipelineRunId, pipelineStepId } = input;
  const supabase = createAdminClient();

  // Mark the step as running
  await supabase
    .from("pipeline_steps")
    .update({
      status: "running",
      started_at: new Date().toISOString(),
    })
    .eq("id", pipelineStepId);

  try {
    // 1. Fetch all news_items for the given pipeline run
    const { data: newsItems, error: fetchError } = await supabase
      .from("news_items")
      .select(
        "id, title, summary, original_url, category, relevance_score, confidence_level, time_horizon"
      )
      .eq("pipeline_run_id", pipelineRunId);

    if (fetchError) {
      throw new Error(`Failed to fetch news items: ${fetchError.message}`);
    }

    if (!newsItems || newsItems.length === 0) {
      throw new Error(
        `No news items found for pipeline run ${pipelineRunId}`
      );
    }

    const totalEvaluated = newsItems.length;

    // 2. Pre-filter: sort by relevance_score descending and keep top N to stay within token limits
    let itemsForLLM = newsItems as NewsItem[];
    if (itemsForLLM.length > MAX_ITEMS_FOR_LLM) {
      itemsForLLM = [...itemsForLLM]
        .sort((a, b) => (b.relevance_score ?? 0) - (a.relevance_score ?? 0))
        .slice(0, MAX_ITEMS_FOR_LLM);
      console.log(
        `[Selector] Pre-filtered ${totalEvaluated} items down to top ${itemsForLLM.length} by relevance_score`
      );
    }

    // 3. Call OpenAI to score and select the top 10
    const openAIResult = await callOpenAI(itemsForLLM);

    // 3. Enforce category diversity
    const diverseSelections = enforceCategoryDiversity(
      openAIResult.selections,
      newsItems as NewsItem[]
    );

    // 4. Update the database: set is_selected = true and relevance_score for the top 10
    const updatePromises = diverseSelections.map((entry) => {
      // Normalize total_score (sum of 5 criteria, max 50) to 0-10 range for the DB constraint
      const normalizedScore = Math.min(10, Math.round((entry.total_score / 5) * 10) / 10);
      return supabase
        .from("news_items")
        .update({
          is_selected: true,
          relevance_score: normalizedScore,
        })
        .eq("id", entry.news_item_id)
        .eq("pipeline_run_id", pipelineRunId);
    });

    const updateResults = await Promise.all(updatePromises);
    for (const result of updateResults) {
      if (result.error) {
        throw new Error(
          `Failed to update news item: ${result.error.message}`
        );
      }
    }

    // 5. Build the ranking justification log
    const rankingLog = diverseSelections.map((entry, index) => {
      const item = (newsItems as NewsItem[]).find(
        (n) => n.id === entry.news_item_id
      );
      return {
        rank: index + 1,
        news_item_id: entry.news_item_id,
        title: item?.title ?? "(unknown)",
        category: item?.category ?? "unknown",
        total_score: entry.total_score,
        scores: entry.scores,
        justification: entry.justification,
      };
    });

    const logs = {
      summary: {
        total_evaluated: totalEvaluated,
        selected_count: diverseSelections.length,
        diversity_enforced: true,
        min_per_category: MIN_ITEMS_PER_CATEGORY,
        max_per_category: MAX_ITEMS_PER_CATEGORY,
      },
      ranking: rankingLog,
      raw_openai_selection_count: openAIResult.selections.length,
    };

    // 6. Mark pipeline step as completed and store logs
    await supabase
      .from("pipeline_steps")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        output_data: {
          selected_count: diverseSelections.length,
          total_evaluated: totalEvaluated,
          selected_item_ids: diverseSelections.map((e) => e.news_item_id),
        },
        logs,
      })
      .eq("id", pipelineStepId);

    return {
      selectedCount: diverseSelections.length,
      totalEvaluated,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);

    // Mark the pipeline step as failed
    await supabase
      .from("pipeline_steps")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
        error_message: errorMessage,
      })
      .eq("id", pipelineStepId);

    throw error;
  }
}
