import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRegistrosAdmin } from "@/lib/registros/guard";

const createSchema = z.object({
  nome: z.string().trim().min(1, "Nome obrigatório"),
  titular: z.string().trim().min(1, "Titular obrigatório"),
  apresentacao: z.string().trim().min(1).default("mista"),
  observacoes: z.string().trim().optional().nullable(),
});

const updateSchema = z.object({
  id: z.string().uuid(),
  nome: z.string().trim().min(1).optional(),
  titular: z.string().trim().min(1).optional(),
  apresentacao: z.string().trim().min(1).optional(),
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
    .from("registro_marcas")
    .insert({
      nome: parsed.data.nome,
      titular: parsed.data.titular,
      apresentacao: parsed.data.apresentacao,
      observacoes: parsed.data.observacoes ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("[registros/marcas] insert:", error.message);
    return NextResponse.json({ error: "Erro ao criar marca" }, { status: 500 });
  }

  return NextResponse.json({ marca: data });
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
  if (rest.nome !== undefined) patch.nome = rest.nome;
  if (rest.titular !== undefined) patch.titular = rest.titular;
  if (rest.apresentacao !== undefined) patch.apresentacao = rest.apresentacao;
  if (rest.observacoes !== undefined) patch.observacoes = rest.observacoes ?? null;

  const { data, error } = await guard.supabase
    .from("registro_marcas")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[registros/marcas] update:", error.message);
    return NextResponse.json({ error: "Erro ao atualizar marca" }, { status: 500 });
  }

  return NextResponse.json({ marca: data });
}
