import { createAdminClient } from "@/lib/supabase/admin";
import { buildFeedbackPrompt } from "@/lib/magny/feedback";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RefinerInput {
  pipelineRunId: string;
  pipelineStepId: string;
}

export interface RefinerOutput {
  reportId: string;
  reportSlug: string;
  sectionsGenerated: number;
}

// Section keys in order (must match the DB constraint)
const SECTION_DEFINITIONS = [
  {
    key: "executive_summary",
    title: "Resumo Executivo",
    orderIndex: 1,
  },
  {
    key: "news_radar",
    title: "Radar de Notícias da Semana",
    orderIndex: 2,
  },
  {
    key: "connections",
    title: "Conexões e Padrões Cruzados",
    orderIndex: 3,
  },
  {
    key: "insights",
    title: "Insights Estratégicos",
    orderIndex: 4,
  },
  {
    key: "blind_spots",
    title: "Pontos Cegos e Ângulos Não Cobertos",
    orderIndex: 5,
  },
  {
    key: "opportunities",
    title: "Oportunidades Emergentes",
    orderIndex: 6,
  },
  {
    key: "threats",
    title: "Ameaças e Riscos no Horizonte",
    orderIndex: 7,
  },
  {
    key: "weekly_watchlist",
    title: "Checklist Semanal: O que Monitorar",
    orderIndex: 8,
  },
] as const;

type SectionKey = (typeof SECTION_DEFINITIONS)[number]["key"];

interface ReportSection {
  key: SectionKey;
  title: string;
  content: string;
}

interface OpenAIResponse {
  headline?: string;
  sections: ReportSection[];
}

// ---------------------------------------------------------------------------
// Database row types (subset of what we need)
// ---------------------------------------------------------------------------

interface NewsSourceRow {
  id: string;
  news_item_id: string;
  url: string | null;
  title: string | null;
  type: string | null;
  content_summary: string | null;
  data_points: Record<string, unknown>;
}

interface NewsItemRow {
  id: string;
  title: string;
  original_url: string | null;
  summary: string | null;
  relevance_score: number | null;
  category: string | null;
  confidence_level: string;
  time_horizon: string | null;
  metadata: Record<string, unknown>;
  news_sources: NewsSourceRow[];
}

