import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRegistrosAdmin } from "@/lib/registros/guard";

const createSchema = z.object({
  dominio: z.string().trim().toLowerCase().min(3, "Domínio obrigatório"),
  registrador: z.string().trim().optional().nullable(),
  titular: z.string().trim().optional().nullable(),
  data_expiracao: z.string().trim().optional().nullable(),
  renovacao_automatica: z.boolean().default(false),
  observacoes: z.string().trim().optional().nullable(),
});

const updateSchema = z.object({
  id: z.string().uuid(),
  dominio: z.string().trim().toLowerCase().min(3).optional(),
  registrador: z.string().trim().optional().nullable(),
  titular: z.string().trim().optional().nullable(),
  data_expiracao: z.string().trim().optional().nullable(),
  renovacao_automatica: z.boolean().optional(),
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
    .from("registro_dominios")
    .insert({
      dominio: parsed.data.dominio,
      registrador: parsed.data.registrador || null,
      titular: parsed.data.titular || null,
      data_expiracao: parsed.data.data_expiracao || null,
      renovacao_automatica: parsed.data.renovacao_automatica,
      observacoes: parsed.data.observacoes || null,
    })
    .select()
    .single();

  if (error) {
    console.error("[registros/dominios] insert:", error.message);
    const msg = error.code === "23505" ? "Este domínio já está cadastrado" : "Erro ao criar domínio";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  return NextResponse.json({ dominio: data });
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
  if (rest.dominio !== undefined) patch.dominio = rest.dominio;
  if (rest.registrador !== undefined) patch.registrador = rest.registrador || null;
  if (rest.titular !== undefined) patch.titular = rest.titular || null;
  if (rest.data_expiracao !== undefined) patch.data_expiracao = rest.data_expiracao || null;
  if (rest.renovacao_automatica !== undefined) patch.renovacao_automatica = rest.renovacao_automatica;
  if (rest.observacoes !== undefined) patch.observacoes = rest.observacoes || null;

  const { data, error } = await guard.supabase
    .from("registro_dominios")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[registros/dominios] update:", error.message);
    return NextResponse.json({ error: "Erro ao atualizar domínio" }, { status: 500 });
  }

  return NextResponse.json({ dominio: data });
}

export async function DELETE(request: NextRequest) {
  const guard = await requireRegistrosAdmin();
  if (!guard.ok) return guard.response;

  const parsed = z
    .object({ id: z.string().uuid() })
    .safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const { error } = await guard.supabase
    .from("registro_dominios")
    .delete()
    .eq("id", parsed.data.id);

  if (error) {
    console.error("[registros/dominios] delete:", error.message);
    return NextResponse.json({ error: "Erro ao excluir domínio" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
