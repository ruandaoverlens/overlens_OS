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
import { MYCELIUM_TYPES, type MyceliumReference } from "@/lib/mycelium-types";

const SUPABASE_URL = "https://lqymftfphjexutgtvjuh.supabase.co";

function previewUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/mycelium-previews/${path
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

const LOAD_ERROR = "Não foi possível carregar os favoritos";
const GRID = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3";

function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === "AbortError";
}

function parseTags(raw: string): Set<string> {
  return new Set(raw.split(",").map((t) => t.trim()).filter(Boolean));
}

export function MyceliumFavoritesPage() {
  const { items, isFavorite, toggleFavorite } = useFavorites();

  // A URL é a fonte de verdade dos filtros (?q=&tags=a,b). Aqui a filtragem é
  // local (sobre o conjunto de favoritos já carregado).
  const [q, setQ] = useUrlState<string>("q", "");
  const [tagsParam, setTagsParam] = useUrlState<string>("tags", "");
  const activeTags = useMemo(() => parseTags(tagsParam), [tagsParam]);

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
  // Termo normalizado (sem acento/caixa) — a filtragem aqui já é local.
  const query = normalizeText(q);

  const [references, setReferences] = useState<MyceliumReference[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  // Item aberto no lightbox vive na URL (?item=) para ser compartilhável.
  // O hook cuida do histórico: abrir empilha, fechar desempilha.
  const [selectedId, openItem, closeItem] = useLightboxItem();

  const retry = useCallback(() => setRefreshKey((k) => k + 1), []);

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

  // Fetch the favorited references (previous request aborted on change).
  useEffect(() => {
    if (!favoriteRefIds) {
      setReferences([]);
      setLoading(false);
      setHasLoaded(true);
      return;
    }
    const controller = new AbortController();
    // Sem `limit` explícito a API devolve o default (30) e quem tem mais
    // favoritos que isso só veria os primeiros.
    const params = new URLSearchParams({ ids: favoriteRefIds, limit: "200" });

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
  }, [favoriteRefIds, refreshKey, retry]);

  // Refresh when a new reference is created (button "+")
  useEffect(() => {
    window.addEventListener("mycelium:refresh", retry);
    return () => window.removeEventListener("mycelium:refresh", retry);
  }, [retry]);

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
    return stillFavorite.filter((r) => {
      if (activeTags.size > 0 && !r.tags.some((t) => activeTags.has(t))) {
        return false;
      }
      if (query) {
        const hit =
          matchesNormalized(r.title, query) ||
          matchesNormalized(r.description ?? "", query) ||
          r.tags.some((t) => matchesNormalized(t, query));
        if (!hit) return false;
      }
      return true;
    });
  }, [stillFavorite, query, activeTags]);

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

  const clearFilters = useCallback(() => {
    setTagsParam("");
    setSearch("");
  }, [setTagsParam]);

  const hasAnyFavorites = items.some((i) => i.type === "reference");

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
    if (!hasAnyFavorites || stillFavorite.length === 0) {
      return (
        <EmptyState
          title="Nenhum favorito ainda"
          description="Marque referências com a estrela para encontrá-las aqui."
          action={<MyceliumCreateButton />}
          className="py-16"
        />
      );
    }
    if (filtered.length === 0) {
      return (
        <EmptyState
          variant="filtered"
          title="Nenhum favorito corresponde aos filtros"
          description="Tente outra busca ou limpe os filtros."
          onClear={clearFilters}
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
          const typeLabel =
            MYCELIUM_TYPES.find((t) => t.value === ref.type)?.label ?? ref.type;
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
      slug="favoritos"
      title="Favoritos"
      searchPlaceholder="Buscar nos favoritos…"
      search={search}
      onSearchChange={setSearch}
      tags={allTags}
      activeTags={activeTags}
      onTagToggle={onTagToggle}
      count={hasLoaded && !loadError ? filtered.length : undefined}
      countLabel={filtered.length === 1 ? "favorito" : "favoritos"}
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
