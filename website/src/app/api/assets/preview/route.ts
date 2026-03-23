import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";
import {
  ORIGINALS_DIR,
  PREVIEWS_DIR,
  generatePreview,
  detectMediaType,
  IMAGE_PREVIEW,
  VIDEO_PREVIEW,
  AUDIO_PREVIEW,
} from "@/lib/media-optimizer";

const MIME_TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".ogg": "audio/ogg",
  ".opus": "audio/opus",
};

/**
 * GET /api/assets/preview?file=Imagens/photo.jpg
 *
 * Serves the optimized preview for a given asset.
 * If the preview doesn't exist yet, generates it on-demand and caches it.
 */
export async function GET(request: NextRequest) {
  const fileParam = request.nextUrl.searchParams.get("file");

  if (!fileParam) {
    return NextResponse.json({ error: "Missing file parameter" }, { status: 400 });
  }

  // Prevent path traversal
  const normalized = path.normalize(fileParam).replace(/^(\.\.[/\\])+/, "");
  const originalPath = path.join(ORIGINALS_DIR, normalized);

  if (!originalPath.startsWith(ORIGINALS_DIR)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 403 });
  }

  const mediaType = detectMediaType(normalized);
  if (!mediaType) {
    return NextResponse.json({ error: "Unsupported media type" }, { status: 400 });
  }

  // Determine preview extension
  const previewExt = mediaType === "image"
    ? `.${IMAGE_PREVIEW.format}`
    : mediaType === "video"
      ? `.${VIDEO_PREVIEW.format}`
      : `.${AUDIO_PREVIEW.format}`;

  const parsed = path.parse(normalized);
  const previewRelative = path.join(parsed.dir, `${parsed.name}${previewExt}`);
  const previewPath = path.join(PREVIEWS_DIR, previewRelative);

  // Try to serve existing preview
  try {
    await stat(previewPath);
  } catch {
    // Preview doesn't exist yet — generate on demand
    try {
      await stat(originalPath); // verify original exists
      await generatePreview(originalPath);
    } catch (err) {
      console.error("[preview] Generation failed:", err);
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
  }

  // Serve the preview file
  try {
    const buffer = await readFile(previewPath);
    const ext = path.extname(previewPath).toLowerCase();
    const contentType = MIME_TYPES[ext] ?? "application/octet-stream";

    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "Content-Length": buffer.length.toString(),
      "Cache-Control": "public, max-age=31536000, immutable", // 1 year cache
    };

    // For videos, support range requests for better streaming
    if (mediaType === "video") {
      const range = request.headers.get("range");
      if (range) {
        const fileStat = await stat(previewPath);
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileStat.size - 1;
        const chunkSize = end - start + 1;

        const chunk = buffer.subarray(start, end + 1);

        return new NextResponse(chunk, {
          status: 206,
          headers: {
            "Content-Type": contentType,
            "Content-Range": `bytes ${start}-${end}/${fileStat.size}`,
            "Content-Length": chunkSize.toString(),
            "Accept-Ranges": "bytes",
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      }

      headers["Accept-Ranges"] = "bytes";
    }

    return new NextResponse(buffer, { headers });
  } catch {
    return NextResponse.json({ error: "Preview not found" }, { status: 404 });
  }
}
