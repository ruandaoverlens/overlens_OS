"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HeadingTitle } from "@/components/ui/heading";
import { FavoriteButton } from "@/components/favorite-button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import {
  SmPlaySolidIcon,
  SmGraphicEqLineIcon,
  SmArrowForwardIosLineIcon,
  SmArrowBackIosNewLineIcon,
  SmDocLineIcon,
  SmDownloadLineIcon,
} from "@/components/icons";
import { useAuth, canDelete } from "@/lib/auth";
import { useFavorites } from "@/lib/favorites";
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

const DELETE_ERROR = "Não foi possível excluir a referência";

// ─── Stage image ─────────────────────────────────────────────

/** Imagem do palco: `fill` + `object-contain` dentro de uma área com altura fixa. */
function StageImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative w-full h-[50vh] min-h-[256px]">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="100vw"
        className="object-contain rounded-sm"
      />
    </div>
  );
}

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
  const confirm = useConfirm();
  const { isFavorite, toggleFavorite } = useFavorites();
  const isAdmin = user && canDelete(user.role);
  const [deleting, setDeleting] = useState(false);
  const attachments = reference.attachments ?? [];
  const [currentIdx, setCurrentIdx] = useState(0);
  const hasMultiple = attachments.length > 1;
  const current = attachments[currentIdx];
  const typeLabel = TYPE_LABELS[reference.type] ?? reference.type;
  const total = attachments.length;

  const goPrev = () => setCurrentIdx((i) => (i - 1 + total) % total);
  const goNext = () => setCurrentIdx((i) => (i + 1) % total);

  // Navegação por setas (mantida): usa o total para não depender dos handlers.
  useEffect(() => {
    if (!hasMultiple) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setCurrentIdx((i) => (i - 1 + total) % total);
      } else if (e.key === "ArrowRight") {
        setCurrentIdx((i) => (i + 1) % total);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [hasMultiple, total]);

  const handleDelete = async () => {
    const ok = await confirm({
      title: "Excluir esta referência?",
      description: `"${reference.title}" será removida do Mycelium. Esta ação não pode ser desfeita.`,
      confirmLabel: "Excluir",
      destructive: true,
    });
    if (!ok) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/mycelium/${reference.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        onDelete?.();
        notify.success("Referência excluída");
      } else {
        const data = await res.json().catch(() => ({}));
        notify.error(DELETE_ERROR, {
          description: data?.error ?? `Erro ${res.status}`,
        });
      }
    } catch (err) {
      notify.fromError(err, DELETE_ERROR);
    } finally {
      setDeleting(false);
    }
  };

  // ─── Center content per attachment kind ───
  const renderStage = () => {
    if (attachments.length === 0) {
      const cover = previewUrl(reference.cover_path);
      if (cover) {
        return <StageImage src={cover} alt={reference.title} />;
      }
      return (
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <SmGraphicEqLineIcon className="size-12" />
          <HeadingTitle as="h3" size="eyebrow">
            {typeLabel}
          </HeadingTitle>
        </div>
      );
    }

    if (!current) return null;
    const url = attachmentDisplayUrl(current);
    const original = attachmentSourceUrl(current);

    switch (current.kind) {
      case "image":
        return url ? <StageImage src={url} alt={reference.title} /> : null;
      case "video":
        return (
          <video
            src={original ?? url ?? ""}
            controls
            preload="metadata"
            className="max-h-full max-w-full object-contain rounded-sm"
          />
        );
      case "audio":
        return (
          <div className="flex flex-col items-center gap-5 w-full max-w-md">
            <div className="size-24 rounded-full bg-surface-raised-2 flex items-center justify-center text-muted-foreground">
              <SmPlaySolidIcon className="size-10" />
            </div>
            <p className="text-sm text-muted-foreground truncate max-w-full">
              {attachmentName(current)}
            </p>
            <audio
              src={original ?? url ?? ""}
              controls
              preload="metadata"
              className="w-full"
            />
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
                  <SmDownloadLineIcon className="size-4" />
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
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 pl-1">
            <Badge variant="secondary">{typeLabel}</Badge>
            {hasMultiple && (
              <span className="text-xs text-muted-foreground" aria-live="polite">
                {currentIdx + 1} / {attachments.length}
              </span>
            )}
          </div>
          <DialogTitle>{reference.title}</DialogTitle>
          {reference.description ? (
            <DialogDescription>{reference.description}</DialogDescription>
          ) : (
            <DialogDescription className="sr-only">
              {typeLabel}
              {reference.author?.name ? ` · ${reference.author.name}` : ""}
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Media stage */}
        <div className="relative flex items-center justify-center min-h-[280px] max-h-[60vh] rounded-lg bg-surface-950 px-2 py-3 overflow-hidden">
          {hasMultiple && (
            <Button
              type="button"
              size="icon-sm"
              variant="secondary"
              onClick={goPrev}
              aria-label="Mídia anterior"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-absolute-black/60 text-absolute-white hover:bg-absolute-black/80"
            >
              <SmArrowBackIosNewLineIcon className="size-4" />
            </Button>
          )}
          {renderStage()}
          {hasMultiple && (
            <Button
              type="button"
              size="icon-sm"
              variant="secondary"
              onClick={goNext}
              aria-label="Próxima mídia"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-absolute-black/60 text-absolute-white hover:bg-absolute-black/80"
            >
              <SmArrowForwardIosLineIcon className="size-4" />
            </Button>
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
          <ul className="flex flex-wrap gap-1.5 pl-1" aria-label="Tags">
            {reference.tags.map((tag) => (
              <li key={tag}>
                <Badge variant="outline">{tag}</Badge>
              </li>
            ))}
          </ul>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 pt-1 pl-1">
          <FavoriteButton
            isFavorite={isFavorite(reference.id)}
            iconClassName="size-5"
            onClick={() =>
              toggleFavorite({
                id: reference.id,
                type: "reference",
                title: reference.title,
                subtitle: typeLabel,
                thumbnail: previewUrl(reference.cover_path) ?? "",
              })
            }
          />
          {reference.url && (
            <Button variant="default" size="sm" asChild>
              <a href={reference.url} target="_blank" rel="noopener noreferrer">
                <span>Abrir referência</span>
              </a>
            </Button>
          )}
          {isAdmin && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDelete}
              loading={deleting}
              loadingText="Excluindo…"
            >
              <span>Excluir</span>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
