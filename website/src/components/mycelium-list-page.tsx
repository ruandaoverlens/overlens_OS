"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AssetPageShell, useLightboxItem } from "@/components/asset-page-shell";
import { EmptyState } from "@/components/empty-state";
import { MediaCardGridSkeleton } from "@/components/skeletons";
import { MyceliumCard } from "./mycelium-card";
import { MyceliumLightbox } from "./mycelium-lightbox";
import { MyceliumCreateButton } from "./mycelium-create-button";
import { useFavorites } from "@/lib/favorites";
import { useUrlState } from "@/lib/use-url-state";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { notify } from "@/lib/notifications";
import { normalizeText, matchesNormalized } from "@/lib/normalize-text";
import { cn } from "@/lib/utils";
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

const LOAD_ERROR = "Não foi possível carregar as referências";
const GRID = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3";

function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === "AbortError";
}

function parseTags(raw: string): Set<string> {
  return new Set(raw.split(",").map((t) => t.trim()).filter(Boolean));
}

export function MyceliumListPage({ category }: { category: MyceliumCategory }) {
  // A URL é a fonte de verdade dos filtros (?q=&tags=a,b).
  const [q, setQ] = useUrlState<string>("q", "");
  const [tagsParam, setTagsParam] = useUrlState<string>("tags", "");
  const activeTags = useMemo(() => parseTags(tagsParam), [tagsParam]);

  // Busca: input local → debounce 250ms → URL → fetch.
  const [search, setSearch] = useState(q);
  const [prevQ, setPrevQ] = useState(q);
  if (q !== prevQ) {
    setPrevQ(q);
    setSearch(q);
  }
  const debouncedSearch = useDebouncedValue(search, 250);
  useEffect(() => {
    if (search !== debouncedSearch) return;
    if (debouncedSearch !== q) setQ(debouncedSearch);
  }, [search, debouncedSearch, q, setQ]);
  const query = q.trim();

  const [references, setReferences] = useState<MyceliumReference[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  // Item aberto no lightbox vive na URL (?item=) para ser compartilhável.
  // O hook cuida do histórico: abrir empilha, fechar desempilha.
  const [selectedId, openItem, closeItem] = useLightboxItem();
  const { isFavorite, toggleFavorite } = useFavorites();

  const retry = useCallback(() => setRefreshKey((k) => k + 1), []);

  // Fetch on mount and when type/search/refresh changes (previous request aborted).
  useEffect(() => {
    if (!category.type) return;
    const controller = new AbortController();
    // A busca NÃO vai para a API: o `ilike` do Postgres ignora caixa mas não
    // acento ("video" não acharia "Vídeo"). Filtramos o lote no cliente.
    const params = new URLSearchParams({ type: category.type, limit: "200" });

    setLoading(true);
    setLoadError(null);

    (async () => {
      try {
        const r = await fetch(`/api/mycelium/list?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!r.ok) throw new Error(`Erro ${r.status}`);
        const d: { references?: MyceliumReference[] } = await r.json();
        setReferences(d.references ?? []);
      } catch (err) {
        if (isAbortError(err)) return;
        const message = err instanceof Error ? err.message : "Erro desconhecido";
        setLoadError(message);
        notify.error(LOAD_ERROR, {
          description: message,
          action: { label: "Tentar novamente", onClick: retry },
        });
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          setHasLoaded(true);
        }
      }
    })();

    return () => controller.abort();
  }, [category.type, refreshKey, retry]);

  // Refresh when "+" creates a new reference
  useEffect(() => {
    window.addEventListener("mycelium:refresh", retry);
    return () => window.removeEventListener("mycelium:refresh", retry);
  }, [retry]);

  // Unique tags across loaded references
  const allTags = useMemo(
    () => Array.from(new Set(references.flatMap((r) => r.tags))).sort(),
    [references],
  );

  // Busca (sem acento/caixa) + tags, tudo no cliente sobre o lote carregado.
  const filtered = useMemo(() => {
    const needle = normalizeText(query);
    return references.filter((r) => {
      if (activeTags.size > 0 && !r.tags.some((t) => activeTags.has(t))) return false;
      if (!needle) return true;
      return (
        matchesNormalized(r.title, needle) ||
        matchesNormalized(r.description ?? "", needle) ||
        r.tags.some((t) => matchesNormalized(t, needle))
      );
    });
  }, [references, activeTags, query]);

  const onTagToggle = (tag: string) => {
    if (tag === "__all__") {
      setTagsParam("");
      return;
    }
    const next = new Set(activeTags);
    if (next.has(tag)) next.delete(tag);
    else next.add(tag);
    setTagsParam(Array.from(next).join(","));
  };

  const hasFilters = Boolean(query) || activeTags.size > 0;
  const clearFilters = useCallback(() => {
    // Tags saem da URL agora; a busca sai pelo debounce.
    setTagsParam("");
    setSearch("");
  }, [setTagsParam]);

  const typeLabel =
    MYCELIUM_TYPES.find((t) => t.value === category.type)?.label ??
    category.type ??
    "";

  const selected = useMemo(
    () => (selectedId ? references.find((r) => r.id === selectedId) ?? null : null),
    [references, selectedId],
  );

  // `?item=` aponta para algo que não está na lista carregada: limpa a URL.
  useEffect(() => {
    if (hasLoaded && !loading && selectedId && !selected) closeItem();
  }, [hasLoaded, loading, selectedId, selected, closeItem]);

  const renderContent = () => {
    if (!hasLoaded) {
      return <MediaCardGridSkeleton count={8} className={GRID} />;
    }
    if (loadError && references.length === 0) {
      return (
        <EmptyState
          variant="error"
          title={LOAD_ERROR}
          description={loadError}
          onRetry={retry}
          className="py-16"
        />
      );
    }
    if (filtered.length === 0) {
      return hasFilters ? (
        <EmptyState
          variant="filtered"
          title="Nenhuma referência encontrada"
          description="Tente outra busca ou limpe os filtros."
          onClear={clearFilters}
          className="py-16"
        />
      ) : (
        <EmptyState
          title="Nenhuma referência ainda"
          description={category.emptyMessage}
          action={<MyceliumCreateButton />}
          className="py-16"
        />
      );
    }
    return (
      <div
        aria-busy={loading || undefined}
        className={cn(GRID, "transition-opacity", loading && "opacity-60")}
      >
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
              onClick={() => openItem(ref.id)}
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
    );
  };

  return (
    <AssetPageShell
      slug={category.slug}
      title={category.title}
      searchPlaceholder={`Buscar em ${category.title.toLowerCase()}…`}
      search={search}
      onSearchChange={setSearch}
      tags={allTags}
      activeTags={activeTags}
      onTagToggle={onTagToggle}
      count={hasLoaded && !loadError ? filtered.length : undefined}
      countLabel={filtered.length === 1 ? "referência" : "referências"}
      headerActions={<MyceliumCreateButton className="shrink-0" />}
    >
      {renderContent()}

      {selected && (
        <MyceliumLightbox
          reference={selected}
          onClose={closeItem}
          onDelete={() => {
            const id = selected.id;
            closeItem();
            setReferences((prev) => prev.filter((r) => r.id !== id));
          }}
        />
      )}
    </AssetPageShell>
  );
}
