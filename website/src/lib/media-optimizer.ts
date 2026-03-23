import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import { mkdir, access, stat } from "fs/promises";
import sharp from "sharp";

const execFileAsync = promisify(execFile);

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

const IMAGE_EXTENSIONS = new Set([
  ".jpg", ".jpeg", ".png", ".webp", ".avif", ".tiff", ".tif", ".bmp",
]);

const VIDEO_EXTENSIONS = new Set([
  ".mp4", ".mov", ".webm", ".avi", ".mkv", ".m4v",
]);

const AUDIO_EXTENSIONS = new Set([
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

// ─── Video Optimization (ffmpeg) ─────────────────────────────

async function optimizeVideo(inputPath: string): Promise<OptimizeResult> {
  const previewPath = buildPreviewPath(inputPath, `.${VIDEO_PREVIEW.format}`);
  await ensureDir(path.dirname(previewPath));

  const args = [
    "-i", inputPath,
    "-vf", `scale=-2:${VIDEO_PREVIEW.maxHeight}`,
    "-c:v", VIDEO_PREVIEW.codec,
    "-crf", String(VIDEO_PREVIEW.crf),
    "-preset", VIDEO_PREVIEW.preset,
    "-movflags", "+faststart", // web optimized: moov atom at start
    "-pix_fmt", "yuv420p", // max compatibility
  ];

  if (VIDEO_PREVIEW.audioCodec) {
    args.push("-c:a", VIDEO_PREVIEW.audioCodec, "-b:a", VIDEO_PREVIEW.audioBitrate);
  } else {
    args.push("-an"); // strip audio
  }

  args.push("-y", previewPath);

  await execFileAsync("ffmpeg", args, { timeout: 300_000 }); // 5 min timeout

  const originalStat = await stat(inputPath);
  const previewStat = await stat(previewPath);

  // Get preview dimensions from ffprobe
  let width: number | undefined;
  let height: number | undefined;
  try {
    const { stdout } = await execFileAsync("ffprobe", [
      "-v", "error",
      "-select_streams", "v:0",
      "-show_entries", "stream=width,height",
      "-of", "json",
      previewPath,
    ]);
    const probe = JSON.parse(stdout);
    width = probe.streams?.[0]?.width;
    height = probe.streams?.[0]?.height;
  } catch {
    // non-critical, skip
  }

  return {
    originalPath: inputPath,
    previewPath,
    previewRelative: path.relative(PREVIEWS_DIR, previewPath),
    originalSize: originalStat.size,
    previewSize: previewStat.size,
    ratio: previewStat.size / originalStat.size,
    mediaType: "video",
    width,
    height,
  };
}

// ─── Audio Optimization (ffmpeg) ─────────────────────────────

async function optimizeAudio(inputPath: string): Promise<OptimizeResult> {
  const previewPath = buildPreviewPath(inputPath, `.${AUDIO_PREVIEW.format}`);
  await ensureDir(path.dirname(previewPath));

  const args = [
    "-i", inputPath,
    "-c:a", AUDIO_PREVIEW.codec,
    "-b:a", AUDIO_PREVIEW.bitrate,
    "-y", previewPath,
  ];

  await execFileAsync("ffmpeg", args, { timeout: 120_000 });

  const originalStat = await stat(inputPath);
  const previewStat = await stat(previewPath);

  return {
    originalPath: inputPath,
    previewPath,
    previewRelative: path.relative(PREVIEWS_DIR, previewPath),
    originalSize: originalStat.size,
    previewSize: previewStat.size,
    ratio: previewStat.size / originalStat.size,
    mediaType: "audio",
  };
}

// ─── Public API ───────────────────────────────────────────────

/**
 * Generate an optimized preview for any media file.
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

  // Check if preview already exists
  const ext = mediaType === "image"
    ? `.${IMAGE_PREVIEW.format}`
    : mediaType === "video"
      ? `.${VIDEO_PREVIEW.format}`
      : `.${AUDIO_PREVIEW.format}`;

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

  switch (mediaType) {
    case "image":
      return optimizeImage(inputPath);
    case "video":
      return optimizeVideo(inputPath);
    case "audio":
      return optimizeAudio(inputPath);
  }
}

/**
 * Batch generate previews for multiple files.
 * Processes images in parallel, videos sequentially (CPU intensive).
 */
export async function generatePreviews(
  inputPaths: string[],
  options?: { force?: boolean; onProgress?: (completed: number, total: number, result: OptimizeResult) => void }
): Promise<OptimizeResult[]> {
  const images = inputPaths.filter((p) => detectMediaType(p) === "image");
  const others = inputPaths.filter((p) => detectMediaType(p) !== "image");

  const results: OptimizeResult[] = [];
  let completed = 0;
  const total = inputPaths.length;

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

  // Process videos/audio sequentially (ffmpeg is CPU heavy)
  for (const p of others) {
    const result = await generatePreview(p, options);
    completed++;
    options?.onProgress?.(completed, total, result);
    results.push(result);
  }

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
