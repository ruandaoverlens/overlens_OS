"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
import { EmptyState } from "@/components/empty-state";
import { MediaCardGridSkeleton } from "@/components/skeletons";
import { MyceliumCard } from "@/components/mycelium-card";
import { MyceliumLightbox } from "@/components/mycelium-lightbox";
import { MyceliumCreateButton } from "@/components/mycelium-create-button";
import { useLightboxItem } from "@/components/asset-page-shell";
import { useFavorites } from "@/lib/favorites";
import { useInfiniteScroll } from "@/lib/use-infinite-scroll";
import { useUrlState } from "@/lib/use-url-state";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { useSlashFocus } from "@/lib/use-slash-focus";
import { getGradient } from "@/lib/brand-gradients";
import { normalizeText, matchesNormalized } from "@/lib/normalize-text";
import { notify } from "@/lib/notifications";
import { cn } from "@/lib/utils";
import {
  MYCELIUM_TYPES,
  type MyceliumReference,
  type MyceliumType,
} from "@/lib/mycelium-types";

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

/** Teto aceito pela API de listagem; acima disso a busca local satura. */
const FEED_LIMIT = 200;

const LOAD_ERROR = "Não foi possível carregar as referências";
const GRID = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3";

function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === "AbortError";
}

function isMyceliumType(value: string | null): value is MyceliumType {
  return MYCELIUM_TYPES.some((t) => t.value === value);
}

const CHIP_BASE =
  "px-3 py-1 rounded-full text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background";
// Chip selecionado: o inverso do fundo (branco no escuro, preto no claro).
const CHIP_ACTIVE = "bg-foreground text-background";
const CHIP_INACTIVE = "bg-surface-900 text-surface-400 hover:text-surface-200";

// ─── Page ────────────────────────────────────────────────────

