"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  SmCloseLineIcon,
  SmPlaySolidIcon,
  SmSoundLineIcon,
  SmDocLineIcon,
  SmArrowUpwardLineIcon,
  SmArrowDownwardLineIcon,
  SmUploadLineIcon,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AttachmentKind } from "@/lib/mycelium-types";

export interface AttachmentDraft {
  id: string;
  file: File;
  kind: AttachmentKind;
  previewUrl: string;
}

interface MyceliumAttachmentUploaderProps {
  files: AttachmentDraft[];
  onChange: (files: AttachmentDraft[]) => void;
  maxSizeMB?: number;
  /** Teto do envio inteiro (capa + mídias). */
  maxTotalMB?: number;
  /** Bytes já ocupados fora desta lista (a capa, por exemplo). */
  outrosBytes?: number;
  disabled?: boolean;
  /** `id` de um `<Label>` externo que nomeia a área de upload. */
  "aria-labelledby"?: string;
}

const ACCEPT = "image/*,video/*,audio/*,application/pdf";

/**
 * O envio é multipart para a Route Handler `/api/mycelium/create`, cujo corpo é
 * limitado a ~4,5 MB na Vercel. Por isso há dois tetos distintos: um por
 * arquivo (para nenhum item sozinho consumir o envio inteiro) e um para o
 * total do envio, que é o limite real da plataforma.
 */
export const MYCELIUM_MAX_FILE_MB = 2;

/** Teto do corpo multipart aceito pela Vercel, com folga para os campos de texto. */
export const MYCELIUM_MAX_TOTAL_MB = 4;

export const MYCELIUM_MAX_TOTAL_BYTES = MYCELIUM_MAX_TOTAL_MB * 1024 * 1024;

