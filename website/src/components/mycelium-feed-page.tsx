"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Banner,
  BannerImage,
  BannerContent,
  BannerTitle,
} from "@/components/ui/banner";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { SmSearchLineIcon } from "@/components/icons";
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

// ─── Page ────────────────────────────────────────────────────

export function MyceliumFeedPage() {
  const [references, setReferences] = useState<FeedReference[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState<MyceliumType | null>(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<FeedReference | null>(null);
  const { isFavorite, toggleFavorite } = useFavorites();

  const fetchReferences = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeType) params.set("type", activeType);
    if (search.trim()) params.set("q", search.trim());
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
  }, [activeType, search]);

  // Fetch on mount and when filter/search changes.
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

      {/* Search + Adicionar */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-3 max-w-[1920px] mx-auto w-full min-w-0">
        <InputGroup size="sm" className="flex-1 min-w-0 rounded-full">
          <InputGroupAddon align="inline-start">
            <InputGroupText>
              <SmSearchLineIcon />
            </InputGroupText>
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Buscar no Mycelium..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>
        <MyceliumCreateButton className="shrink-0" />
      </div>

      {/* Type filters */}
      <div className="px-4 pb-2 max-w-[1920px] mx-auto w-full">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveType(null)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              activeType === null
                ? "bg-white text-black"
                : "bg-[var(--surface-900)] text-[var(--surface-400)] hover:text-[var(--surface-200)]"
            }`}
          >
            Todos
          </button>
          {MYCELIUM_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setActiveType(t.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                activeType === t.value
                  ? "bg-white text-black"
                  : "bg-[var(--surface-900)] text-[var(--surface-400)] hover:text-[var(--surface-200)]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pt-2 max-w-[1920px] mx-auto w-full">
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
        <div className="h-[200px] w-full shrink-0" aria-hidden="true" />
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
