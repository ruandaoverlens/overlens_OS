// Cliente da Revista da Propriedade Industrial (RPI) do INPI — módulo de marcas.
//
// A RPI publica semanalmente (terças) um índice JSON de edições e um ZIP por
// edição contendo um único XML. Tudo é dado público, sem login/captcha. O
// servidor (Varnish) devolve 503 com Retry-After em rajadas, então baixamos
// com retry/backoff. Descompactação em memória com `fflate`, parse com
// `fast-xml-parser`.

import { unzipSync, strFromU8 } from "fflate";
import { XMLParser } from "fast-xml-parser";

const INDICE_URL =
  "http://revistas.inpi.gov.br/rpi/busca/data?revista.dataInicial=31/01/2017&revista.dataFinal=31/12/2200&revista.tipoRevista.id=5";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

export interface RevistaInfo {
  numero: string;
  dataPublicacao: string;
}

export interface DespachoParseado {
  codigo: string;
  nome: string;
}

export interface PublicacaoParseada {
  processoNumero: string;
  marcaNome: string;
  apresentacao: string;
  classes: string[];
  titular: string;
  despachos: DespachoParseado[];
}

export interface RevistaParseada {
  numeroRevista: string;
  publicacoes: PublicacaoParseada[];
}

// ─── Índice de edições ────────────────────────────────────────

interface IndiceItem {
  numero?: number | string;
  dataPublicacao?: string;
  nomeArquivoEscritorio?: string;
  tipoArquivo?: string;
}

/**
 * Busca o índice JSON de edições (mais recente primeiro) e retorna o item [0].
 */
