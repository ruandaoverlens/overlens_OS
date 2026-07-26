// Assistente de IA do módulo "Registros" — montagem de contexto e
// de system prompt. Ver ADR-0001 (sub-decisão 3): o assistente informa e
// estrutura caminhos, a decisão jurídica é sempre humana; toda resposta deve
// se apoiar nos dados reais do módulo injetados aqui (grounding obrigatório,
// nunca "de memória").

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ALERTA_TIPO_LABEL,
  ALERTA_STATUS_LABEL,
  DOCUMENTO_TIPO_LABEL,
  EVENTO_TIPO_LABEL,
  PROCESSO_STATUS_LABEL,
  formatarData,
} from "./types";
import type {
  AlertaRow,
  DocumentoRow,
  DocumentoTipo,
  EventoRow,
  MarcaRow,
  ProcessoRow,
} from "./types";

const BUCKET = "registro-docs";
// Limite de caracteres por documento anexado, para não estourar o contexto.
const MAX_DOC_CHARS = 50_000;

// ─── Contexto do portfólio ─────────────────────────────────────

export interface MontarContextoOpts {
  /** Quando informado, foca o contexto nessa marca. Senão, portfólio inteiro. */
  marcaId?: string | null;
}

/**
 * Busca marcas + processos + eventos + alertas pendentes (e candidatos do
 * radar pendentes/em alerta) e serializa tudo em texto estruturado (tipo XML) para injeção no system
 * prompt. Identificadores (nº de processo, datas, status) ficam explícitos
 * para que o modelo sempre cite a fonte de cada afirmação.
 */
