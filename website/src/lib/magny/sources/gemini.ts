// ============================================================
// Gemini Source Fetcher
// ============================================================
//
// Queries the Google Gemini API (gemini-2.0-flash) with Google
// Search grounding enabled, giving it access to real-time web
// results. Returns a list of news items from the past week
// covering AI, technology, business, and digital culture.

export interface GeminiNewsItem {
  title: string;
  original_url: string;
  summary: string;
  relevance_score: number;
  category: string;
}

interface GeminiRawItem {
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

const PROMPT =
  "Search the web and find the 15 most important and recent news stories from the past 7 days " +
  "about technology (AI, infrastructure, developer tools), business (strategy, funding, markets), " +
  "and creation (design tools, maker culture, creator economy, digital culture). " +
  "Focus on developments that are useful, inspiring, or actionable for founders, makers, and creators who use AI/tech to build. " +
  "Return ONLY a valid JSON object with a single key \"items\" containing an array. " +
  "Each array element must have these exact keys: " +
  "title (string), url (string, direct link to the article), " +
  "summary (string, 1-2 sentences), " +
  "category (string, one of: tecnologia/negocios/criacao), " +
  "relevance_score (number between 0 and 10). " +
  "Do not include any text outside the JSON.";

// Response shape returned by the generateContent endpoint
interface GeminiCandidate {
  content?: {
    parts?: Array<{ text?: string }>;
  };
}

interface GeminiApiResponse {
  candidates?: GeminiCandidate[];
}

/**
 * Queries the Gemini API (with Google Search grounding) for weekly news items.
 * Gracefully returns an empty array if the API key is missing or any error occurs.
 */
export async function queryGemini(): Promise<GeminiNewsItem[]> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("[Gemini] API key not configured, skipping");
    return [];
  }

  const model = "gemini-2.0-flash";
  console.log(`[Gemini] Querying ${model} (with search grounding) for weekly news...`);

  const endpoint =
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent` +
    `?key=${apiKey}`;

  let responseText: string;
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: PROMPT }] }],
        tools: [{ google_search: {} }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
      signal: AbortSignal.timeout(60_000),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorBody}`);
    }

    const data = (await response.json()) as GeminiApiResponse;
    const parts = data.candidates?.[0]?.content?.parts ?? [];
    responseText = parts.map((p) => p.text ?? "").join("").trim();

    if (!responseText) {
      console.error("[Gemini] Empty content in API response");
      return [];
    }
  } catch (err) {
    console.error("[Gemini] Request failed:", err);
    return [];
  }

  // Strip markdown code fences if the model wrapped the JSON
  const cleaned = responseText
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    console.error("[Gemini] Failed to parse JSON response");
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
      console.error("[Gemini] Unexpected JSON shape:", parsed);
      return [];
    }
  } else {
    console.error("[Gemini] Unexpected JSON type in response");
    return [];
  }

  const items: GeminiNewsItem[] = [];

  for (const raw of rawItems) {
    if (!raw || typeof raw !== "object") continue;
    const item = raw as GeminiRawItem;

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

  console.log(`[Gemini] Parsed ${items.length} news items`);
  return items;
}
