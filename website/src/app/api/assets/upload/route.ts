import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import {
  ORIGINALS_DIR,
  generatePreview,
  detectMediaType,
  getPreviewApiUrl,
  getDownloadApiUrl,
} from "@/lib/media-optimizer";

/** Map asset type slugs to subfolder names inside assets/ */
const ASSET_TYPE_FOLDERS: Record<string, string> = {
  "banco-de-imagens": "Imagens",
  "banco-de-videos": "Footages",
  "sons-e-audios": "Musicas",
  "simbolos-e-logotipos": "Imagens/logos",
  "ativos-de-cor": "Imagens/cores",
  "ativos-de-tipografia": "Imagens/tipografia",
  "biblioteca-de-icones": "Imagens/icones",
  "grafismos-e-patterns": "Imagens/grafismos",
  "templates-e-layouts": "Imagens/templates",
  "objetos-3d": "Objetos3D",
};

function sanitizeFilename(name: string): string {
  return name
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_") // remove invalid chars
    .replace(/\s+/g, "-") // spaces to hyphens
    .replace(/-+/g, "-") // collapse multiple hyphens
    .replace(/^-|-$/g, ""); // trim hyphens
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const file = formData.get("file") as File | null;
    const assetType = formData.get("assetType") as string | null;
    const metadataRaw = formData.get("metadata") as string | null;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    if (!assetType) {
      return NextResponse.json({ error: "Tipo de asset não especificado" }, { status: 400 });
    }

    // Determine destination folder
    const subfolder = ASSET_TYPE_FOLDERS[assetType] ?? assetType;
    const destDir = path.join(ORIGINALS_DIR, subfolder);
    await mkdir(destDir, { recursive: true });

    // Sanitize and write the original file
    const originalName = sanitizeFilename(file.name);
    const destPath = path.join(destDir, originalName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(destPath, buffer);

    // Parse metadata (for logging/future DB use)
    let metadata: Record<string, unknown> = {};
    if (metadataRaw) {
      try {
        metadata = JSON.parse(metadataRaw);
      } catch {
        // ignore invalid metadata
      }
    }

    // Generate optimized preview if it's a media file
    const mediaType = detectMediaType(originalName);
    let preview: { url: string; size: number; ratio: number } | null = null;

    if (mediaType) {
      try {
        const result = await generatePreview(destPath, { force: true });
        const relativePath = path.relative(ORIGINALS_DIR, destPath);
        preview = {
          url: getPreviewApiUrl(relativePath),
          size: result.previewSize,
          ratio: result.ratio,
        };
      } catch (err) {
        console.error("[upload] Preview generation failed:", err);
        // Upload still succeeds, preview will be generated on-demand
      }
    }

    const relativePath = path.relative(ORIGINALS_DIR, destPath);

    return NextResponse.json({
      success: true,
      file: {
        name: originalName,
        size: buffer.length,
        mediaType,
        path: relativePath,
        downloadUrl: getDownloadApiUrl(relativePath),
        previewUrl: preview?.url ?? (mediaType ? getPreviewApiUrl(relativePath) : null),
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
      { status: 500 }
    );
  }
}
