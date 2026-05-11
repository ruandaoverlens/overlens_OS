"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  SmCloseLineIcon,
  SmPlaySolidIcon,
  SmGraphicEqLineIcon,
  SmArrowForwardIosLineIcon,
  SmArrowBackIosNewLineIcon,
  SmDocLineIcon,
  SmDownloadLineIcon,
} from "@/components/icons";
import { useAuth, canDelete } from "@/lib/auth";
import {
  MYCELIUM_TYPES,
  type MyceliumReference,
  type MyceliumAttachment,
  type MyceliumType,
} from "@/lib/mycelium-types";

// ─── URL helpers ─────────────────────────────────────────────

const SUPABASE_URL = "https://lqymftfphjexutgtvjuh.supabase.co";

function publicUrl(bucket: string, path: string | null | undefined): string | null {
  if (!path) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

function previewUrl(path: string | null | undefined): string | null {
  return publicUrl("mycelium-previews", path);
}

function storageUrl(path: string | null | undefined): string | null {
  return publicUrl("mycelium-attachments", path);
}

function attachmentDisplayUrl(att: MyceliumAttachment): string | null {
  return previewUrl(att.preview_path) ?? storageUrl(att.storage_path);
}

function attachmentSourceUrl(att: MyceliumAttachment): string | null {
  return storageUrl(att.storage_path) ?? previewUrl(att.preview_path);
}

function attachmentName(att: MyceliumAttachment): string {
  return att.storage_path.split("/").pop() ?? "arquivo";
}

// ─── Type label ──────────────────────────────────────────────

const TYPE_LABELS: Record<MyceliumType, string> = MYCELIUM_TYPES.reduce(
  (acc, t) => {
    acc[t.value] = t.label;
    return acc;
  },
  {} as Record<MyceliumType, string>,
);

// ─── Lightbox ────────────────────────────────────────────────

export function MyceliumLightbox({
  reference,
  onClose,
  onDelete,
}: {
  reference: MyceliumReference;
  onClose: () => void;
  onDelete?: () => void;
}) {
  const { user } = useAuth();
  const isAdmin = user && canDelete(user.role);
  const [deleting, setDeleting] = useState(false);
  const attachments = reference.attachments ?? [];
  const [currentIdx, setCurrentIdx] = useState(0);
  const hasMultiple = attachments.length > 1;
  const current = attachments[currentIdx];
  const typeLabel = TYPE_LABELS[reference.type] ?? reference.type;

  const goPrev = () =>
    setCurrentIdx((i) => (i - 1 + attachments.length) % attachments.length);
  const goNext = () =>
    setCurrentIdx((i) => (i + 1) % attachments.length);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft" && hasMultiple) goPrev();
      else if (e.key === "ArrowRight" && hasMultiple) goNext();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose, hasMultiple, attachments.length]);

  const handleDelete = async () => {
    if (!confirm("Excluir esta referência?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/mycelium/${reference.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        onDelete?.();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data?.error ?? "Erro ao excluir referência");
      }
    } catch {
      alert("Erro ao excluir referência");
    } finally {
      setDeleting(false);
    }
  };

  // ─── Center content per attachment kind ───
  const renderCenter = () => {
    // No attachments → fall back to cover or neutral state
    if (attachments.length === 0) {
      const cover = previewUrl(reference.cover_path);
      if (cover) {
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={reference.title}
            className="max-h-[80%] max-w-full object-contain rounded-sm"
          />
        );
      }
      return (
        <div className="flex flex-col items-center gap-4 text-white/40">
          <SmGraphicEqLineIcon className="size-16" />
          <span className="text-sm uppercase tracking-wider">{typeLabel}</span>
          {reference.url && (
            <Button variant="outline" size="sm" asChild>
              <a href={reference.url} target="_blank" rel="noopener noreferrer">
                <span>Abrir referência</span>
              </a>
            </Button>
          )}
        </div>
      );
    }

    if (!current) return null;
    const url = attachmentDisplayUrl(current);
    const original = attachmentSourceUrl(current);

    switch (current.kind) {
      case "image":
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url ?? ""}
            alt={reference.title}
            className="max-h-[80%] max-w-full object-contain rounded-sm"
          />
        );
      case "video":
        return (
          <video
            src={original ?? url ?? ""}
            controls
            autoPlay={false}
            className="max-h-[80%] max-w-full object-contain rounded-sm"
          />
        );
      case "audio":
        return (
          <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
            <div className="size-32 rounded-full bg-white/5 flex items-center justify-center text-white/40">
              <SmPlaySolidIcon className="size-12" />
            </div>
            <p className="text-sm text-white/60 truncate max-w-full">
              {attachmentName(current)}
            </p>
            <audio
              src={original ?? url ?? ""}
              controls
              className="w-full"
            />
          </div>
        );
      case "file":
        return (
          <div className="flex flex-col items-center gap-4 text-white/60">
            <SmDocLineIcon className="size-16 text-white/40" />
            <p className="text-sm truncate max-w-md text-center">
              {attachmentName(current)}
            </p>
            {original && (
              <Button variant="default" size="sm" asChild>
                <a href={original} download={attachmentName(current)}>
                  <SmDownloadLineIcon className="size-4 mr-1" />
                  <span>Download</span>
                </a>
              </Button>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex flex-col animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Top bar */}
      <div
        className="flex items-start justify-between px-4 py-3 shrink-0 gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-1 min-w-0 max-w-xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block px-1.5 py-0.5 rounded-sm bg-white/10 text-[10px] uppercase tracking-wider text-white/70">
              {typeLabel}
            </span>
            {hasMultiple && (
              <span className="text-[11px] text-white/40">
                {currentIdx + 1} / {attachments.length}
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-white/80 truncate">
            {reference.title}
          </p>
          {reference.description && (
            <p className="text-xs text-white/50 mt-0.5 line-clamp-2">
              {reference.description}
            </p>
          )}
          {(reference.author?.name || reference.created_at) && (
            <p className="text-xs text-white/40 mt-1">
              {reference.author?.name}
              {reference.author?.name && reference.created_at ? " · " : ""}
              {reference.created_at &&
                new Date(reference.created_at).toLocaleDateString("pt-BR")}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 ml-4">
          {reference.url && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="border-white/20 text-white/60 hover:bg-white/10 hover:border-white/40 hover:text-white"
            >
              <a href={reference.url} target="_blank" rel="noopener noreferrer">
                <span>Abrir referência</span>
              </a>
            </Button>
          )}
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 text-white/60 hover:bg-white/10 hover:border-white/40 hover:text-white"
              onClick={handleDelete}
              disabled={deleting}
            >
              <span>{deleting ? "Excluindo..." : "Excluir"}</span>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-white/60 hover:text-white hover:bg-white/10"
            onClick={onClose}
          >
            <SmCloseLineIcon />
          </Button>
        </div>
      </div>

      {/* Center stage */}
      <div
        className="flex-1 flex items-center justify-center px-4 pb-6 min-h-0 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {hasMultiple && (
          <button
            onClick={goPrev}
            aria-label="Anterior"
            className="absolute left-4 top-1/2 -translate-y-1/2 size-10 rounded-full bg-black/50 text-white/60 hover:text-white hover:bg-black/70 flex items-center justify-center transition-all z-10"
          >
            <SmArrowBackIosNewLineIcon className="size-5" />
          </button>
        )}
        {renderCenter()}
        {hasMultiple && (
          <button
            onClick={goNext}
            aria-label="Próximo"
            className="absolute right-4 top-1/2 -translate-y-1/2 size-10 rounded-full bg-black/50 text-white/60 hover:text-white hover:bg-black/70 flex items-center justify-center transition-all z-10"
          >
            <SmArrowForwardIosLineIcon className="size-5" />
          </button>
        )}
      </div>

      {/* Tags strip (optional, low-emphasis) */}
      {reference.tags.length > 0 && (
        <div
          className="shrink-0 px-4 pb-4 flex flex-wrap gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          {reference.tags.map((tag) => (
            <span
              key={tag}
              className="text-[11px] px-2 py-0.5 rounded-sm bg-white/5 text-white/50"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
