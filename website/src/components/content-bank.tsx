"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  SmArrowOutwardLineIcon,
  SmDownloadLineIcon,
  SmInvoiceLineIcon,
  SmDocLineIcon,
  SmCognitionLineIcon,
  SmLink2LineIcon,
} from "@/components/icons";
import { EmptyState } from "@/components/empty-state";
import { MediaCardGridSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { headingTitleVariants } from "@/components/ui/heading";
import { cn } from "@/lib/utils";
import { AssetUploadModal } from "@/components/asset-upload-modal";
import { getUploadConfig } from "@/lib/upload-configs";
import { useAuth, canUpload } from "@/lib/auth";
import { notify } from "@/lib/notifications";
import { normalizeText, matchesNormalized } from "@/lib/normalize-text";

const GRID_CLASS = "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 px-4 pb-4";
const GRID_SIZES = "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw";

// ─── Types ─────────────────────────────────────────────────────

interface ContentItem {
  kind: "file" | "link";
  storagePath: string;
  assetType: string;
  metadata: Record<string, unknown>;
  uploadedAt: string;
}

interface ContentBankProps {
  /** Asset slug — e.g. "templates-e-layouts" */
  slug: string;
  /** Search query (filters by title/tags) */
  search?: string;
  /** Há busca digitada ainda não aplicada (debounce). Atenua a grade e marca `aria-busy`. */
  searching?: boolean;
  /** Optional active tag filter */
  activeTags?: Set<string>;
  /** Fallback empty message */
  emptyTitle?: string;
  emptyDescription?: string;
  /** Limpa busca/tags (usado no estado "sem resultados"). */
  onClearFilters?: () => void;
  /** Reporta a quantidade de itens visíveis (após busca/tags). */
  onCountChange?: (visible: number) => void;
}

// ─── Helpers ───────────────────────────────────────────────────

const SLUG_ICON: Record<string, React.ReactNode> = {
  "templates-e-layouts": <SmInvoiceLineIcon className="size-8 text-muted-foreground" />,
  "documentacao": <SmDocLineIcon className="size-8 text-muted-foreground" />,
  "objetos-3d": <SmCognitionLineIcon className="size-8 text-muted-foreground" />,
};

function getMetaString(meta: Record<string, unknown>, key: string): string {
  const v = meta[key];
  return typeof v === "string" ? v : "";
}

function getMetaArray(meta: Record<string, unknown>, key: string): string[] {
  const v = meta[key];
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

function getDisplayTitle(item: ContentItem): string {
  const meta = item.metadata;
  const titulo = getMetaString(meta, "titulo");
  if (titulo) return titulo;
  // Fallback: last segment of storage path
  const tail = item.storagePath.split("/").pop() ?? "Sem título";
  return tail.replace(/\.[^.]+$/, "");
}

function getToolLabel(meta: Record<string, unknown>): string {
  const tool = getMetaString(meta, "ferramenta");
  const map: Record<string, string> = {
    "figma": "Figma",
    "adobe-illustrator": "Illustrator",
    "adobe-photoshop": "Photoshop",
    "sketch": "Sketch",
    "adobe-xd": "Adobe XD",
    "canva": "Canva",
  };
  return tool ? (map[tool] ?? tool) : "";
}

function getTypeLabel(meta: Record<string, unknown>): string {
  const tipo = getMetaString(meta, "tipo");
  const map: Record<string, string> = {
    "template": "Template",
    "layout": "Layout",
    "mockup": "Mockup",
    "wireframe": "Wireframe",
    "apresentacao": "Apresentação",
    "guia": "Guia",
    "manual": "Manual",
    "referencia": "Referência",
    "planilha": "Planilha",
    "relatorio": "Relatório",
  };
  return tipo ? (map[tipo] ?? tipo) : "";
}

// ─── Card ──────────────────────────────────────────────────────

function ContentCard({
  item,
  slug,
}: {
  item: ContentItem;
  slug: string;
}) {
  const title = getDisplayTitle(item);
  const isLink = item.kind === "link";
  const url = isLink ? getMetaString(item.metadata, "url") : null;
  const thumbnailUrl = getMetaString(item.metadata, "thumbnailUrl");
  const tool = getToolLabel(item.metadata);
  const typeLabel = getTypeLabel(item.metadata);

  const handleClick = () => {
    if (isLink && url) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      // File: trigger download via API
      const a = document.createElement("a");
      a.href = `/api/assets/download?file=${encodeURIComponent(item.storagePath)}`;
      a.download = item.storagePath.split("/").pop() ?? "";
      a.click();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isLink ? `Abrir link: ${title}` : `Baixar ${title}`}
      className="group flex flex-col rounded-md overflow-hidden bg-surface-900 border border-border hover:border-foreground/25 transition-colors text-left outline-none focus-visible:ring-2 focus-visible:ring-foreground"
    >
      <div className="relative aspect-4/3 w-full bg-surface-950 flex items-center justify-center overflow-hidden">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={title}
            fill
            sizes={GRID_SIZES}
            unoptimized
            className="object-cover"
          />
        ) : (
          SLUG_ICON[slug] ?? <SmInvoiceLineIcon className="size-8 text-muted-foreground" />
        )}

        {/* Action badge — top-right */}
        {/* Selos sobre a miniatura: pílula escura literal, legível nos dois temas. */}
        <div className="absolute top-2 right-2 size-7 rounded-full bg-absolute-black/60 backdrop-blur-sm flex items-center justify-center text-absolute-white/80 group-hover:text-absolute-white transition-colors">
          {isLink ? (
            <SmArrowOutwardLineIcon className="size-4" />
          ) : (
            <SmDownloadLineIcon className="size-4" />
          )}
        </div>

        {/* Link badge — bottom-left */}
        {isLink && (
          <p className={cn(headingTitleVariants({ size: "eyebrow" }), "absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-absolute-black/60 text-absolute-white/85 backdrop-blur-sm flex items-center gap-1")}>
            <SmLink2LineIcon className="size-3" />
            <span>Link</span>
          </p>
        )}
      </div>

      <div className="flex flex-col gap-0.5 px-3 py-3">
        <p className="text-sm font-medium text-foreground truncate">{title}</p>
        <p className="text-xs text-muted-foreground truncate">
          {[typeLabel, tool].filter(Boolean).join(" · ") || "—"}
        </p>
      </div>
    </button>
  );
}

