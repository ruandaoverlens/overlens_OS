import { NextRequest, NextResponse } from "next/server";

interface OgResult {
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

function findMetaContent(html: string, attr: "property" | "name", value: string): string | null {
  // Tenta atributo X primeiro (property/name), depois content.
  const patternA = new RegExp(
    `<meta[^>]*\\b${attr}\\s*=\\s*["']${value}["'][^>]*\\bcontent\\s*=\\s*["']([^"']*)["'][^>]*>`,
    "i",
  );
  const matchA = html.match(patternA);
  if (matchA?.[1]) return decodeEntities(matchA[1].trim());

  // Tenta order invertida (content antes de property/name).
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
 * GET /api/mycelium/og?url=...
 *
 * Tenta extrair OpenGraph metadata da URL via regex sobre o HTML.
 * NÃO retorna 500 — sempre 200 com fields null + `error` em caso de falha,
 * pra não bloquear o form de criação no front.
 *
 * Sem checagem de role (qualquer autenticado seria ok, mas mantemos público
 * pra simplificar — não há dados sensíveis sendo retornados).
 */
export async function GET(request: NextRequest): Promise<NextResponse<OgResult>> {
  const empty: OgResult = {
    title: null,
    description: null,
    image: null,
    siteName: null,
  };

  try {
    const target = request.nextUrl.searchParams.get("url");
    if (!target) {
      return NextResponse.json({ ...empty, error: "url é obrigatório" });
    }

    // Valida URL (http/https only)
    let baseUrl: string;
    try {
      const parsed = new URL(target);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        return NextResponse.json({ ...empty, error: "Protocolo inválido" });
      }
      baseUrl = parsed.toString();
    } catch {
      return NextResponse.json({ ...empty, error: "URL inválida" });
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
      return NextResponse.json({
        ...empty,
        error: isAbort ? "Timeout ao buscar URL" : "Falha ao buscar URL",
      });
    }
    clearTimeout(timeoutId);

    if (!response.ok) {
      return NextResponse.json({
        ...empty,
        error: `HTTP ${response.status}`,
      });
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().includes("html")) {
      return NextResponse.json({ ...empty, error: "Conteúdo não é HTML" });
    }

    // Lê até MAX_HTML_BYTES — só precisamos do <head>
    const reader = response.body?.getReader();
    if (!reader) {
      return NextResponse.json({ ...empty, error: "Resposta sem corpo" });
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
        // Heurística: se já passou do </head>, podemos parar.
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

    const result: OgResult = {
      title: ogTitle ?? titleTag ?? null,
      description: ogDescription ?? metaDescription ?? null,
      image: resolveAbsoluteUrl(ogImage, baseUrl),
      siteName: ogSiteName ?? null,
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error("[mycelium:og] Error:", err);
    return NextResponse.json({ ...empty, error: "Erro ao buscar metadata" });
  }
}