export async function montarContexto(
  supabase: SupabaseClient,
  opts: MontarContextoOpts = {},
): Promise<string> {
  const { marcaId } = opts;

  let marcasQuery = supabase.from("registro_marcas").select("*").order("nome");
  if (marcaId) marcasQuery = marcasQuery.eq("id", marcaId);
  const { data: marcasData } = await marcasQuery;
  const marcas = (marcasData ?? []) as MarcaRow[];
  const marcaIds = marcas.map((m) => m.id);

  if (marcaIds.length === 0) {
    return "<portfolio>\n  (nenhuma marca cadastrada no módulo)\n</portfolio>";
  }

  const { data: processosData } = await supabase
    .from("registro_processos")
    .select("*")
    .in("marca_id", marcaIds)
    .order("numero");
  const processos = (processosData ?? []) as ProcessoRow[];
  const processoIds = processos.map((p) => p.id);

  let eventos: EventoRow[] = [];
  if (processoIds.length > 0) {
    const { data: eventosData } = await supabase
      .from("registro_eventos")
      .select("*")
      .in("processo_id", processoIds)
      .order("data", { ascending: false });
    eventos = (eventosData ?? []) as EventoRow[];
  }

  const { data: alertasData } = await supabase
    .from("registro_alertas")
    .select("*")
    .eq("status", "pendente")
    .order("data_limite", { ascending: true });
  let alertas = (alertasData ?? []) as AlertaRow[];
  if (marcaId) {
    // Mantém alertas ligados a um processo desta marca, ou alertas soltos
    // (sem processo_id — ex.: radar geral) quando focando numa marca.
    const processoSet = new Set(processoIds);
    alertas = alertas.filter((a) => !a.processo_id || processoSet.has(a.processo_id));
  }

  // Candidatos do Radar RPI ainda não revisados/descartados.
  const { data: candidatosData } = await supabase
    .from("registro_radar_candidatos")
    .select("*")
    .in("status", ["pendente", "alerta"])
    .limit(50);
  const candidatosRadar = (candidatosData ?? []) as Array<Record<string, unknown>>;

  const processosPorMarca = new Map<string, ProcessoRow[]>();
  for (const p of processos) {
    const arr = processosPorMarca.get(p.marca_id) ?? [];
    arr.push(p);
    processosPorMarca.set(p.marca_id, arr);
  }
  const eventosPorProcesso = new Map<string, EventoRow[]>();
  for (const e of eventos) {
    const arr = eventosPorProcesso.get(e.processo_id) ?? [];
    arr.push(e);
    eventosPorProcesso.set(e.processo_id, arr);
  }

  const linhas: string[] = [];
  linhas.push("<portfolio>");
  for (const marca of marcas) {
    linhas.push(
      `  <marca id="${marca.id}" nome="${marca.nome}" titular="${marca.titular}">`,
    );
    if (marca.apresentacao) linhas.push(`    apresentacao: ${marca.apresentacao}`);
    if (marca.observacoes) linhas.push(`    observacoes: ${marca.observacoes}`);

    const procs = processosPorMarca.get(marca.id) ?? [];
    if (procs.length === 0) {
      linhas.push(`    (nenhum processo cadastrado para esta marca)`);
    }
    for (const p of procs) {
      const classe = p.classe_descricao ? `${p.classe} - ${p.classe_descricao}` : p.classe;
      linhas.push(
        `    <processo numero="${p.numero}" classe="${classe}" status="${PROCESSO_STATUS_LABEL[p.status]}">`,
      );
      linhas.push(
        `      deposito: ${formatarData(p.data_deposito)} | concessao: ${formatarData(p.data_concessao)} | proxima_renovacao: ${formatarData(p.proxima_renovacao)}`,
      );
      if (p.situacao) linhas.push(`      situacao: ${p.situacao}`);
      if (p.observacoes) linhas.push(`      observacoes: ${p.observacoes}`);
      const evs = eventosPorProcesso.get(p.id) ?? [];
      if (evs.length > 0) {
        linhas.push(`      <eventos>`);
        for (const e of evs) {
          const rpi = e.rpi_numero ? ` (RPI ${e.rpi_numero})` : "";
          const desc = e.descricao ? ` — ${e.descricao}` : "";
          linhas.push(
            `        - [${formatarData(e.data)}] ${EVENTO_TIPO_LABEL[e.tipo]}: ${e.titulo}${rpi}${desc}`,
          );
        }
        linhas.push(`      </eventos>`);
      }
      linhas.push(`    </processo>`);
    }
    linhas.push(`  </marca>`);
  }
  linhas.push("</portfolio>");

  linhas.push("");
  linhas.push("<alertas_pendentes>");
  if (alertas.length === 0) {
    linhas.push("  (nenhum alerta pendente)");
  }
  for (const a of alertas) {
    const prazo = a.data_limite ? ` — prazo: ${formatarData(a.data_limite)}` : "";
    const desc = a.descricao ? ` — ${a.descricao}` : "";
    const proc = a.processo_id ? `, processo_id: ${a.processo_id}` : "";
    linhas.push(
      `  - [${ALERTA_TIPO_LABEL[a.tipo]} / ${ALERTA_STATUS_LABEL[a.status]}] ${a.titulo}${prazo}${desc} (origem: ${a.origem}${proc}, alerta_id: ${a.id})`,
    );
  }
  linhas.push("</alertas_pendentes>");

  if (candidatosRadar.length > 0) {
    linhas.push("");
    linhas.push("<candidatos_radar>");
    linhas.push(
      "  (publicações da RPI levantadas pelo matching determinístico, ainda não revisadas por humano)",
    );
    for (const c of candidatosRadar) {
      linhas.push(`  - ${JSON.stringify(c)}`);
    }
    linhas.push("</candidatos_radar>");
  }

  return linhas.join("\n");
}

// ─── Resolução de documentos anexados ──────────────────────────

export interface DocResolvido {
  id: string;
  titulo: string;
  tipo: DocumentoTipo;
  sensivel: boolean;
  /** Texto extraído do documento, quando o tipo suporta extração. */
  conteudo: string | null;
  /** Mensagem explicando por que o conteúdo não foi incluído. */
  aviso: string | null;
}

export interface ResolverDocumentosResult {
  docs: DocResolvido[];
  /** true se QUALQUER documento incluído com conteúdo extraído tem sensivel=true. */
  contemSensivel: boolean;
}

function isTextMime(mime: string | null): boolean {
  if (!mime) return false;
  const m = mime.toLowerCase();
  return m.startsWith("text/") || m.includes("json") || m.includes("xml");
}

/**
 * Para cada `registro_documentos` selecionado: se o mime for texto (text/*,
 * json, xml) baixa o conteúdo do bucket privado `registro-docs` via admin
 * client e inclui o texto (até ~50k chars). Caso contrário (PDF/imagem)
 * inclui só metadados + aviso de que o conteúdo não foi extraído.
 */