// ─── Main ──────────────────────────────────────────────────────

export function ContentBank({
  slug,
  search = "",
  searching = false,
  activeTags,
  emptyTitle = "Nada por aqui ainda",
  emptyDescription = "Faça upload de um arquivo ou cole um link para começar.",
  onClearFilters,
  onCountChange,
}: ContentBankProps) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const { user } = useAuth();
  const canSend = !!user && canUpload(user.role);
  const uploadConfig = getUploadConfig(slug);
  const [uploadOpen, setUploadOpen] = useState(false);

  const fetchItems = useCallback(async () => {
    abortRef.current?.abort();
    const abort = new AbortController();
    abortRef.current = abort;
    setLoading(true);
    try {
      const res = await fetch(`/api/assets/list-content?type=${encodeURIComponent(slug)}`, { signal: abort.signal });
      if (!res.ok) throw new Error(`fetch failed (${res.status})`);
      const { items } = await res.json() as { items: ContentItem[] };
      setItems(items ?? []);
      setLoadError(null);
    } catch (err) {
      // Desmontou ou refez o fetch: não atualiza estado.
      if ((err as Error)?.name === "AbortError") return;
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      console.error("[content-bank] fetch failed:", err);
      setItems([]);
      setLoadError(msg);
      notify.error("Falha ao carregar referências", {
        description: msg,
        action: {
          label: "Tentar novamente",
          onClick: () => void fetchItems(),
        },
      });
    } finally {
      if (!abort.signal.aborted) setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    void fetchItems();
    return () => abortRef.current?.abort();
  }, [fetchItems]);

  const filtered = useMemo(() => {
    // Busca insensível a acento: "apresentacao" encontra "Apresentação".
    const q = normalizeText(search);
    return items.filter((item) => {
      if (q) {
        const title = getDisplayTitle(item);
        const tags = getMetaArray(item.metadata, "tags");
        if (!matchesNormalized(title, q) && !tags.some((t) => matchesNormalized(t, q))) {
          return false;
        }
      }
      if (activeTags && activeTags.size > 0) {
        const tags = getMetaArray(item.metadata, "tags");
        if (!tags.some((t) => activeTags.has(t))) return false;
      }
      return true;
    });
  }, [items, search, activeTags]);

  useEffect(() => {
    onCountChange?.(filtered.length);
  }, [filtered.length, onCountChange]);

  const hasFilters = search.trim().length > 0 || (activeTags?.size ?? 0) > 0;
  const icon = SLUG_ICON[slug] ?? <SmInvoiceLineIcon className="size-6" />;

  const uploadModal = canSend && uploadConfig ? (
    <AssetUploadModal
      config={uploadConfig}
      open={uploadOpen}
      onOpenChange={setUploadOpen}
      onSubmit={() => void fetchItems()}
    />
  ) : null;

  if (loading) {
    return <MediaCardGridSkeleton count={8} className={GRID_CLASS} />;
  }

  // Ainda digitando: mantém a grade (atenuada) em vez de piscar um vazio.
  if (filtered.length === 0 && !searching) {
    if (loadError) {
      return (
        <div className="flex flex-1 items-center justify-center py-16">
          <EmptyState
            variant="error"
            icon={icon}
            title="Erro ao carregar"
            description={loadError}
            onRetry={() => void fetchItems()}
            className="border-none"
          />
        </div>
      );
    }
    if (hasFilters) {
      return (
        <div className="flex flex-1 items-center justify-center py-16">
          <EmptyState
            variant="filtered"
            icon={icon}
            title="Nenhum resultado"
            description="Nada corresponde à busca ou às tags selecionadas."
            onClear={onClearFilters}
            className="border-none"
          />
        </div>
      );
    }
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <EmptyState
          icon={icon}
          title={emptyTitle}
          description={canSend ? emptyDescription : "Ainda não há itens publicados nesta categoria."}
          action={
            canSend && uploadConfig ? (
              <Button type="button" variant="default" size="sm" onClick={() => setUploadOpen(true)}>
                Fazer upload
              </Button>
            ) : undefined
          }
          className="border-none"
        />
        {uploadModal}
      </div>
    );
  }

  return (
    <>
      <div
        aria-busy={searching || undefined}
        className={cn(GRID_CLASS, "transition-opacity", searching && "opacity-60")}
      >
        {filtered.map((item) => (
          <ContentCard key={item.storagePath} item={item} slug={slug} />
        ))}
      </div>
      {uploadModal}
    </>
  );
}
