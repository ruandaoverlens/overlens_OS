import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRegistrosAdmin } from "@/lib/registros/guard";

// Aceita `title` (mesmo contrato do ConversationItem compartilhado com o chat).
const PatchBodySchema = z.object({
  title: z.string().trim().min(1).max(120),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const guard = await requireRegistrosAdmin();
    if (!guard.ok) return guard.response;

    const { id } = await params;
    const json = await req.json().catch(() => null);
    const parsed = PatchBodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Body inválido", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { error } = await guard.supabase
      .from("registro_assistente_conversas")
      .update({ titulo: parsed.data.title })
      .eq("id", id)
      .eq("user_id", guard.userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[registros/assistente/conversas PATCH] Error:", err);
    return NextResponse.json({ error: "Erro ao renomear conversa" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const guard = await requireRegistrosAdmin();
    if (!guard.ok) return guard.response;

    const { id } = await params;
    const { error } = await guard.supabase
      .from("registro_assistente_conversas")
      .delete()
      .eq("id", id)
      .eq("user_id", guard.userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[registros/assistente/conversas DELETE] Error:", err);
    return NextResponse.json({ error: "Erro ao excluir conversa" }, { status: 500 });
  }
}