export function MyceliumFeedPage() {
  // A URL é a fonte de verdade dos filtros (?q=&type=).
  const [q, setQ] = useUrlState<string>("q", "");
  const [typeParam, setTypeParam] = useUrlState<string | null>("type", null);
  const activeType: MyceliumType | null = isMyceliumType(typeParam) ? typeParam : null;

  // Busca: input local (digitação fluida) → debounce 250ms → URL → fetch.
  const [search, setSearch] = useState(q);
  const [prevQ, setPrevQ] = useState(q);
  if (q !== prevQ) {
    // URL mudou (voltar/avançar ou limpar filtros): sincroniza o input no render.
    setPrevQ(q);
    setSearch(q);
  }
  const debouncedSearch = useDebouncedValue(search, 250);
  useEffect(() => {
    if (search !== debouncedSearch) return; // ainda digitando
    if (debouncedSearch !== q) setQ(debouncedSearch);
  }, [search, debouncedSearch, q, setQ]);
  const query = q.trim();
  const searchRef = useRef<HTMLInputElement>(null);
  useSlashFocus(searchRef);

  const [references, setReferences] = useState<FeedReference[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  // Item aberto no lightbox vive na URL (?item=) para ser compartilhável.
  // O hook cuida do histórico: abrir empilha, fechar desempilha (sem entradas mortas).
  const [selectedId, openItem, closeItem] = useLightboxItem();
  const { isFavorite, toggleFavorite } = useFavorites();

  const retry = useCallback(() => setRefreshKey((k) => k + 1), []);

  // Fetch on mount and when filter/search/refresh changes. The previous request
  // is aborted so a slow response never overwrites a newer one.
  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();
    if (activeType) params.set("type", activeType);
    // A busca NÃO vai para a API: o `ilike` do Postgres ignora caixa mas não
    // acento ("video" não acharia "Vídeo"). Carregamos o lote e filtramos aqui
    // com `matchesNormalized`. Trade-off: a busca cobre o lote carregado (200).
    params.set("limit", String(FEED_LIMIT));

    setLoading(true);
    setLoadError(null);

    (async () => {
      try {
        const r = await fetch(`/api/mycelium/list?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!r.ok) throw new Error(`Erro ${r.status}`);
        const d: { references?: FeedReference[] } = await r.json();
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
  }, [activeType, refreshKey, retry]);

  // Refresh when a new reference is created elsewhere (button "+").
  useEffect(() => {
    window.addEventListener("mycelium:refresh", retry);
    return () => window.removeEventListener("mycelium:refresh", retry);
  }, [retry]);

  // Busca local, insensível a acento e caixa.
  const filtered = useMemo(() => {
    const needle = normalizeText(query);
    if (!needle) return references;
    return references.filter(
      (r) =>
        matchesNormalized(r.title, needle) ||
        matchesNormalized(r.description ?? "", needle) ||
        r.tags.some((t) => matchesNormalized(t, needle)),
    );
  }, [references, query]);

  // Client-side pagination over the already-fetched list.
  const { visibleItems, hasMore, setSentinel } = useInfiniteScroll(filtered, 24);

  const hasFilters = Boolean(query) || activeType !== null;
  const clearFilters = useCallback(() => {
    // O tipo sai da URL agora; a busca sai pelo debounce (evita duas escritas
    // concorrentes na mesma query string).
    setTypeParam(null);
    setSearch("");
  }, [setTypeParam]);

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

  const selected = useMemo(
    () => (selectedId ? references.find((r) => r.id === selectedId) ?? null : null),
    [references, selectedId],
  );

  // `?item=` aponta para algo que não está na lista carregada: limpa a URL
  // pelo mesmo caminho do fechamento (desempilha se a entrada for nossa).
  useEffect(() => {
    if (hasLoaded && !loading && selectedId && !selected) closeItem();
  }, [hasLoaded, loading, selectedId, selected, closeItem]);

  const handleDeleted = () => {
    const deletedId = selectedId;
    closeItem();
    if (deletedId) {
      setReferences((prev) => prev.filter((r) => r.id !== deletedId));
    }
  };

  const bannerGradient = useMemo(() => getGradient("Mycelium"), []);

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
          description="Adicione a primeira referência ao Mycelium."
          action={<MyceliumCreateButton />}
          className="py-16"
        />
      );
    }
    return (
      <>
        <div
          aria-busy={loading || undefined}
          className={cn(GRID, "transition-opacity", loading && "opacity-60")}
        >
          {visibleItems.map((reference) => (
            <MyceliumCard
              key={reference.id}
              reference={reference}
              onClick={() => openItem(reference.id)}
              isFavorite={isFavorite(reference.id)}
              onToggleFavorite={() => handleToggleFavorite(reference)}
            />
          ))}
        </div>
        {hasMore && <div ref={setSentinel} className="h-8" aria-hidden="true" />}
      </>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Banner */}
      <Banner size="sm">
        <BannerImage gradient={bannerGradient} />
        <BannerContent>
          <BannerTitle>Mycelium</BannerTitle>
        </BannerContent>
      </Banner>

      {/* Search + Adicionar */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-3 max-w-(--container-max-width) mx-auto w-full min-w-0">
        <InputGroup size="sm" className="flex-1 min-w-0 rounded-full">
          <InputGroupAddon align="inline-start">
            <InputGroupText>
              <SmSearchLineIcon />
            </InputGroupText>
          </InputGroupAddon>
          <InputGroupInput
            ref={searchRef}
            type="search"
            aria-label="Buscar no Mycelium"
            aria-keyshortcuts="/"
            placeholder="Buscar no Mycelium…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <InputGroupAddon align="inline-end" className="hidden sm:flex">
            <kbd
              aria-hidden="true"
              className="rounded border border-border/60 bg-surface-900 px-1.5 text-caption font-mono text-muted-foreground"
            >
              /
            </kbd>
          </InputGroupAddon>
        </InputGroup>
        <MyceliumCreateButton className="shrink-0" />
      </div>

      {/* Type filters */}
      <div className="px-4 pb-2 max-w-(--container-max-width) mx-auto w-full">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por tipo">
          <button
            type="button"
            onClick={() => setTypeParam(null)}
            aria-pressed={activeType === null}
            className={cn(CHIP_BASE, activeType === null ? CHIP_ACTIVE : CHIP_INACTIVE)}
          >
            Todos
          </button>
          {MYCELIUM_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTypeParam(t.value)}
              aria-pressed={activeType === t.value}
              className={cn(CHIP_BASE, activeType === t.value ? CHIP_ACTIVE : CHIP_INACTIVE)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contador de resultados */}
      {hasLoaded && !loadError && (
        <div className="px-4 pb-2 max-w-(--container-max-width) mx-auto w-full">
          <span className="text-xs text-muted-foreground" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? "referência" : "referências"}
            {references.length >= FEED_LIMIT && (
              // O lote satura: dizer isso é melhor do que devolver "nenhum
              // resultado" para algo que existe fora das mais recentes.
              <span className="ml-1">
                · busca limitada às {FEED_LIMIT} mais recentes
              </span>
            )}
          </span>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pt-2 max-w-(--container-max-width) mx-auto w-full">
        {renderContent()}
        <div className="h-[200px] w-full shrink-0" aria-hidden="true" />
      </div>

      {selected && (
        <MyceliumLightbox
          reference={selected}
          onClose={closeItem}
          onDelete={handleDeleted}
        />
      )}
    </div>
  );
}
