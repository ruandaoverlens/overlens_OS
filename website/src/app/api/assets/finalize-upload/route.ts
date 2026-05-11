import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sanitizeFilename, getAssetType } from "@/lib/supabase/storage";
import {
  generatePreviewFromBuffer,
  detectMediaType,
} from "@/lib/media-optimizer";

export const maxDuration = 60;

interface FinalizeUploadBody {
  path: string;
  assetType: string;
  originalName: string;
  metadata: Record<string, unknown>;
  clientPreviewPath?: string;
  originalSize: number;
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

    const body = (await request.json()) as Partial<FinalizeUploadBody>;
    const {
      path: storagePath,
      assetType,
      originalName,
      metadata = {},
      clientPreviewPath,
      originalSize,
    } = body;

    if (!storagePath) {
      return NextResponse.json({ error: "Caminho do arquivo não informado" }, { status: 400 });
    }
    if (!assetType) {
      return NextResponse.json({ error: "Tipo de asset não especificado" }, { status: 400 });
    }
    if (!originalName) {
      return NextResponse.json({ error: "Nome original não informado" }, { status: 400 });
    }
    if (typeof originalSize !== "number" || originalSize < 0) {
      return NextResponse.json({ error: "Tamanho do arquivo inválido" }, { status: 400 });
    }

    const sanitizedName = sanitizeFilename(originalName);
    const mediaType = detectMediaType(originalName);
    const admin = createAdminClient();

    let preview: { url: string; size: number; ratio: number } | null = null;
    let previewError: string | null = null;

    if (clientPreviewPath) {
      // Client already uploaded a preview (video/audio processed in browser).
      try {
        const { data: { publicUrl } } = admin.storage
          .from("asset-previews")
          .getPublicUrl(clientPreviewPath);

        preview = {
          url: publicUrl,
          size: 0,
          ratio: 0,
        };
      } catch (err) {
        previewError = (err as Error).message ?? "Falha ao registrar preview";
        console.error("[finalize-upload] Client preview registration failed:", err);
      }
    } else if (mediaType === "image") {
      // Server-side preview via Sharp. Download the original from storage,
      // resize/encode in memory, and upload the result to asset-previews.
      try {
        const { data: blob, error: dlError } = await admin.storage
          .from("platform-assets")
          .download(storagePath);

        if (dlError || !blob) {
          throw new Error(dlError?.message ?? "Falha ao baixar original");
        }

        const buffer = Buffer.from(await blob.arrayBuffer());
        const result = await generatePreviewFromBuffer(buffer);
        const parsed = path.parse(storagePath);
        const previewStoragePath = `${parsed.dir}/${parsed.name}${result.ext}`;

        const { error: upError } = await admin.storage
          .from("asset-previews")
          .upload(previewStoragePath, result.buffer, {
            contentType: result.contentType,
            upsert: true,
          });

        if (upError) {
          throw new Error(upError.message);
        }

        const { data: { publicUrl } } = admin.storage
          .from("asset-previews")
          .getPublicUrl(previewStoragePath);

        preview = {
          url: publicUrl,
          size: result.previewSize,
          ratio: result.ratio,
        };
      } catch (err) {
        previewError = (err as Error).message ?? "Falha ao gerar preview";
        console.error("[finalize-upload] Image preview generation failed:", err);
      }
    }
    // For video/audio without clientPreviewPath: graceful fallback — no preview.

    // Persist metadata overrides keyed by (asset_type, asset_key=filename).
    // Best-effort: never fail the request if the row insert fails.
    const canonicalType = getAssetType(assetType);
    if (canonicalType) {
      const m = metadata as Record<string, unknown>;
      const asString = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
      const tags = Array.isArray(m.tags) ? (m.tags as unknown[]).filter((t): t is string => typeof t === "string") : [];
      try {
        await admin.from("asset_metadata").upsert(
          {
            asset_type: canonicalType,
            asset_key: sanitizedName,
            title: asString(m.title) ?? asString(m.titulo),
            caption: asString(m.caption) ?? asString(m.legenda) ?? asString(m.notas),
            author: asString(m.author) ?? asString(m.artist),
            year: asString(m.year) ?? asString(m.ano),
            source_url: asString(m.sourceUrl) ?? asString(m.source_url),
            tags,
            updated_by: user.id,
          },
          { onConflict: "asset_type,asset_key" },
        );
      } catch (err) {
        console.error("[finalize-upload] Failed to persist asset_metadata:", err);
      }
    }

    return NextResponse.json({
      success: true,
      file: {
        name: sanitizedName,
        size: originalSize,
        mediaType,
        path: storagePath,
        downloadUrl: `/api/assets/download?file=${encodeURIComponent(storagePath)}`,
        previewUrl: preview?.url ?? null,
      },
      preview: preview
        ? {
            size: preview.size,
            ratio: preview.ratio,
            savings: `${Math.round((1 - preview.ratio) * 100)}%`,
          }
        : null,
      previewError,
      metadata,
    });
  } catch (err) {
    console.error("[finalize-upload] Error:", err);
    return NextResponse.json(
      { error: "Erro ao finalizar upload" },
      { status: 500 },
    );
  }
}
