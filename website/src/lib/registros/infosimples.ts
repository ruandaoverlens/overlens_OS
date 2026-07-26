// Cliente da API de consulta INPI/Marcas da Infosimples.
//
// A Infosimples expõe consultas automatizadas ao INPI via API v2. Usamos a
// consulta "inpi/marcas" (busca por texto/base de marcas) para a "consulta de
// disponibilidade de marcas". É um serviço PAGO e autenticado por token
// (process.env.INFOSIMPLES_TOKEN); quando o token não está configurado a
// consulta ao vivo simplesmente não roda (a busca segue com o cache local).
//
// ─── Pontos a validar com a doc oficial ───────────────────────────────────
// A doc pública (https://infosimples.com/consultas/inpi-marcas/) lista os
// PARÂMETROS e os CAMPOS retornados, mas não fixa a URL exata do endpoint nem o
// aninhamento do array `data`. Implementamos pelo padrão público conhecido da
// API v2 da Infosimples:
//   - Endpoint:   POST https://api.infosimples.com/api/v2/consultas/inpi/marcas
//   - Corpo:      form-urlencoded com `token` + argumentos da consulta
//   - Resposta:   { code, code_message, header, data: [...], errors, ... }
//   - code === 200 -> sucesso
// Parâmetros conhecidos da consulta: marca, ncl, tipo, pesquisa_textual,
// pagina, pedidos_vivos. Campos por resultado: numero, marca, titular, classe,
// situacao, tipo, registro, prioridade — normalmente sob `data[0].processos`.
// VALIDAR com a doc/portal oficial: (1) URL/slug exato do endpoint; (2) se o
// array de processos vem em `data` direto ou em `data[0].processos`; (3) nomes
// exatos dos campos de cada processo. O parser abaixo é tolerante a ambas as
// formas de aninhamento.

// URL base da API v2 da Infosimples (ver ponto a validar acima).
const INFOSIMPLES_ENDPOINT =
  "https://api.infosimples.com/api/v2/consultas/inpi/marcas";

// Timeout defensivo — a consulta bate no site do INPI e pode demorar.
const TIMEOUT_MS = 60_000;

/** Erro tipado disparado quando o token da Infosimples não está configurado. */
export class InfosimplesNaoConfigurado extends Error {
  constructor() {
    super("INFOSIMPLES_TOKEN não configurado.");
    this.name = "InfosimplesNaoConfigurado";
  }
}

/** Erro tipado para falhas de consulta (rede, timeout, code != 200). */
export class InfosimplesErro extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InfosimplesErro";
  }
}

/** Um resultado de marca normalizado a partir da resposta da Infosimples. */
export interface MarcaInfosimples {
  processoNumero: string;
  marca: string;
  situacao: string | null;
  titular: string | null;
  classe: string | null;
  apresentacao?: string;
}

export interface ResultadoInfosimples {
  total: number;
  resultados: MarcaInfosimples[];
}

// ─── Tipos crus da resposta (tolerantes) ──────────────────────

interface ProcessoBruto {
  numero?: unknown;
  processo?: unknown;
  marca?: unknown;
  titular?: unknown;
  classe?: unknown;
  ncl?: unknown;
  situacao?: unknown;
  tipo?: unknown;
  apresentacao?: unknown;
  registro?: unknown;
}

interface RespostaBruta {
  code?: number;
  code_message?: string;
  data?: unknown;
  errors?: unknown;
}

function str(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v.trim();
  if (typeof v === "number") return String(v);
  return "";
}

function strOuNull(v: unknown): string | null {
  const s = str(v);
  return s.length > 0 ? s : null;
}

/**
 * Extrai a lista de processos da resposta, tolerando as duas formas de
 * aninhamento: `data` como array de processos, ou `data[0].processos`.
 */
function extrairProcessos(data: unknown): ProcessoBruto[] {
  if (!Array.isArray(data)) return [];
  // Forma A: data já é o array de processos.
  const pareceProcesso = (o: unknown): boolean =>
    !!o &&
    typeof o === "object" &&
    ("marca" in (o as object) ||
      "numero" in (o as object) ||
      "processo" in (o as object));
  if (data.length > 0 && data.every(pareceProcesso)) {
    return data as ProcessoBruto[];
  }
  // Forma B: data[i].processos.
  const out: ProcessoBruto[] = [];
  for (const item of data) {
    if (item && typeof item === "object" && "processos" in item) {
      const procs = (item as { processos?: unknown }).processos;
      if (Array.isArray(procs)) out.push(...(procs as ProcessoBruto[]));
    }
  }
  return out;
}

function normalizarResultados(data: unknown): MarcaInfosimples[] {
  return extrairProcessos(data)
    .map((p) => {
      const processoNumero = str(p.numero) || str(p.processo);
      const marca = str(p.marca);
      const classe = strOuNull(p.classe) ?? strOuNull(p.ncl);
      const apresentacao = strOuNull(p.apresentacao ?? p.tipo);
      return {
        processoNumero,
        marca,
        situacao: strOuNull(p.situacao),
        titular: strOuNull(p.titular),
        classe,
        ...(apresentacao ? { apresentacao } : {}),
      } satisfies MarcaInfosimples;
    })
    .filter((r) => r.processoNumero || r.marca);
}

/**
 * Consulta a base de marcas do INPI via Infosimples.
 *
 * Lança `InfosimplesNaoConfigurado` se o token não estiver presente e
 * `InfosimplesErro` para falhas de rede/timeout/erro de negócio (code != 200).
 * O chamador (disponibilidade.ts) captura esses erros para não derrubar a
 * busca — a consulta ao vivo é best-effort.
 */
export async function consultarMarcaInpi(args: {
  marca: string;
  classe?: string;
}): Promise<ResultadoInfosimples> {
  const token = process.env.INFOSIMPLES_TOKEN;
  if (!token) {
    throw new InfosimplesNaoConfigurado();
  }

  // Argumentos da consulta (nomes conforme doc pública da Infosimples).
  const params = new URLSearchParams();
  params.set("token", token);
  params.set("marca", args.marca);
  params.set("pesquisa_textual", "1"); // busca por radical/texto, não exata
  if (args.classe) params.set("ncl", args.classe);

  let res: Response;
  try {
    res = await fetch(INFOSIMPLES_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: params.toString(),
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new InfosimplesErro(`Falha de rede na consulta Infosimples: ${msg}`);
  }

  if (!res.ok) {
    throw new InfosimplesErro(`Infosimples respondeu HTTP ${res.status}.`);
  }

  let json: RespostaBruta;
  try {
    json = (await res.json()) as RespostaBruta;
  } catch {
    throw new InfosimplesErro("Resposta da Infosimples não é JSON válido.");
  }

  // code 200 = sucesso na convenção da Infosimples.
  if (json.code !== 200) {
    const detalhe = json.code_message ?? `code ${json.code}`;
    throw new InfosimplesErro(`Consulta Infosimples sem sucesso: ${detalhe}`);
  }

  const resultados = normalizarResultados(json.data);
  return { total: resultados.length, resultados };
}
