"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AssetPageShell } from "@/components/asset-page-shell";
import { MyceliumCard } from "./mycelium-card";
import { MyceliumLightbox } from "./mycelium-lightbox";
import { MyceliumCreateButton } from "./mycelium-create-button";
import { useFavorites } from "@/lib/favorites";
import type { MyceliumCategory } from "@/lib/mycelium";
import { MYCELIUM_TYPES, type MyceliumReference } from "@/lib/mycelium-types";

const SUPABASE_URL = "https://lqymftfphjexutgtvjuh.supabase.co";

function previewUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/mycelium-previews/${path
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

export function MyceliumListPage({ category }: { category: MyceliumCategory }) {
  const [references, setReferences] = useState<MyceliumReference[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<MyceliumReference | null>(null);
  const { isFavorite, toggleFavorite } = useFavorites();

  const fetchReferences = useCallback(async () => {
    if (!category.type) return;
    setLoading(true);
    const params = new URLSearchParams({ type: category.type });
    if (search.trim()) params.set("q", search.trim());
    try {
      const r = await fetch(`/api/mycelium/list?${params.toString()}`);
      const d = r.ok ? await r.json() : { references: [] };
      setReferences(d.references ?? []);
    } catch {
      setReferences([]);
    } finally {
      setLoading(false);
    }
  }, [category.type, search]);

  // Fetch on mount and when type/search changes
  useEffect(() => {
    fetchReferences();
  }, [fetchReferences]);

  // Refresh when "+" creates a new reference
  useEffect(() => {
    const handler = () => fetchReferences();
    window.addEventListener("mycelium:refresh", handler);
    return () => window.removeEventListener("mycelium:refresh", handler);
  }, [fetchReferences]);

  // Unique tags across loaded references
  const allTags = useMemo(
    () => Array.from(new Set(references.flatMap((r) => r.tags))).sort(),
    [references],
  );

  // Tag filter (client-side over the fetched set)
  const filtered = useMemo(() => {
    if (activeTags.size === 0) return references;
    return references.filter((r) => r.tags.some((t) => activeTags.has(t)));
  }, [references, activeTags]);

  const onTagToggle = (tag: string) => {
    setActiveTags((prev) => {
      if (tag === "__all__") return new Set();
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  const typeLabel =
    MYCELIUM_TYPES.find((t) => t.value === category.type)?.label ??
    category.type ??
    "";

  return (
    <AssetPageShell
      slug={category.slug}
      title={category.title}
      searchPlaceholder={`Buscar em ${category.title.toLowerCase()}...`}
      search={search}
      onSearchChange={setSearch}
      tags={allTags}
      activeTags={activeTags}
      onTagToggle={onTagToggle}
      headerActions={<MyceliumCreateButton className="shrink-0" />}
    >
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <p className="text-sm text-white/40">Carregando...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <p className="text-sm text-white/40">{category.emptyMessage}</p>
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
