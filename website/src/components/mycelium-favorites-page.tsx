"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AssetPageShell } from "@/components/asset-page-shell";
import { MyceliumCard } from "./mycelium-card";
import { MyceliumLightbox } from "./mycelium-lightbox";
import { useFavorites } from "@/lib/favorites";
import { MYCELIUM_TYPES, type MyceliumReference } from "@/lib/mycelium-types";

const SUPABASE_URL = "https://lqymftfphjexutgtvjuh.supabase.co";

function previewUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/mycelium-previews/${path
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

export function MyceliumFavoritesPage() {
  const { items, isFavorite, toggleFavorite } = useFavorites();
  const [references, setReferences] = useState<MyceliumReference[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<MyceliumReference | null>(null);

  // IDs of reference-type favorites
  const favoriteRefIds = useMemo(
    () =>
      items
        .filter((i) => i.type === "reference")
        .map((i) => i.id)
        .sort()
        .join(","),
    [items],
  );

  const fetchReferences = useCallback(async () => {
    if (!favoriteRefIds) {
      setReferences([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const params = new URLSearchParams({ ids: favoriteRefIds });
    try {
      const r = await fetch(`/api/mycelium/list?${params.toString()}`);
      const d = r.ok ? await r.json() : { references: [] };
      setReferences(d.references ?? []);
    } catch {
      setReferences([]);
    } finally {
      setLoading(false);
    }
  }, [favoriteRefIds]);

  useEffect(() => {
    fetchReferences();
  }, [fetchReferences]);

  // Refresh when a new reference is created (button "+")
  useEffect(() => {
    const handler = () => fetchReferences();
    window.addEventListener("mycelium:refresh", handler);
    return () => window.removeEventListener("mycelium:refresh", handler);
  }, [fetchReferences]);

  // Drop references that were unfavorited locally (keeps view in sync without a refetch)
  const stillFavorite = useMemo(
    () => references.filter((r) => isFavorite(r.id)),
    [references, isFavorite],
  );

  // Search + tag filtering on the favorited set
  const allTags = useMemo(
    () => Array.from(new Set(stillFavorite.flatMap((r) => r.tags))).sort(),
    [stillFavorite],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return stillFavorite.filter((r) => {
      if (activeTags.size > 0 && !r.tags.some((t) => activeTags.has(t))) {
        return false;
      }
      if (q) {
        const hay = `${r.title} ${r.description ?? ""} ${r.tags.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [stillFavorite, search, activeTags]);

  const onTagToggle = (tag: string) => {
    setActiveTags((prev) => {
      if (tag === "__all__") return new Set();
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  const hasAnyFavorites = items.some((i) => i.type === "reference");

  return (
    <AssetPageShell
      slug="favoritos"
      title="Favoritos"
      searchPlaceholder="Buscar nos favoritos..."
      search={search}
      onSearchChange={setSearch}
      tags={allTags}
      activeTags={activeTags}
      onTagToggle={onTagToggle}
    >
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <p className="text-sm text-white/40">Carregando...</p>
        </div>
      ) : !hasAnyFavorites || filtered.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <p className="text-sm text-white/40">
            {hasAnyFavorites
              ? "Nenhum favorito corresponde aos filtros."
              : "Você ainda não favoritou nenhuma referência."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((ref) => {
            const firstImage = ref.attachments?.find((a) => a.kind === "image");
            const thumbnail =
              previewUrl(ref.cover_path) ??
              previewUrl(
                firstImage?.preview_path ?? firstImage?.storage_path ?? null,
              ) ??
              "";
            const typeLabel =
              MYCELIUM_TYPES.find((t) => t.value === ref.type)?.label ?? ref.type;
            return (
              <MyceliumCard
                key={ref.id}
                reference={ref}
                onClick={() => setSelected(ref)}
                isFavorite={isFavorite(ref.id)}
                onToggleFavorite={() =>
                  toggleFavorite({
                    id: ref.id,
                    type: "reference",
                    title: ref.title,
                    subtitle: typeLabel,
                    thumbnail,
                  })
                }
              />
            );
          })}
        </div>
      )}

      {selected && (
        <MyceliumLightbox
          reference={selected}
          onClose={() => setSelected(null)}
          onDelete={() => {
            const id = selected.id;
            setSelected(null);
            setReferences((prev) => prev.filter((r) => r.id !== id));
          }}
        />
      )}
    </AssetPageShell>
  );
}
