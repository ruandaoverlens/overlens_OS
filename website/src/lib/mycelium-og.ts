// Server-side Open Graph metadata fetcher.
// Used by /api/mycelium/og (preview-fill) and /api/mycelium/create (cover fallback).

import { lookup } from "dns/promises";

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
const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB — limite de tamanho de cover
const MAX_REDIRECTS = 3;

// ---------------------------------------------------------------------------
// Guarda anti-SSRF
// ---------------------------------------------------------------------------
// Impede que URLs controladas pelo cliente sejam usadas para sondar a rede
// interna (metadata endpoints da cloud, localhost, IPs privados, etc.).
// A guarda é aplicada a TODA URL antes do fetch e revalidada em CADA redirect.

class SsrfError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SsrfError";
  }
}

/** Converte um IPv4 "a.b.c.d" em array de 4 octets, ou null se inválido. */
function parseIpv4(ip: string): [number, number, number, number] | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  const octets: number[] = [];
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null;
    const n = Number(part);
    if (n < 0 || n > 255) return null;
    octets.push(n);
  }
  return octets as [number, number, number, number];
}

/** Faixas IPv4 privadas / reservadas que NÃO podem ser alvo de fetch. */
function isBlockedIpv4(octets: [number, number, number, number]): boolean {
  const [a, b] = octets;
  if (a === 0) return true; // 0.0.0.0/8 "this network"
  if (a === 10) return true; // 10.0.0.0/8 private
  if (a === 127) return true; // 127.0.0.0/8 loopback
  if (a === 169 && b === 254) return true; // 169.254.0.0/16 link-local (inclui 169.254.169.254)
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12 private
  if (a === 192 && b === 168) return true; // 192.168.0.0/16 private
  if (a === 100 && b >= 64 && b <= 127) return true; // 100.64.0.0/10 CGNAT
  if (a === 192 && b === 0) return true; // 192.0.0.0/24 + 192.0.2.0/24 (IETF/TEST-NET)
  if (a === 198 && (b === 18 || b === 19)) return true; // 198.18.0.0/15 benchmark
  if (a >= 224) return true; // 224.0.0.0/4 multicast + 240.0.0.0/4 reservado + 255.255.255.255 broadcast
  return false;
}

/**
 * Verifica se um endereço IP (IPv4 ou IPv6) cai em faixa privada/reservada.
 * Retorna true = BLOQUEAR.
 */
function isBlockedIp(address: string): boolean {
  // IPv4 direto
  const v4 = parseIpv4(address);
  if (v4) return isBlockedIpv4(v4);

  // IPv6
  let ip = address.toLowerCase();
  // Remove zona de escopo (ex.: fe80::1%eth0)
  const pct = ip.indexOf("%");
  if (pct !== -1) ip = ip.slice(0, pct);

  // IPv4-mapped / embedded: ::ffff:a.b.c.d ou ::a.b.c.d — aplica a mesma checagem ao IPv4.
  const mapped = ip.match(/:((?:\d{1,3}\.){3}\d{1,3})$/);
  if (mapped) {
    const embedded = parseIpv4(mapped[1]);
    if (embedded) return isBlockedIpv4(embedded);
  }

  if (ip === "::1") return true; // loopback
  if (ip === "::" || ip === "::0") return true; // unspecified
  if (ip.startsWith("fe8") || ip.startsWith("fe9") || ip.startsWith("fea") || ip.startsWith("feb"))
    return true; // fe80::/10 link-local
  if (ip.startsWith("fc") || ip.startsWith("fd")) return true; // fc00::/7 ULA

  return false;
}

/**
 * Valida que uma URL aponta para um host público seguro.
 * - Só aceita http/https.
 * - Rejeita hostnames literais localhost / *.localhost.
 * - Resolve o hostname via DNS e rejeita se QUALQUER IP resolvido cair em
 *   faixa privada/reservada. Se o host já for um IP literal, checa direto.
 * Lança SsrfError se a URL for insegura.
 */
