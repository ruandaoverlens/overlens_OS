import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, rm } from "fs/promises";
import path from "path";
import os from "os";
import { createClient } from "@/lib/supabase/server";
import { getStoragePath, sanitizeFilename } from "@/lib/supabase/storage";
import {
  generatePreview,
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

    // Generate preview if media file
    const mediaType = detectMediaType(originalName);
    let preview: { url: string; size: number; ratio: number } | null = null;

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
        console.error("[upload] Client preview upload failed:", err);
      }
    } else if (mediaType === "image") {
      // Server-side image preview via Sharp (works on Vercel)
      try {
        const tmpDir = path.join(os.tmpdir(), "overlens-upload");
        await mkdir(tmpDir, { recursive: true });
        const tmpPath = path.join(tmpDir, originalName);
        await writeFile(tmpPath, buffer);

        const result = await generatePreview(tmpPath, { force: true });

        const { readFile } = await import("fs/promises");
        const previewBuffer = await readFile(result.previewPath);
        const previewExt = path.extname(result.previewPath);
        const parsed = path.parse(storagePath);
        const previewStoragePath = `${parsed.dir}/${parsed.name}${previewExt}`;

        const mimeMap: Record<string, string> = {
          ".webp": "image/webp",
          ".mp4": "video/mp4",
          ".ogg": "audio/ogg",
        };

        await supabase.storage
          .from("asset-previews")
          .upload(previewStoragePath, previewBuffer, {
            contentType: mimeMap[previewExt] ?? "application/octet-stream",
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

        // Clean up temp files
        await rm(tmpPath, { force: true }).catch(() => {});
        await rm(result.previewPath, { force: true }).catch(() => {});
      } catch (err) {
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
