import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRegistrosAdmin } from "@/lib/registros/guard";

const createSchema = z.object({
  nomeMarca: z.string().trim().min(1, "Nome da marca obrigatório"),
  titular: z.string().trim().min(1, "Titular obrigatório"),
  classes: z.string().trim().optional().nullable(),
});

const updateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["em_andamento", "concluida", "arquivada"]).optional(),
  observacoes: z.string().trim().optional().nullable(),
});

export async function POST(request: NextRequest) {
  const guard = await requireRegistrosAdmin();
  if (!guard.ok) return guard.response;

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos" }, { status: 400 });
  }

  const { data, error } = await guard.supabase
    .from("registro_jornadas")
    .insert({
      nome_marca: parsed.data.nomeMarca,
      titular: parsed.data.titular,
      classes: parsed.data.classes || null,
    })
    .select()
    .single();

  if (error) {
    console.error("[registros/jornadas] insert:", error.message);
    return NextResponse.json({ error: "Erro ao iniciar jornada" }, { status: 500 });
  }

  return NextResponse.json({ jornada: data });
}

export async function PATCH(request: NextRequest) {
  const guard = await requireRegistrosAdmin();
  if (!guard.ok) return guard.response;

  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos" }, { status: 400 });
  }

  const { id, ...rest } = parsed.data;
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (rest.status !== undefined) patch.status = rest.status;
  if (rest.observacoes !== undefined) patch.observacoes = rest.observacoes ?? null;

  const { data, error } = await guard.supabase
    .from("registro_jornadas")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[registros/jornadas] update:", error.message);
    return NextResponse.json({ error: "Erro ao atualizar jornada" }, { status: 500 });
  }

  return NextResponse.json({ jornada: data });
}
