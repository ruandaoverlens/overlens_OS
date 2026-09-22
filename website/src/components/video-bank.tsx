"use client";

import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { footages, getAllTags, type Footage } from "@/lib/footages";
import { useFavorites } from "@/lib/favorites";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import {
  Tooltip,
  TooltipContent,
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
  SmPlaySolidIcon,
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
import { useAssetMetadata, type AssetMetadataOverride } from "@/lib/asset-metadata";
import { AdminAssetTabs } from "@/components/admin-asset-tabs";
import { AssetUploadModal } from "@/components/asset-upload-modal";
import { AssetEditDialog } from "@/components/asset-edit-dialog";
import { getUploadConfig } from "@/lib/upload-configs";
import { getGradient } from "@/lib/brand-gradients";
import { useAssetFilters, useLightboxItem } from "@/components/asset-page-shell";
import { notify } from "@/lib/notifications";
import { useSlashFocus } from "@/lib/use-slash-focus";
import { normalizeText, matchesNormalized } from "@/lib/normalize-text";

// ─── Tag Filter Bar ───────────────────────────────────────────

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

  return (
    <div
      ref={containerRef}
      role="group"
      aria-label="Filtrar por tag"
      className={`container-content relative flex flex-wrap gap-1.5 py-3 overflow-hidden ${
        expanded ? "" : "max-h-[68px]"
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
    // Respeita "prefers-reduced-motion": mostra a info, sem autoplay.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
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
      className="group relative block w-full overflow-hidden rounded-sm bg-surface-950"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        onClick={onClick}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        aria-label={`Abrir ${footage.title}`}
        className="block w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-foreground rounded-sm"
      >
        <video
          ref={videoRef}
          src={footage.previewUrl}
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          className="block w-full h-auto"
        />

        {/* Hover overlay with info */}
        <div
          // Véu e texto literais: o fundo aqui é o frame do vídeo, não o tema.
          className={`absolute inset-0 bg-gradient-to-t from-absolute-black/80 via-transparent to-transparent transition-opacity duration-200 pointer-events-none ${
            isHovering ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Bottom info */}
          <div className="absolute bottom-0 left-0 right-0 p-2.5">
            <p className="text-xs text-absolute-white font-medium truncate">
              {footage.title}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs text-absolute-white/80">{footage.resolution}</span>
              <span className="text-xs text-absolute-white/80" aria-hidden="true">·</span>
              <span className="text-xs text-absolute-white/80">{footage.fps}</span>
              {footage.hasAudio && (
                <>
                  <span className="text-xs text-absolute-white/80" aria-hidden="true">·</span>
                  <span className="text-xs text-absolute-white/80">audio</span>
                </>
              )}
            </div>
          </div>
        </div>
      </button>

      {/* Hide toggle: irmão do botão principal */}
      {showHideButton && onToggleHide && (
        <div className="absolute top-2 right-2 z-10 opacity-0 pointer-events-none transition-opacity duration-200 group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto focus-visible:opacity-100 pointer-coarse:opacity-100 pointer-coarse:pointer-events-auto">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={isHidden ? "Desocultar vídeo" : "Ocultar vídeo"}
            aria-pressed={!!isHidden}
            onClick={onToggleHide}
            className="rounded-full bg-absolute-black/50 text-absolute-white/70 hover:bg-absolute-black/70 hover:text-absolute-white"
          >
            {isHidden ? <SmVisibilityOffSolidIcon className="size-4" /> : <SmVisibilitySolidIcon className="size-4" />}
          </Button>
        </div>
      )}
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
  onEdit,
  isHidden,
  onToggleHide,
}: {
  footage: Footage;
  onClose: () => void;
  onFavorite: (id: string) => void;
  isFavorited?: boolean;
  onDelete?: () => void;
  onEdit?: () => void;
  isHidden?: boolean;
  onToggleHide?: () => void;
}) {
  const { user } = useAuth();
  const isAdmin = user && canDelete(user.role);
  const confirm = useConfirm();
  const [deleting, setDeleting] = useState(false);
  const [hiding, setHiding] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Respeita "prefers-reduced-motion": o vídeo fica com os controles, parado.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      videoRef.current?.pause();
      return;
    }
    videoRef.current?.play().catch(() => {});
  }, []);

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = footage.downloadUrl;
    a.download = footage.filename;
    a.click();
  };

  const handleDelete = async () => {
    const ok = await confirm({
      destructive: true,
      title: "Excluir este asset?",
      description: "Esta ação não pode ser desfeita.",
      confirmLabel: "Excluir",
    });
    if (!ok) return;
    setDeleting(true);
    try {
      const storagePath = getStoragePath("banco-de-videos", footage.filename);
      const res = await fetch("/api/assets/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storagePath, previewPath: storagePath }),
      });
      if (res.ok) {
        notify.success("Asset excluído");
        onDelete?.();
        onClose();
      } else {
        const data = await res.json().catch(() => ({}));
        notify.error("Falha ao excluir asset", { description: data.error });
      }
    } catch (err) {
      notify.fromError(err, "Falha ao excluir asset");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        showCloseButton={false}
        className="max-w-none sm:max-w-none max-h-none w-screen h-svh rounded-none p-0 bg-background border-0 flex flex-col gap-0 overflow-hidden"
      >
        <DialogTitle className="sr-only">{footage.title}</DialogTitle>
        <DialogDescription className="sr-only">
          Vídeo {footage.resolution} · {footage.fps} · {footage.author}. Enviado por {footage.uploadedBy}.
        </DialogDescription>

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 shrink-0">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground font-medium truncate">
              {footage.title}
            </p>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
              <span>{footage.resolution}</span>
              <span aria-hidden="true">·</span>
              <span>{footage.fps}</span>
              <span aria-hidden="true">·</span>
              <span>{footage.author}</span>
              <span aria-hidden="true">·</span>
              <span>Enviado por {footage.uploadedBy}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            {isAdmin && onEdit && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-border text-muted-foreground hover:bg-accent hover:border-foreground/40 hover:text-foreground"
                onClick={onEdit}
              >
                <span>Editar</span>
              </Button>
            )}
            {isAdmin && onToggleHide && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-border text-muted-foreground hover:bg-accent hover:border-foreground/40 hover:text-foreground"
                onClick={async () => {
                  setHiding(true);
                  try {
                    await onToggleHide();
                  } catch (err) {
                    notify.fromError(err, isHidden ? "Falha ao desocultar asset" : "Falha ao ocultar asset");
                  } finally {
                    setHiding(false);
                  }
                }}
                loading={hiding}
                loadingText={isHidden ? "Desocultando…" : "Ocultando…"}
                aria-pressed={!!isHidden}
              >
                <span>{isHidden ? "Desocultar" : "Ocultar"}</span>
              </Button>
            )}
            {isAdmin && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                loading={deleting}
                loadingText="Excluindo…"
              >
                Excluir
              </Button>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={handleDownload}
                >
                  <span>Download</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Baixar vídeo original</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label={isFavorited ? "Remover dos favoritos" : "Salvar nos favoritos"}
                  aria-pressed={!!isFavorited}
                  className="border-border text-foreground hover:bg-accent hover:border-foreground/40"
                  onClick={() => onFavorite(footage.id)}
                >
                  {isFavorited ? <SmStarSolidIcon /> : <SmStarLineIcon />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">{isFavorited ? "Remover dos favoritos" : "Salvar nos favoritos"}</TooltipContent>
            </Tooltip>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Fechar"
              className="text-muted-foreground hover:text-foreground hover:bg-accent"
              onClick={onClose}
            >
              <SmCloseLineIcon />
            </Button>
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
            preload="metadata"
            aria-label={footage.title}
            className="max-w-full max-h-full rounded-lg object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Video Bank ──────────────────────────────────────────

function applyOverride(base: Footage, override: AssetMetadataOverride | undefined): Footage {
  if (!override) return base;
  return {
    ...base,
    title: override.title ?? base.title,
    author: override.author ?? base.author,
    tags: override.tags.length > 0 ? override.tags : base.tags,
  };
}

export function VideoBank() {
  const { user } = useAuth();
  const isAdmin = user && canDelete(user.role);
  const allTags = getAllTags();
  // Filtros vivem na URL (?q=&tags=&view=hidden); `search` é o input local (sem debounce).
  const { search, setSearch, q, activeTags, toggleTag, clearFilters, hasFilters, showHidden, setShowHidden } = useAssetFilters();
  // O vídeo aberto vive na URL (?item=<id>) para ser compartilhável.
  const [selectedId, openItem, closeItem] = useLightboxItem();
  const [editing, setEditing] = useState<Footage | null>(null);
  const [deleted, setDeleted] = useState<Set<string>>(new Set());
  const { isHidden, hide, unhide } = useHiddenAssets("video");
  const metadata = useAssetMetadata("video");
  const { isFavorite: globalIsFavorite, toggleFavorite: globalToggleFavorite } = useFavorites();
  const [uploadOpen, setUploadOpen] = useState(false);
  const showUpload = user && canUpload(user.role);
  const uploadConfig = getUploadConfig("banco-de-videos");
  // Atalho "/" foca a busca, como nos demais bancos.
  const searchRef = useRef<HTMLInputElement>(null);
  useSlashFocus(searchRef);

  const mergedFootages = useMemo(
    () => footages.map((f) => applyOverride(f, metadata.get(f.id))),
    [metadata],
  );

  const handleFavorite = useCallback((id: string) => {
    const f = mergedFootages.find((ft) => ft.id === id);
    if (f) {
      globalToggleFavorite({ id: f.id, type: "video", title: f.title, subtitle: f.author, thumbnail: f.previewUrl });
    }
  }, [globalToggleFavorite, mergedFootages]);

  const handleToggleHide = async (id: string) => {
    if (isHidden(id)) await unhide(id);
    else await hide(id);
  };

  const availableFootages = mergedFootages.filter((f) => !deleted.has(f.id));
  const hiddenCount = availableFootages.filter((f) => isHidden(f.id)).length;
  const visibleCount = availableFootages.length - hiddenCount;

  const filtered = useMemo(() => {
    // Busca insensível a acento: "video" encontra "vídeo".
    const needle = normalizeText(q);
    return mergedFootages.filter((f) => {
      if (deleted.has(f.id)) return false;
      if (showHidden ? !isHidden(f.id) : isHidden(f.id)) return false;
      const matchesTags = activeTags.size === 0 || f.tags.some((t) => activeTags.has(t));
      const matchesSearch =
        !needle ||
        matchesNormalized(f.title, needle) ||
        matchesNormalized(f.author, needle) ||
        f.tags.some((t) => matchesNormalized(t, needle));
      return matchesTags && matchesSearch;
    });
  }, [mergedFootages, deleted, showHidden, isHidden, activeTags, q]);

  const selectedFootage = useMemo(
    () => mergedFootages.find((f) => f.id === selectedId && !deleted.has(f.id)) ?? null,
    [mergedFootages, selectedId, deleted],
  );

  // Item inexistente (ou excluído) na lista carregada: limpa a chave da URL.
  useEffect(() => {
    if (selectedId && !selectedFootage) closeItem();
  }, [selectedId, selectedFootage, closeItem]);

  const { visibleItems: pagedFootages, hasMore, setSentinel } = useInfiniteScroll(filtered);

  return (
    <div className="flex flex-col h-full">
      {/* Banner */}
      <Banner size="sm">
        <BannerImage gradient={getGradient("banco-de-videos")} />
        <BannerContent>
          <BannerTitle>Banco de vídeos</BannerTitle>
        </BannerContent>
      </Banner>

      {/* Admin tabs */}
      {isAdmin && (
        <AdminAssetTabs showHidden={showHidden} onShowHiddenChange={setShowHidden} totalCount={visibleCount} hiddenCount={hiddenCount} />
      )}

      {/* Search + Upload */}
      <div className="container-content flex items-center gap-2 pt-4 pb-3">
        <InputGroup size="sm" className="flex-1 rounded-full">
          <InputGroupAddon align="inline-start">
            <InputGroupText>
              <SmSearchLineIcon />
            </InputGroupText>
          </InputGroupAddon>
          <InputGroupInput
            ref={searchRef}
            type="search"
            aria-label="Buscar vídeos…"
            aria-keyshortcuts="/"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            placeholder="Buscar vídeos…"
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
        {showUpload && uploadConfig && (
          <Button type="button" variant="default" size="sm" className="shrink-0" onClick={() => setUploadOpen(true)}>
            <span>Upload</span>
          </Button>
        )}
      </div>

      <TagFilter tags={allTags} active={activeTags} onToggle={toggleTag} />

      {/* Contador de resultados */}
      <div className="container-content pb-2">
        <span className="text-xs text-muted-foreground" aria-live="polite">
          {filtered.length} {filtered.length === 1 ? "vídeo" : "vídeos"}
        </span>
      </div>

      {/* Masonry Grid */}
      <div className="flex-1 overflow-auto px-1 pb-4 pt-10">
        <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-1">
          {pagedFootages.map((footage) => (
            <div key={footage.id} className="mb-1 break-inside-avoid">
              <VideoThumb
                footage={footage}
                onClick={() => openItem(footage.id)}
                showHideButton={!!isAdmin}
                isHidden={isHidden(footage.id)}
                onToggleHide={() => handleToggleHide(footage.id)}
              />
            </div>
          ))}
        </div>
        {hasMore && <div ref={setSentinel} className="h-8" aria-hidden="true" />}

        {filtered.length === 0 && (
          <div className="container-content py-16">
            <EmptyState
              variant={hasFilters ? "filtered" : "empty"}
              icon={<SmPlaySolidIcon className="size-6" />}
              title={hasFilters ? "Nenhum vídeo encontrado" : showHidden ? "Nenhum asset oculto" : "Nenhum vídeo ainda"}
              description={hasFilters ? "Nenhum resultado para a busca ou as tags selecionadas." : showHidden ? undefined : "Envie o primeiro vídeo para o banco."}
              onClear={clearFilters}
              action={
                !hasFilters && !showHidden && showUpload && uploadConfig ? (
                  <Button type="button" variant="default" size="sm" onClick={() => setUploadOpen(true)}>
                    <span>Upload</span>
                  </Button>
                ) : undefined
              }
              className="border-none"
            />
          </div>
        )}
        <div className="h-[200px] w-full shrink-0" aria-hidden="true" />
      </div>

      {/* Lightbox */}
      {selectedFootage && (
        <VideoLightbox
          footage={selectedFootage}
          onClose={closeItem}
          onFavorite={handleFavorite}
          isFavorited={globalIsFavorite(selectedFootage.id)}
          onDelete={() => {
            setDeleted((prev) => new Set(prev).add(selectedFootage.id));
            closeItem();
          }}
          onEdit={isAdmin ? () => setEditing(selectedFootage) : undefined}
          isHidden={isHidden(selectedFootage.id)}
          onToggleHide={() => handleToggleHide(selectedFootage.id)}
        />
      )}

      {editing && (
        <AssetEditDialog
          open={!!editing}
          onOpenChange={(open) => { if (!open) setEditing(null); }}
          config={{
            assetType: "video",
            hideCaption: true,
            hideYear: true,
            hideSourceUrl: true,
          }}
          assetKey={editing.id}
          initial={{
            title: editing.title ?? "",
            caption: "",
            author: editing.author ?? "",
            year: "",
            sourceUrl: "",
            tags: editing.tags ?? [],
          }}
          onSaved={() => {
            // `selectedFootage` deriva de `mergedFootages`, que já reflete o override salvo.
            setEditing(null);
          }}
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
