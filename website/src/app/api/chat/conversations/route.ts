import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { AVAILABLE_MODELS, DEFAULT_MODEL } from "@/lib/ai/models";

const ModelIdSchema = z.enum(
  AVAILABLE_MODELS.map((m) => m.id) as [string, ...string[]],
);

const CitedSectionSchema = z
  .object({
    title: z.string(),
    segments: z.array(z.string()),
  })
  .nullable()
  .optional();

const AttachmentSchema = z.object({
  name: z.string(),
  contentType: z.string(),
  url: z.string(),
});

const PostBodySchema = z
  .object({
    firstMessage: z.string(),
    model: ModelIdSchema.optional(),
    planMode: z.boolean().optional(),
    citedSection: CitedSectionSchema,
    attachments: z.array(AttachmentSchema).optional(),
  })
  .refine(
    (val) => val.firstMessage.trim().length > 0 || (val.attachments?.length ?? 0) > 0,
    { message: "Mensagem ou anexo obrigatório" },
  );

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("chat_conversations")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ conversations: data ?? [] });
  } catch (err) {
    console.error("[chat/conversations GET] Error:", err);
    return NextResponse.json(
      { error: "Erro ao listar conversas" },
      { status: 500 },
    );
  }
}

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
    const parsed = PostBodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Body inválido", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const {
      firstMessage,
      model = DEFAULT_MODEL,
      planMode = false,
      citedSection = null,
      attachments = [],
    } = parsed.data;

    const trimmed = firstMessage.trim();
    const fallbackTitle =
      attachments.length > 0
        ? attachments.length === 1
          ? attachments[0].name
          : `${attachments.length} anexos`
        : "Nova conversa";
    const capitalized =
      trimmed.length > 0
        ? trimmed.charAt(0).toLocaleUpperCase("pt-BR") + trimmed.slice(1)
        : fallbackTitle;
    const title =
      capitalized.length > 60
        ? capitalized.slice(0, 60) + "…"
        : capitalized;

    const { data: conversation, error: convErr } = await supabase
      .from("chat_conversations")
      .insert({
        user_id: user.id,
        title,
        model,
        plan_mode: planMode,
      })
      .select("id")
      .single();

    if (convErr || !conversation) {
      return NextResponse.json(
        { error: convErr?.message ?? "Falha ao criar conversa" },
        { status: 500 },
      );
    }

    const { error: msgErr } = await supabase.from("chat_messages").insert({
      conversation_id: conversation.id,
      role: "user",
      content: firstMessage,
      cited_segments: citedSection?.segments ?? null,
      attachments: attachments.length > 0 ? attachments : null,
    });

    if (msgErr) {
      return NextResponse.json({ error: msgErr.message }, { status: 500 });
    }

    return NextResponse.json({ id: conversation.id });
  } catch (err) {
    console.error("[chat/conversations POST] Error:", err);
    return NextResponse.json(
      { error: "Erro ao criar conversa" },
      { status: 500 },
    );
  }
}
