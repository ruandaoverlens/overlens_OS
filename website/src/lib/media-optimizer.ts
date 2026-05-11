import path from "path";
import { mkdir, access, stat } from "fs/promises";
import sharp from "sharp";

// ─── Paths ────────────────────────────────────────────────────

const PROJECT_ROOT = path.resolve(process.cwd(), "..");

/** Where originals are stored (full quality) */
export const ORIGINALS_DIR = path.join(PROJECT_ROOT, "assets");

/** Where optimized previews are cached */
export const PREVIEWS_DIR = path.join(PROJECT_ROOT, "assets", "_previews");

// ─── Config ───────────────────────────────────────────────────

export const IMAGE_PREVIEW = {
  /** Max width for preview images */
  maxWidth: 1200,
  /** Max height for preview images */
  maxHeight: 1200,
  /** WebP quality (0-100) */
  quality: 75,
  /** Output format */
  format: "webp" as const,
};

export const VIDEO_PREVIEW = {
  /** Max height for preview videos (width scales proportionally) */
  maxHeight: 720,
  /** CRF value (0-51, lower = better quality, 23 is default) */
  crf: 28,
  /** Video codec */
  codec: "libx264",
  /** Audio codec (aac) or null to strip audio */
  audioCodec: "aac" as string | null,
  /** Audio bitrate */
  audioBitrate: "96k",
  /** Preset (ultrafast, fast, medium, slow) */
  preset: "fast",
  /** Output format */
  format: "mp4",
};

export const AUDIO_PREVIEW = {
  /** Audio codec for previews */
  codec: "libopus",
  /** Bitrate */
  bitrate: "64k",
  /** Output format */
  format: "ogg",
};

// ─── Types ────────────────────────────────────────────────────

export type MediaType = "image" | "video" | "audio";

export interface OptimizeResult {
  /** Absolute path to the original file */
  originalPath: string;
  /** Absolute path to the generated preview */
  previewPath: string;
  /** Relative path from PREVIEWS_DIR (for URL construction) */
  previewRelative: string;
  /** Original file size in bytes */
  originalSize: number;
  /** Preview file size in bytes */
  previewSize: number;
  /** Compression ratio (e.g. 0.15 = 85% smaller) */
  ratio: number;
  /** Media type detected */
  mediaType: MediaType;
  /** Width of preview (images/videos) */
  width?: number;
  /** Height of preview (images/videos) */
  height?: number;
}

// ─── Helpers ──────────────────────────────────────────────────

export const IMAGE_EXTENSIONS = new Set([
  ".jpg", ".jpeg", ".png", ".webp", ".avif", ".tiff", ".tif", ".bmp",
]);

export const VIDEO_EXTENSIONS = new Set([
  ".mp4", ".mov", ".webm", ".avi", ".mkv", ".m4v",
]);

export const AUDIO_EXTENSIONS = new Set([
  ".mp3", ".wav", ".flac", ".ogg", ".aac", ".m4a", ".opus",
]);

export function detectMediaType(filename: string): MediaType | null {
  const ext = path.extname(filename).toLowerCase();
  if (IMAGE_EXTENSIONS.has(ext)) return "image";
  if (VIDEO_EXTENSIONS.has(ext)) return "video";
  if (AUDIO_EXTENSIONS.has(ext)) return "audio";
  return null;
}

async function ensureDir(dir: string) {
  await mkdir(dir, { recursive: true });
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Build the preview output path, preserving subfolder structure.
 * e.g. original: assets/Imagens/photo.jpg → preview: assets/_previews/Imagens/photo.webp
 */
function buildPreviewPath(originalPath: string, ext: string): string {
  const relative = path.relative(ORIGINALS_DIR, originalPath);
  const parsed = path.parse(relative);
  const previewRelative = path.join(parsed.dir, `${parsed.name}${ext}`);
  return path.join(PREVIEWS_DIR, previewRelative);
}

// ─── Image Optimization (sharp) ──────────────────────────────

export interface BufferOptimizeResult {
  /** Preview content as a Buffer (WebP-encoded) */
  buffer: Buffer;
  /** Original buffer size in bytes */
  originalSize: number;
  /** Preview buffer size in bytes */
  previewSize: number;
  /** Compression ratio (preview / original; e.g. 0.15 = 85% smaller) */
  ratio: number;
  /** File extension (with leading dot), e.g. ".webp" */
  ext: string;
  /** MIME type, e.g. "image/webp" */
  contentType: string;
  /** Width of preview */
  width?: number;
  /** Height of preview */
  height?: number;
}

/**
 * Generate an optimized preview from an in-memory image buffer.
 *
 * Safe on read-only filesystems (Vercel serverless): no temp files written.
 * This is the preferred entry point for HTTP request handlers — `generatePreview`
 * exists only for batch scripts that operate on files on disk.
 */
export async function generatePreviewFromBuffer(
  input: Buffer,
): Promise<BufferOptimizeResult> {
  const pipeline = sharp(input)
    .resize(IMAGE_PREVIEW.maxWidth, IMAGE_PREVIEW.maxHeight, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: IMAGE_PREVIEW.quality });

  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
  // Normalize to Buffer<ArrayBuffer> so consumers (NextResponse, fetch, etc.)
  // accept it without TS BodyInit complaints.
  const buffer = Buffer.from(data);

  return {
    buffer,
    originalSize: input.length,
    previewSize: buffer.length,
    ratio: buffer.length / input.length,
    ext: `.${IMAGE_PREVIEW.format}`,
    contentType: "image/webp",
    width: info.width,
    height: info.height,
  };
}