/** Formata bytes em MB com uma casa decimal (pt-BR). */
export function formatMB(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} MB`;
}

/** Extensões aceitas quando o browser não informa um MIME (drag & drop). */
const EXTENSOES_ACEITAS =
  /\.(jpe?g|png|gif|webp|avif|svg|heic|mp4|mov|webm|mkv|avi|mp3|wav|ogg|m4a|aac|flac|pdf)$/i;

/** O `accept` do input não vale para drag & drop: validamos por MIME/extensão. */
export function tipoAceito(file: File): boolean {
  const mime = file.type.toLowerCase();
  if (mime) {
    return (
      mime.startsWith("image/") ||
      mime.startsWith("video/") ||
      mime.startsWith("audio/") ||
      mime === "application/pdf"
    );
  }
  return EXTENSOES_ACEITAS.test(file.name);
}

function detectKind(file: File): AttachmentKind {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "audio";
  return "file";
}

function makeDraft(file: File): AttachmentDraft {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    file,
    kind: detectKind(file),
    previewUrl: URL.createObjectURL(file),
  };
}

export function MyceliumAttachmentUploader({
  files,
  onChange,
  maxSizeMB = MYCELIUM_MAX_FILE_MB,
  maxTotalMB = MYCELIUM_MAX_TOTAL_MB,
  outrosBytes = 0,
  disabled = false,
  "aria-labelledby": labelledBy,
}: MyceliumAttachmentUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropzoneId = useId();
  const hintId = useId();
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<Array<{ id: string; message: string }>>([]);

  const dismissError = useCallback((id: string) => {
    setErrors((prev) => prev.filter((e) => e.id !== id));
  }, []);

  // Cleanup object URLs only on full unmount; per-item revoke happens in handleRemove.
  // We use a ref to keep the latest set of URLs without re-running cleanup on every change.
  const previewsRef = useRef<string[]>([]);
  useEffect(() => {
    previewsRef.current = files.map((f) => f.previewUrl);
  }, [files]);
  useEffect(() => {
    return () => {
      previewsRef.current.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch {
          /* noop */
        }
      });
    };
  }, []);

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const arr = Array.from(incoming);
      const accepted: AttachmentDraft[] = [];
      const maxBytes = maxSizeMB * 1024 * 1024;
      const maxTotalBytes = maxTotalMB * 1024 * 1024;
      const rejected: Array<{ id: string; message: string }> = [];
      // Total já comprometido: a capa (ou o que o pai informar) + as mídias
      // já na lista. Cresce a cada arquivo aceito, então o teto do envio é
      // checado aqui — e não só no submit.
      let totalAtual =
        outrosBytes + files.reduce((soma, f) => soma + f.file.size, 0);

      for (const file of arr) {
        if (!tipoAceito(file)) {
          rejected.push({
            id: `${file.name}-tipo-${Date.now()}`,
            message: `${file.name}: tipo não aceito. Use imagem, vídeo, áudio ou PDF`,
          });
          continue;
        }
        if (file.size > maxBytes) {
          rejected.push({
            id: `${file.name}-${file.size}-${Date.now()}`,
            message: `${file.name}: excede ${maxSizeMB} MB por arquivo`,
          });
          continue;
        }
        if (totalAtual + file.size > maxTotalBytes) {
          rejected.push({
            id: `${file.name}-total-${file.size}-${Date.now()}`,
            message: `${file.name}: estouraria o total de ${maxTotalMB} MB do envio (restam ${formatMB(
              Math.max(0, maxTotalBytes - totalAtual),
            )})`,
          });
          continue;
        }
        totalAtual += file.size;
        accepted.push(makeDraft(file));
      }

      setErrors(rejected);

      if (accepted.length > 0) {
        onChange([...files, ...accepted]);
      }
    },
    [files, maxSizeMB, maxTotalMB, outrosBytes, onChange],
  );

  const handleRemove = useCallback(
    (id: string) => {
      const target = files.find((f) => f.id === id);
      if (target) {
        try {
          URL.revokeObjectURL(target.previewUrl);
        } catch {
          /* noop */
        }
      }
      onChange(files.filter((f) => f.id !== id));
    },
    [files, onChange],
  );

  const move = useCallback(
    (index: number, direction: -1 | 1) => {
      const target = index + direction;
      if (target < 0 || target >= files.length) return;
      const next = [...files];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      onChange(next);
    },
    [files, onChange],
  );

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  const maxTotalBytes = maxTotalMB * 1024 * 1024;
  const usadoBytes =
    outrosBytes + files.reduce((soma, f) => soma + f.file.size, 0);
  const totalCheio = usadoBytes >= maxTotalBytes;

  return (
    <div className="flex flex-col gap-3">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        id={dropzoneId}
        aria-labelledby={labelledBy ? `${labelledBy} ${dropzoneId}` : undefined}
        aria-describedby={hintId}
        aria-disabled={disabled || undefined}
        onClick={() => {
          if (disabled) return;
          inputRef.current?.click();
        }}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (disabled) return;
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-field border-2 border-dashed border-foreground/20 bg-accent/30 px-4 py-6 text-center text-sm text-muted-foreground transition-colors cursor-pointer hover:bg-accent/50 outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          isDragging && "border-foreground/60 bg-accent/60",
          disabled && "pointer-events-none opacity-60",
        )}
      >
        <SmUploadLineIcon className="size-6 text-surface-500" />
        <span>
          Arraste arquivos aqui ou{" "}
          <span className="underline underline-offset-2">clique pra selecionar</span>
        </span>
        <span id={hintId} className="text-xs text-muted-foreground">
          Imagens, vídeos, áudios e PDFs até {maxSizeMB} MB por arquivo ·{" "}
          <span className={cn("tabular-nums", totalCheio && "text-destructive")}>
            {formatMB(usadoBytes)} de {maxTotalMB} MB
          </span>{" "}
          no envio
        </span>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="hidden"
          disabled={disabled}
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              addFiles(e.target.files);
            }
            // Reset so selecting the same file twice still triggers onChange.
            e.target.value = "";
          }}
        />
      </div>

      {errors.length > 0 && (
        <ul role="alert" aria-label="Arquivos ignorados" className="flex flex-col gap-2 px-2">
          {errors.map((err) => (
            <li key={err.id} className="flex items-center justify-between gap-2 text-xs text-destructive">
              <span className="min-w-0 truncate">{err.message}</span>
              <Button
                type="button"
                size="icon-xs"
                variant="ghost"
                onClick={() => dismissError(err.id)}
                className="shrink-0 text-muted-foreground hover:text-foreground"
                aria-label={`Dispensar aviso: ${err.message}`}
              >
                <SmCloseLineIcon className="size-3" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {files.length > 0 && (
        <ul className="flex flex-row gap-2 overflow-x-auto pb-2">
          {files.map((draft, index) => (
            <li
              key={draft.id}
              className="relative shrink-0 group size-20"
            >
              <div className="relative w-20 h-20 rounded-field-sm overflow-hidden bg-accent/60 border border-foreground/10 flex items-center justify-center">
                {draft.kind === "image" && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={draft.previewUrl}
                    alt={draft.file.name}
                    className="w-full h-full object-cover"
                  />
                )}
                {draft.kind === "video" && (
                  <>
                    <video
                      src={draft.previewUrl}
                      muted
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-cover"
                    />
                    {/* Véu e ícone sobre o frame do vídeo: literais nos dois temas. */}
                    <span className="absolute inset-0 flex items-center justify-center bg-absolute-black/30 pointer-events-none">
                      <SmPlaySolidIcon className="size-6 text-absolute-white" />
                    </span>
                  </>
                )}
                {draft.kind === "audio" && (
                  <div className="flex flex-col items-center justify-center gap-2 px-1 text-foreground/80">
                    <SmSoundLineIcon className="size-6" />
                    <span className="text-xs leading-tight line-clamp-2 text-center">
                      {draft.file.name}
                    </span>
                  </div>
                )}
                {draft.kind === "file" && (
                  <div className="flex flex-col items-center justify-center gap-2 px-1 text-foreground/80">
                    <SmDocLineIcon className="size-6" />
                    <span className="text-xs leading-tight line-clamp-2 text-center">
                      {draft.file.name}
                    </span>
                  </div>
                )}
              </div>

              <Button
                type="button"
                size="icon-xs"
                variant="secondary"
                onClick={() => handleRemove(draft.id)}
                disabled={disabled}
                className="absolute -top-1.5 -right-1.5 z-10 border border-foreground/20 bg-background shadow-sm hover:bg-destructive hover:text-primary-foreground"
                aria-label={`Remover ${draft.file.name}`}
              >
                <SmCloseLineIcon className="size-3" />
              </Button>

              {files.length > 1 && (
                <div className="action-overlay absolute -bottom-1.5 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="secondary"
                    onClick={() => move(index, -1)}
                    disabled={disabled || index === 0}
                    className="border border-foreground/20 bg-background shadow-sm"
                    aria-label={`Mover ${draft.file.name} para a esquerda`}
                  >
                    <SmArrowUpwardLineIcon className="size-3 -rotate-90" />
                  </Button>
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="secondary"
                    onClick={() => move(index, 1)}
                    disabled={disabled || index === files.length - 1}
                    className="border border-foreground/20 bg-background shadow-sm"
                    aria-label={`Mover ${draft.file.name} para a direita`}
                  >
                    <SmArrowDownwardLineIcon className="size-3 -rotate-90" />
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export { detectKind };
