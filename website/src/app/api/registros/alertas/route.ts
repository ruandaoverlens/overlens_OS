import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRegistrosAdmin } from "@/lib/registros/guard";

const STATUS = ["pendente", "revisado", "resolvido", "descartado"] as const;

const updateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(STATUS),
});

export async function PATCH(request: NextRequest) {
  const guard = await requireRegistrosAdmin();
  if (!guard.ok) return guard.response;

  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const { id, status } = parsed.data;
  const patch: Record<string, unknown> = {
    status,
    resolved_at: status === "resolvido" ? new Date().toISOString() : null,
  };

  const { data, error } = await guard.supabase
    .from("registro_alertas")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[registros/alertas] update:", error.message);
    return NextResponse.json({ error: "Erro ao atualizar alerta" }, { status: 500 });
  }

  return NextResponse.json({ alerta: data });
}
