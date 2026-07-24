import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRegistrosAdmin } from "@/lib/registros/guard";
import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "registro-docs";

const TIPOS = [
  "certificado",
  "protocolo",
  "despacho",
  "oposicao",
  "exigencia",
  "procuracao",
  "comprovante",
  "outro",
] as const;

// Registra os metadados após o upload direto ao Storage.
const createSchema = z.object({
  marcaId: z.string().uuid(),
  processoId: z.string().uuid().optional().nullable(),
  tipo: z.enum(TIPOS),
  titulo: z.string().trim().min(1, "Título obrigatório"),
  storagePath: z.string().trim().min(1),
  mimeType: z.string().trim().optional().nullable(),
  tamanho: z.number().int().nonnegative().optional().nullable(),
  sensivel: z.boolean().default(true),
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
    .from("registro_documentos")
    .insert({
      marca_id: d.marcaId,
      processo_id: d.processoId ?? null,
      tipo: d.tipo,
      titulo: d.titulo,
      storage_path: d.storagePath,
      mime_type: d.mimeType ?? null,
      tamanho: d.tamanho ?? null,
      sensivel: d.sensivel,
      uploaded_by: guard.userId,
    })
    .select()
    .single();

  if (error) {
    console.error("[registros/documentos] insert:", error.message);
    return NextResponse.json({ error: "Erro ao registrar documento" }, { status: 500 });
  }

  return NextResponse.json({ documento: data });
}

export async function DELETE(request: NextRequest) {
  const guard = await requireRegistrosAdmin();
  if (!guard.ok) return guard.response;

  const parsed = deleteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  // Busca o storage_path antes de remover a linha.
  const { data: doc, error: fetchErr } = await guard.supabase
    .from("registro_documentos")
    .select("storage_path")
    .eq("id", parsed.data.id)
    .single();

  if (fetchErr || !doc) {
    return NextResponse.json({ error: "Documento não encontrado" }, { status: 404 });
  }

  const { error: delErr } = await guard.supabase
    .from("registro_documentos")
    .delete()
    .eq("id", parsed.data.id);

  if (delErr) {
    console.error("[registros/documentos] delete row:", delErr.message);
    return NextResponse.json({ error: "Erro ao remover documento" }, { status: 500 });
  }

  // Remove o objeto do Storage com o admin client (bucket privado).
  const admin = createAdminClient();
  const storagePath = (doc as { storage_path: string }).storage_path;
  const { error: storageErr } = await admin.storage.from(BUCKET).remove([storagePath]);
  if (storageErr) {
    // Linha já removida; loga mas não falha a requisição.
    console.error("[registros/documentos] delete object:", storageErr.message);
  }

  return NextResponse.json({ ok: true });
}
