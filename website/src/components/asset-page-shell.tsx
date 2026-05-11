"use client";

import { useState, useRef, useEffect } from "react";
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

// ─── Gradient palette ───────────────────────────────────────────

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

// ─── Tag Filter ─────────────────────────────────────────────────

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
      className={`relative flex flex-wrap gap-1.5 overflow-hidden ${
        expanded ? "" : "max-h-[100px] sm:max-h-[68px]"
      }`}
    >
      <button
        onClick={() => onToggle("__all__")}
        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
          active.size === 0
            ? "bg-white text-black"
            : "bg-[var(--surface-900)] text-[var(--surface-400)] hover:text-[var(--surface-200)]"
        }`}
      >
        Todos
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => onToggle(tag)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            active.has(tag)
              ? "bg-white text-black"
              : "bg-[var(--surface-900)] text-[var(--surface-400)] hover:text-[var(--surface-200)]"
          }`}
        >
          {tag}
        </button>
      ))}
      {!expanded && isOverflowing && (
        <button
          onClick={() => setExpanded(true)}
          className="px-3 py-1 rounded-full text-xs font-medium text-[var(--surface-300)] hover:text-white transition-colors"
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
  searchPlaceholder = "Buscar ativos...",
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
  const [internalSearch, setInternalSearch] = useState("");
  const [internalTags, setInternalTags] = useState<Set<string>>(new Set());
  const [uploadOpen, setUploadOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const currentSearch = search ?? internalSearch;
  const currentOnSearch = onSearchChange ?? setInternalSearch;
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
      <div className="flex items-center gap-2 px-4 pt-4 pb-3 max-w-[1920px] mx-auto w-full min-w-0">
        <InputGroup size="sm" className="flex-1 min-w-0 rounded-full">
          <InputGroupAddon align="inline-start">
            <InputGroupText>
              <SmSearchLineIcon />
            </InputGroupText>
          </InputGroupAddon>
          <InputGroupInput
            placeholder={searchPlaceholder}
            value={currentSearch}
            onChange={(e) => currentOnSearch(e.target.value)}
          />
        </InputGroup>
        {showUpload && uploadConfig && (
          <Button
            variant="default"
            size="sm"
            className="shrink-0"
            onClick={() => setUploadOpen(true)}
          >
            <span>Upload</span>
          </Button>
        )}
        {headerActions}
      </div>

      {/* Tags */}
      <div className="px-4 pb-2 max-w-[1920px] mx-auto w-full">
        <TagFilter
          tags={tags}
          active={currentActiveTags}
          onToggle={currentOnTagToggle}
        />
      </div>

      {/* Count */}
      {count !== undefined && (
        <div className="px-4 pb-2 max-w-[1920px] mx-auto w-full">
          <span className="text-xs text-muted-foreground">
            {count} {countLabel}
          </span>
        </div>
      )}

      {/* Content */}
      <div className={contentClassName ?? "flex-1 overflow-y-auto px-4 pt-2 max-w-[1920px] mx-auto w-full"}>
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
