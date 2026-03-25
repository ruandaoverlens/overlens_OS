// ============================================================
// Feedly Source Fetcher
// ============================================================
//
// Fetches articles from the user's Feedly collections via the
// Feedly API v3. Since these are already curated feeds, items
// get a default relevance score of 6 (mid-high).

export interface FeedlyNewsItem {
  title: string;
  original_url: string;
  summary: string;
  relevance_score: number;
  category: string;
}

interface FeedlyAlternateLink {
  href?: string;
  type?: string;
}

interface FeedlyArticle {
  title?: string;
  alternate?: FeedlyAlternateLink[];
  originId?: string;
  summary?: { content?: string };
  content?: { content?: string };
  categories?: Array<{ label?: string }>;
  topics?: string[];
  published?: number;
}

interface FeedlyCollection {
  id: string;
  label?: string;
}

interface FeedlyStreamResponse {
  items?: FeedlyArticle[];
}

const VALID_CATEGORIES = new Set([
  "tecnologia",
  "negocios",
  "criacao",
]);

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  tecnologia: [
    "ai", "artificial intelligence", "machine learning", "deep learning",
    "llm", "gpt", "neural", "openai", "anthropic", "gemini", "copilot",
    "generative", "diffusion", "transformer", "technology", "software",
    "hardware", "infrastructure", "cloud", "api", "developer", "engineering",
    "open source", "programming", "security", "data",
  ],
  negocios: [
    "business", "startup", "venture", "funding", "ipo", "acquisition",
    "revenue", "market", "strategy", "leadership", "management", "economy",
    "pricing", "growth", "saas", "enterprise", "b2b", "fintech",
    "regulation", "policy", "compliance", "antitrust", "governance",
  ],
  criacao: [
    "design", "creator", "maker", "creative", "figma", "canva", "adobe",
    "ux", "ui", "product design", "content", "video", "newsletter",
    "indie", "solo", "freelance", "culture", "digital culture",
    "social media", "community", "trend", "lifestyle", "no-code",
    "low-code", "tool", "workflow", "productivity",
  ],
};

/** Max total items to return across all collections. */
const MAX_TOTAL_ITEMS = 30;

/** Only fetch articles from the last 7 days. */
const MAX_AGE_DAYS = 7;

/** Max items per collection stream request. */
const ITEMS_PER_COLLECTION = 20;

/**
 * Strips HTML tags from a string.
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Infers a category from article metadata using keyword matching.
 */
function inferCategory(article: FeedlyArticle): string {
  const text = [
    article.title ?? "",
    ...(article.categories?.map((c) => c.label ?? "") ?? []),
    ...(article.topics ?? []),
  ]
    .join(" ")
    .toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) {
      return category;
    }
  }

  return "tecnologia";
}

/**
 * Extracts the article URL from Feedly's alternate links or originId.
 */
function extractUrl(article: FeedlyArticle): string {
  const alt = article.alternate?.[0]?.href;
  if (alt) return alt;

  // originId is often the article URL
  if (article.originId && article.originId.startsWith("http")) {
    return article.originId;
  }

  return "";
}

/**
 * Queries the Feedly API for articles from the user's collections.
 * Gracefully returns an empty array if the API key is missing or any error occurs.
 */
export async function queryFeedly(): Promise<FeedlyNewsItem[]> {
  const apiKey = process.env.FEEDLY_API_KEY;
  if (!apiKey) {
    console.warn("[Feedly] API key not configured, skipping");
    return [];
  }

  console.log("[Feedly] Fetching user collections...");

  // 1. Get user's collections (each has a stream ID)
  let collections: FeedlyCollection[];
  try {
    const response = await fetch("https://cloud.feedly.com/v3/collections", {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorBody}`);
    }

    collections = (await response.json()) as FeedlyCollection[];
  } catch (err) {
    console.error("[Feedly] Failed to fetch collections:", err);
    return [];
  }

  if (!Array.isArray(collections) || collections.length === 0) {
    console.warn("[Feedly] No collections found");
    return [];
  }

  console.log(`[Feedly] Found ${collections.length} collections`);

  // 2. Fetch stream contents for each collection
  const newerThan = Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
  const allItems: FeedlyNewsItem[] = [];

  for (const collection of collections) {
    if (allItems.length >= MAX_TOTAL_ITEMS) break;

    const streamId = encodeURIComponent(collection.id);
    const url =
      `https://cloud.feedly.com/v3/streams/contents` +
      `?streamId=${streamId}&count=${ITEMS_PER_COLLECTION}&newerThan=${newerThan}`;

    try {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(15_000),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(
          `[Feedly] Failed to fetch stream for "${collection.label ?? collection.id}": HTTP ${response.status}: ${errorBody}`
        );
        continue;
      }

      const stream = (await response.json()) as FeedlyStreamResponse;
      const articles = stream.items ?? [];

      for (const article of articles) {
        if (allItems.length >= MAX_TOTAL_ITEMS) break;

        const title = typeof article.title === "string" ? article.title.trim() : "";
        const articleUrl = extractUrl(article);
        if (!title || !articleUrl) continue;

        const rawSummary =
          article.summary?.content ?? article.content?.content ?? "";
        const summary = stripHtml(rawSummary).slice(0, 400);

        const category = inferCategory(article);

        allItems.push({
          title,
          original_url: articleUrl,
          summary,
          relevance_score: 6,
          category,
        });
      }
    } catch (err) {
      console.error(
        `[Feedly] Error fetching stream for "${collection.label ?? collection.id}":`,
        err
      );
      continue;
    }
  }

  console.log(`[Feedly] Parsed ${allItems.length} news items`);
  return allItems;
}
