/**
 * Direct-to-Supabase asset upload helper.
 *
 * Orchestrates a three-step browser upload that bypasses Vercel's 4.5MB
 * serverless body limit:
 *
 *   1. Ask our API for a signed upload URL ("signing")
 *   2. PUT the file directly to Supabase Storage ("uploading-original")
 *      - for video/audio: also run a client-side ffmpeg preview
 *        ("optimizing") and upload it to the previews bucket
 *        ("uploading-preview")
 *   3. Tell our API the upload is done so it can persist metadata
 *      ("finalizing")
 *
 * All steps honor an external AbortSignal and an overall timeout. Errors are
 * always wrapped with the phase name so callers can show useful messages.
 */

import { generateClientPreview, needsClientPreview } from "@/lib/client-media-optimizer";

// ─── Public types ─────────────────────────────────────────────

export type DirectUploadPhase =
  | "signing"
  | "uploading-original"
  | "optimizing"
  | "uploading-preview"
  | "finalizing";

export interface DirectUploadProgress {
  phase: DirectUploadPhase;
  /** Bytes uploaded for the current file. Only meaningful in upload phases. */
  bytesUploaded?: number;
  /** Total size of the file being uploaded in the current phase. */
  totalBytes?: number;
}

export interface DirectUploadOptions {
  file: File;
  assetType: string;
  metadata: Record<string, unknown>;
  onProgress?: (p: DirectUploadProgress) => void;
  signal?: AbortSignal;
  /** Total operation timeout in ms. Defaults to 5 minutes. */
  timeoutMs?: number;
}

export interface DirectUploadFile {
  name: string;
  size: number;
  mediaType: "image" | "video" | "audio" | null;
  path: string;
  downloadUrl: string;
  previewUrl: string | null;
}

export interface DirectUploadPreview {
  size: number;
  ratio: number;
  savings: string;
}

export interface DirectUploadResult {
  file: DirectUploadFile;
  preview: DirectUploadPreview | null;
  previewError: string | null;
}

// ─── Internal types ───────────────────────────────────────────

type SupabaseBucket = "platform-assets" | "asset-previews";

interface SignUploadResponse {
  uploadUrl: string;
  token: string;
  path: string;
}

interface FinalizeUploadResponse {
  success: true;
  file: DirectUploadFile;
  preview: DirectUploadPreview | null;
  previewError: string | null;
  metadata: Record<string, unknown>;
}

const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000;

// ─── Helpers ──────────────────────────────────────────────────

/**
 * Build an AbortController that fires on either the external signal
 * or after `timeoutMs`. Returns the controller plus a cleanup fn that
 * removes listeners and clears the timer.
 */
function combineSignalWithTimeout(
  external: AbortSignal | undefined,
  timeoutMs: number
): { controller: AbortController; cleanup: () => void } {
  const controller = new AbortController();

  const onAbort = () => {
    if (!controller.signal.aborted) {
      const reason = external?.reason ?? new DOMException("Aborted", "AbortError");
      controller.abort(reason);
    }
  };

  if (external) {
    if (external.aborted) {
      onAbort();
    } else {
      external.addEventListener("abort", onAbort, { once: true });
    }
  }

  const timer = setTimeout(() => {
    if (!controller.signal.aborted) {
      controller.abort(
        new DOMException(`Upload timed out after ${timeoutMs}ms`, "TimeoutError")
      );
    }
  }, timeoutMs);

  const cleanup = () => {
    clearTimeout(timer);
    if (external) {
      external.removeEventListener("abort", onAbort);
    }
  };

  return { controller, cleanup };
}

