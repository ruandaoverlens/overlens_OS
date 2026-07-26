// Orquestração da "consulta de disponibilidade de marcas" (ADR-0003).
//
// Combina duas fontes:
//   1. Cache local (registro_rpi_publicacoes) — publicações da RPI já ingeridas
//      pelo radar. Pré-filtra por similaridade (substring/fonética) e refina em
//      memória com avaliarSimilaridade().
//   2. Consulta ao vivo à base do INPI via Infosimples (best-effort — só roda se
//      o token estiver configurado; falha aqui não derruba a busca).
//
// Junta, deduplica por processo, filtra por score e emite um veredicto
// agregado considerando as classes solicitadas. A decisão final é sempre
// humana — o veredicto é um indicador de risco, não uma conclusão jurídica.

import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizar, fonetico, avaliarSimilaridade, type TipoMatch } from "./matching";
import {
  consultarMarcaInpi,
  InfosimplesNaoConfigurado,
  type MarcaInfosimples,
} from "./infosimples";

// Score mínimo para um resultado entrar na lista (indício relevante).
const SCORE_MINIMO = 0.75;
// Teto de candidatos trazidos do cache local no pré-filtro.
const MAX_CANDIDATOS_LOCAL = 500;

export type Veredicto =
  | "indisponivel"
  | "risco_alto"
  | "risco_medio"
  | "provavelmente_disponivel";

export interface ResultadoDisponibilidade {
  nome: string;
  veredicto: Veredicto;
  fontes: {
    local: { consultada: boolean; total: number };
    inpiLive: { consultada: boolean; total: number; motivo?: string };
  };
  resultados: Array<{
    origem: "local" | "inpi_live";
    processoNumero: string;
    marca: string;
    situacao: string | null;
    titular: string | null;
    classes: string[];
    tipoMatch: TipoMatch;
    score: number;
  }>;
}

type ItemResultado = ResultadoDisponibilidade["resultados"][number];

// Linha relevante do cache local.
interface PublicacaoLocalRow {
  processo_numero: string | null;
  marca_nome: string | null;
  titular: string | null;
  classes: string[] | null;
  apresentacao: string | null;
  despachos: Array<{ codigo?: string; nome?: string }> | null;
}

/** O cache local não tem "situação" — usamos o último despacho publicado. */
function situacaoDeDespachos(despachos: PublicacaoLocalRow["despachos"]): string | null {
  if (!Array.isArray(despachos) || despachos.length === 0) return null;
  const nome = (despachos[despachos.length - 1]?.nome ?? "").trim();
  return nome || null;
}

/** Conta quantos campos de um resultado têm dado útil (para dedup por riqueza). */
function riqueza(r: ItemResultado): number {
  let n = 0;
  if (r.situacao) n++;
  if (r.titular) n++;
  if (r.classes.length > 0) n++;
  if (r.marca) n++;
  return n;
}

/**
 * Escapa vírgulas/parênteses que quebrariam o filtro `.or()` do PostgREST.
 * Nossa string normalizada só tem A-Z0-9 e espaço, mas mantemos por segurança.
 */
function limparParaFiltro(s: string): string {
  return s.replace(/[(),]/g, " ").trim();
}

/**
 * Busca candidatos no cache local: pré-filtra por substring da marca
 * normalizada OU por igualdade do código fonético, e refina em memória.
 */
async function buscarLocal(
  supabase: SupabaseClient,
  nome: string,
): Promise<{ consultada: boolean; itens: ItemResultado[] }> {
  const norm = limparParaFiltro(normalizar(nome));
  const fon = fonetico(nome);
  if (!norm) return { consultada: true, itens: [] };

  const filtros: string[] = [`marca_normalizada.ilike.%${norm}%`];
  if (fon) filtros.push(`marca_fonetica.eq.${fon}`);

  const { data, error } = await supabase
    .from("registro_rpi_publicacoes")
    .select("processo_numero, marca_nome, titular, classes, apresentacao, despachos")
    .or(filtros.join(","))
    .limit(MAX_CANDIDATOS_LOCAL);

  if (error) {
    console.error("[disponibilidade] busca local:", error.message);
    return { consultada: false, itens: [] };
  }

  const itens: ItemResultado[] = [];
  for (const row of (data ?? []) as PublicacaoLocalRow[]) {
    const marca = (row.marca_nome ?? "").trim();
    if (!marca) continue;
    const sim = avaliarSimilaridade(marca, nome);
    if (!sim) continue;
    itens.push({
      origem: "local",
      processoNumero: (row.processo_numero ?? "").trim(),
      marca,
      situacao: situacaoDeDespachos(row.despachos),
      titular: row.titular ?? null,
      classes: Array.isArray(row.classes) ? row.classes.filter(Boolean) : [],
      tipoMatch: sim.tipoMatch,
      score: sim.score,
    });
  }
  return { consultada: true, itens };
}

/**
 * Extrai o código numérico da classe Nice. A Infosimples devolve no formato
 * "NCL(11) 09"; queremos só o "09" (com zero à esquerda) para comparar com as
 * classes solicitadas e com o cache local.
 */
