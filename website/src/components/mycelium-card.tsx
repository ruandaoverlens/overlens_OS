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

/** Placeholder por tipo: cor de marca em micro-dose sobre a superfície mais escura. */
function placeholder(brand: string): string {
  return `color-mix(in oklab, var(--brand-${brand}) 25%, var(--surface-950))`;
}

const TYPE_PLACEHOLDER: Record<MyceliumType, string> = {
  artigo: placeholder("arena"),
  video: placeholder("cotta"),
  imagem: placeholder("kobold"),
  audio: placeholder("midori"),
  pdf: placeholder("sahara"),
  skill: placeholder("boreal"),
  post: placeholder("bleu"),
  site: placeholder("azzay"),
};

const DEFAULT_PLACEHOLDER = "var(--surface-950)";

/** Grade de 1/2/3/4 colunas (sm/md/xl) — largura esperada da imagem por breakpoint. */
const CARD_IMAGE_SIZES =
  "(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw";

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
  const placeholderColor = TYPE_PLACEHOLDER[reference.type] ?? DEFAULT_PLACEHOLDER;

  return (
    <MediaCard>
      <MediaCardImage
        src={cover ?? undefined}
        color={cover ? undefined : placeholderColor}
        alt={reference.title}
        sizes={CARD_IMAGE_SIZES}
        aria-label={`Abrir ${reference.title}`}
        onClick={onClick}
      />
      {/* Overlay de favorito: irmão absoluto da imagem (MediaCardImage é um <button>
          e não pode conter outro controle). `action-overlay` revela no hover e no
          foco e mantém o botão alcançável no toque (onde não existe hover). */}
      <div className="action-overlay absolute right-2 top-2 z-20">
        <FavoriteButton
          isFavorite={isFavorite}
          onClick={() => onToggleFavorite()}
        />
      </div>
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