function describeError(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

/** Read the new filename for a client-generated preview, keeping the
 *  base name of the original file. */
function previewFilenameFor(originalName: string, preview: File): string {
  const lastDot = preview.name.lastIndexOf(".");
  const previewExt = lastDot >= 0 ? preview.name.slice(lastDot) : "";
  const baseName = originalName.replace(/\.[^.]+$/, "");
  return `${baseName}${previewExt}`;
}

// ─── Network primitives ───────────────────────────────────────

async function callSignUpload(args: {
  filename: string;
  contentType: string;
  assetType: string;
  size: number;
  bucket?: SupabaseBucket;
  signal: AbortSignal;
}): Promise<SignUploadResponse> {
  const { signal, ...body } = args;
  let res: Response;
  try {
    res = await fetch("/api/assets/sign-upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    });
  } catch (err) {
    throw new Error(`[direct-upload] signing failed: ${describeError(err)}`);
  }

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const data: unknown = await res.json();
      if (
        data &&
        typeof data === "object" &&
        "error" in data &&
        typeof (data as { error: unknown }).error === "string"
      ) {
        message = (data as { error: string }).error;
      }
    } catch {
      // ignore — fall back to status code
    }
    throw new Error(`[direct-upload] signing failed: ${message}`);
  }

  return (await res.json()) as SignUploadResponse;
}

/**
 * PUT the file body to a Supabase signed upload URL using XHR so we can
 * surface per-byte progress.
 *
 * The signed URL returned by sign-upload is the absolute URL the browser
 * should hit (e.g. `${SUPABASE_URL}/storage/v1/object/upload/sign/<bucket>/<path>?token=<token>`).
 * Per Supabase docs, we send the file body as a PUT with the bearer token.
 */
function putToSignedUrl(args: {
  uploadUrl: string;
  token: string;
  file: File;
  signal: AbortSignal;
  onByteProgress: (loaded: number, total: number) => void;
}): Promise<void> {
  const { uploadUrl, token, file, signal, onByteProgress } = args;

  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(signal.reason ?? new DOMException("Aborted", "AbortError"));
      return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl, true);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("x-upsert", "false");
    if (file.type) {
      xhr.setRequestHeader("Content-Type", file.type);
    }

    const onAbort = () => {
      try {
        xhr.abort();
      } catch {
        // ignore
      }
    };

    const cleanup = () => {
      signal.removeEventListener("abort", onAbort);
    };

    xhr.upload.onprogress = (event: ProgressEvent) => {
      if (event.lengthComputable) {
        onByteProgress(event.loaded, event.total);
      } else {
        onByteProgress(event.loaded, file.size);
      }
    };

    xhr.onload = () => {
      cleanup();
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        const detail = xhr.responseText
          ? `: ${xhr.responseText.slice(0, 300)}`
          : "";
        reject(new Error(`HTTP ${xhr.status}${detail}`));
      }
    };

    xhr.onerror = () => {
      cleanup();
      reject(new Error("Network error"));
    };

    xhr.onabort = () => {
      cleanup();
      reject(signal.reason ?? new DOMException("Aborted", "AbortError"));
    };

    xhr.ontimeout = () => {
      cleanup();
      reject(new Error("Request timed out"));
    };

    signal.addEventListener("abort", onAbort, { once: true });

    xhr.send(file);
  });
}

async function callFinalize(args: {
  path: string;
  assetType: string;
  originalName: string;
  metadata: Record<string, unknown>;
  clientPreviewPath: string | undefined;
  originalSize: number;
  signal: AbortSignal;
}): Promise<FinalizeUploadResponse> {
  const { signal, ...body } = args;

  let res: Response;
  try {
    res = await fetch("/api/assets/finalize-upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    });
  } catch (err) {
    throw new Error(`[direct-upload] finalizing failed: ${describeError(err)}`);
  }

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const data: unknown = await res.json();
      if (
        data &&
        typeof data === "object" &&
        "error" in data &&
        typeof (data as { error: unknown }).error === "string"
      ) {
        message = (data as { error: string }).error;
      }
    } catch {
      // ignore
    }
    throw new Error(`[direct-upload] finalizing failed: ${message}`);
  }

  return (await res.json()) as FinalizeUploadResponse;
}

// ─── Public API ───────────────────────────────────────────────

