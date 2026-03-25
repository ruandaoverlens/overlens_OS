"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { footages, getAllTags, type Footage } from "@/lib/footages";
import { useFavorites } from "@/lib/favorites";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Banner,
  BannerImage,
  BannerContent,
  BannerTitle,
} from "@/components/ui/banner";
import {
  SmCloseLineIcon,
  SmSearchLineIcon,
  SmStarLineIcon,
  SmStarSolidIcon,
  SmVisibilitySolidIcon,
  SmVisibilityOffSolidIcon,
} from "@/components/icons";
import { useAuth, canUpload, canDelete } from "@/lib/auth";
import { useInfiniteScroll } from "@/lib/use-infinite-scroll";
import { getStoragePath } from "@/lib/supabase/storage";
import { useHiddenAssets } from "@/lib/hidden-assets";
import { AdminAssetTabs } from "@/components/admin-asset-tabs";
import { AssetUploadModal } from "@/components/asset-upload-modal";
import { getUploadConfig } from "@/lib/upload-configs";

const VIDEO_GRADIENT = "linear-gradient(135deg, #8A3060 0%, #C47098 50%, #E8B0CC 100%)";

// ─── Tag Filter Bar ───────────────────────────────────────────

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

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-wrap gap-1.5 px-4 py-3 overflow-hidden ${
        expanded ? "" : "max-h-[68px]"
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

// ─── Video Thumbnail (preview card) ───────────────────────────

function VideoThumb({
  footage,
  onClick,
  showHideButton,
  isHidden,
  onToggleHide,
}: {
  footage: Footage;
  onClick: () => void;
  showHideButton?: boolean;
  isHidden?: boolean;
  onToggleHide?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
    videoRef.current?.play().catch(() => {});
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  }, []);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick(); }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative block w-full overflow-hidden rounded-sm bg-[var(--surface-950)] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
    >
      <video
        ref={videoRef}
        src={footage.previewUrl}
        muted
        loop
        playsInline
        preload="metadata"
        className="block w-full h-auto"
      />

      {/* Hide icon on hover */}
      {showHideButton && onToggleHide && (
        <div className={`absolute top-2 right-2 z-10 transition-opacity duration-200 ${isHovering ? "opacity-100" : "opacity-0"}`}>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleHide(); }}
            className="size-8 rounded-full flex items-center justify-center bg-black/50 text-white/40 hover:text-white/70 hover:bg-black/70 transition-all"
          >
            {isHidden ? <SmVisibilityOffSolidIcon className="size-4" /> : <SmVisibilitySolidIcon className="size-4" />}
          </button>
        </div>
      )}

      {/* Hover overlay with info */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity duration-200 ${
          isHovering ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-2.5">
          <p className="text-[11px] text-white/90 font-medium truncate">
            {footage.title}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] text-white/50">{footage.resolution}</span>
            <span className="text-[10px] text-white/30">·</span>
            <span className="text-[10px] text-white/50">{footage.fps}</span>
            {footage.hasAudio && (
              <>
                <span className="text-[10px] text-white/30">·</span>
                <span className="text-[10px] text-white/50">audio</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Fullscreen Lightbox ──────────────────────────────────────

export function VideoLightbox({
  footage,
  onClose,
  onFavorite,
  isFavorited,
  onDelete,
  isHidden,
  onToggleHide,
}: {
  footage: Footage;
  onClose: () => void;
  onFavorite: (id: string) => void;
  isFavorited?: boolean;
  onDelete?: () => void;
  isHidden?: boolean;
  onToggleHide?: () => void;
}) {
  const { user } = useAuth();
  const isAdmin = user && canDelete(user.role);
  const [deleting, setDeleting] = useState(false);
  const [hiding, setHiding] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    videoRef.current?.play().catch(() => {});
  }, []);

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = footage.downloadUrl;
    a.download = footage.filename;
    a.click();
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este asset?")) return;
    setDeleting(true);
    try {
      const storagePath = getStoragePath("banco-de-videos", footage.filename);
      const res = await fetch("/api/assets/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storagePath, previewPath: storagePath }),
      });
      if (res.ok) {
        onDelete?.();
        onClose();
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao excluir");
      }
    } catch {
      alert("Erro ao excluir asset");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col animate-in fade-in duration-200">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white/80 font-medium truncate">
            {footage.title}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-white/40">{footage.resolution}</span>
            <span className="text-xs text-white/20">·</span>
            <span className="text-xs text-white/40">{footage.fps}</span>
            <span className="text-xs text-white/20">·</span>
            <span className="text-xs text-white/40">{footage.author}</span>
            <span className="text-xs text-white/20">·</span>
            <span className="text-xs text-white/40">Enviado por {footage.uploadedBy}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          {isAdmin && onToggleHide && (
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 text-white/60 hover:bg-white/10 hover:border-white/40 hover:text-white"
              onClick={async () => {
                setHiding(true);
                await onToggleHide();
                setHiding(false);
              }}
              disabled={hiding}
            >
              <span>{hiding ? "..." : isHidden ? "Desocultar" : "Ocultar"}</span>
            </Button>
          )}
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 text-white/60 hover:bg-white/10 hover:border-white/40 hover:text-white"
              onClick={handleDelete}
              disabled={deleting}
            >
              <span>{deleting ? "Excluindo..." : "Excluir"}</span>
            </Button>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleDownload}
                >
                  <span>Download</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Baixar vídeo original</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-white/20 text-white hover:bg-white/10 hover:border-white/40 text-lg font-light"
                  onClick={() => onFavorite(footage.id)}
                >
                  {isFavorited ? <SmStarSolidIcon /> : <SmStarLineIcon />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Salvar nos favoritos</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white/60 hover:text-white hover:bg-white/10"
                  onClick={onClose}
                >
                  <SmCloseLineIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Fechar</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Video area */}
      <div className="flex-1 flex items-center justify-center px-4 pb-4 min-h-0">
        <video
          ref={videoRef}
          src={footage.previewUrl}
          controls
          autoPlay
          loop
          playsInline
          className="max-w-full max-h-full rounded-lg object-contain"
        />
      </div>
    </div>
  );
}

