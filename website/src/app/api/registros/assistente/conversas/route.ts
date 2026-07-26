import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRegistrosAdmin } from "@/lib/registros/guard";

const PostBodySchema = z.object({
  firstMessage: z.string().trim().min(1, "Mensagem obrigatória"),
  marcaId: z.string().uuid().optional().nullable(),
});

export async function GET() {
  try {
    const guard = await requireRegistrosAdmin();
    if (!guard.ok) return guard.response;

    const { data, error } = await guard.supabase
      .from("registro_assistente_conversas")
      .select("id, titulo, marca_id, updated_at")
      .eq("user_id", guard.userId)
      .order("updated_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ conversas: data ?? [] });
  } catch (err) {
    console.error("[registros/assistente/conversas GET] Error:", err);
    return NextResponse.json({ error: "Erro ao listar conversas" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const guard = await requireRegistrosAdmin();
    if (!guard.ok) return guard.response;

    const json = await req.json().catch(() => null);
    const parsed = PostBodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Body inválido", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { firstMessage, marcaId = null } = parsed.data;

    // Título derivado da primeira mensagem (mesma regra do chat do Brand System).
    const capitalized =
      firstMessage.charAt(0).toLocaleUpperCase("pt-BR") + firstMessage.slice(1);
    const titulo =
      capitalized.length > 60 ? capitalized.slice(0, 60) + "…" : capitalized;

    const { data: conversa, error: convErr } = await guard.supabase
      .from("registro_assistente_conversas")
      .insert({ user_id: guard.userId, titulo, marca_id: marcaId })
      .select("id")
      .single();

    if (convErr || !conversa) {
      return NextResponse.json(
        { error: convErr?.message ?? "Falha ao criar conversa" },
        { status: 500 },
      );
    }

    const { error: msgErr } = await guard.supabase
      .from("registro_assistente_mensagens")
      .insert({
        conversa_id: conversa.id,
        role: "user",
        content: firstMessage,
      });

    if (msgErr) {
      return NextResponse.json({ error: msgErr.message }, { status: 500 });
    }

    return NextResponse.json({ id: conversa.id });
  } catch (err) {
    console.error("[registros/assistente/conversas POST] Error:", err);
    return NextResponse.json({ error: "Erro ao criar conversa" }, { status: 500 });
  }
}