/**
 * Upload an asset directly to Supabase Storage from the browser,
 * bypassing Vercel's 4.5MB serverless body limit.
 *
 * Flow:
 *   1. signing                 — POST /api/assets/sign-upload (original)
 *   2. uploading-original      — PUT file to signed URL (xhr, with progress)
 *   3. optimizing              — (video/audio only) generate client preview
 *   4. uploading-preview       — (video/audio only) sign + PUT preview
 *   5. finalizing              — POST /api/assets/finalize-upload
 */
export async function uploadAssetDirect(
  opts: DirectUploadOptions
): Promise<DirectUploadResult> {
  const {
    file,
    assetType,
    metadata,
    onProgress,
    signal: externalSignal,
    timeoutMs = DEFAULT_TIMEOUT_MS,
  } = opts;

  const { controller, cleanup } = combineSignalWithTimeout(externalSignal, timeoutMs);
  const signal = controller.signal;

  const emit = (p: DirectUploadProgress): void => {
    if (!onProgress) return;
    try {
      onProgress(p);
    } catch {
      // never let user callbacks break the upload
    }
  };

  try {
    // ─── 1. Sign upload for the original ─────────────────────
    emit({ phase: "signing" });

    const originalSign = await callSignUpload({
      filename: file.name,
      contentType: file.type || "application/octet-stream",
      assetType,
      size: file.size,
      signal,
    });

    // ─── 2. Upload the original ──────────────────────────────
    emit({
      phase: "uploading-original",
      bytesUploaded: 0,
      totalBytes: file.size,
    });

    try {
      await putToSignedUrl({
        uploadUrl: originalSign.uploadUrl,
        token: originalSign.token,
        file,
        signal,
        onByteProgress: (loaded, total) => {
          emit({
            phase: "uploading-original",
            bytesUploaded: loaded,
            totalBytes: total,
          });
        },
      });
    } catch (err) {
      throw new Error(
        `[direct-upload] uploading-original failed: ${describeError(err)}`
      );
    }

    // ─── 3 & 4. Client-side preview (video/audio only) ───────
    let clientPreviewPath: string | undefined;

    if (needsClientPreview(file.name)) {
      emit({ phase: "optimizing" });

      let previewFile: File | null = null;
      try {
        const { preview } = await generateClientPreview(file);
        previewFile = preview;
      } catch (err) {
        // Non-fatal: server may still produce a preview, or the asset
        // is saved without one. Mirror the existing modal behavior.
        if (typeof console !== "undefined") {
          console.warn(
            "[direct-upload] client preview generation failed, continuing without preview:",
            err
          );
        }
      }

      if (previewFile) {
        if (signal.aborted) {
          throw signal.reason ?? new DOMException("Aborted", "AbortError");
        }

        emit({ phase: "signing" });

        const previewName = previewFilenameFor(file.name, previewFile);
        const previewSign = await callSignUpload({
          filename: previewName,
          contentType: previewFile.type || "application/octet-stream",
          assetType,
          size: previewFile.size,
          bucket: "asset-previews",
          signal,
        });

        emit({
          phase: "uploading-preview",
          bytesUploaded: 0,
          totalBytes: previewFile.size,
        });

        try {
          await putToSignedUrl({
            uploadUrl: previewSign.uploadUrl,
            token: previewSign.token,
            file: previewFile,
            signal,
            onByteProgress: (loaded, total) => {
              emit({
                phase: "uploading-preview",
                bytesUploaded: loaded,
                totalBytes: total,
              });
            },
          });
        } catch (err) {
          throw new Error(
            `[direct-upload] uploading-preview failed: ${describeError(err)}`
          );
        }

        clientPreviewPath = previewSign.path;
      }
    }

    // ─── 5. Finalize ─────────────────────────────────────────
    emit({ phase: "finalizing" });

    const finalized = await callFinalize({
      path: originalSign.path,
      assetType,
      originalName: file.name,
      metadata,
      clientPreviewPath,
      originalSize: file.size,
      signal,
    });

    return {
      file: finalized.file,
      preview: finalized.preview,
      previewError: finalized.previewError,
    };
  } finally {
    cleanup();
  }
}
