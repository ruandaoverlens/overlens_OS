import { generateObject } from "ai";
import { z } from "zod";
import { openrouter } from "./openrouter";
import { ROUTER_MODEL } from "./models";
import type { DocIndexEntry } from "./types";

const RouterOutputSchema = z.object({
  doc_ids: z.array(z.string()).max(5),
  reasoning: z.string().optional(),
});

/**
 * Roteia o pedido do usuário para até 5 documentos relevantes do índice.
 * Modelo barato (ROUTER_MODEL via OpenRouter). Retorna IDs (segments.join("/")).
 */
export async function routeDocs(
  userPrompt: string,
  index: DocIndexEntry[],
): Promise<string[]> {
  if (index.length === 0) return [];

  // Compact brief — title + summary only. Free-tier OpenRouter caps prompt
  // tokens around ~14k, and including ai_when_to_use blows past that.
  const indexBrief = index
    .map((d) => `[${d.id}] (${d.priority}) ${d.title} — ${d.summary}`)
    .join("\n");

  try {
    const { object } = await generateObject({
      model: openrouter(ROUTER_MODEL),
      schema: RouterOutputSchema,
      maxTokens: 500,
      prompt: `Você é um roteador de contexto. Dado o pedido do usuário e o índice de documentos da Overlens abaixo, escolha no MÁXIMO 5 documentos mais relevantes pra responder bem. Priorize docs com priority=high quando empatados em relevância. Se nada for claramente relevante, retorne array vazio. Retorne apenas os IDs.

Pedido do usuário:
"""
${userPrompt}
"""

Índice (id | priority/system | título — summary | When: ai_when_to_use):
${indexBrief}`,
    });

    // Filtrar IDs que não estão no índice (segurança contra hallucination de slug)
    const valid = new Set(index.map((d) => d.id));
    return object.doc_ids.filter((id) => valid.has(id));
  } catch (err) {
    console.error("[router] failed to route docs:", err);
    return [];
  }
}
