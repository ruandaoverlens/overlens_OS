// Server-side Open Graph metadata fetcher.
// Used by /api/mycelium/og (preview-fill) and /api/mycelium/create (cover fallback).

export interface OgMetadata {
  title: string | null;
  description: string | null;
  image: string | null;
  siteName: string | null;
  error?: string;
}

const USER_AGENT =
  "Mozilla/5.0 (compatible; OverlensMyceliumBot/1.0; +https://overlens-os.vercel.app)";
const TIMEOUT_MS = 5000;
const MAX_HTML_BYTES = 512 * 1024; // 512KB — só precisamos do <head>

function decodeEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => {
      const code = Number(n);
      return Number.isFinite(code) ? String.fromCodePoint(code) : "";
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
      const code = parseInt(hex, 16);
      return Number.isFinite(code) ? String.fromCodePoint(code) : "";
    });
}

function findMetaContent(
  html: string,
  attr: "property" | "name",
  value: string,
): string | null {
  const patternA = new RegExp(
    `<meta[^>]*\\b${attr}\\s*=\\s*["']${value}["'][^>]*\\bcontent\\s*=\\s*["']([^"']*)["'][^>]*>`,
    "i",
  );
  const matchA = html.match(patternA);
  if (matchA?.[1]) return decodeEntities(matchA[1].trim());

  const patternB = new RegExp(
    `<meta[^>]*\\bcontent\\s*=\\s*["']([^"']*)["'][^>]*\\b${attr}\\s*=\\s*["']${value}["'][^>]*>`,
    "i",
  );
  const matchB = html.match(patternB);
  if (matchB?.[1]) return decodeEntities(matchB[1].trim());

  return null;
}

function findTitleTag(html: string): string | null {
  const m = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return m?.[1] ? decodeEntities(m[1].trim()) : null;
}

function resolveAbsoluteUrl(maybeUrl: string | null, baseUrl: string): string | null {
  if (!maybeUrl) return null;
  try {
    return new URL(maybeUrl, baseUrl).toString();
  } catch {
    return null;
  }
}

/**
 * Fetches a URL and extracts OpenGraph / Twitter / HTML metadata.
 * Always returns a result object — never throws. On failure, fields are null
 * and `error` is populated.
 */
export async function fetchOgMetadata(target: string): Promise<OgMetadata> {
  const empty: OgMetadata = {
    title: null,
    description: null,
    image: null,
    siteName: null,
  };

  let baseUrl: string;
  try {
    const parsed = new URL(target);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return { ...empty, error: "Protocolo inválido" };
    }
    baseUrl = parsed.toString();
  } catch {
    return { ...empty, error: "URL inválida" };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(baseUrl, {
      method: "GET",
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
      },
      redirect: "follow",
    });
  } catch (err) {
    clearTimeout(timeoutId);
    const isAbort = (err as Error).name === "AbortError";
    return {
      ...empty,
      error: isAbort ? "Timeout ao buscar URL" : "Falha ao buscar URL",
    };
  }
  clearTimeout(timeoutId);

  if (!response.ok) {
    return { ...empty, error: `HTTP ${response.status}` };
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("html")) {
    return { ...empty, error: "Conteúdo não é HTML" };
  }

  const reader = response.body?.getReader();
  if (!reader) {
    return { ...empty, error: "Resposta sem corpo" };
  }

  const decoder = new TextDecoder("utf-8");
  let html = "";
  let bytesRead = 0;
  try {
    while (bytesRead < MAX_HTML_BYTES) {
      const { done, value } = await reader.read();
      if (done) break;
      bytesRead += value.byteLength;
      html += decoder.decode(value, { stream: true });
      if (/<\/head>/i.test(html)) break;
    }
    html += decoder.decode();
  } finally {
    reader.cancel().catch(() => {});
  }

  const ogTitle = findMetaContent(html, "property", "og:title");
  const titleTag = findTitleTag(html);
  const ogDescription = findMetaContent(html, "property", "og:description");
  const metaDescription = findMetaContent(html, "name", "description");
  const ogImage =
    findMetaContent(html, "property", "og:image") ||
    findMetaContent(html, "property", "og:image:url") ||
    findMetaContent(html, "name", "twitter:image");
  const ogSiteName = findMetaContent(html, "property", "og:site_name");

  return {
    title: ogTitle ?? titleTag ?? null,
    description: ogDescription ?? metaDescription ?? null,
    image: resolveAbsoluteUrl(ogImage, baseUrl),
    siteName: ogSiteName ?? null,
  };
}

/** Downloads an image URL on the server. Returns null on failure. */
export async function downloadImage(
  imageUrl: string,
): Promise<{ buffer: Buffer; contentType: string; ext: string } | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(imageUrl, {
      method: "GET",
      signal: controller.signal,
      headers: { "User-Agent": USER_AGENT },
      redirect: "follow",
    });
    if (!res.ok) return null;
    const contentType = (res.headers.get("content-type") ?? "image/jpeg")
      .split(";")[0]
      .trim();
    if (!contentType.startsWith("image/")) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    const ext = "." + (contentType.split("/")[1] || "jpg").toLowerCase();
    return { buffer, contentType, ext };
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}