async function optimizeImage(inputPath: string): Promise<OptimizeResult> {
  const previewPath = buildPreviewPath(inputPath, `.${IMAGE_PREVIEW.format}`);
  await ensureDir(path.dirname(previewPath));

  const pipeline = sharp(inputPath)
    .resize(IMAGE_PREVIEW.maxWidth, IMAGE_PREVIEW.maxHeight, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: IMAGE_PREVIEW.quality });

  const info = await pipeline.toFile(previewPath);

  const originalStat = await stat(inputPath);

  return {
    originalPath: inputPath,
    previewPath,
    previewRelative: path.relative(PREVIEWS_DIR, previewPath),
    originalSize: originalStat.size,
    previewSize: info.size,
    ratio: info.size / originalStat.size,
    mediaType: "image",
    width: info.width,
    height: info.height,
  };
}

// ─── Public API ───────────────────────────────────────────────

/**
 * Generate an optimized preview for an image file.
 * Video and audio previews must be generated client-side using
 * `generateClientPreview()` from `@/lib/client-media-optimizer`.
 *
 * If a preview already exists, returns it without re-processing (unless force=true).
 */
export async function generatePreview(
  inputPath: string,
  options?: { force?: boolean }
): Promise<OptimizeResult> {
  const mediaType = detectMediaType(inputPath);
  if (!mediaType) {
    throw new Error(`Unsupported media type: ${path.extname(inputPath)}`);
  }

  if (mediaType === "video" || mediaType === "audio") {
    throw new Error(
      `Server-side preview generation for ${mediaType} is not supported on Vercel. ` +
      `Use client-side processing with generateClientPreview() from @/lib/client-media-optimizer.`
    );
  }

  // Check if preview already exists
  const ext = `.${IMAGE_PREVIEW.format}`;
  const previewPath = buildPreviewPath(inputPath, ext);

  if (!options?.force && await fileExists(previewPath)) {
    const originalStat = await stat(inputPath);
    const previewStat = await stat(previewPath);
    return {
      originalPath: inputPath,
      previewPath,
      previewRelative: path.relative(PREVIEWS_DIR, previewPath),
      originalSize: originalStat.size,
      previewSize: previewStat.size,
      ratio: previewStat.size / originalStat.size,
      mediaType,
    };
  }

  return optimizeImage(inputPath);
}

/**
 * Batch generate previews for multiple image files.
 * Video/audio files are skipped — they must use client-side processing.
 */
export async function generatePreviews(
  inputPaths: string[],
  options?: { force?: boolean; onProgress?: (completed: number, total: number, result: OptimizeResult) => void }
): Promise<OptimizeResult[]> {
  const images = inputPaths.filter((p) => detectMediaType(p) === "image");

  const results: OptimizeResult[] = [];
  let completed = 0;
  const total = images.length;

  // Process images in parallel (sharp handles this well)
  const imageResults = await Promise.all(
    images.map(async (p) => {
      const result = await generatePreview(p, options);
      completed++;
      options?.onProgress?.(completed, total, result);
      return result;
    })
  );
  results.push(...imageResults);

  return results;
}

/**
 * Get the preview URL path for a given original file path.
 * Returns the API endpoint that serves the optimized preview.
 */
export function getPreviewApiUrl(originalRelativePath: string): string {
  return `/api/assets/preview?file=${encodeURIComponent(originalRelativePath)}`;
}

/**
 * Get the download URL for a given original file path.
 */
export function getDownloadApiUrl(originalRelativePath: string): string {
  return `/api/assets/download?file=${encodeURIComponent(originalRelativePath)}`;
}
