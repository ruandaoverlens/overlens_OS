import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { createClient } from "@/lib/supabase/server";
import {
  generatePreviewFromBuffer,
  detectMediaType,
  IMAGE_PREVIEW,
  VIDEO_PREVIEW,
  AUDIO_PREVIEW,
} from "@/lib/media-optimizer";

export const maxDuration = 120;

const MIME_TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".mp4": "video/mp4",
  ".mp3": "audio/mpeg",
  ".webm": "video/webm",
  ".ogg": "audio/ogg",
  ".opus": "audio/opus",
};

/**
 * GET /api/assets/preview?file=Imagens/photo.jpg
 *
 * Serves the optimized preview from Supabase Storage (asset-previews bucket).
 * - Images: if preview doesn't exist, generates it server-side with Sharp.
 * - Video/Audio: if preview doesn't exist, returns 404 (must be generated client-side).
 */
export async function GET(request: NextRequest) {
  const fileParam = request.nextUrl.searchParams.get("file");

  if (!fileParam) {
    return NextResponse.json({ error: "Missing file parameter" }, { status: 400 });
  }

  const mediaType = detectMediaType(fileParam);
  if (!mediaType) {
    return NextResponse.json({ error: "Unsupported media type" }, { status: 400 });
  }

  // Determine preview path in storage
  const previewExt = mediaType === "image"
    ? `.${IMAGE_PREVIEW.format}`
    : mediaType === "video"
      ? `.${VIDEO_PREVIEW.format}`
      : `.${AUDIO_PREVIEW.format}`;

  const parsed = path.parse(fileParam);
  const previewStoragePath = `${parsed.dir}/${parsed.name}${previewExt}`;

  const supabase = await createClient();

  // Try to download existing preview from public bucket
  const { data: previewBlob } = await supabase.storage
    .from("asset-previews")
    .download(previewStoragePath);

  if (previewBlob) {
    const buffer = Buffer.from(await previewBlob.arrayBuffer());
    const contentType = MIME_TYPES[previewExt] ?? "application/octet-stream";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  // Preview doesn't exist — handle based on media type
  if (mediaType === "video" || mediaType === "audio") {
    // Video/audio previews must be generated client-side.
    // Return 404 so the frontend knows no preview is available.
    return NextResponse.json(
      {
        error: "Preview not available",
        message: `No ${mediaType} preview found. Video and audio previews are generated client-side at upload time.`,
      },
      { status: 404 }
    );
  }

  // Image: generate on demand with Sharp (works on Vercel)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  // Download original
  const { data: originalBlob, error } = await supabase.storage
    .from("platform-assets")
    .download(fileParam);

  if (error || !originalBlob) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  // Read once; reuse for both the optimization path and the fallback below.
  const originalBuffer = Buffer.from(await originalBlob.arrayBuffer());
  const originalContentType = originalBlob.type || "application/octet-stream";

  try {
    // Generate preview from buffer (no temp files — Vercel functions cannot
    // write outside /tmp and os.tmpdir() may return /var/tmp on some runtimes).
    const result = await generatePreviewFromBuffer(originalBuffer);

    // Upload preview to public bucket (cached for next requests)
    await supabase.storage
      .from("asset-previews")
      .upload(previewStoragePath, result.buffer, {
        contentType: result.contentType,
        upsert: true,
      });

    return new NextResponse(new Uint8Array(result.buffer), {
      headers: {
        "Content-Type": result.contentType,
        "Content-Length": result.buffer.length.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("[preview] Generation failed, falling back to original:", err);

    // Fallback: serve the original file inline so the gallery still shows it.
    return new NextResponse(originalBuffer, {
      headers: {
        "Content-Type": originalContentType,
        "Content-Length": originalBuffer.length.toString(),
        // Short cache so a future retry can re-generate the preview
        "Cache-Control": "public, max-age=300",
        "X-Preview-Fallback": "original",
      },
    });
  }
}