// ---------------------------------------------------------------------------
// System prompt (in Portuguese, as required by the reference doc)
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `Você é um Analista Sênior de Inteligência de Mercado e Tendências com foco em síntese estratégica de notícias e formulação de recomendações acionáveis para o público Vanguarda — profissionais atentos a IA, tecnologia, negócios e cultura digital. Sua atuação exige competências centrais como leitura crítica de múltiplas fontes, identificação de padrões emergentes, avaliação da confiabilidade das informações e capacidade de gerar insights estratégicos e práticos. Você domina frameworks de foresight (como STEEP, Círculos de Controle/Influência e Sinais Fracos), análise causal (Método de Abdução de Peirce) e triangulação de fontes. Sua abordagem é fundamentada na tradição de inteligência competitiva de Michael Porter, na análise de cenários de Peter Schwartz e nos métodos empíricos de validação de hipóteses defendidos por Nate Silver. Trabalha em Nível 5 (Jaques), com raciocínio sistêmico, conexões transversais e horizonte temporal de até 3 anos. Utiliza ferramentas como Excel analítico, planilhas colaborativas, LLMs como assistentes de síntese, análise semântica via NLP e bancos como Crunchbase, Statista e bases regulatórias. Sua entrega é clara, estruturada e voltada à ação estratégica imediata, com diferenciação precisa entre fatos, inferências e hipóteses. Você transforma ruído informacional em vantagem competitiva com precisão cirúrgica e contextualização profunda.

REGRAS DE QUALIDADE OBRIGATÓRIAS:
- Nunca invente dados, citações ou fatos.
- Quando houver divergência entre fontes, aponte a divergência e indique qual versão parece mais sólida e por quê (ex.: fonte primária, comunicado oficial, metodologia explícita, reputação).
- Diferencie claramente:
  - Fato confirmado (com suporte nas fontes)
  - Inferência (sua conclusão a partir das fontes)
  - Hipótese (o que pode acontecer; sinalize como hipótese)
- Sempre que mencionar um dado (ex.: percentual, crescimento, adoção), registre: qual fonte, qual contexto, qual limitação (se estiver claro).
- Evite manchetes enganosas: reescreva o ponto central com linguagem precisa.
- Trabalhe somente com o material fornecido. Se algo essencial estiver faltando, registre como lacuna.

REGRAS DE CITAÇÃO E FONTES:
- Use links inline no formato Markdown [texto](URL) sempre que referenciar uma notícia ou fonte.
- Na tabela do Radar, inclua o link na coluna "O que aconteceu" usando formato [descrição curta](URL).
- Ao mencionar dados, estatísticas ou fatos específicos de uma fonte adicional, inclua o link inline.
- Cada notícia do Radar deve ter pelo menos 1 link para a fonte principal.
- Nas seções de análise (Conexões, Insights, etc.), referencie as fontes quando citar fatos específicos.

O RELATÓRIO É ORGANIZADO EM 3 PILARES FIXOS:
- **TECNOLOGIA** — IA, infraestrutura, ferramentas, open source, segurança, dados
- **NEGÓCIOS** — estratégia, funding, mercados, regulação, pricing, growth
- **CRIAÇÃO** — design, maker culture, creator economy, ferramentas de criação, cultura digital

CRITÉRIOS DE PRIORIZAÇÃO (viés utilitarista):
Ao decidir o que entra com mais destaque, use estes critérios:
- Utilidade prática (pode ser usado para decidir, construir ou evitar erro?)
- Novidade real (mudança genuína vs repetição)
- Impacto no ecossistema (efeito em mercados, ferramentas, comportamentos)
- Relevância Vanguarda (alinhamento com os 3 pilares)
- Potencial de inspiração/alerta (move à ação?)

REGRA DE EQUILÍBRIO: Todos os 3 pilares devem estar representados em TODAS as seções analíticas. Nenhum pilar pode ser ignorado.

PERGUNTAS INTERNAS (faça silenciosamente antes de responder):
- O que é "sinal" vs "ruído" nesta semana?
- O que é consequência de tendências antigas vs ruptura nova?
- Quem ganha / quem perde e por quê?
- O que muda em custos, distribuição, confiança, regulação ou poder de mercado?
- Quais métricas confirmariam/negariam as teses?

FORMATO DE SAÍDA OBRIGATÓRIO:
Retorne EXCLUSIVAMENTE um objeto JSON válido com a seguinte estrutura. Não inclua nenhum texto antes ou depois do JSON.

{
  "headline": "Uma frase curta, provocativa e persuasiva que capture o tema dominante da semana. Máximo 8 palavras. Exemplos: 'A corrida pelo domínio da IA acelerou', 'Regulação global entra em modo ataque', 'Big Tech reescreve as regras do jogo'. NÃO use dois-pontos, aspas ou pontuação dupla.",
  "sections": [
    {
      "key": "executive_summary",
      "title": "Resumo Executivo",
      "content": "Markdown com 3-5 bullets dos movimentos mais importantes da semana + 1 frase 'O que muda no tabuleiro' para a Vanguarda. Máximo 10 linhas."
    },
    {
      "key": "news_radar",
      "title": "Radar de Notícias da Semana",
      "content": "Tabela Markdown com colunas: Pilar | O que aconteceu (com link [título](URL) para a fonte principal) | Por que importa agora | Grau de confiança (Alto/Médio/Baixo) | Horizonte (imediato 0-3m / curto 3-12m / médio 1-3a). Os valores da coluna Pilar devem ser: TECNOLOGIA, NEGÓCIOS ou CRIAÇÃO."
    },
    {
      "key": "connections",
      "title": "Conexões e Padrões Cruzados",
      "content": "3-6 padrões que conectam várias notícias. Para cada padrão: evidências (quais notícias suportam) + implicação."
    },
    {
      "key": "insights",
      "title": "Insights Estratégicos",
      "content": "7-12 insights. Formato de cada insight — **Insight:** ... | **Base:** ... | **Implicação prática:** ..."
    },
    {
      "key": "blind_spots",
      "title": "Pontos Cegos e Ângulos Não Cobertos",
      "content": "5-10 pontos cegos. Formato: **Ponto cego:** ... | **Por que é cego:** ... | **Como verificar:** ..."
    },
    {
      "key": "opportunities",
      "title": "Oportunidades Emergentes",
      "content": "5-10 oportunidades. Formato: **Oportunidade:** ... | **Para quem:** ... | **Janela:** ... | **Primeiro passo:** ..."
    },
    {
      "key": "threats",
      "title": "Ameaças e Riscos no Horizonte",
      "content": "5-10 ameaças. Formato: **Ameaça:** ... | **Cenário de impacto:** leve/moderado/severo | **Sinais de alerta:** ... | **Mitigação sugerida:** ..."
    },
    {
      "key": "weekly_watchlist",
      "title": "Checklist Semanal: O que Monitorar",
      "content": "8-12 itens curtos de monitoramento para a próxima semana (decisões regulatórias, launches, métricas, rumores, movimentos de concorrentes, novos dados)."
    }
  ]
}`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns the Monday and Friday of the week that contains `date`.
 * Week starts on Monday (ISO week convention).
 */
