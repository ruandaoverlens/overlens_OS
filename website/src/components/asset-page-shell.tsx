"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useMounted } from "@/lib/use-mounted";
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
import { Button } from "@/components/ui/button";
import { SmSearchLineIcon } from "@/components/icons";
import { useAuth, canUpload } from "@/lib/auth";
import { AssetUploadModal } from "@/components/asset-upload-modal";
import { getUploadConfig } from "@/lib/upload-configs";
import { getGradient } from "@/lib/brand-gradients";
import { useUrlState } from "@/lib/use-url-state";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { useSlashFocus } from "@/lib/use-slash-focus";

// ─── Lightbox item na URL (?item=) ──────────────────────────────

/**
 * Item aberto em lightbox, sincronizado com `?item=<id>`.
 *
 * Abrir empilha uma entrada no histórico (`pushState`) para que o Back do
 * navegador feche o lightbox. Fechar pela UI (X, Esc, clique fora) precisa
 * **desempilhar** essa entrada com `history.back()` — fechar com `replaceState`
 * deixaria entradas mortas no histórico e o Back passaria a exigir um toque
 * por item já aberto sem mudar nada na tela.
 *
 * ```tsx
 * const [selectedId, openItem, closeItem, setItem] = useLightboxItem();
 * <Card onClick={() => openItem(asset.id)} />
 * {selected && <Lightbox onClose={closeItem} />}
 * ```
 *
 * `setItem` é a escrita crua (replace) — use para limpar uma chave inválida.
 */
export function useLightboxItem(key: string = "item") {
  const [selectedId, setSelectedId] = useUrlState<string | null>(key, null);
  // Verdadeiro enquanto a entrada atual do histórico foi empilhada por nós.
  const pushedRef = useRef(false);

  const openItem = useCallback(
    (id: string) => {
      setSelectedId(id, { history: "push" });
      pushedRef.current = true;
    },
    [setSelectedId],
  );

  const closeItem = useCallback(() => {
    if (pushedRef.current) {
      pushedRef.current = false;
      window.history.back();
      return;
    }
    // Chegou direto por link compartilhado: não há entrada nossa para desfazer.
    setSelectedId(null);
  }, [setSelectedId]);

  // Fechou pelo Back do navegador: a entrada empilhada já saiu.
  useEffect(() => {
    if (!selectedId) pushedRef.current = false;
  }, [selectedId]);

  return [selectedId, openItem, closeItem, setSelectedId] as const;
}

// ─── URL-backed filters (q, tags, view) ─────────────────────────

/**
 * Busca e tags sincronizadas com a query string (`?q=...&tags=a,b&view=hidden`).
 * Compartilhado entre o shell e os bancos para que a URL seja a fonte da verdade.
 *
 * A busca usa estado local (digitação fluida) → debounce 250ms → URL. Quando a
 * URL muda por fora (voltar/avançar, limpar filtros), o input é sincronizado.
 */
export function useAssetFilters() {
  const [q, setQ] = useUrlState<string>("q", "");
  const [tagsRaw, setTagsRaw] = useUrlState<string>("tags", "");
  const [view, setView] = useUrlState<string>("view", "");

  const [search, setSearch] = useState(q);
  const [prevQ, setPrevQ] = useState(q);
  if (q !== prevQ) {
    // URL mudou externamente: sincroniza o input no render.
    setPrevQ(q);
    setSearch(q);
  }
  const debouncedSearch = useDebouncedValue(search, 250);
  useEffect(() => {
    if (search !== debouncedSearch) return; // ainda digitando
    if (debouncedSearch !== q) setQ(debouncedSearch);
  }, [search, debouncedSearch, q, setQ]);

  const activeTags = useMemo(
    () => new Set(tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)),
    [tagsRaw]
  );

  const toggleTag = useCallback(
    (tag: string) => {
      if (tag === "__all__") {
        setTagsRaw("");
        return;
      }
      const next = new Set(activeTags);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      setTagsRaw(Array.from(next).join(","));
    },
    [activeTags, setTagsRaw]
  );

  const clearFilters = useCallback(() => {
    setSearch("");
    setQ("");
    setTagsRaw("");
  }, [setQ, setTagsRaw]);

  const showHidden = view === "hidden";
  const setShowHidden = useCallback(
    (next: boolean) => setView(next ? "hidden" : ""),
    [setView]
  );

  const hasFilters = q.trim().length > 0 || activeTags.size > 0;

  return {
    /** Valor do input (local, sem debounce). */
    search,
    setSearch,
    /** Valor efetivo na URL (debounced) — use este para filtrar. */
    q,
    activeTags,
    toggleTag,
    clearFilters,
    hasFilters,
    showHidden,
    setShowHidden,
  };
}

// ─── Tag Filter ─────────────────────────────────────────────────

const TAG_BASE = "px-3 py-1 rounded-full text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-foreground";
const TAG_ACTIVE = "bg-primary text-primary-foreground";
const TAG_INACTIVE = "bg-surface-900 text-surface-400 hover:text-surface-200";

