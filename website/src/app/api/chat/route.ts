import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { streamText, createDataStreamResponse } from "ai";
import { createClient } from "@/lib/supabase/server";
import { openrouter } from "@/lib/ai/openrouter";
import { AVAILABLE_MODELS, DEFAULT_MODEL } from "@/lib/ai/models";
import { buildSystemPrompt } from "@/lib/ai/system-prompts";
import { getDocsIndex, loadDocsByIds } from "@/lib/ai/docs-index";
import { routeDocs } from "@/lib/ai/router";
import { classifyChatError } from "@/lib/ai/chat-errors";
import { resolveSources } from "@/lib/ai/sources";

const ModelIdSchema = z.enum(
  AVAILABLE_MODELS.map((m) => m.id) as [string, ...string[]],
);

const UIMessageSchema = z.object({
  id: z.string().optional(),
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
});

const CitedSectionSchema = z
  .object({
    title: z.string(),
    segments: z.array(z.string()),
  })
  .nullable()
  .optional();

const BodySchema = z.object({
  conversationId: z.string().uuid(),
  messages: z.array(UIMessageSchema).min(1),
  model: ModelIdSchema.optional(),
  planMode: z.boolean().optional(),
  citedSection: CitedSectionSchema,
  skipPersistFirstUser: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const json = await req.json();
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Body inválido", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const {
      conversationId,
      messages,
      model: requestedModel,
      planMode = false,
      citedSection = null,
      skipPersistFirstUser = false,
    } = parsed.data;

    const model = requestedModel ?? DEFAULT_MODEL;

    // Ownership check
    const { data: conversation, error: convErr } = await supabase
      .from("chat_conversations")
      .select("id, user_id")
      .eq("id", conversationId)
      .maybeSingle();

    if (convErr) {
      return NextResponse.json({ error: convErr.message }, { status: 500 });
    }
    if (!conversation || conversation.user_id !== user.id) {
      return NextResponse.json(
        { error: "Conversa não encontrada" },
        { status: 404 },
      );
    }

    // Persist last user message (unless skipping — set true on the first call,
    // since /conversations already saved it).
    if (!skipPersistFirstUser) {
      const lastUser = [...messages].reverse().find((m) => m.role === "user");
      if (lastUser) {
        const { error: insertErr } = await supabase
          .from("chat_messages")
          .insert({
            conversation_id: conversationId,
            role: "user",
            content: lastUser.content,
            cited_segments: citedSection?.segments ?? null,
          });
        if (insertErr) {
          return NextResponse.json(
            { error: insertErr.message },
            { status: 500 },
          );
        }
      }
    }

    // Resolve context docs
    let contextDocs: Array<{
      title: string;
      segments: string[];
      content: string;
    }> = [];
    const lastUserMessage =
      [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
    let routedDocIds: string[] = [];

    if (
      citedSection &&
      Array.isArray(citedSection.segments) &&
      citedSection.segments.length > 0
    ) {
      // Usuário citou seção explicitamente — pular roteador, usar só essa
      const id = citedSection.segments.join("/");
      contextDocs = loadDocsByIds([id]);
      routedDocIds = [id];
    } else if (lastUserMessage.trim().length > 0) {
      try {
        const index = getDocsIndex();
        // Cap router latency. If it takes more than 3s, drop context and stream sooner.
        const ROUTER_TIMEOUT_MS = 3000;
        const routerPromise = routeDocs(lastUserMessage, index);
        const timeoutPromise = new Promise<string[]>((resolve) =>
          setTimeout(() => resolve([]), ROUTER_TIMEOUT_MS),
        );
        routedDocIds = await Promise.race([routerPromise, timeoutPromise]);
        if (routedDocIds.length > 0) {
          contextDocs = loadDocsByIds(routedDocIds);
        }
      } catch (err) {
        console.error(
          "[/api/chat] router failed, continuing without context:",
          err,
        );
      }
    }

    const system = buildSystemPrompt({ planMode, contextDocs });

    const sources = resolveSources(routedDocIds);

    return createDataStreamResponse({
      execute: (writer) => {
        if (sources.length > 0) {
          writer.writeMessageAnnotation({ kind: "sources", sources });
        }

        const result = streamText({
          model: openrouter(model),
          system,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          maxTokens: 2000,
          onError: ({ error }) => {
            console.error("[chat] streamText error:", error);
          },
          onFinish: async ({ text, usage }) => {
            try {
              await supabase.from("chat_messages").insert({
                conversation_id: conversationId,
                role: "assistant",
                content: text,
                tokens_in: usage?.promptTokens ?? null,
                tokens_out: usage?.completionTokens ?? null,
                routed_doc_ids: routedDocIds,
              });
            } catch (err) {
              console.error("[chat] Failed to persist assistant message:", err);
            }
          },
        });

        result.mergeIntoDataStream(writer);
      },
      onError: (error) => classifyChatError(error).message,
    });
  } catch (err) {
    console.error("[chat] Error:", err);
    return NextResponse.json(
      { error: "Erro interno no chat" },
      { status: 500 },
    );
  }
}
