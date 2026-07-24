import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRegistrosAdmin } from "@/lib/registros/guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { sanitizeStorageFilename } from "@/lib/supabase/storage";

const BUCKET = "registro-docs";
const MAX_SIZE = 100 * 1024 * 1024; // 100 MB

const schema = z.object({
  marcaId: z.string().uuid(),
  filename: z.string().trim().min(1),
  size: z.number().int().positive(),
});

export async function POST(request: NextRequest) {
  const guard = await requireRegistrosAdmin();
  if (!guard.ok) return guard.response;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }
  if (parsed.data.size > MAX_SIZE) {
    return NextResponse.json({ error: "Arquivo excede o limite de 100 MB" }, { status: 413 });
  }

  const { marcaId, filename } = parsed.data;
  const storagePath = `${marcaId}/${Date.now()}-${sanitizeStorageFilename(filename)}`;

  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from(BUCKET)
    .createSignedUploadUrl(storagePath, { upsert: false });

  if (error || !data) {
    console.error("[registros/documentos/sign-upload]:", error?.message);
    return NextResponse.json({ error: "Erro ao gerar URL de upload" }, { status: 500 });
  }

  return NextResponse.json({
    uploadUrl: data.signedUrl,
    token: data.token,
    path: data.path ?? storagePath,
  });
}
