import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStoragePath, sanitizeFilename } from "@/lib/supabase/storage";

const MAX_SIZE = 500 * 1024 * 1024; // 500 MB

type Bucket = "platform-assets" | "asset-previews";

interface SignUploadBody {
  filename: string;
  contentType: string;
  assetType: string;
  size: number;
  bucket?: Bucket;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Role check
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !["staff", "admin"].includes(profile.role)) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const body = (await request.json()) as Partial<SignUploadBody>;
    const { filename, assetType, size } = body;
    const bucket: Bucket = body.bucket ?? "platform-assets";

    if (!filename) {
      return NextResponse.json({ error: "Nome do arquivo não informado" }, { status: 400 });
    }
    if (!assetType) {
      return NextResponse.json({ error: "Tipo de asset não especificado" }, { status: 400 });
    }
    if (typeof size !== "number" || size <= 0) {
      return NextResponse.json({ error: "Tamanho do arquivo inválido" }, { status: 400 });
    }
    if (size > MAX_SIZE) {
      return NextResponse.json({ error: "Arquivo excede o limite de 500 MB" }, { status: 413 });
    }

    // For asset-previews, keep the supplied filename verbatim (caller already
    // knows the canonical preview name like "output.mp4"). For originals, we
    // normalize using sanitizeFilename to keep display names predictable.
    const finalName =
      bucket === "asset-previews" ? filename : sanitizeFilename(filename);
    const storagePath = getStoragePath(assetType, finalName);

    const admin = createAdminClient();
    const { data, error } = await admin.storage
      .from(bucket)
      .createSignedUploadUrl(storagePath, { upsert: false });

    if (error || !data) {
      console.error("[sign-upload] Failed to create signed URL:", error);
      return NextResponse.json(
        { error: error?.message ?? "Erro ao gerar URL de upload" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      uploadUrl: data.signedUrl,
      token: data.token,
      path: data.path ?? storagePath,
    });
  } catch (err) {
    console.error("[sign-upload] Error:", err);
    return NextResponse.json(
      { error: "Erro ao gerar URL de upload" },
      { status: 500 },
    );
  }
}
