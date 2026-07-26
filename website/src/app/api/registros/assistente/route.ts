import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  streamText,
  createDataStreamResponse,
  convertToCoreMessages,
  type Message as AiMessage,
} from "ai";
import { requireRegistrosAdmin } from "@/lib/registros/guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { openrouter } from "@/lib/ai/openrouter";
import { DEFAULT_MODEL } from "@/lib/ai/models";
import type { ModelId } from "@/lib/ai/models";
import {
  montarContexto,
  montarSystemPrompt,
  resolverDocumentos,
} from "@/lib/registros/assistente";

export const maxDuration = 120;

// Documentos internos sensíveis nunca passam por modelos em tier gratuito
// (ADR-0001, sub-decisão 3). Id exato de AVAILABLE_MODELS em lib/ai/models.ts.
const SENSITIVE_MODEL: ModelId = "anthropic/claude-haiku-4.5";

const UIMessageSchema = z.object({
  id: z.string().optional(),
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
});

const BodySchema = z.object({
  messages: z.array(UIMessageSchema).min(1),
  marcaId: z.string().uuid().optional().nullable(),
  documentoIds: z.array(z.string().uuid()).optional(),
  conversaId: z.string().uuid().optional().nullable(),
  // true na primeira chamada após criar a conversa — a mensagem do usuário
  // já foi salva por /conversas, não deve ser gravada de novo.
  skipPersistFirstUser: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const guard = await requireRegistrosAdmin();
    if (!guard.ok) return guard.response;

    const json = await req.json().catch(() => null);
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Body inválido", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const {
      messages,
      marcaId,
      documentoIds = [],
      conversaId = null,
      skipPersistFirstUser = false,
    } = parsed.data;

    // Quando a conversa é persistida: valida posse e grava a última mensagem
    // do usuário (exceto na primeira chamada, já salva por /conversas).
    if (conversaId) {
      const { data: conversa } = await guard.supabase
        .from("registro_assistente_conversas")
        .select("id, user_id")
        .eq("id", conversaId)
        .maybeSingle();

      if (!conversa || conversa.user_id !== guard.userId) {
        return NextResponse.json({ error: "Conversa não encontrada" }, { status: 404 });
      }

      if (!skipPersistFirstUser) {
        const lastUser = [...messages].reverse().find((m) => m.role === "user");
        if (lastUser) {
          const { error: insertErr } = await guard.supabase
            .from("registro_assistente_mensagens")
            .insert({
              conversa_id: conversaId,
              role: "user",
              content: lastUser.content,
            });
          if (insertErr) {
            return NextResponse.json({ error: insertErr.message }, { status: 500 });
          }
        }
      }
    }

    const admin = createAdminClient();

    const [contexto, resolucao] = await Promise.all([
      montarContexto(guard.supabase, { marcaId: marcaId ?? null }),
      resolverDocumentos(guard.supabase, admin, documentoIds),
    ]);

    // Modelo por sensibilidade do dado: dados públicos -> DEFAULT_MODEL
    // (Gemma free). Qualquer documento anexado com CONTEÚDO sensível força
    // o modelo pago. Metadados (títulos/tipos) sozinhos não contam.
    const model: ModelId = resolucao.contemSensivel ? SENSITIVE_MODEL : DEFAULT_MODEL;

    const systemPrompt = montarSystemPrompt(contexto, resolucao.docs);

    const messagesForCore: AiMessage[] = messages.map((m, i) => ({
      id: m.id ?? `msg-${i}`,
      role: m.role,
      content: m.content,
    }));
    const coreMessages = convertToCoreMessages(messagesForCore);

    return createDataStreamResponse({
      execute: (writer) => {
        // Anota qual modelo foi usado (e por quê) logo no início do stream,
        // para a UI exibir o indicador de modelo em uso.
        writer.writeMessageAnnotation({
          kind: "model",
          model,
          contemSensivel: resolucao.contemSensivel,
        });

        const result = streamText({
          model: openrouter(model),
          system: systemPrompt,
          messages: coreMessages,
          maxTokens: 2000,
          onError: ({ error }) => {
            console.error("[registros/assistente] streamText error:", error);
          },
          onFinish: async ({ text }) => {
            if (!conversaId || !text) return;
            try {
              await guard.supabase.from("registro_assistente_mensagens").insert({
                conversa_id: conversaId,
                role: "assistant",
                content: text,
              });
            } catch (persistErr) {
              console.error(
                "[registros/assistente] falha ao persistir resposta:",
                persistErr,
              );
            }
          },
        });

        result.mergeIntoDataStream(writer);
      },
      onError: (error) => {
        console.error("[registros/assistente] stream error:", error);
        return "Algo deu errado ao gerar a resposta. Tente novamente.";
      },
    });
  } catch (err) {
    console.error("[registros/assistente] Error:", err);
    return NextResponse.json({ error: "Erro interno no assistente" }, { status: 500 });
  }
}