function extrairCodigoClasse(s: string): string {
  const m = s.match(/(\d{1,2})\s*$/);
  return m ? m[1].padStart(2, "0") : s.trim();
}

/** Converte um resultado da Infosimples num item, aplicando avaliarSimilaridade. */
function mapearInfosimples(r: MarcaInfosimples, nome: string): ItemResultado | null {
  if (!r.marca) return null;
  const sim = avaliarSimilaridade(r.marca, nome);
  if (!sim) return null;
  const classes = r.classe
    ? r.classe
        .split(/[;,]/)
        .map((c) => c.trim())
        .filter(Boolean)
        .map(extrairCodigoClasse)
    : [];
  return {
    origem: "inpi_live",
    processoNumero: r.processoNumero,
    marca: r.marca,
    situacao: r.situacao,
    titular: r.titular,
    classes,
    tipoMatch: sim.tipoMatch,
    score: sim.score,
  };
}

/**
 * Deduplica por processoNumero, preferindo o item com mais dados. Itens sem
 * número de processo não colidem entre si (mantidos por marca+origem).
 */
function deduplicar(itens: ItemResultado[]): ItemResultado[] {
  const porChave = new Map<string, ItemResultado>();
  const semProcesso: ItemResultado[] = [];
  for (const item of itens) {
    const chave = item.processoNumero;
    if (!chave) {
      semProcesso.push(item);
      continue;
    }
    const existente = porChave.get(chave);
    if (!existente) {
      porChave.set(chave, item);
      continue;
    }
    // Preferir o de maior score; empate -> o de mais dados.
    const trocar =
      item.score > existente.score ||
      (item.score === existente.score && riqueza(item) > riqueza(existente));
    if (trocar) porChave.set(chave, item);
  }
  return [...porChave.values(), ...semProcesso];
}

/**
 * Calcula o veredicto agregado considerando a interseção com as classes
 * solicitadas. Sem classes informadas, qualquer resultado conta para o veredicto.
 */
function calcularVeredicto(
  itens: ItemResultado[],
  classesSolicitadas: string[],
): Veredicto {
  if (itens.length === 0) return "provavelmente_disponivel";

  // Normaliza para código com zero à esquerda ("9" e "09" são a mesma classe).
  const normClasse = (c: string) => extrairCodigoClasse(c.trim());
  const semClasses = classesSolicitadas.length === 0;
  const solicitadasSet = new Set(
    classesSolicitadas.map(normClasse).filter(Boolean),
  );
  const emClasseSolicitada = (item: ItemResultado): boolean =>
    semClasses || item.classes.some((c) => solicitadasSet.has(normClasse(c)));

  // Match exato em classe solicitada (ou sem classes) -> indisponível.
  if (itens.some((i) => i.score === 1 && emClasseSolicitada(i))) {
    return "indisponivel";
  }
  if (itens.some((i) => i.score >= 0.9)) return "risco_alto";
  if (itens.some((i) => i.score >= SCORE_MINIMO)) return "risco_medio";
  return "provavelmente_disponivel";
}

/**
 * Verifica a disponibilidade de um nome de marca combinando cache local e
 * consulta ao vivo (Infosimples). Retorna o contrato consumido pela UI.
 */
export async function verificarDisponibilidade(
  supabase: SupabaseClient,
  { nome, classes = [] }: { nome: string; classes?: string[] },
): Promise<ResultadoDisponibilidade> {
  // a. Cache local.
  const local = await buscarLocal(supabase, nome);

  // b. Consulta ao vivo (best-effort).
  const inpiLive: ResultadoDisponibilidade["fontes"]["inpiLive"] = {
    consultada: false,
    total: 0,
  };
  const itensLive: ItemResultado[] = [];
  try {
    const classe = classes.length > 0 ? classes[0] : undefined;
    const resp = await consultarMarcaInpi({ marca: nome, classe });
    inpiLive.consultada = true;
    for (const r of resp.resultados) {
      const item = mapearInfosimples(r, nome);
      if (item) itensLive.push(item);
    }
  } catch (err) {
    if (err instanceof InfosimplesNaoConfigurado) {
      inpiLive.motivo = "token não configurado";
    } else {
      inpiLive.motivo =
        err instanceof Error ? err.message : "falha na consulta ao vivo";
    }
  }

  // c. Juntar, deduplicar, filtrar por score e ordenar.
  const todos = deduplicar([...local.itens, ...itensLive]).filter(
    (i) => i.score >= SCORE_MINIMO,
  );
  todos.sort((a, b) => b.score - a.score);

  // Totais das fontes contam os resultados relevantes de cada origem (pós-filtro).
  inpiLive.total = todos.filter((i) => i.origem === "inpi_live").length;
  const totalLocal = todos.filter((i) => i.origem === "local").length;

  // d. Veredicto agregado.
  const veredicto = calcularVeredicto(todos, classes);

  return {
    nome,
    veredicto,
    fontes: {
      local: { consultada: local.consultada, total: totalLocal },
      inpiLive,
    },
    resultados: todos,
  };
}