function TagFilter({
  tags,
  active,
  onToggle,
}: {
  tags: string[];
  active: Set<string>;
  onToggle: (tag: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || expanded) return;
    setIsOverflowing(el.scrollHeight > el.clientHeight);
  }, [tags, expanded]);

  if (tags.length === 0) return null;

  return (
    <div
      ref={containerRef}
      role="group"
      aria-label="Filtrar por tag"
      className={`relative flex flex-wrap gap-1.5 overflow-hidden ${
        expanded ? "" : "max-h-[100px] sm:max-h-[68px]"
      }`}
    >
      <button
        type="button"
        aria-pressed={active.size === 0}
        onClick={() => onToggle("__all__")}
        className={`${TAG_BASE} ${active.size === 0 ? TAG_ACTIVE : TAG_INACTIVE}`}
      >
        Todos
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          type="button"
          aria-pressed={active.has(tag)}
          onClick={() => onToggle(tag)}
          className={`${TAG_BASE} ${active.has(tag) ? TAG_ACTIVE : TAG_INACTIVE}`}
        >
          {tag}
        </button>
      ))}
      {!expanded && isOverflowing && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className={`${TAG_BASE} text-surface-300 hover:text-foreground`}
        >
          Ver todos
        </button>
      )}
    </div>
  );
}

// ─── Shell Component ────────────────────────────────────────────

export function AssetPageShell({
  slug,
  title,
  searchPlaceholder = "Buscar ativos…",
  tags = [],
  activeTags,
  onTagToggle,
  search,
  onSearchChange,
  count,
  headerSlot,
  headerActions,
  countLabel = "ativos",
  contentClassName,
  gradient,
  children,
}: {
  slug?: string;
  title: string;
  searchPlaceholder?: string;
  tags?: string[];
  activeTags?: Set<string>;
  onTagToggle?: (tag: string) => void;
  search?: string;
  /** Quando ausente, o campo de busca não é renderizado. */
  onSearchChange?: (value: string) => void;
  count?: number;
  countLabel?: string;
  contentClassName?: string;
  gradient?: string;
  headerSlot?: React.ReactNode;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  // Fallback local (sem URL) para consumidores que não controlam as tags.
  // Quem quiser persistir na query string usa `useAssetFilters` e passa as props.
  const [internalTags, setInternalTags] = useState<Set<string>>(new Set());
  const [uploadOpen, setUploadOpen] = useState(false);
  const mounted = useMounted();

  const currentActiveTags = activeTags ?? internalTags;
  const currentOnTagToggle =
    onTagToggle ??
    ((tag: string) => {
      setInternalTags((prev) => {
        if (tag === "__all__") return new Set();
        const next = new Set(prev);
        if (next.has(tag)) next.delete(tag);
        else next.add(tag);
        return next;
      });
    });

  const showUpload = mounted && user && canUpload(user.role);
  const uploadConfig = slug ? getUploadConfig(slug) : undefined;
  const showSearch = typeof onSearchChange === "function";
  const searchRef = useRef<HTMLInputElement>(null);

  // Atalho "/" foca a busca (ignorado quando já se está digitando).
  useSlashFocus(searchRef, showSearch);

  return (
    <div className="flex flex-col h-full">
      {/* Banner */}
      <Banner size="sm">
        <BannerImage gradient={gradient ?? getGradient(title)} />
        <BannerContent>
          <BannerTitle>{title}</BannerTitle>
        </BannerContent>
      </Banner>

      {/* Header slot (e.g. admin tabs) */}
      {headerSlot}

      {/* Search + Upload */}
      {(showSearch || (showUpload && uploadConfig) || headerActions) && (
        <div className="container-content flex items-center gap-2 pt-4 pb-3 min-w-0">
          {showSearch && (
            <InputGroup size="sm" className="flex-1 min-w-0 rounded-full">
              <InputGroupAddon align="inline-start">
                <InputGroupText>
                  <SmSearchLineIcon />
                </InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                ref={searchRef}
                type="search"
                aria-label={searchPlaceholder}
                aria-keyshortcuts="/"
                placeholder={searchPlaceholder}
                value={search ?? ""}
                onChange={(e) => onSearchChange?.(e.target.value)}
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
          )}
          {showUpload && uploadConfig && (
            <Button
              type="button"
              variant="default"
              size="sm"
              className="shrink-0 ml-auto"
              onClick={() => setUploadOpen(true)}
            >
              <span>Upload</span>
            </Button>
          )}
          {headerActions}
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="container-content pb-2">
          <TagFilter
            tags={tags}
            active={currentActiveTags}
            onToggle={currentOnTagToggle}
          />
        </div>
      )}

      {/* Count */}
      {count !== undefined && (
        <div className="container-content pb-2">
          <span className="text-xs text-muted-foreground" aria-live="polite">
            {count} {countLabel}
          </span>
        </div>
      )}

      {/* Content */}
      <div className={contentClassName ?? "container-content flex-1 overflow-y-auto pt-2"}>
        {children}
        <div className="h-[200px] w-full shrink-0" aria-hidden="true" />
      </div>

      {/* Upload Modal */}
      {uploadConfig && (
        <AssetUploadModal
          config={uploadConfig}
          open={uploadOpen}
          onOpenChange={setUploadOpen}
        />
      )}
    </div>
  );
}