export async function obterUltimaRevista(): Promise<RevistaInfo> {
  const res = await fetch(INDICE_URL, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Falha ao obter índice da RPI: HTTP ${res.status}`);
  }
  const json = (await res.json()) as IndiceItem[];
  if (!Array.isArray(json) || json.length === 0) {
    throw new Error("Índice da RPI vazio ou em formato inesperado.");
  }
  const item = json[0];
  const numero = String(item.numero ?? "").trim();
  if (!numero) {
    throw new Error("Índice da RPI sem número de revista no item mais recente.");
  }
  return { numero, dataPublicacao: String(item.dataPublicacao ?? "") };
}

// ─── Download + unzip ─────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Baixa o ZIP de `/txt/RM{numero}.zip` com retry/backoff, descompacta em memória
 * e retorna o conteúdo do único XML como string.
 */
export async function baixarRevista(numero: string | number): Promise<string> {
  const n = String(numero).trim();
  const url = `https://revistas.inpi.gov.br/txt/RM${n}.zip`;

  const MAX_TENTATIVAS = 3;
  let ultimoErro: unknown = null;

  for (let tentativa = 1; tentativa <= MAX_TENTATIVAS; tentativa++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": USER_AGENT },
        cache: "no-store",
      });

      if (res.status === 503) {
        const retryAfter = Number(res.headers.get("retry-after")) || tentativa * 2;
        ultimoErro = new Error(`HTTP 503 (Retry-After ${retryAfter}s)`);
        if (tentativa < MAX_TENTATIVAS) {
          await sleep(retryAfter * 1000);
          continue;
        }
        break;
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ao baixar ${url}`);
      }

      const buf = new Uint8Array(await res.arrayBuffer());
      const arquivos = unzipSync(buf);
      const nomes = Object.keys(arquivos);
      const xmlNome =
        nomes.find((k) => k.toLowerCase().endsWith(".xml")) ?? nomes[0];
      if (!xmlNome) {
        throw new Error(`ZIP RM${n} vazio.`);
      }
      return strFromU8(arquivos[xmlNome]);
    } catch (err) {
      ultimoErro = err;
      if (tentativa < MAX_TENTATIVAS) {
        await sleep(tentativa * 2000); // backoff crescente
        continue;
      }
    }
  }

  throw new Error(
    `Falha ao baixar revista RM${n} após ${MAX_TENTATIVAS} tentativas: ${
      ultimoErro instanceof Error ? ultimoErro.message : String(ultimoErro)
    }`,
  );
}

// ─── Parse do XML ─────────────────────────────────────────────

/** Normaliza `undefined | T | T[]` para `T[]` (fast-xml-parser colapsa arrays de 1). */
function comoArray<T>(v: T | T[] | undefined | null): T[] {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}

function texto(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v.trim();
  if (typeof v === "number") return String(v);
  // Elemento com atributos + texto -> fast-xml-parser usa '#text'.
  if (typeof v === "object") {
    const t = (v as Record<string, unknown>)["#text"];
    if (t != null) return texto(t);
  }
  return "";
}

/**
 * Parseia o XML de uma revista RPI (manual oficial v1.03). Tolerante a campos
 * ausentes e a arrays vs objeto único. Retorna as publicações normalizadas.
 */
export function parsearRevista(xml: string): RevistaParseada {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    trimValues: true,
    parseAttributeValue: false,
    parseTagValue: false,
    isArray: () => false,
  });

  const doc = parser.parse(xml) as Record<string, unknown>;
  const revista = (doc.revista ?? {}) as Record<string, unknown>;
  const numeroRevista = String(revista["@_numero"] ?? "").trim();

  const processos = comoArray<Record<string, unknown>>(
    revista.processo as Record<string, unknown> | Record<string, unknown>[] | undefined,
  );

  const publicacoes: PublicacaoParseada[] = [];

  for (const proc of processos) {
    const processoNumero = String(proc["@_numero"] ?? "").trim();

    // Marca (nome + apresentação/natureza).
    const marca = (proc.marca ?? {}) as Record<string, unknown>;
    const marcaNome = texto((marca as Record<string, unknown>).nome ?? marca);
    const apresentacao = String(marca["@_apresentacao"] ?? "").trim();

    // Despachos.
    const despachosNode = (proc.despachos ?? {}) as Record<string, unknown>;
    const despachos: DespachoParseado[] = comoArray<Record<string, unknown>>(
      despachosNode.despacho as
        | Record<string, unknown>
        | Record<string, unknown>[]
        | undefined,
    ).map((d) => ({
      codigo: String(d["@_codigo"] ?? "").trim(),
      nome: String(d["@_nome"] ?? "").trim(),
    }));

    // Titulares (pega o primeiro nome-razao-social).
    const titularesNode = (proc.titulares ?? {}) as Record<string, unknown>;
    const titulares = comoArray<Record<string, unknown>>(
      titularesNode.titular as
        | Record<string, unknown>
        | Record<string, unknown>[]
        | undefined,
    );
    const titular = titulares
      .map((t) => String(t["@_nome-razao-social"] ?? "").trim())
      .filter(Boolean)
      .join("; ");

    // Classes NCL (código). No XML real, `classe-nice` fica dentro de
    // `lista-classe-nice`. Aceitamos também `classe-nice` direto no processo,
    // por tolerância a variações de formato.
    const listaClasse = (proc["lista-classe-nice"] ?? {}) as Record<string, unknown>;
    const classeNodes = [
      ...comoArray<Record<string, unknown>>(
        listaClasse["classe-nice"] as
          | Record<string, unknown>
          | Record<string, unknown>[]
          | undefined,
      ),
      ...comoArray<Record<string, unknown>>(
        proc["classe-nice"] as
          | Record<string, unknown>
          | Record<string, unknown>[]
          | undefined,
      ),
    ];
    const classes = classeNodes
      .map((c) => String(c["@_codigo"] ?? "").trim())
      .filter(Boolean);

    if (!processoNumero && !marcaNome) continue;

    publicacoes.push({
      processoNumero,
      marcaNome,
      apresentacao,
      classes,
      titular,
      despachos,
    });
  }

  return { numeroRevista, publicacoes };
}

// Códigos de despacho de interesse para colidência (publicação para oposição
// e republicações/Madri).
export const DESPACHOS_COLIDENCIA = new Set([
  "IPAS009",
  "IPAS135",
  "IPAS421",
  "IPAS756",
  "IPAS757",
]);
