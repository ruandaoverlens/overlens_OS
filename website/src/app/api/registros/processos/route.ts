import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRegistrosAdmin } from "@/lib/registros/guard";

const STATUS = [
  "requerida",
  "registrada",
  "indeferida",
  "arquivada",
  "em_oposicao",
  "em_exigencia",
] as const;

// Aceita "" ou null nos campos de data e normaliza para null.
const dateField = z
  .union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.literal(""), z.null()])
  .optional();

const createSchema = z.object({
  marca_id: z.string().uuid(),
  numero: z.string().trim().min(1, "Número obrigatório"),
  classe: z.string().trim().min(1, "Classe obrigatória"),
  edicao_ncl: z.string().trim().optional().nullable(),
  classe_descricao: z.string().trim().optional().nullable(),
  status: z.enum(STATUS).default("requerida"),
  situacao: z.string().trim().optional().nullable(),
  data_deposito: dateField,
  data_concessao: dateField,
  proxima_renovacao: dateField,
  observacoes: z.string().trim().optional().nullable(),
});

const updateSchema = z.object({
  id: z.string().uuid(),
  numero: z.string().trim().min(1).optional(),
  classe: z.string().trim().min(1).optional(),
  edicao_ncl: z.string().trim().optional().nullable(),
  classe_descricao: z.string().trim().optional().nullable(),
  status: z.enum(STATUS).optional(),
  situacao: z.string().trim().optional().nullable(),
  data_deposito: dateField,
  data_concessao: dateField,
  proxima_renovacao: dateField,
  observacoes: z.string().trim().optional().nullable(),
});

function normDate(v: string | null | undefined): string | null | undefined {
  if (v === undefined) return undefined;
  return v === "" || v === null ? null : v;
}

export async function POST(request: NextRequest) {
  const guard = await requireRegistrosAdmin();
  if (!guard.ok) return guard.response;

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos" }, { status: 400 });
  }
  const d = parsed.data;

  const { data, error } = await guard.supabase
    .from("registro_processos")
    .insert({
      marca_id: d.marca_id,
      numero: d.numero,
      classe: d.classe,
      edicao_ncl: d.edicao_ncl ?? null,
      classe_descricao: d.classe_descricao ?? null,
      status: d.status,
      situacao: d.situacao ?? null,
      data_deposito: normDate(d.data_deposito) ?? null,
      data_concessao: normDate(d.data_concessao) ?? null,
      proxima_renovacao: normDate(d.proxima_renovacao) ?? null,
      observacoes: d.observacoes ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("[registros/processos] insert:", error.message);
    const msg = error.code === "23505" ? "Já existe um processo com este número" : "Erro ao criar processo";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  return NextResponse.json({ processo: data });
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
  if (rest.numero !== undefined) patch.numero = rest.numero;
  if (rest.classe !== undefined) patch.classe = rest.classe;
  if (rest.edicao_ncl !== undefined) patch.edicao_ncl = rest.edicao_ncl ?? null;
  if (rest.classe_descricao !== undefined) patch.classe_descricao = rest.classe_descricao ?? null;
  if (rest.status !== undefined) patch.status = rest.status;
  if (rest.situacao !== undefined) patch.situacao = rest.situacao ?? null;
  if (rest.data_deposito !== undefined) patch.data_deposito = normDate(rest.data_deposito);
  if (rest.data_concessao !== undefined) patch.data_concessao = normDate(rest.data_concessao);
  if (rest.proxima_renovacao !== undefined) patch.proxima_renovacao = normDate(rest.proxima_renovacao);
  if (rest.observacoes !== undefined) patch.observacoes = rest.observacoes ?? null;

  const { data, error } = await guard.supabase
    .from("registro_processos")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[registros/processos] update:", error.message);
    const msg = error.code === "23505" ? "Já existe um processo com este número" : "Erro ao atualizar processo";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  return NextResponse.json({ processo: data });
}
