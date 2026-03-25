// ============================================================
// Perplexity Source Fetcher
// ============================================================
//
// Queries the Perplexity API (chat completions format) using the
// "sonar" model, which has real-time web search capabilities.
// Returns a list of news items from the past week covering AI,
// technology, business, and digital culture.

export interface PerplexityNewsItem {
  title: string;
  original_url: string;
  summary: string;
  relevance_score: number;
  category: string;
}

interface PerplexityRawItem {
  title?: unknown;
  url?: unknown;
  summary?: unknown;
  category?: unknown;
  relevance_score?: unknown;
}

const VALID_CATEGORIES = new Set([
  "tecnologia",
  "negocios",
  "criacao",
]);

/** Maps legacy categories to new pilares. */
function normalizeCategory(raw: string): string {
  if (VALID_CATEGORIES.has(raw)) return raw;
  const map: Record<string, string> = {
    ai: "tecnologia", technology: "tecnologia",
    business: "negocios",
    culture: "criacao", regulation: "criacao",
  };
  return map[raw] ?? "tecnologia";
}

const SYSTEM_PROMPT =
  "You are a news research assistant with real-time web search capabilities. " +
  "Find the most important news from the past week about technology (AI, infrastructure, tools), " +
  "business (strategy, funding, markets), and creation (design, maker culture, digital culture, creator tools). " +
  "Focus on what is useful, inspiring, or actionable for founders, makers, and creators who use AI/tech to build. " +
  "Return a JSON object with a single key \"items\" containing an array of objects. " +
  "Each object must have: title (string), url (string), summary (1-2 sentences), " +
  "category (one of: tecnologia/negocios/criacao), relevance_score (number 0-10).";

const USER_PROMPT =
  "Search the web and list the 15 most significant news stories from the past 7 days about " +
  "technology (AI, dev tools, infrastructure), business (strategy, funding, startups), and " +
  "creation (design tools, maker culture, creator economy, digital culture). " +
  "Focus on developments that are useful, inspiring, or actionable. " +
  "Return only valid JSON matching the schema described.";

/**
 * Queries the Perplexity API for weekly news items.
 * Gracefully returns an empty array if the API key is missing or any error occurs.
 */
export async function queryPerplexity(): Promise<PerplexityNewsItem[]> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    console.warn("[Perplexity] API key not configured, skipping");
    return [];
  }

  console.log("[Perplexity] Querying sonar model for weekly news...");

  let responseText: string;
  try {
    const response = await fetch(
      "https://api.perplexity.ai/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "sonar",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: USER_PROMPT },
          ],
          temperature: 0.2,
        }),
        signal: AbortSignal.timeout(60_000),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorBody}`);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    responseText = data.choices?.[0]?.message?.content ?? "";
    if (!responseText) {
      console.error("[Perplexity] Empty content in API response");
      return [];
    }
  } catch (err) {
    console.error("[Perplexity] Request failed:", err);
    return [];
  }

  // Parse JSON — strip markdown code fences if present
  const cleaned = responseText
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    console.error("[Perplexity] Failed to parse JSON response");
    return [];
  }

  // Normalise: accept { items: [...] }, { news: [...] }, or a bare array
  let rawItems: unknown[];
  if (Array.isArray(parsed)) {
    rawItems = parsed;
  } else if (parsed && typeof parsed === "object") {
    const obj = parsed as Record<string, unknown>;
    const firstArray = Object.values(obj).find((v) => Array.isArray(v));
    if (firstArray) {
      rawItems = firstArray as unknown[];
    } else {
      console.error("[Perplexity] Unexpected JSON shape:", parsed);
      return [];
    }
  } else {
    console.error("[Perplexity] Unexpected JSON type in response");
    return [];
  }

  const items: PerplexityNewsItem[] = [];

  for (const raw of rawItems) {
    if (!raw || typeof raw !== "object") continue;
    const item = raw as PerplexityRawItem;

    const title =
      typeof item.title === "string" ? item.title.trim() : "";
    const url =
      typeof item.url === "string" ? item.url.trim() : "";
    const summary =
      typeof item.summary === "string" ? item.summary.trim() : "";
    const rawCategory =
      typeof item.category === "string" ? item.category.toLowerCase() : "";
    const category = VALID_CATEGORIES.has(rawCategory)
      ? rawCategory
      : normalizeCategory(rawCategory);
    const score =
      typeof item.relevance_score === "number"
        ? Math.min(10, Math.max(0, item.relevance_score))
        : 5;

    if (!title || !url) continue;

    items.push({ title, original_url: url, summary, relevance_score: score, category });
  }

  console.log(`[Perplexity] Parsed ${items.length} news items`);
  return items;
}