// ─── Main Video Bank ──────────────────────────────────────────

export function VideoBank() {
  const { user } = useAuth();
  const isAdmin = user && canDelete(user.role);
  const allTags = getAllTags();
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [selectedFootage, setSelectedFootage] = useState<Footage | null>(null);
  const [deleted, setDeleted] = useState<Set<string>>(new Set());
  const [showHidden, setShowHidden] = useState(false);
  const { isHidden, hide, unhide } = useHiddenAssets("video");
  const { isFavorite: globalIsFavorite, toggleFavorite: globalToggleFavorite } = useFavorites();
  const [uploadOpen, setUploadOpen] = useState(false);
  const showUpload = user && canUpload(user.role);
  const uploadConfig = getUploadConfig("banco-de-videos");

  const handleToggleTag = useCallback((tag: string) => {
    if (tag === "__all__") {
      setActiveTags(new Set());
      return;
    }
    setActiveTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  }, []);

  const handleFavorite = useCallback((id: string) => {
    const f = footages.find((ft) => ft.id === id);
    if (f) {
      globalToggleFavorite({ id: f.id, type: "video", title: f.title, subtitle: f.author, thumbnail: f.previewUrl });
    }
  }, [globalToggleFavorite]);

  const handleToggleHide = async (id: string) => {
    if (isHidden(id)) await unhide(id);
    else await hide(id);
  };

  const availableFootages = footages.filter((f) => !deleted.has(f.id));
  const hiddenCount = availableFootages.filter((f) => isHidden(f.id)).length;
  const visibleCount = availableFootages.length - hiddenCount;

  const filtered = footages.filter((f) => {
    if (deleted.has(f.id)) return false;
    if (showHidden ? !isHidden(f.id) : isHidden(f.id)) return false;
    const matchesTags = activeTags.size === 0 || f.tags.some((t) => activeTags.has(t));
    const q = search.toLowerCase().trim();
    const matchesSearch = !q || f.title.toLowerCase().includes(q) || f.author.toLowerCase().includes(q) || f.tags.some((t) => t.includes(q));
    return matchesTags && matchesSearch;
  });

  const { visibleItems: pagedFootages, hasMore, setSentinel } = useInfiniteScroll(filtered);

  return (
    <div className="flex flex-col h-full">
      {/* Banner */}
      <Banner size="sm">
        <BannerImage gradient={VIDEO_GRADIENT} />
        <BannerContent>
          <BannerTitle>Banco de vídeos</BannerTitle>
        </BannerContent>
      </Banner>

      {/* Admin tabs */}
      {isAdmin && (
        <AdminAssetTabs showHidden={showHidden} onShowHiddenChange={setShowHidden} totalCount={visibleCount} hiddenCount={hiddenCount} />
      )}

      {/* Search + Upload */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-3">
        <InputGroup size="sm" className="flex-1 rounded-full">
          <InputGroupAddon align="inline-start">
            <InputGroupText>
              <SmSearchLineIcon />
            </InputGroupText>
          </InputGroupAddon>
          <InputGroupInput
            type="text"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            placeholder="Buscar vídeos..."
          />
        </InputGroup>
        {showUpload && uploadConfig && (
          <Button variant="default" size="sm" className="shrink-0" onClick={() => setUploadOpen(true)}>
            <span>Upload</span>
          </Button>
        )}
      </div>

      <TagFilter tags={allTags} active={activeTags} onToggle={handleToggleTag} />

      {/* Masonry Grid */}
      <div className="flex-1 overflow-auto px-1 pb-4 pt-[40px]">
        <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-1">
          {pagedFootages.map((footage) => (
            <div key={footage.id} className="mb-1 break-inside-avoid">
              <VideoThumb
                footage={footage}
                onClick={() => setSelectedFootage(footage)}
                showHideButton={!!isAdmin}
                isHidden={isHidden(footage.id)}
                onToggleHide={() => handleToggleHide(footage.id)}
              />
            </div>
          ))}
        </div>
        {hasMore && (
          <div ref={setSentinel} className="flex items-center justify-center py-8">
            <p className="text-xs text-white/30">Carregando mais...</p>
          </div>
        )}
        <div className="h-[200px] w-full shrink-0" aria-hidden="true" />
      </div>

      {/* Lightbox */}
      {selectedFootage && (
        <VideoLightbox
          footage={selectedFootage}
          onClose={() => setSelectedFootage(null)}
          onFavorite={handleFavorite}
          isFavorited={globalIsFavorite(selectedFootage.id)}
          onDelete={() => {
            setDeleted((prev) => new Set(prev).add(selectedFootage.id));
            setSelectedFootage(null);
          }}
          isHidden={isHidden(selectedFootage.id)}
          onToggleHide={() => handleToggleHide(selectedFootage.id)}
        />
      )}

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
