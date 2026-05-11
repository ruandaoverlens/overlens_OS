"use client";

import { FavoriteButton } from "@/components/favorite-button";
import { MYCELIUM_TYPES, type MyceliumReference, type MyceliumType } from "@/lib/mycelium-types";

// ─── URL helpers ─────────────────────────────────────────────

const SUPABASE_URL = "https://lqymftfphjexutgtvjuh.supabase.co";

/** Build a public URL for a path inside the mycelium-previews public bucket. */
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

/** Solid placeholder colors per type, used when no cover/preview is available. */
const TYPE_PLACEHOLDER: Record<MyceliumType, string> = {
  artigo: "bg-stone-800",
  video: "bg-rose-950",
  imagem: "bg-indigo-950",
  audio: "bg-emerald-950",
  pdf: "bg-amber-950",
  skill: "bg-violet-950",
  post: "bg-sky-950",
  site: "bg-slate-800",
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
  // Pick a cover: explicit cover_path, else first image attachment preview, else null.
  const firstImage = reference.attachments?.find((a) => a.kind === "image");
  const cover =
    previewUrl(reference.cover_path) ??
    previewUrl(firstImage?.preview_path ?? firstImage?.storage_path ?? null);

  const typeLabel = TYPE_LABELS[reference.type] ?? reference.type;
  const placeholderColor = TYPE_PLACEHOLDER[reference.type] ?? "bg-stone-800";
  const visibleTags = reference.tags.slice(0, 3);
  const remainingTags = Math.max(0, reference.tags.length - visibleTags.length);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
      className="rounded-sm overflow-hidden cursor-pointer group relative w-full text-left aspect-[4/5] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors flex flex-col"
    >
      {/* Cover */}
      <div className="relative w-full aspect-[4/3] shrink-0 overflow-hidden">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={reference.title}
            className="w-full h-full object-cover block"
            loading="lazy"
          />
        ) : (
          <div
            className={`w-full h-full ${placeholderColor} flex items-center justify-center`}
          >
            <span className="text-xs uppercase tracking-wider text-white/30">
              {typeLabel}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200" />
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <FavoriteButton isFavorite={isFavorite} onClick={() => onToggleFavorite()} />
        </div>
        {/* Type badge */}
        <div className="absolute top-2 left-2">
          <span className="inline-block px-1.5 py-0.5 rounded-sm bg-black/60 text-[10px] uppercase tracking-wider text-white/70">
            {typeLabel}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-1 flex flex-col gap-1.5 p-3 min-h-0">
        <p className="text-sm font-medium text-white/80 line-clamp-2 leading-tight">
          {reference.title}
        </p>
        {reference.description && (
          <p className="text-xs text-white/60 line-clamp-2 leading-snug">
            {reference.description}
          </p>
        )}
        {visibleTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto pt-1">
            {visibleTags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-1.5 py-0.5 rounded-sm bg-white/5 text-white/50"
              >
                {tag}
              </span>
            ))}
            {remainingTags > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 text-white/40">
                +{remainingTags}
              </span>
            )}
          </div>
        )}
        <div className="flex items-center gap-1.5 text-[11px] text-white/40 pt-1">
          {reference.author?.name && (
            <>
              <span className="truncate">{reference.author.name}</span>
              <span aria-hidden>·</span>
            </>
          )}
          <span>{timeAgo(reference.created_at)}</span>
        </div>
      </div>
    </div>
  );
}
