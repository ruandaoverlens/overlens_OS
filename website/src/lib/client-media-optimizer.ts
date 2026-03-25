/**
 * Client-side media optimizer using @ffmpeg/ffmpeg (WASM).
 * Runs entirely in the browser — no server-side FFmpeg needed.
 */

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

// ─── Config ───────────────────────────────────────────────────

const VIDEO_SETTINGS = {
  maxHeight: 720,
  crf: 28,
  preset: "fast",
  audioBitrate: "96k",
};

const AUDIO_SETTINGS = {
  bitrate: "96k",
  format: "mp3",
};

// ─── Singleton FFmpeg instance ────────────────────────────────

let ffmpeg: FFmpeg | null = null;
let loadPromise: Promise<void> | null = null;

async function getFFmpeg(): Promise<FFmpeg> {
  if (ffmpeg && ffmpeg.loaded) return ffmpeg;

  if (loadPromise) {
    await loadPromise;
    return ffmpeg!;
  }

  ffmpeg = new FFmpeg();

  loadPromise = (async () => {
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";

    await ffmpeg!.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
    });
  })();

  await loadPromise;
  return ffmpeg!;
}

// ─── Helpers ──────────────────────────────────────────────────

const VIDEO_EXTENSIONS = new Set([
  ".mp4",
  ".mov",
  ".webm",
  ".avi",
  ".mkv",
  ".m4v",
]);

const AUDIO_EXTENSIONS = new Set([
  ".mp3",
  ".wav",
  ".flac",
  ".ogg",
  ".aac",
  ".m4a",
  ".opus",
]);

function getExtension(filename: string): string {
  const idx = filename.lastIndexOf(".");
  return idx >= 0 ? filename.slice(idx).toLowerCase() : "";
}

function detectClientMediaType(
  filename: string
): "video" | "audio" | null {
  const ext = getExtension(filename);
  if (VIDEO_EXTENSIONS.has(ext)) return "video";
  if (AUDIO_EXTENSIONS.has(ext)) return "audio";
  return null;
}

// ─── Public API ───────────────────────────────────────────────

export interface ClientPreviewResult {
  preview: File;
  mediaType: "video" | "audio";
}

/**
 * Generate a compressed preview of a video or audio file in the browser.
 * Returns a new File with the preview content.
 *
 * - Video: scales to 720p max, H.264, CRF 28, MP4
 * - Audio: MP3 at 96k bitrate
 */
export async function generateClientPreview(
  file: File
): Promise<ClientPreviewResult> {
  const mediaType = detectClientMediaType(file.name);
  if (!mediaType) {
    throw new Error(
      `Unsupported media type for client preview: ${file.name}`
    );
  }

  const instance = await getFFmpeg();
  const inputName = `input${getExtension(file.name)}`;

  // Write input file to FFmpeg virtual FS
  await instance.writeFile(inputName, await fetchFile(file));

  if (mediaType === "video") {
    const outputName = "output.mp4";

    await instance.exec([
      "-i",
      inputName,
      "-vf",
      `scale=-2:'min(${VIDEO_SETTINGS.maxHeight},ih)'`,
      "-c:v",
      "libx264",
      "-crf",
      String(VIDEO_SETTINGS.crf),
      "-preset",
      VIDEO_SETTINGS.preset,
      "-movflags",
      "+faststart",
      "-pix_fmt",
      "yuv420p",
      "-c:a",
      "aac",
      "-b:a",
      VIDEO_SETTINGS.audioBitrate,
      "-y",
      outputName,
    ]);

    const data = await instance.readFile(outputName);
    const blob = new Blob([data instanceof Uint8Array ? data.slice() : data], { type: "video/mp4" });
    const baseName = file.name.replace(/\.[^.]+$/, "");
    const preview = new File([blob], `${baseName}.mp4`, {
      type: "video/mp4",
    });

    // Cleanup virtual FS
    await instance.deleteFile(inputName).catch(() => {});
    await instance.deleteFile(outputName).catch(() => {});

    return { preview, mediaType: "video" };
  } else {
    // Audio
    const outputName = `output.${AUDIO_SETTINGS.format}`;

    await instance.exec([
      "-i",
      inputName,
      "-b:a",
      AUDIO_SETTINGS.bitrate,
      "-y",
      outputName,
    ]);

    const data = await instance.readFile(outputName);
    const mimeType = "audio/mpeg";
    const blob = new Blob([data instanceof Uint8Array ? data.slice() : data], { type: mimeType });
    const baseName = file.name.replace(/\.[^.]+$/, "");
    const preview = new File([blob], `${baseName}.${AUDIO_SETTINGS.format}`, {
      type: mimeType,
    });

    // Cleanup virtual FS
    await instance.deleteFile(inputName).catch(() => {});
    await instance.deleteFile(outputName).catch(() => {});

    return { preview, mediaType: "audio" };
  }
}

/**
 * Check if a file is a video or audio file that needs client-side preview generation.
 */
export function needsClientPreview(filename: string): boolean {
  return detectClientMediaType(filename) !== null;
}
