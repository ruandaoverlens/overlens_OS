import { createAdminClient } from "@/lib/supabase/admin";
import { queryPerplexity } from "@/lib/magny/sources/perplexity";
import { queryGemini } from "@/lib/magny/sources/gemini";
import { queryFeedly } from "@/lib/magny/sources/feedly";

// ============================================================
// Types
// ============================================================

interface ExplorerInput {
  pipelineRunId: string;
  pipelineStepId: string;
}

interface NewsItem {
  title: string;
  original_url: string;
  summary: string;
  relevance_score: number;
  category: string;
  source_id: string | null;
}

interface ExplorerOutput {
  newsItems: NewsItem[];
  totalFound: number;
}

interface Source {
  id: string;
  name: string;
  type: "rss" | "api" | "instagram" | "manual";
  url: string | null;
  category: string;
  reliability_score: number;
  config: Record<string, unknown>;
}

interface LLMNewsItem {
  title: string;
  url: string;
  summary: string;
  category: string;
  relevance_score: number;
}

// ============================================================
// RSS Feed Parser
// ============================================================

/**
 * Extracts the text content between two XML tags.
 * Returns the first match or an empty string if not found.
 */
function extractTag(xml: string, tag: string): string {
  // Try CDATA first: <tag><![CDATA[...]]></tag>
  const cdataRe = new RegExp(
    `<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${tag}>`,
    "i"
  );
  const cdataMatch = xml.match(cdataRe);
  if (cdataMatch) return cdataMatch[1].trim();

  // Plain content: <tag ...>...</tag>
  const plainRe = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const plainMatch = xml.match(plainRe);
  if (plainMatch) return plainMatch[1].trim();

  return "";
}

/**
 * Extracts the value of an XML attribute from a tag.
 * e.g. extractAttr('<link href="https://..." />', 'href') => 'https://...'
 */
function extractAttr(tag: string, attr: string): string {
  const re = new RegExp(`${attr}=["']([^"']+)["']`, "i");
  const match = tag.match(re);
  return match ? match[1].trim() : "";
}

/**
 * Strips HTML tags from a string.
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Fetches and parses an RSS or Atom feed, returning a list of NewsItems.
 * Handles both RSS (<item>) and Atom (<entry>) formats.
 * If parsing fails, logs the error and returns an empty array.
 */
/** Max items to keep per RSS source after date filtering. */
const MAX_ITEMS_PER_RSS_SOURCE = 15;

/** Only keep RSS items published within the last N days. */
const RSS_MAX_AGE_DAYS = 7;

/**
 * Attempts to extract a publication date from an RSS/Atom item block.
 * Returns a Date or null if no parseable date is found.
 */
function extractPubDate(raw: string): Date | null {
  const dateStr =
    extractTag(raw, "pubDate") ||
    extractTag(raw, "published") ||
    extractTag(raw, "updated") ||
    extractTag(raw, "dc:date");
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

async function fetchRSSFeed(
  url: string,
  source: Source
): Promise<NewsItem[]> {
  console.log(`  [RSS] Fetching: ${url}`);

  let xml: string;
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Magny/1.0 RSS Reader" },
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }
    xml = await response.text();
  } catch (err) {
    console.error(`  [RSS] Failed to fetch ${url}:`, err);
    return [];
  }

  const items: NewsItem[] = [];
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - RSS_MAX_AGE_DAYS);

  // Determine format: Atom uses <entry>, RSS uses <item>
  const isAtom = /<feed[\s>]/i.test(xml);
  const itemTag = isAtom ? "entry" : "item";

  // Split on opening tag to get individual entry/item blocks
  const itemPattern = new RegExp(`<${itemTag}[\\s>][\\s\\S]*?<\\/${itemTag}>`, "gi");
  const rawItems = xml.match(itemPattern) ?? [];

  console.log(`  [RSS] Found ${rawItems.length} raw items from ${source.name}`);

  for (const raw of rawItems) {
    // Filter by date — skip items older than cutoff
    const pubDate = extractPubDate(raw);
    if (pubDate && pubDate < cutoffDate) continue;

    const title = stripHtml(extractTag(raw, "title"));
    if (!title) continue;

    // URL: prefer <link> content; for Atom, <link href="..."> self-closing
    let originalUrl = extractTag(raw, "link");
    if (!originalUrl) {
      // Atom self-closing link: <link href="..." rel="alternate"/>
      const linkTagMatch = raw.match(/<link\s[^>]*>/i);
      if (linkTagMatch) {
        originalUrl = extractAttr(linkTagMatch[0], "href");
      }
    }
    if (!originalUrl) continue;

    const rawSummary =
      extractTag(raw, "description") ||
      extractTag(raw, "summary") ||
      extractTag(raw, "content");
    const summary = stripHtml(rawSummary).slice(0, 400);

    items.push({
      title,
      original_url: originalUrl,
      summary,
      relevance_score: source.reliability_score,
      category: normalizeCategory(source.category),
      source_id: source.id,
    });

    // Cap items per source
    if (items.length >= MAX_ITEMS_PER_RSS_SOURCE) break;
  }

  const filtered = items.length;
  const skipped = rawItems.length - filtered;
  if (skipped > 0) {
    console.log(`  [RSS] Kept ${filtered} recent items, skipped ${skipped} (older than ${RSS_MAX_AGE_DAYS}d or over cap)`);
  }

  return items;
}

