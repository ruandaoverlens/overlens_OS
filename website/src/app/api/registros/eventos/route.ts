import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRegistrosAdmin } from "@/lib/registros/guard";

const TIPOS = [
  "deposito",
  "publicacao",
  "exame",
  "exigencia",
  "resposta",
  "concessao",
  "renovacao",
  "oposicao",
  "outro",
] as const;

const createSchema = z.object({
  processo_id: z.string().uuid(),
  tipo: z.enum(TIPOS),
  titulo: z.string().trim().min(1, "Título obrigatório"),
  descricao: z.string().trim().optional().nullable(),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  rpi_numero: z.string().trim().optional().nullable(),
});

const deleteSchema = z.object({ id: z.string().uuid() });

export async function POST(request: NextRequest) {
  const guard = await requireRegistrosAdmin();
  if (!guard.ok) return guard.response;

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos" }, { status: 400 });
  }
  const d = parsed.data;

  const { data, error } = await guard.supabase
    .from("registro_eventos")
    .insert({
      processo_id: d.processo_id,
      tipo: d.tipo,
      titulo: d.titulo,
      descricao: d.descricao ?? null,
      data: d.data,
      rpi_numero: d.rpi_numero ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("[registros/eventos] insert:", error.message);
    return NextResponse.json({ error: "Erro ao criar evento" }, { status: 500 });
  }

  return NextResponse.json({ evento: data });
}

export async function DELETE(request: NextRequest) {
  const guard = await requireRegistrosAdmin();
  if (!guard.ok) return guard.response;

  const parsed = deleteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const { error } = await guard.supabase
    .from("registro_eventos")
    .delete()
    .eq("id", parsed.data.id);

  if (error) {
    console.error("[registros/eventos] delete:", error.message);
    return NextResponse.json({ error: "Erro ao remover evento" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