export async function assertPublicUrl(rawUrl: string): Promise<URL> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new SsrfError("URL inválida");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new SsrfError("Protocolo inválido");
  }

  const hostname = parsed.hostname.toLowerCase().replace(/\.$/, "");

  if (hostname === "localhost" || hostname.endsWith(".localhost")) {
    throw new SsrfError("Host bloqueado");
  }

  // Se o hostname já é um IP literal (v4 ou v6), checa diretamente.
  // URL envolve IPv6 em colchetes; parsed.hostname os remove.
  const literalV4 = parseIpv4(hostname);
  if (literalV4) {
    if (isBlockedIpv4(literalV4)) throw new SsrfError("IP bloqueado");
    return parsed;
  }
  if (hostname.includes(":")) {
    // IPv6 literal
    if (isBlockedIp(hostname)) throw new SsrfError("IP bloqueado");
    return parsed;
  }

  // Resolve DNS — todos os endereços (v4 e v6).
  let addresses: { address: string; family: number }[];
  try {
    addresses = await lookup(hostname, { all: true });
  } catch {
    throw new SsrfError("Não foi possível resolver o host");
  }

  if (!addresses.length) throw new SsrfError("Host sem endereços");

  for (const { address } of addresses) {
    if (isBlockedIp(address)) {
      throw new SsrfError("Host resolve para IP privado/reservado");
    }
  }

  return parsed;
}

/**
 * fetch com guarda anti-SSRF. Desabilita o follow automático de redirect
 * (redirect: "manual") e segue manualmente até MAX_REDIRECTS saltos,
 * revalidando o destino com assertPublicUrl a CADA salto.
 */
export async function safeFetch(
  initialUrl: string,
  init: RequestInit,
): Promise<Response> {
  let currentUrl = initialUrl;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const validated = await assertPublicUrl(currentUrl);

    const response = await fetch(validated.toString(), {
      ...init,
      redirect: "manual",
    });

    // 3xx com Location → validar e seguir manualmente.
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) return response; // sem destino, devolve como está
      // Cancela o corpo do redirect pra não vazar sockets.
      response.body?.cancel().catch(() => {});
      if (hop === MAX_REDIRECTS) {
        throw new SsrfError("Excesso de redirects");
      }
      // Resolve relativo à URL atual.
      currentUrl = new URL(location, validated).toString();
      continue;
    }

    return response;
  }

  // Inalcançável, mas satisfaz o compilador.
  throw new SsrfError("Excesso de redirects");
}

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

  const baseUrl = target;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response: Response;
  try {
    response = await safeFetch(baseUrl, {
      method: "GET",
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
      },
    });
  } catch (err) {
    clearTimeout(timeoutId);
    const name = (err as Error).name;
    if (name === "SsrfError") {
      return { ...empty, error: "URL não permitida" };
    }
    const isAbort = name === "AbortError";
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
    const res = await safeFetch(imageUrl, {
      method: "GET",
      signal: controller.signal,
      headers: { "User-Agent": USER_AGENT },
    });
    if (!res.ok) return null;
    const contentType = (res.headers.get("content-type") ?? "image/jpeg")
      .split(";")[0]
      .trim();
    if (!contentType.startsWith("image/")) return null;

    // Rejeita cedo se o Content-Length declarado exceder o limite.
    const declaredLen = Number(res.headers.get("content-length"));
    if (Number.isFinite(declaredLen) && declaredLen > MAX_IMAGE_BYTES) {
      res.body?.cancel().catch(() => {});
      return null;
    }

    // Lê com limite de tamanho (defende contra Content-Length ausente/mentiroso).
    const reader = res.body?.getReader();
    if (!reader) return null;
    const chunks: Uint8Array[] = [];
    let total = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_IMAGE_BYTES) {
        reader.cancel().catch(() => {});
        return null;
      }
      chunks.push(value);
    }
    const buffer = Buffer.concat(chunks.map((c) => Buffer.from(c)));
    const ext = "." + (contentType.split("/")[1] || "jpg").toLowerCase();
    return { buffer, contentType, ext };
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}
