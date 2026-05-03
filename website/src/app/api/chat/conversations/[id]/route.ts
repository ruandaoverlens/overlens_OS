import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { AVAILABLE_MODELS } from "@/lib/ai/models";

const ModelIdSchema = z.enum(
  AVAILABLE_MODELS.map((m) => m.id) as [string, ...string[]],
);

const PatchBodySchema = z
  .object({
    title: z.string().min(1).optional(),
    model: ModelIdSchema.optional(),
    plan_mode: z.boolean().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: "Nenhum campo para atualizar",
  });

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { data: conversation, error: convErr } = await supabase
      .from("chat_conversations")
      .select("*")
      .eq("id", id)
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

    const { data: messages, error: msgErr } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });

    if (msgErr) {
      return NextResponse.json({ error: msgErr.message }, { status: 500 });
    }

    return NextResponse.json({ conversation, messages: messages ?? [] });
  } catch (err) {
    console.error("[chat/conversations/[id] GET] Error:", err);
    return NextResponse.json(
      { error: "Erro ao carregar conversa" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const json = await req.json();
    const parsed = PatchBodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Body inválido", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    // Ownership check (RLS also enforces it, but we want a clean 404).
    const { data: existing, error: existErr } = await supabase
      .from("chat_conversations")
      .select("id, user_id")
      .eq("id", id)
      .maybeSingle();

    if (existErr) {
      return NextResponse.json({ error: existErr.message }, { status: 500 });
    }
    if (!existing || existing.user_id !== user.id) {
      return NextResponse.json(
        { error: "Conversa não encontrada" },
        { status: 404 },
      );
    }

    const { data: updated, error: updErr } = await supabase
      .from("chat_conversations")
      .update(parsed.data)
      .eq("id", id)
      .select("*")
      .single();

    if (updErr || !updated) {
      return NextResponse.json(
        { error: updErr?.message ?? "Falha ao atualizar" },
        { status: 500 },
      );
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[chat/conversations/[id] PATCH] Error:", err);
    return NextResponse.json(
      { error: "Erro ao atualizar conversa" },
      { status: 500 },
    );
  }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { data: existing, error: existErr } = await supabase
      .from("chat_conversations")
      .select("id, user_id")
      .eq("id", id)
      .maybeSingle();

    if (existErr) {
      return NextResponse.json({ error: existErr.message }, { status: 500 });
    }
    if (!existing || existing.user_id !== user.id) {
      return NextResponse.json(
        { error: "Conversa não encontrada" },
        { status: 404 },
      );
    }

    const { error: delErr } = await supabase
      .from("chat_conversations")
      .delete()
      .eq("id", id);

    if (delErr) {
      return NextResponse.json({ error: delErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[chat/conversations/[id] DELETE] Error:", err);
    return NextResponse.json(
      { error: "Erro ao deletar conversa" },
      { status: 500 },
    );
  }
}