// ============================================================
// Category normalization (5 old → 3 new pilares)
// ============================================================

const NEW_CATEGORIES = new Set(["tecnologia", "negocios", "criacao"]);

/**
 * Maps legacy 5-category values to the new 3-pilar system.
 * If already a valid new category, returns as-is.
 */
function normalizeCategory(raw: string): string {
  const lower = raw.toLowerCase().trim();
  if (NEW_CATEGORIES.has(lower)) return lower;

  const map: Record<string, string> = {
    ai: "tecnologia",
    technology: "tecnologia",
    business: "negocios",
    culture: "criacao",
    regulation: "criacao",
  };
  return map[lower] ?? "tecnologia";
}

// ============================================================
// LLM (OpenAI) Source Querier
// ============================================================

/**
 * Queries the OpenAI chat completions API and returns news items.
 * Parses the JSON array from the model response.
 */
async function queryLLMForNews(source: Source): Promise<NewsItem[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("  [LLM] OPENAI_API_KEY is not set — skipping LLM source.");
    return [];
  }

  const model =
    (source.config?.model as string | undefined) ?? "gpt-4o-mini";

  console.log(`  [LLM] Querying OpenAI (${model}) for source: ${source.name}`);

  const systemPrompt =
    "You are a news research assistant. Find the most important news from the past week about technology, business, and creation (design, tools, maker culture, digital culture). " +
    "Focus on what is useful, inspiring, or actionable for founders, makers, and creators who use AI/tech to build. " +
    'Return a JSON array of objects with: title, url, summary (1-2 sentences), category (tecnologia/negocios/criacao), relevance_score (0-10).';

  const userPrompt =
    (source.config?.prompt as string | undefined) ??
    "List the 15 most significant and recent news stories from the past 7 days about technology (AI, infra, tools), business (strategy, funding, markets), and creation (design, maker culture, digital culture). " +
    "Focus on developments that are useful, inspiring, or actionable for founders, makers, and creators. Return only valid JSON.";

  let responseText: string;
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
      signal: AbortSignal.timeout(60_000),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorBody}`);
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    responseText = data.choices?.[0]?.message?.content ?? "";
  } catch (err) {
    console.error(`  [LLM] Request failed for ${source.name}:`, err);
    return [];
  }

  // Parse JSON — the model might wrap the array in an object key
  let parsed: unknown;
  try {
    parsed = JSON.parse(responseText);
  } catch {
    console.error(`  [LLM] Failed to parse JSON response for ${source.name}`);
    return [];
  }

  // Normalise: accept array directly or { news: [...] } / { items: [...] }
  let rawItems: unknown[];
  if (Array.isArray(parsed)) {
    rawItems = parsed;
  } else if (parsed && typeof parsed === "object") {
    const obj = parsed as Record<string, unknown>;
    const firstArrayValue = Object.values(obj).find((v) => Array.isArray(v));
    if (firstArrayValue) {
      rawItems = firstArrayValue as unknown[];
    } else {
      console.error(`  [LLM] Unexpected JSON shape from ${source.name}:`, parsed);
      return [];
    }
  } else {
    console.error(`  [LLM] Unexpected JSON type from ${source.name}`);
    return [];
  }

  const items: NewsItem[] = [];
  for (const raw of rawItems) {
    if (!raw || typeof raw !== "object") continue;
    const item = raw as LLMNewsItem;

    const title = typeof item.title === "string" ? item.title.trim() : "";
    const url = typeof item.url === "string" ? item.url.trim() : "";
    const summary = typeof item.summary === "string" ? item.summary.trim() : "";
    const rawCategory =
      typeof item.category === "string" ? item.category.toLowerCase() : "";
    const category = rawCategory
      ? normalizeCategory(rawCategory)
      : normalizeCategory(source.category);
    const score =
      typeof item.relevance_score === "number"
        ? Math.min(10, Math.max(0, item.relevance_score))
        : source.reliability_score;

    if (!title || !url) continue;

    items.push({
      title,
      original_url: url,
      summary,
      relevance_score: score,
      category,
      source_id: source.id,
    });
  }

  console.log(`  [LLM] Parsed ${items.length} items from ${source.name}`);
  return items;
}

// ============================================================
// Deduplication
// ============================================================

/**
 * Removes duplicate news items by exact URL match.
 * Keeps the first occurrence.
 */
function deduplicateByUrl(items: NewsItem[]): NewsItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (!item.original_url || seen.has(item.original_url)) return false;
    seen.add(item.original_url);
    return true;
  });
}

// ============================================================
// Pipeline Step Logger
// ============================================================

/**
 * Appends a log entry to the pipeline_steps.logs column and optionally
 * updates the status field.
 */
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
    console.error("[Explorer] Failed to fetch pipeline step for update:", fetchError);
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
    console.error("[Explorer] Failed to update pipeline step:", updateError);
  }
}

// ============================================================
// Main: runExplorer
// ============================================================

export async function runExplorer(input: ExplorerInput): Promise<ExplorerOutput> {
  const { pipelineRunId, pipelineStepId } = input;
  const supabase = createAdminClient();

  console.log(`[Explorer] Starting — pipeline_run_id=${pipelineRunId}`);

  await updatePipelineStep(pipelineStepId, {
    status: "running",
    logMessage: "Explorer agent started",
  });

  // ----------------------------------------------------------
  // 1. Fetch active sources
  // ----------------------------------------------------------
  const { data: sources, error: sourcesError } = await supabase
    .from("sources")
    .select("*")
    .eq("is_active", true);

  if (sourcesError) {
    console.error("[Explorer] Failed to fetch sources:", sourcesError);
    await updatePipelineStep(pipelineStepId, {
      status: "failed",
      logMessage: `Failed to fetch sources: ${sourcesError.message}`,
      errorMessage: sourcesError.message,
    });
    return { newsItems: [], totalFound: 0 };
  }

  console.log(`[Explorer] Found ${sources?.length ?? 0} active sources`);
  await updatePipelineStep(pipelineStepId, {
    logMessage: `Loaded ${sources?.length ?? 0} active sources`,
  });

  // ----------------------------------------------------------
  // 2. Collect news from database-configured sources (RSS + OpenAI API)
  // ----------------------------------------------------------
  const allItems: NewsItem[] = [];

  for (const source of (sources ?? []) as Source[]) {
    try {
      let items: NewsItem[] = [];

      if (source.type === "rss") {
        if (!source.url) {
          console.warn(`[Explorer] RSS source "${source.name}" has no URL — skipping`);
          continue;
        }
        items = await fetchRSSFeed(source.url, source);
      } else if (source.type === "api") {
        // Currently only OpenAI is supported
        const provider =
          (source.config?.provider as string | undefined) ?? "openai";
        if (provider === "openai") {
          items = await queryLLMForNews(source);
        } else {
          console.warn(
            `[Explorer] API source "${source.name}" uses unsupported provider "${provider}" — skipping`
          );
          continue;
        }
      } else {
        console.log(
          `[Explorer] Skipping source "${source.name}" (type="${source.type}" not yet implemented)`
        );
        continue;
      }

      console.log(
        `[Explorer] Source "${source.name}" — collected ${items.length} items`
      );
      allItems.push(...items);

      await updatePipelineStep(pipelineStepId, {
        logMessage: `Source "${source.name}" (${source.type}): ${items.length} items`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[Explorer] Unexpected error for source "${source.name}":`, err);
      await updatePipelineStep(pipelineStepId, {
        logMessage: `Source "${source.name}" failed: ${message}`,
      });
      // Continue with remaining sources
    }
  }

  // ----------------------------------------------------------
  // 3. Fetch from Perplexity and Gemini (standalone API sources)
  // ----------------------------------------------------------
  console.log("[Explorer] Querying Perplexity...");
  try {
    const perplexityItems = await queryPerplexity();
    const mapped = perplexityItems.map((item) => ({
      ...item,
      source_id: null as string | null,
    }));
    allItems.push(...mapped);
    await updatePipelineStep(pipelineStepId, {
      logMessage: `Perplexity: ${perplexityItems.length} items`,
    });
    console.log(`[Explorer] Perplexity — collected ${perplexityItems.length} items`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[Explorer] Unexpected error from Perplexity:", err);
    await updatePipelineStep(pipelineStepId, {
      logMessage: `Perplexity failed: ${message}`,
    });
  }

  console.log("[Explorer] Querying Gemini...");
  try {
    const geminiItems = await queryGemini();
    const mapped = geminiItems.map((item) => ({
      ...item,
      source_id: null as string | null,
    }));
    allItems.push(...mapped);
    await updatePipelineStep(pipelineStepId, {
      logMessage: `Gemini: ${geminiItems.length} items`,
    });
    console.log(`[Explorer] Gemini — collected ${geminiItems.length} items`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[Explorer] Unexpected error from Gemini:", err);
    await updatePipelineStep(pipelineStepId, {
      logMessage: `Gemini failed: ${message}`,
    });
  }

  console.log("[Explorer] Querying Feedly...");
  try {
    const feedlyItems = await queryFeedly();
    const mapped = feedlyItems.map((item) => ({
      ...item,
      source_id: null as string | null,
    }));
    allItems.push(...mapped);
    await updatePipelineStep(pipelineStepId, {
      logMessage: `Feedly: ${feedlyItems.length} items`,
    });
    console.log(`[Explorer] Feedly — collected ${feedlyItems.length} items`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[Explorer] Unexpected error from Feedly:", err);
    await updatePipelineStep(pipelineStepId, {
      logMessage: `Feedly failed: ${message}`,
    });
  }

  // ----------------------------------------------------------
  // 4. Deduplicate by URL
  // ----------------------------------------------------------
  const deduplicated = deduplicateByUrl(allItems);
  console.log(
    `[Explorer] Deduplication: ${allItems.length} → ${deduplicated.length} unique items`
  );
  await updatePipelineStep(pipelineStepId, {
    logMessage: `Deduplication complete: ${deduplicated.length} unique items (${allItems.length - deduplicated.length} removed)`,
  });

  // ----------------------------------------------------------
  // 5. Persist news_items to the database
  // ----------------------------------------------------------
  if (deduplicated.length > 0) {
    const rows = deduplicated.map((item) => ({
      pipeline_run_id: pipelineRunId,
      pipeline_step_id: pipelineStepId,
      title: item.title,
      original_url: item.original_url,
      summary: item.summary || null,
      relevance_score: item.relevance_score,
      category: item.category,
      source_id: item.source_id,
      is_selected: false,
      confidence_level: "medium" as const,
    }));

    const { error: insertError } = await supabase
      .from("news_items")
      .insert(rows);

    if (insertError) {
      console.error("[Explorer] Failed to insert news_items:", insertError);
      await updatePipelineStep(pipelineStepId, {
        status: "failed",
        logMessage: `Database insert failed: ${insertError.message}`,
        errorMessage: insertError.message,
      });
      return { newsItems: deduplicated, totalFound: deduplicated.length };
    }

    console.log(`[Explorer] Saved ${deduplicated.length} news items to the database`);
  }

  // ----------------------------------------------------------
  // 6. Mark step as completed and return
  // ----------------------------------------------------------
  await updatePipelineStep(pipelineStepId, {
    status: "completed",
    logMessage: `Explorer completed — ${deduplicated.length} items saved`,
    outputData: {
      totalFound: deduplicated.length,
      sourceCount: sources?.length ?? 0,
    },
  });

  console.log(`[Explorer] Done — ${deduplicated.length} items collected and saved`);

  return {
    newsItems: deduplicated,
    totalFound: deduplicated.length,
  };
}