function getWeekRange(date: Date): { monday: Date; friday: Date } {
  const day = date.getDay(); // 0 = Sunday, 1 = Monday, …, 6 = Saturday
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  friday.setHours(0, 0, 0, 0);

  return { monday, friday };
}

/** Format a Date as "YYYY-MM-DD" */
function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Map DB confidence_level value to Portuguese label */
function confidenceLevelPt(level: string): string {
  const map: Record<string, string> = {
    high: "Alto",
    medium: "Médio",
    low: "Baixo",
  };
  return map[level] ?? level;
}

/** Map DB time_horizon value to Portuguese label */
function timeHorizonPt(horizon: string | null): string {
  const map: Record<string, string> = {
    immediate: "Imediato (0-3m)",
    short: "Curto (3-12m)",
    medium: "Médio (1-3a)",
  };
  return horizon ? (map[horizon] ?? horizon) : "—";
}

/** Map DB category value to the new pilar label (with accent for display) */
function categoryPt(category: string | null): string {
  const map: Record<string, string> = {
    tecnologia: "TECNOLOGIA",
    negocios: "NEGÓCIOS",
    criacao: "CRIAÇÃO",
    // Legacy mappings for backwards compat
    ai: "TECNOLOGIA",
    technology: "TECNOLOGIA",
    business: "NEGÓCIOS",
    culture: "CRIAÇÃO",
    regulation: "CRIAÇÃO",
  };
  return category ? (map[category] ?? category) : "TECNOLOGIA";
}

/**
 * Build the user-facing news block that is injected into the prompt.
 * Mirrors the format described in section "1) Entradas" of the reference doc.
 */
