/**
 * Browser-only image compression utility.
 *
 * Optional preflight used before upload to keep payloads reasonable on slow
 * connections. Pure browser APIs — no npm dependencies.
 *
 * Strategy:
 *   1. Decode the file via `createImageBitmap`.
 *   2. Scale down so the longer side fits `maxDimension`.
 *   3. Re-encode with a quality loop, halving size until <= `maxBytes` or
 *      we hit `minQuality` / `maxIterations`.
 *
 * The function is defensive: any decode/encode failure logs a warning and
 * returns the original file untouched. The only thrown error is AbortError.
 */

// ─── Public types ─────────────────────────────────────────────

export interface CompressOptions {
  /** Target max file size in bytes. Compression iterates until file size <= target (or maxIterations reached). */
  maxBytes?: number;
  /** Max width/height (whichever is larger). Image is scaled down if it exceeds this. */
  maxDimension?: number;
  /** Initial JPEG/WebP quality (0-1). */
  initialQuality?: number;
  /** Minimum quality before giving up. */
  minQuality?: number;
  /** Output mime. "image/jpeg" or "image/webp". Default "image/jpeg" (broadest support). */
  outputType?: "image/jpeg" | "image/webp";
  /** Max iterations of quality reduction before returning the smallest version. */
  maxIterations?: number;
}

export interface CompressResult {
  file: File;
  compressed: boolean;
  originalSize: number;
  finalSize: number;
  iterations: number;
}

// ─── Defaults & constants ─────────────────────────────────────

const DEFAULTS: Required<CompressOptions> = {
  maxBytes: 4 * 1024 * 1024,
  maxDimension: 2400,
  initialQuality: 0.9,
  minQuality: 0.5,
  outputType: "image/jpeg",
  maxIterations: 5,
};

const SUPPORTED_INPUT_TYPES = new Set<string>([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

// ─── Canvas abstraction ───────────────────────────────────────

type CanvasBundle =
  | {
      kind: "offscreen";
      canvas: OffscreenCanvas;
      ctx: OffscreenCanvasRenderingContext2D;
    }
  | {
      kind: "html";
      canvas: HTMLCanvasElement;
      ctx: CanvasRenderingContext2D;
    };

function getCanvas(width: number, height: number): CanvasBundle | null {
  if (typeof OffscreenCanvas !== "undefined") {
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext("2d");
    if (ctx) {
      return { kind: "offscreen", canvas, ctx };
    }
  }

  if (typeof document !== "undefined") {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      return { kind: "html", canvas, ctx };
    }
  }

  return null;
}

function canvasToBlob(
  bundle: CanvasBundle,
  type: "image/jpeg" | "image/webp",
  quality: number,
): Promise<Blob | null> {
  if (bundle.kind === "offscreen") {
    return bundle.canvas.convertToBlob({ type, quality });
  }
  return new Promise((resolve) => {
    bundle.canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

// ─── Helpers ──────────────────────────────────────────────────

function throwIfAborted(signal: AbortSignal | undefined): void {
  if (signal?.aborted) {
    throw new DOMException("Aborted", "AbortError");
  }
}

function computeScaledSize(
  width: number,
  height: number,
  maxDimension: number,
): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= maxDimension) {
    return { width, height };
  }
  const ratio = maxDimension / longest;
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  };
}

function replaceExtension(name: string, ext: string): string {
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  return `${base}.${ext}`;
}

function extensionFor(type: "image/jpeg" | "image/webp"): string {
  return type === "image/webp" ? "webp" : "jpg";
}

function unchanged(file: File): CompressResult {
  return {
    file,
    compressed: false,
    originalSize: file.size,
    finalSize: file.size,
    iterations: 0,
  };
}

// ─── Public API ───────────────────────────────────────────────

/**
 * Compress an image file in the browser if it exceeds maxBytes.
 *
 * Supports: image/jpeg, image/png, image/webp. PNGs with transparency are
 * preserved by outputting WebP when outputType is "image/webp"; otherwise
 * transparency is flattened to white.
 *
 * Files that are not images, or are already under maxBytes, are returned
 * unchanged (compressed: false).
 *
 * Never throws on a non-image file or on compression failure — returns the
 * original instead with compressed: false. Throws only on AbortSignal.
 */
export async function compressImageIfNeeded(
  file: File,
  options?: CompressOptions & { signal?: AbortSignal },
): Promise<CompressResult> {
  const opts: Required<CompressOptions> = {
    maxBytes: options?.maxBytes ?? DEFAULTS.maxBytes,
    maxDimension: options?.maxDimension ?? DEFAULTS.maxDimension,
    initialQuality: options?.initialQuality ?? DEFAULTS.initialQuality,
    minQuality: options?.minQuality ?? DEFAULTS.minQuality,
    outputType: options?.outputType ?? DEFAULTS.outputType,
    maxIterations: options?.maxIterations ?? DEFAULTS.maxIterations,
  };
  const signal = options?.signal;

  throwIfAborted(signal);

  // 1. Skip non-image / unsupported types.
  if (!file.type.startsWith("image/") || !SUPPORTED_INPUT_TYPES.has(file.type)) {
    return unchanged(file);
  }

  // 2. Skip files already under threshold.
  if (file.size <= opts.maxBytes) {
    return unchanged(file);
  }

  try {
    // 3a. Decode.
    const bitmap = await createImageBitmap(file);
    throwIfAborted(signal);

    try {
      const { width, height } = computeScaledSize(
        bitmap.width,
        bitmap.height,
        opts.maxDimension,
      );

      const bundle = getCanvas(width, height);
      if (!bundle) {
        return unchanged(file);
      }

      // Source could have alpha (PNG/WebP). JPEG has no alpha — fill white to
      // avoid black artifacts where transparency would have been.
      const sourceCouldHaveAlpha =
        file.type === "image/png" || file.type === "image/webp";
      if (opts.outputType === "image/jpeg" && sourceCouldHaveAlpha) {
        bundle.ctx.fillStyle = "#ffffff";
        bundle.ctx.fillRect(0, 0, width, height);
      }

      bundle.ctx.drawImage(bitmap, 0, 0, width, height);

      // 3b. Quality loop.
      let quality = opts.initialQuality;
      let iterations = 0;
      let bestBlob: Blob | null = null;

      while (iterations < opts.maxIterations) {
        throwIfAborted(signal);
        iterations += 1;

        const blob = await canvasToBlob(bundle, opts.outputType, quality);
        if (!blob) {
          break;
        }

        if (!bestBlob || blob.size < bestBlob.size) {
          bestBlob = blob;
        }

        if (blob.size <= opts.maxBytes) {
          break;
        }

        // Reduce quality for next pass, clamped to minQuality.
        const next = quality - 0.1;
        if (next < opts.minQuality - 1e-9) {
          break;
        }
        quality = next;
      }

      if (!bestBlob) {
        return unchanged(file);
      }

      // If we somehow ended up larger than the source, keep the original.
      if (bestBlob.size >= file.size) {
        return unchanged(file);
      }

      const newName = replaceExtension(file.name, extensionFor(opts.outputType));
      const newFile = new File([bestBlob], newName, {
        type: opts.outputType,
        lastModified: file.lastModified,
      });

      return {
        file: newFile,
        compressed: true,
        originalSize: file.size,
        finalSize: newFile.size,
        iterations,
      };
    } finally {
      // Free decoded pixels eagerly.
      bitmap.close();
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw err;
    }
    console.warn("[image-compress] failed, returning original:", err);
    return unchanged(file);
  }
}
