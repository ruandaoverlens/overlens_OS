"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  SmCloseLineIcon,
  SmPlaySolidIcon,
  SmSoundLineIcon,
  SmDocLineIcon,
  SmArrowUpwardLineIcon,
  SmArrowDownwardLineIcon,
  SmUploadLineIcon,
} from "@/components/icons";
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
}

const ACCEPT = "image/*,video/*,audio/*,application/pdf";

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
  maxSizeMB = 100,
}: MyceliumAttachmentUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const errors: string[] = [];

      for (const file of arr) {
        if (file.size > maxBytes) {
          errors.push(`${file.name}: excede ${maxSizeMB}MB`);
          continue;
        }
        accepted.push(makeDraft(file));
      }

      if (errors.length > 0) {
        setError(errors.join("; "));
      } else {
        setError(null);
      }

      if (accepted.length > 0) {
        onChange([...files, ...accepted]);
      }
    },
    [files, maxSizeMB, onChange],
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-[12px] border-2 border-dashed border-foreground/20 bg-accent/30 px-4 py-6 text-center text-sm text-muted-foreground transition-colors cursor-pointer hover:bg-accent/50",
          isDragging && "border-foreground/60 bg-accent/60",
        )}
      >
        <SmUploadLineIcon className="size-6 opacity-60" />
        <span>
          Arraste arquivos aqui ou{" "}
          <span className="underline underline-offset-2">clique pra selecionar</span>
        </span>
        <span className="text-xs opacity-60">
          Imagens, vídeos, áudios e PDFs até {maxSizeMB}MB
        </span>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              addFiles(e.target.files);
            }
            // Reset so selecting the same file twice still triggers onChange.
            e.target.value = "";
          }}
        />
      </div>

      {error && (
        <p className="text-xs text-destructive px-2" role="alert">
          {error}
        </p>
      )}

      {files.length > 0 && (
        <ul className="flex flex-row gap-2 overflow-x-auto pb-2">
          {files.map((draft, index) => (
            <li
              key={draft.id}
              className="relative shrink-0 group"
              style={{ width: 80, height: 80 }}
            >
              <div className="relative w-20 h-20 rounded-[8px] overflow-hidden bg-accent/60 border border-foreground/10 flex items-center justify-center">
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
                    <span className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                      <SmPlaySolidIcon className="size-6 text-white" />
                    </span>
                  </>
                )}
                {draft.kind === "audio" && (
                  <div className="flex flex-col items-center justify-center gap-1 px-1 text-foreground/80">
                    <SmSoundLineIcon className="size-6" />
                    <span className="text-[10px] leading-tight line-clamp-2 text-center">
                      {draft.file.name}
                    </span>
                  </div>
                )}
                {draft.kind === "file" && (
                  <div className="flex flex-col items-center justify-center gap-1 px-1 text-foreground/80">
                    <SmDocLineIcon className="size-6" />
                    <span className="text-[10px] leading-tight line-clamp-2 text-center">
                      {draft.file.name}
                    </span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleRemove(draft.id)}
                className="absolute -top-1 -right-1 z-10 flex items-center justify-center size-5 rounded-full bg-background text-foreground border border-foreground/20 shadow-sm hover:bg-destructive hover:text-white transition-colors"
                aria-label={`Remover ${draft.file.name}`}
              >
                <SmCloseLineIcon className="size-3" />
              </button>

              {files.length > 1 && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 z-10 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    className="flex items-center justify-center size-5 rounded-full bg-background text-foreground border border-foreground/20 shadow-sm hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Mover para a esquerda"
                  >
                    <SmArrowUpwardLineIcon className="size-3 -rotate-90" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === files.length - 1}
                    className="flex items-center justify-center size-5 rounded-full bg-background text-foreground border border-foreground/20 shadow-sm hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Mover para a direita"
                  >
                    <SmArrowDownwardLineIcon className="size-3 -rotate-90" />
                  </button>
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
