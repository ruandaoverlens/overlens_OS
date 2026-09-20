import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/route-access";
import { sanitizeStorageFilename } from "@/lib/supabase/storage";

export const maxDuration = 60;

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"]);

/** Bucket público já usado pelas imagens do Brand System (`/brand/images/...`). */
const BUCKET = "asset-previews";
const FOLDER = "Docs";

/**
 * Upload de imagem inserida pelo editor de páginas. Admin-only, mesmo gate
 * do salvamento do texto. A URL pública devolvida entra direto no markdown.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !isAdmin(profile.role)) {
    return NextResponse.json({ error: "Apenas administradores podem editar textos" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Formato não suportado (use PNG, JPG, WebP, GIF ou SVG)" }, { status: 400 });
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "Imagem maior que 10MB" }, { status: 413 });
  }

  const safeName = sanitizeStorageFilename(file.name).replace(/\s+/g, "-");
  const storagePath = `${FOLDER}/${randomUUID().slice(0, 8)}-${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const admin = createAdminClient();
  const { error } = await admin.storage
    .from(BUCKET)
    .upload(storagePath, buffer, { contentType: file.type, upsert: false });

  if (error) {
    console.error("[docs/upload-image] upload failed:", error.message);
    return NextResponse.json({ error: "Erro ao enviar a imagem" }, { status: 500 });
  }

  const { data } = admin.storage.from(BUCKET).getPublicUrl(storagePath);
  return NextResponse.json({ url: data.publicUrl });
}
