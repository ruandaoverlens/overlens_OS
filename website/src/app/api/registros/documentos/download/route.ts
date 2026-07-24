import { NextRequest, NextResponse } from "next/server";
import { requireRegistrosAdmin } from "@/lib/registros/guard";
import { createAdminClient } from "@/lib/supabase/admin";
import type { DocumentoRow } from "@/lib/registros/types";

export const maxDuration = 120;

const BUCKET = "registro-docs";

/**
 * GET /api/registros/documentos/download?id=<uuid>
 * Baixa um documento do bucket privado e devolve como attachment.
 */
export async function GET(request: NextRequest) {
  const guard = await requireRegistrosAdmin();
  if (!guard.ok) return guard.response;

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Parâmetro id ausente" }, { status: 400 });
  }

  const { data: doc, error } = await guard.supabase
    .from("registro_documentos")
    .select("titulo, storage_path, mime_type")
    .eq("id", id)
    .single();

  if (error || !doc) {
    return NextResponse.json({ error: "Documento não encontrado" }, { status: 404 });
  }

  const d = doc as Pick<DocumentoRow, "titulo" | "storage_path" | "mime_type">;

  const admin = createAdminClient();
  const { data: file, error: dlErr } = await admin.storage.from(BUCKET).download(d.storage_path);

  if (dlErr || !file) {
    console.error("[registros/documentos/download]:", dlErr?.message);
    return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = d.storage_path.split("/").pop() ?? d.titulo ?? "documento";

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": d.mime_type || file.type || "application/octet-stream",
      "Content-Length": buffer.length.toString(),
      "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
    },
  });
}
