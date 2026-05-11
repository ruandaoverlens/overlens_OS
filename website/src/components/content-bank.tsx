"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  SmArrowOutwardLineIcon,
  SmDownloadLineIcon,
  SmInvoiceLineIcon,
  SmDocLineIcon,
  SmCognitionLineIcon,
  SmLink2LineIcon,
} from "@/components/icons";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";

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
  /** Optional active tag filter */
  activeTags?: Set<string>;
  /** Fallback empty message */
  emptyTitle?: string;
  emptyDescription?: string;
}

// ─── Helpers ───────────────────────────────────────────────────

const SLUG_ICON: Record<string, React.ReactNode> = {
  "templates-e-layouts": <SmInvoiceLineIcon className="size-8 text-white/40" />,
  "documentacao": <SmDocLineIcon className="size-8 text-white/40" />,
  "objetos-3d": <SmCognitionLineIcon className="size-8 text-white/40" />,
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
      className="group flex flex-col rounded-md overflow-hidden bg-[var(--surface-900)] border border-white/5 hover:border-white/15 transition-colors text-left"
    >
      <div className="relative aspect-[4/3] w-full bg-black/40 flex items-center justify-center overflow-hidden">
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          SLUG_ICON[slug] ?? <SmInvoiceLineIcon className="size-8 text-white/40" />
        )}

        {/* Action badge — top-right */}
        <div className="absolute top-2 right-2 size-7 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/80 group-hover:text-white transition-colors">
          {isLink ? (
            <SmArrowOutwardLineIcon className="size-4" />
          ) : (
            <SmDownloadLineIcon className="size-4" />
          )}
        </div>

        {/* Link badge — bottom-left */}
        {isLink && (
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-[10px] uppercase tracking-wider text-white/80 flex items-center gap-1">
            <SmLink2LineIcon className="size-3" />
            <span>Link</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-0.5 px-3 py-3">
        <p className="text-sm font-medium text-white/90 truncate">{title}</p>
        <p className="text-xs text-white/40 truncate">
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
  activeTags,
  emptyTitle = "Nada por aqui ainda",
  emptyDescription = "Faça upload de um arquivo ou cole um link para começar.",
}: ContentBankProps) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/assets/list-content?type=${encodeURIComponent(slug)}`);
      if (!res.ok) throw new Error("fetch failed");
      const { items } = await res.json() as { items: ContentItem[] };
      setItems(items ?? []);
    } catch (err) {
      console.error("[content-bank] fetch failed:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      if (q) {
        const title = getDisplayTitle(item).toLowerCase();
        const tags = getMetaArray(item.metadata, "tags").map((t) => t.toLowerCase());
        if (!title.includes(q) && !tags.some((t) => t.includes(q))) {
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

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 px-4 pb-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[4/3] rounded-md bg-[var(--surface-900)] animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <Empty className="border-none">
          <EmptyHeader>
            <EmptyMedia contained>
              {SLUG_ICON[slug] ?? <SmInvoiceLineIcon className="size-6" />}
            </EmptyMedia>
            <EmptyTitle>{emptyTitle}</EmptyTitle>
            <EmptyDescription>{emptyDescription}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 px-4 pb-4">
      {filtered.map((item) => (
        <ContentCard key={item.storagePath} item={item} slug={slug} />
      ))}
    </div>
  );
}
