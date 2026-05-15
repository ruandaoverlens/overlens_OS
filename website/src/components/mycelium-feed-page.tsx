"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Banner,
  BannerImage,
  BannerContent,
  BannerTitle,
} from "@/components/ui/banner";
import { MyceliumCard } from "@/components/mycelium-card";
import { MyceliumLightbox } from "@/components/mycelium-lightbox";
import { MyceliumCreateButton } from "@/components/mycelium-create-button";
import { useFavorites } from "@/lib/favorites";
import { useInfiniteScroll } from "@/lib/use-infinite-scroll";
import {
  MYCELIUM_TYPES,
  type MyceliumReference,
  type MyceliumType,
} from "@/lib/mycelium-types";

// ─── Gradient palette (matches AssetPageShell) ───────────────

const GRADIENTS = [
  "linear-gradient(135deg, #77C5D5 0%, #A8DDE8 50%, #D4F0F7 100%)",
  "linear-gradient(135deg, #D6A461 0%, #E8C98A 50%, #F5E6C4 100%)",
  "linear-gradient(135deg, #3A913F 0%, #6BBF6F 50%, #A8DFA9 100%)",
  "linear-gradient(135deg, #8A3060 0%, #C47098 50%, #E8B0CC 100%)",
  "linear-gradient(135deg, #4A5FA8 0%, #7B8FCC 50%, #B4C0E8 100%)",
  "linear-gradient(135deg, #F87C56 0%, #FBA98A 50%, #FDD4C4 100%)",
  "linear-gradient(135deg, #5A9B9B 0%, #88C4C4 50%, #C0E4E4 100%)",
  "linear-gradient(135deg, #E8D44D 0%, #F0E27A 50%, #F8F0B0 100%)",
  "linear-gradient(135deg, #DC625E 0%, #EB9290 50%, #F5C4C3 100%)",
  "linear-gradient(135deg, #F4C3CC 0%, #F8D8DE 50%, #FCF0F2 100%)",
  "linear-gradient(135deg, #8BAF6A 0%, #B0CF96 50%, #D4E8C4 100%)",
  "linear-gradient(135deg, #FBDD7A 0%, #FCEAA3 50%, #FEF5D4 100%)",
] as const;

function getGradient(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

// The API enriches each reference with cover_url and attachments with
// preview_url. They're not part of the base type, so we widen here.
type FeedAttachment = MyceliumReference["attachments"] extends
  | Array<infer A>
  | undefined
  ? A & { preview_url?: string | null }
  : never;

type FeedReference = MyceliumReference & {
  cover_url?: string | null;
  attachments?: FeedAttachment[];
};

// ─── Filter chip ─────────────────────────────────────────────

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-sm text-xs uppercase tracking-wider transition-colors ${
        active
          ? "bg-white/15 text-white"
          : "bg-white/[0.03] text-white/50 hover:bg-white/[0.06] hover:text-white/80"
      }`}
    >
      {label}
    </button>
  );
}

// ─── Page ────────────────────────────────────────────────────

export function MyceliumFeedPage() {
  const [references, setReferences] = useState<FeedReference[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState<MyceliumType | null>(null);
  const [selected, setSelected] = useState<FeedReference | null>(null);
  const { isFavorite, toggleFavorite } = useFavorites();

  const fetchReferences = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeType) params.set("type", activeType);
    params.set("limit", "60");
    try {
      const r = await fetch(`/api/mycelium/list?${params.toString()}`);
      const d: { references?: FeedReference[] } = r.ok
        ? await r.json()
        : { references: [] };
      setReferences(d.references ?? []);
    } catch {
      setReferences([]);
    } finally {
      setLoading(false);
    }
  }, [activeType]);

  // Fetch on mount and when filter changes.
  // TODO: swap `limit=60` for real server-side pagination once usage grows.
  useEffect(() => {
    fetchReferences();
  }, [fetchReferences]);

  // Refresh when a new reference is created elsewhere (button "+").
  useEffect(() => {
    const handler = () => fetchReferences();
    window.addEventListener("mycelium:refresh", handler);
    return () => window.removeEventListener("mycelium:refresh", handler);
  }, [fetchReferences]);

  // Client-side pagination over the already-fetched list.
  const { visibleItems, hasMore, setSentinel } = useInfiniteScroll(references, 24);

  const handleToggleFavorite = (reference: FeedReference) => {
    const typeLabel =
      MYCELIUM_TYPES.find((t) => t.value === reference.type)?.label ??
      reference.type;
    const thumbnail =
      reference.cover_url ??
      reference.attachments?.[0]?.preview_url ??
      "";
    toggleFavorite({
      id: reference.id,
      type: "reference",
      title: reference.title,
      subtitle: typeLabel,
      thumbnail,
    });
  };

  const handleDeleted = () => {
    const deletedId = selected?.id;
    setSelected(null);
    if (deletedId) {
      setReferences((prev) => prev.filter((r) => r.id !== deletedId));
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Banner */}
      <Banner size="sm">
        <BannerImage gradient={getGradient("Mycelium")} />
        <BannerContent>
          <BannerTitle>Mycelium</BannerTitle>
        </BannerContent>
      </Banner>

      <div className="max-w-[1920px] mx-auto px-6 py-10 w-full space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-4 max-w-3xl">
            <p className="text-sm text-white/60 leading-relaxed">
              Banco coletivo de referências da marca. Todo material que inspira, alimenta e conecta o pensamento da Overlens.
            </p>
          </div>
          <MyceliumCreateButton className="shrink-0" />
        </div>

        {/* Type filters */}
        <div className="flex flex-wrap gap-2">
          <FilterChip
            label="Todos"
            active={activeType === null}
            onClick={() => setActiveType(null)}
          />
          {MYCELIUM_TYPES.map((t) => (
            <FilterChip
              key={t.value}
              label={t.label}
              active={activeType === t.value}
              onClick={() => setActiveType(t.value)}
            />
          ))}
        </div>

        {/* Grid / states */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-white/40">Carregando referências...</p>
          </div>
        ) : references.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-white/40">
              Nenhuma referência ainda. Adicione a primeira clicando em +.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {visibleItems.map((reference) => (
                <MyceliumCard
                  key={reference.id}
                  reference={reference}
                  onClick={() => setSelected(reference)}
                  isFavorite={isFavorite(reference.id)}
                  onToggleFavorite={() => handleToggleFavorite(reference)}
                />
              ))}
            </div>
            {hasMore && (
              <div ref={setSentinel} className="flex items-center justify-center py-8">
                <p className="text-xs text-white/30">Carregando mais...</p>
              </div>
            )}
          </>
        )}
      </div>

      {selected && (
        <MyceliumLightbox
          reference={selected}
          onClose={() => setSelected(null)}
          onDelete={handleDeleted}
        />
      )}
    </div>
  );
}
