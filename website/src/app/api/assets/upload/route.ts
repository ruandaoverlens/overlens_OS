import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { createClient } from "@/lib/supabase/server";
import { getStoragePath, sanitizeFilename, getAssetType } from "@/lib/supabase/storage";
import {
  generatePreviewFromBuffer,
  detectMediaType,
} from "@/lib/media-optimizer";

export const maxDuration = 120;

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

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const clientPreview = formData.get("preview") as File | null;
    const assetType = formData.get("assetType") as string | null;
    const metadataRaw = formData.get("metadata") as string | null;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }
    if (!assetType) {
      return NextResponse.json({ error: "Tipo de asset não especificado" }, { status: 400 });
    }

    const originalName = sanitizeFilename(file.name);
    const storagePath = getStoragePath(assetType, originalName);
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload original to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("platform-assets")
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Parse metadata
    let metadata: Record<string, unknown> = {};
    if (metadataRaw) {
      try { metadata = JSON.parse(metadataRaw); } catch { /* ignore */ }
    }

    // Persist metadata overrides keyed by (asset_type, asset_key=filename).
    // Best-effort: never fail the upload if the row insert fails.
    const canonicalType = getAssetType(assetType);
    if (canonicalType) {
      const m = metadata as Record<string, unknown>;
      const asString = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
      const tags = Array.isArray(m.tags) ? (m.tags as unknown[]).filter((t): t is string => typeof t === "string") : [];
      try {
        await supabase.from("asset_metadata").upsert(
          {
            asset_type: canonicalType,
            asset_key: originalName,
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
        console.error("[upload] Failed to persist asset_metadata:", err);
      }
    }

    // Generate preview if media file
    const mediaType = detectMediaType(originalName);
    let preview: { url: string; size: number; ratio: number } | null = null;
    let previewError: string | null = null;

    if (mediaType && clientPreview) {
      // Client-side preview was provided (video/audio processed in browser)
      try {
        const previewBuffer = Buffer.from(await clientPreview.arrayBuffer());
        const previewExt = path.extname(clientPreview.name);
        const parsed = path.parse(storagePath);
        const previewStoragePath = `${parsed.dir}/${parsed.name}${previewExt}`;

        const mimeMap: Record<string, string> = {
          ".webp": "image/webp",
          ".mp4": "video/mp4",
          ".mp3": "audio/mpeg",
          ".ogg": "audio/ogg",
        };

        await supabase.storage
          .from("asset-previews")
          .upload(previewStoragePath, previewBuffer, {
            contentType: mimeMap[previewExt] ?? clientPreview.type ?? "application/octet-stream",
            upsert: true,
          });

        const { data: { publicUrl } } = supabase.storage
          .from("asset-previews")
          .getPublicUrl(previewStoragePath);

        preview = {
          url: publicUrl,
          size: previewBuffer.length,
          ratio: previewBuffer.length / buffer.length,
        };
      } catch (err) {
        previewError = (err as Error).message ?? "Falha no upload do preview";
        console.error("[upload] Client preview upload failed:", err);
      }
    } else if (mediaType === "image") {
      // In-memory preview via Sharp. No temp files — Vercel functions have a
      // read-only filesystem except for /tmp, and os.tmpdir() can return
      // /var/tmp (which is not writable), so we avoid disk entirely.
      try {
        const result = await generatePreviewFromBuffer(buffer);
        const parsed = path.parse(storagePath);
        const previewStoragePath = `${parsed.dir}/${parsed.name}${result.ext}`;

        await supabase.storage
          .from("asset-previews")
          .upload(previewStoragePath, result.buffer, {
            contentType: result.contentType,
            upsert: true,
          });

        const { data: { publicUrl } } = supabase.storage
          .from("asset-previews")
          .getPublicUrl(previewStoragePath);

        preview = {
          url: publicUrl,
          size: result.previewSize,
          ratio: result.ratio,
        };
      } catch (err) {
        previewError = (err as Error).message ?? "Falha ao gerar preview";
        console.error("[upload] Image preview generation failed:", err);
      }
    }
    // For video/audio without client preview: graceful fallback — no preview generated

    return NextResponse.json({
      success: true,
      file: {
        name: originalName,
        size: buffer.length,
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
    console.error("[upload] Error:", err);
    return NextResponse.json(
      { error: "Erro ao processar upload" },
      { status: 500 },
    );
  }
}