function buildNewsBlock(items: NewsItemRow[]): string {
  return items
    .map((item, index) => {
      const lines: string[] = [
        `**Notícia #${index + 1}:** ${item.title}`,
        `**Categoria:** ${categoryPt(item.category)}`,
        `**Grau de confiança:** ${confidenceLevelPt(item.confidence_level)}`,
        `**Horizonte temporal:** ${timeHorizonPt(item.time_horizon)}`,
      ];

      if (item.original_url) {
        lines.push(`**URL principal:** ${item.original_url}`);
      }

      if (item.summary) {
        lines.push(`**Resumo/Notas:** ${item.summary}`);
      }

      if (item.relevance_score !== null) {
        lines.push(`**Score de relevância:** ${item.relevance_score}/10`);
      }

      // Additional sources found by the Expander agent
      if (item.news_sources && item.news_sources.length > 0) {
        const sourceLines = item.news_sources.map((src, si) => {
          const parts: string[] = [`  Fonte ${si + 1}:`];
          if (src.title) parts.push(`    Título: ${src.title}`);
          if (src.url) parts.push(`    URL: ${src.url}`);
          if (src.type) parts.push(`    Tipo: ${src.type}`);
          if (src.content_summary)
            parts.push(`    Resumo: ${src.content_summary}`);

          // Flatten data_points if present
          if (src.data_points && Object.keys(src.data_points).length > 0) {
            parts.push(
              `    Dados: ${JSON.stringify(src.data_points, null, 2)}`
            );
          }
          return parts.join("\n");
        });
        lines.push(`**Fontes adicionais:**\n${sourceLines.join("\n\n")}`);
      }

      // Extra metadata fields provided by earlier agents
      if (item.metadata && Object.keys(item.metadata).length > 0) {
        const { initial_assessment, statistics, ...rest } =
          item.metadata as Record<string, unknown>;
        if (initial_assessment) {
          lines.push(`**Avaliação inicial:** ${initial_assessment}`);
        }
        if (statistics) {
          lines.push(`**Dados/Estatísticas:** ${statistics}`);
        }
        if (Object.keys(rest).length > 0) {
          lines.push(`**Metadados adicionais:** ${JSON.stringify(rest)}`);
        }
      }

      return lines.join("\n");
    })
    .join("\n\n---\n\n");
}

/**
 * Call the OpenAI Chat Completions API directly via fetch.
 * Returns parsed JSON from the model response.
 */
async function callOpenAI(
  systemPrompt: string,
  userPrompt: string
): Promise<OpenAIResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      temperature: 0.4, // low enough for factual accuracy, some creativity allowed
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `OpenAI API error ${response.status}: ${response.statusText} — ${errorBody}`
    );
  }

  const data = (await response.json()) as {
    choices: Array<{
      message: {
        content: string;
      };
    }>;
  };

  const rawContent = data.choices?.[0]?.message?.content;
  if (!rawContent) {
    throw new Error("OpenAI returned an empty response");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawContent);
  } catch {
    throw new Error(
      `Failed to parse OpenAI JSON response: ${rawContent.slice(0, 300)}`
    );
  }

  // Validate the shape we expect
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !Array.isArray((parsed as Record<string, unknown>).sections)
  ) {
    throw new Error(
      `Unexpected OpenAI response shape: ${JSON.stringify(parsed).slice(0, 300)}`
    );
  }

  return parsed as OpenAIResponse;
}

/**
 * Assemble the full Markdown document from the ordered sections.
 * This becomes the `markdown_content` field on the `reports` row.
 */
/**
 * Builds a "Fontes e Referências" section from the news items and their sources.
 * This is generated programmatically (not by the LLM) to ensure accuracy of URLs.
 */
function buildSourcesSection(items: NewsItemRow[]): string {
  const lines: string[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const mainUrl = item.original_url || "";
    const mainLink = mainUrl ? `[${item.title}](${mainUrl})` : item.title;

    lines.push(`**${i + 1}. ${mainLink}**`);

    if (item.news_sources && item.news_sources.length > 0) {
      for (const src of item.news_sources) {
        const srcTitle = src.title || "Fonte adicional";
        const srcUrl = src.url || "";
        if (srcUrl) {
          lines.push(`- [${srcTitle}](${srcUrl})`);
        } else {
          lines.push(`- ${srcTitle}`);
        }
      }
    }

    lines.push("");
  }

  return lines.join("\n");
}

