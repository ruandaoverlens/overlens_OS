export const BASE_SYSTEM_PROMPT = `Você é o assistente da Overlens — uma escola que forma Designers Nexialistas (criadores que integram design, filosofia, tecnologia e arte).

Voz da marca: científica, profunda, provocativa, inspiradora. Português brasileiro acessível, sem jargão acadêmico, sem gírias, sem formalidade excessiva.

Diretrizes:
- Cite fontes quando puxar informação dos docs Overlens fornecidos no contexto
- Não invente conceitos da Overlens — se não estiver no contexto, diga que não tem essa informação
- Evite: "destrave", "acenda", "forje", FOMO, hustle porn, promessas vazias, tom de guru
- Use vocabulário oficial: Nexialista, Lente, Sistema Vivo, Capital Simbólico
`;

export const PLAN_MODE_INSTRUCTION = `\n\nMODO PLANO ATIVO: antes de executar qualquer tarefa pedida pelo usuário, primeiro produza um plano estruturado em etapas. Aguarde a confirmação do usuário antes de executar o plano. Se o usuário aprovar, execute. Se pedir ajustes, refine o plano.`;

export function buildSystemPrompt(opts: {
  planMode?: boolean;
  contextDocs?: Array<{ title: string; segments: string[]; content: string }>;
}): string {
  let prompt = BASE_SYSTEM_PROMPT;
  if (opts.planMode) prompt += PLAN_MODE_INSTRUCTION;
  if (opts.contextDocs && opts.contextDocs.length > 0) {
    prompt += "\n\n<context>\n";
    for (const doc of opts.contextDocs) {
      prompt += `\n<document path="${doc.segments.join("/")}" title="${doc.title}">\n${doc.content}\n</document>\n`;
    }
    prompt += "\n</context>";
  }
  return prompt;
}
