"use client";

import {
  MediaCard,
  MediaCardImage,
  MediaCardContent,
  MediaCardTitle,
  MediaCardMeta,
  MediaCardMetaAction,
  MediaCardMetaAuthor,
  MediaCardMetaItem,
} from "@/components/ui/media-card";
import { FavoriteButton } from "@/components/favorite-button";
import {
  MYCELIUM_TYPES,
  type MyceliumReference,
  type MyceliumType,
} from "@/lib/mycelium-types";

// ─── URL helpers ─────────────────────────────────────────────

const SUPABASE_URL = "https://lqymftfphjexutgtvjuh.supabase.co";

function previewUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/mycelium-previews/${path
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

// ─── Type styling ────────────────────────────────────────────

const TYPE_LABELS: Record<MyceliumType, string> = MYCELIUM_TYPES.reduce(
  (acc, t) => {
    acc[t.value] = t.label;
    return acc;
  },
  {} as Record<MyceliumType, string>,
);

const TYPE_PLACEHOLDER: Record<MyceliumType, string> = {
  artigo: "#292524",
  video: "#4c0519",
  imagem: "#1e1b4b",
  audio: "#022c22",
  pdf: "#451a03",
  skill: "#2e1065",
  post: "#082f49",
  site: "#1e293b",
};

// ─── Time helper ─────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "hoje";
  if (days === 1) return "ontem";
  if (days < 7) return `há ${days} dias`;
  if (days < 30) return `há ${Math.floor(days / 7)} sem`;
  if (days < 365) return `há ${Math.floor(days / 30)} meses`;
  return `há ${Math.floor(days / 365)} anos`;
}

// ─── Card ────────────────────────────────────────────────────

export function MyceliumCard({
  reference,
  onClick,
  isFavorite,
  onToggleFavorite,
}: {
  reference: MyceliumReference;
  onClick: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  const firstImage = reference.attachments?.find((a) => a.kind === "image");
  const cover =
    previewUrl(reference.cover_path) ??
    previewUrl(firstImage?.preview_path ?? firstImage?.storage_path ?? null);

  const typeLabel = TYPE_LABELS[reference.type] ?? reference.type;
  const placeholderColor = TYPE_PLACEHOLDER[reference.type] ?? "#1c1917";

  return (
    <MediaCard>
      <MediaCardImage
        src={cover ?? undefined}
        color={cover ? undefined : placeholderColor}
        alt={reference.title}
        onClick={onClick}
      >
        <div
          className="absolute right-2 top-2 z-20 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          <FavoriteButton isFavorite={isFavorite} onClick={() => onToggleFavorite()} />
        </div>
      </MediaCardImage>
      <MediaCardContent>
        <MediaCardTitle onClick={onClick}>{reference.title}</MediaCardTitle>
        <MediaCardMeta>
          <MediaCardMetaAction onClick={onClick}>{typeLabel}</MediaCardMetaAction>
          {reference.author?.name && (
            <MediaCardMetaAuthor>{reference.author.name}</MediaCardMetaAuthor>
          )}
          <MediaCardMetaItem>{timeAgo(reference.created_at)}</MediaCardMetaItem>
        </MediaCardMeta>
      </MediaCardContent>
    </MediaCard>
  );
}
