import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  streamText,
  createDataStreamResponse,
  convertToCoreMessages,
  type Message as AiMessage,
} from "ai";
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

const AttachmentSchema = z.object({
  name: z.string(),
  contentType: z.string(),
  url: z.string(),
});

const UIMessageSchema = z.object({
  id: z.string().optional(),
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
  experimental_attachments: z.array(AttachmentSchema).optional(),
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
  // Anexos enviados junto da última mensagem do usuário (espelham
  // experimental_attachments). Persistidos no DB para reload.
  attachments: z.array(AttachmentSchema).optional(),
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
      attachments = [],
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
        // Prefer attachments from request body; fall back to the message's
        // experimental_attachments (set by useChat client).
        const lastUserAttachments =
          attachments.length > 0
            ? attachments
            : lastUser.experimental_attachments ?? [];
        const { error: insertErr } = await supabase
          .from("chat_messages")
          .insert({
            conversation_id: conversationId,
            role: "user",
            content: lastUser.content,
            cited_segments: citedSection?.segments ?? null,
            attachments:
              lastUserAttachments.length > 0 ? lastUserAttachments : null,
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

    let systemPrompt = buildSystemPrompt({ planMode, contextDocs });

    // If we have non-image attachments (e.g. PDFs/MDs), expose their names to
    // the model as text — most models won't read PDFs natively, but at least
    // they know what was attached. Images are forwarded as multimodal parts
    // by convertToCoreMessages.
    const lastUserMsgIndex = (() => {
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].role === "user") return i;
      }
      return -1;
    })();
    const lastUserMsg =
      lastUserMsgIndex >= 0 ? messages[lastUserMsgIndex] : null;
    const effectiveAttachments =
      attachments.length > 0
        ? attachments
        : lastUserMsg?.experimental_attachments ?? [];
    const nonImageAttachments = effectiveAttachments.filter(
      (a) => !a.contentType.startsWith("image/"),
    );
    if (nonImageAttachments.length > 0) {
      const list = nonImageAttachments
        .map((a) => `- ${a.name} (${a.contentType})`)
        .join("\n");
      systemPrompt += `\n\nO usuário anexou os seguintes arquivos não-imagem (você não consegue ler o conteúdo diretamente — peça ao usuário para colar o trecho relevante se necessário):\n${list}`;
    }

    const sources = resolveSources(routedDocIds);

    // Convert UI messages (with experimental_attachments) into core messages
    // — this turns image attachments into multimodal content parts that the
    // model can see. Attach the request body's `attachments` to the last
    // user message (covers the case where the client sends them via body).
    const messagesForCore: AiMessage[] = messages.map((m, i) => {
      const base: AiMessage = {
        id: m.id ?? `msg-${i}`,
        role: m.role as AiMessage["role"],
        content: m.content,
      };
      const merged =
        i === lastUserMsgIndex && attachments.length > 0
          ? attachments
          : m.experimental_attachments;
      if (merged && merged.length > 0) {
        // Only forward image attachments to the model (other types will not
        // be understood; their names are already in the system prompt).
        const imageOnly = merged.filter((a) =>
          a.contentType.startsWith("image/"),
        );
        if (imageOnly.length > 0) {
          (base as AiMessage & { experimental_attachments?: typeof imageOnly })
            .experimental_attachments = imageOnly;
        }
      }
      return base;
    });

    const coreMessages = convertToCoreMessages(messagesForCore);

    return createDataStreamResponse({
      execute: (writer) => {
        if (sources.length > 0) {
          writer.writeMessageAnnotation({ kind: "sources", sources });
        }

        const result = streamText({
          model: openrouter(model),
          system: systemPrompt,
          messages: coreMessages,
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
