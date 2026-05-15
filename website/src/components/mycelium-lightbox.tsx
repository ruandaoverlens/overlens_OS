"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
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
import { notify } from "@/lib/notifications";

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

// ─── Modal ───────────────────────────────────────────────────

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
    if (!hasMultiple) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMultiple, attachments.length]);

  const handleDelete = async () => {
    if (!confirm("Excluir esta referência?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/mycelium/${reference.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        onDelete?.();
        notify.success("Post removido");
      } else {
        const data = await res.json().catch(() => ({}));
        notify.error("Falha ao salvar post", {
          description: data?.error ?? `Erro ${res.status}`,
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      notify.error("Falha ao salvar post", { description: msg });
    } finally {
      setDeleting(false);
    }
  };

  // ─── Center content per attachment kind ───
  const renderStage = () => {
    if (attachments.length === 0) {
      const cover = previewUrl(reference.cover_path);
      if (cover) {
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={reference.title}
            className="max-h-full max-w-full object-contain rounded-sm"
          />
        );
      }
      return (
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <SmGraphicEqLineIcon className="size-12" />
          <span className="text-xs uppercase tracking-wider">{typeLabel}</span>
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
            className="max-h-full max-w-full object-contain rounded-sm"
          />
        );
      case "video":
        return (
          <video
            src={original ?? url ?? ""}
            controls
            className="max-h-full max-w-full object-contain rounded-sm"
          />
        );
      case "audio":
        return (
          <div className="flex flex-col items-center gap-5 w-full max-w-md">
            <div className="size-24 rounded-full bg-white/5 flex items-center justify-center text-white/40">
              <SmPlaySolidIcon className="size-10" />
            </div>
            <p className="text-sm text-muted-foreground truncate max-w-full">
              {attachmentName(current)}
            </p>
            <audio src={original ?? url ?? ""} controls className="w-full" />
          </div>
        );
      case "file":
        return (
          <div className="flex flex-col items-center gap-4 text-muted-foreground">
            <SmDocLineIcon className="size-12" />
            <p className="text-sm truncate max-w-sm text-center">
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
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-foreground/20 [&::-webkit-scrollbar-track]:bg-transparent">
        <DialogHeader>
          <div className="flex items-center gap-2 pl-1">
            <Badge variant="secondary">{typeLabel}</Badge>
            {hasMultiple && (
              <span className="text-[11px] text-muted-foreground">
                {currentIdx + 1} / {attachments.length}
              </span>
            )}
          </div>
          <DialogTitle>{reference.title}</DialogTitle>
          {reference.description && (
            <DialogDescription>{reference.description}</DialogDescription>
          )}
        </DialogHeader>

        {/* Media stage */}
        <div className="relative flex items-center justify-center min-h-[280px] max-h-[60vh] rounded-lg bg-black/30 px-2 py-3 overflow-hidden">
          {hasMultiple && (
            <button
              onClick={goPrev}
              aria-label="Anterior"
              className="absolute left-2 top-1/2 -translate-y-1/2 size-8 rounded-full bg-black/60 text-white/70 hover:text-white hover:bg-black/80 flex items-center justify-center transition-all z-10"
            >
              <SmArrowBackIosNewLineIcon className="size-4" />
            </button>
          )}
          {renderStage()}
          {hasMultiple && (
            <button
              onClick={goNext}
              aria-label="Próximo"
              className="absolute right-2 top-1/2 -translate-y-1/2 size-8 rounded-full bg-black/60 text-white/70 hover:text-white hover:bg-black/80 flex items-center justify-center transition-all z-10"
            >
              <SmArrowForwardIosLineIcon className="size-4" />
            </button>
          )}
        </div>

        {/* Footer meta */}
        {(reference.author?.name || reference.created_at) && (
          <p className="text-xs text-muted-foreground pl-1">
            {reference.author?.name}
            {reference.author?.name && reference.created_at ? " · " : ""}
            {reference.created_at &&
              new Date(reference.created_at).toLocaleDateString("pt-BR")}
          </p>
        )}

        {/* Tags */}
        {reference.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pl-1">
            {reference.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 pt-1 pl-1">
          {reference.url && (
            <Button variant="default" size="sm" asChild>
              <a href={reference.url} target="_blank" rel="noopener noreferrer">
                <span>Abrir referência</span>
              </a>
            </Button>
          )}
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
            >
              <span>{deleting ? "Excluindo..." : "Excluir"}</span>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