export async function resolverDocumentos(
  supabase: SupabaseClient,
  admin: SupabaseClient,
  documentoIds: string[],
): Promise<ResolverDocumentosResult> {
  if (!documentoIds || documentoIds.length === 0) {
    return { docs: [], contemSensivel: false };
  }

  const { data, error } = await supabase
    .from("registro_documentos")
    .select("*")
    .in("id", documentoIds);

  if (error || !data) {
    return { docs: [], contemSensivel: false };
  }

  const rows = data as DocumentoRow[];
  const docs: DocResolvido[] = [];
  let contemSensivel = false;

  for (const row of rows) {
    if (isTextMime(row.mime_type)) {
      const { data: file, error: dlErr } = await admin.storage
        .from(BUCKET)
        .download(row.storage_path);

      if (dlErr || !file) {
        docs.push({
          id: row.id,
          titulo: row.titulo,
          tipo: row.tipo,
          sensivel: row.sensivel,
          conteudo: null,
          aviso:
            "conteúdo não pôde ser baixado do armazenamento — cole o texto relevante na conversa se necessário",
        });
        continue;
      }

      let texto = await file.text();
      if (texto.length > MAX_DOC_CHARS) {
        texto = `${texto.slice(0, MAX_DOC_CHARS)}\n\n[...conteúdo truncado em ${MAX_DOC_CHARS.toLocaleString("pt-BR")} caracteres...]`;
      }

      docs.push({
        id: row.id,
        titulo: row.titulo,
        tipo: row.tipo,
        sensivel: row.sensivel,
        conteudo: texto,
        aviso: null,
      });
      if (row.sensivel) contemSensivel = true;
    } else {
      docs.push({
        id: row.id,
        titulo: row.titulo,
        tipo: row.tipo,
        sensivel: row.sensivel,
        conteudo: null,
        aviso: `conteúdo não extraído (${row.mime_type ?? "tipo desconhecido"}) — cole o texto relevante na conversa se necessário`,
      });
    }
  }

  return { docs, contemSensivel };
}

// ─── System prompt ──────────────────────────────────────────────

const REGRAS_ASSISTENTE = `Você é o assistente especializado em propriedade intelectual (registros de marca junto ao INPI e LPI — Lei da Propriedade Industrial) da equipe interna da Overlens, atuando dentro do módulo "Registros".

Papel: você INFORMA, contextualiza e estrutura caminhos de ação. Você NÃO decide. A decisão jurídica é sempre humana — do time com o escritório de propriedade intelectual.

Regras obrigatórias:
- Responda APENAS com base no <contexto_portfolio> e nos <documentos_anexados> fornecidos abaixo, mais conhecimento geral de processo INPI/LPI — e, quando usar conhecimento geral (não específico do portfólio Overlens), rotule claramente como tal (ex.: "de forma geral, no rito do INPI...").
- Cite a fonte de cada afirmação factual: número do processo, nome/tipo do documento anexado, ou id do alerta. Nunca afirme algo sobre o portfólio "de memória" — se não estiver no contexto fornecido, diga que a informação não está disponível.
- Quando faltar informação para responder com segurança, diga explicitamente o que falta e sugira qual documento anexar ou qual dado cadastrar.
- Nunca apresente uma recomendação como decisão tomada. Apresente caminhos possíveis com prós e contras, e lembre que a palavra final é do time com o escritório jurídico.
- Sem promessas de resultado (nunca garanta que um registro será concedido, que uma oposição terá sucesso, etc.).
- Português brasileiro claro e direto, sem jargão jurídico desnecessário — quando usar um termo técnico, explique-o brevemente.`;

/**
 * Monta o system prompt completo: papel + regras + documentos anexados
 * (quando houver) + contexto do portfólio.
 */
export function montarSystemPrompt(
  contexto: string,
  docsAnexados: DocResolvido[] = [],
): string {
  let prompt = REGRAS_ASSISTENTE;

  if (docsAnexados.length > 0) {
    prompt += "\n\n<documentos_anexados>";
    for (const doc of docsAnexados) {
      prompt += `\n<documento id="${doc.id}" titulo="${doc.titulo}" tipo="${DOCUMENTO_TIPO_LABEL[doc.tipo]}" sensivel="${doc.sensivel}">\n`;
      prompt += doc.conteudo ?? `(${doc.aviso ?? "conteúdo não disponível"})`;
      prompt += "\n</documento>";
    }
    prompt += "\n</documentos_anexados>";
  }

  prompt += `\n\n<contexto_portfolio>\n${contexto}\n</contexto_portfolio>`;

  return prompt;
}