function assembleMarkdown(
  sections: ReportSection[],
  weekStart: Date,
  weekEnd: Date,
  newsItems?: NewsItemRow[],
  headline?: string
): string {
  const titleText = headline
    ? `# ADS-${toDateString(weekStart)}: ${headline}`
    : `# Arquivo de Sinais — Semana de ${toDateString(weekStart)} a ${toDateString(weekEnd)}`;
  const header = [
    titleText,
    "",
    `> Relatório de inteligência estratégica produzido automaticamente pelo sistema Magny.`,
    "",
  ].join("\n");

  const body = sections
    .map((section) => {
      const sectionDef = SECTION_DEFINITIONS.find((d) => d.key === section.key);
      const title = sectionDef?.title ?? section.title;
      return `## ${title}\n\n${section.content}`;
    })
    .join("\n\n---\n\n");

  // Append sources section if news items are available
  let sourcesSection = "";
  if (newsItems && newsItems.length > 0) {
    sourcesSection = `\n\n---\n\n## Fontes e Referências\n\n${buildSourcesSection(newsItems)}`;
  }

  return `${header}${body}${sourcesSection}\n`;
}

// ---------------------------------------------------------------------------
// Main exported function
// ---------------------------------------------------------------------------

export async function runRefiner(input: RefinerInput): Promise<RefinerOutput> {
  const { pipelineRunId, pipelineStepId } = input;
  const supabase = createAdminClient();

  // ------------------------------------------------------------------
  // 1. Mark pipeline_step as running
  // ------------------------------------------------------------------
  await supabase
    .from("pipeline_steps")
    .update({ status: "running", started_at: new Date().toISOString() })
    .eq("id", pipelineStepId);

  try {
    // ------------------------------------------------------------------
    // 2. Fetch selected news_items with their news_sources
    // ------------------------------------------------------------------
    const { data: newsItems, error: newsError } = await supabase
      .from("news_items")
      .select(
        `
        id,
        title,
        original_url,
        summary,
        relevance_score,
        category,
        confidence_level,
        time_horizon,
        metadata,
        news_sources (
          id,
          news_item_id,
          url,
          title,
          type,
          content_summary,
          data_points
        )
      `
      )
      .eq("pipeline_run_id", pipelineRunId)
      .eq("is_selected", true)
      .order("relevance_score", { ascending: false });

    if (newsError) {
      throw new Error(`Failed to fetch news_items: ${newsError.message}`);
    }

    if (!newsItems || newsItems.length === 0) {
      throw new Error(
        `No selected news_items found for pipeline_run_id ${pipelineRunId}`
      );
    }

    const items = newsItems as unknown as NewsItemRow[];

    // ------------------------------------------------------------------
    // 3. Prepare the prompt context
    // ------------------------------------------------------------------
    const newsBlock = buildNewsBlock(items);
    const userPrompt = `Aqui está o pacote de notícias e fontes da semana para você analisar e gerar o Arquivo de Sinais:

${newsBlock}

Lembre-se: retorne EXCLUSIVAMENTE o JSON conforme o formato especificado no system prompt. Não inclua nenhum texto fora do JSON.`;

    // ------------------------------------------------------------------
    // 4. Build the effective system prompt, appending any lessons learned
    //    from previous admin reviews so the refiner improves over time.
    // ------------------------------------------------------------------
    const feedbackSection = await buildFeedbackPrompt();
    const effectiveSystemPrompt = feedbackSection
      ? `${SYSTEM_PROMPT}\n\n${feedbackSection}`
      : SYSTEM_PROMPT;

    // ------------------------------------------------------------------
    // 5. Call OpenAI gpt-4o
    // ------------------------------------------------------------------
    const openAIResult = await callOpenAI(effectiveSystemPrompt, userPrompt);

    // ------------------------------------------------------------------
    // 6. Parse & validate sections
    // ------------------------------------------------------------------
    const validSectionKeys = new Set(
      SECTION_DEFINITIONS.map((d) => d.key as string)
    );

    const parsedSections: ReportSection[] = openAIResult.sections.filter(
      (s): s is ReportSection =>
        typeof s.key === "string" &&
        validSectionKeys.has(s.key) &&
        typeof s.title === "string" &&
        typeof s.content === "string"
    );

    // Ensure all 8 sections are present; fill missing ones with a placeholder
    const parsedByKey = new Map(parsedSections.map((s) => [s.key, s]));
    const orderedSections: ReportSection[] = SECTION_DEFINITIONS.map((def) => {
      const found = parsedByKey.get(def.key);
      if (found) return found;
      // Fallback: section was not returned by the model
      return {
        key: def.key,
        title: def.title,
        content: `_Seção não gerada pelo modelo._`,
      };
    });

    // ------------------------------------------------------------------
    // 7. Calculate week range (Monday → Friday of current week)
    // ------------------------------------------------------------------
    const now = new Date();
    const { monday: weekStart, friday: weekEnd } = getWeekRange(now);
    const slug = toDateString(weekEnd); // YYYY-MM-DD of Friday

    // ------------------------------------------------------------------
    // 8. Assemble full markdown document
    // ------------------------------------------------------------------
    const markdownContent = assembleMarkdown(orderedSections, weekStart, weekEnd, items, openAIResult.headline);

    // ------------------------------------------------------------------
    // 9. Create the report record
    // ------------------------------------------------------------------
    // Format date as DD/MM/YY for the title
    const startDD = String(weekStart.getDate()).padStart(2, "0");
    const startMM = String(weekStart.getMonth() + 1).padStart(2, "0");
    const startYY = String(weekStart.getFullYear()).slice(-2);
    const headline = openAIResult.headline ?? "Arquivo de Sinais";
    const reportTitle = `ADS-${startDD}/${startMM}/${startYY}: ${headline}`;

    const { data: reportRow, error: reportError } = await supabase
      .from("reports")
      .insert({
        pipeline_run_id: pipelineRunId,
        title: reportTitle,
        slug,
        status: "draft",
        week_start: toDateString(weekStart),
        week_end: toDateString(weekEnd),
        markdown_content: markdownContent,
        metadata: {
          news_item_count: items.length,
          generated_at: now.toISOString(),
        },
      })
      .select("id")
      .single();

    if (reportError) {
      throw new Error(`Failed to create report record: ${reportError.message}`);
    }

    const reportId = reportRow.id as string;

    // ------------------------------------------------------------------
    // 10. Create report_sections records
    // ------------------------------------------------------------------
    const sectionInserts = orderedSections.map((section) => {
      const def = SECTION_DEFINITIONS.find((d) => d.key === section.key)!;
      return {
        report_id: reportId,
        section_key: section.key,
        title: section.title,
        content: section.content,
        order_index: def.orderIndex,
      };
    });

    const { error: sectionsError } = await supabase
      .from("report_sections")
      .insert(sectionInserts);

    if (sectionsError) {
      throw new Error(
        `Failed to create report_sections: ${sectionsError.message}`
      );
    }

    // ------------------------------------------------------------------
    // 11. Mark pipeline_step as completed
    // ------------------------------------------------------------------
    const output: RefinerOutput = {
      reportId,
      reportSlug: slug,
      sectionsGenerated: orderedSections.length,
    };

    await supabase
      .from("pipeline_steps")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        output_data: output,
      })
      .eq("id", pipelineStepId);

    return output;
  } catch (err) {
    // ------------------------------------------------------------------
    // Error path: mark pipeline_step as failed
    // ------------------------------------------------------------------
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error in Refiner agent";

    await supabase
      .from("pipeline_steps")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
        error_message: errorMessage,
      })
      .eq("id", pipelineStepId);

    throw err;
  }
}
