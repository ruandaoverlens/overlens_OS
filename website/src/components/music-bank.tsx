"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { tracks, getAllMusicTags, type Track } from "@/lib/musicas";
import { useMusicPlayer } from "@/lib/music-player";
import { useFavorites } from "@/lib/favorites";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import {
  Banner,
  BannerImage,
  BannerContent,
  BannerTitle,
} from "@/components/ui/banner";
import {
  SmDownloadSolidIcon,
  SmGraphicEqLineIcon,
  SmStarLineIcon,
  SmStarSolidIcon,
  SmPlaySolidIcon,
  SmSearchLineIcon,
} from "@/components/icons";
import { Pause } from "lucide-react";
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
import { useAssetFilters } from "@/components/asset-page-shell";
import { useSlashFocus } from "@/lib/use-slash-focus";
import { normalizeText, matchesNormalized } from "@/lib/normalize-text";
import { notify } from "@/lib/notifications";

// ─── Waveform Visualizer ──────────────────────────────────────

/** Cor do texto (`--foreground`) resolvida do tema para pintar o canvas. */
function themeForeground(): string {
  if (typeof document === "undefined") return "#ffffff";
  const value = getComputedStyle(document.documentElement).getPropertyValue("--foreground").trim();
  return value || "#ffffff";
}

function Waveform({
  isActive,
  progress,
  duration,
  onSeek,
  label,
}: {
  isActive: boolean;
  progress: number;
  duration: number;
  onSeek: (pct: number) => void;
  label: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const barsRef = useRef<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const count = 200;
    barsRef.current = Array.from({ length: count }, () =>
      0.15 + Math.random() * 0.85
    );
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const bars = barsRef.current;
    const barWidth = 2;
    const gap = 1.5;
    const totalBarWidth = barWidth + gap;
    const barCount = Math.floor(w / totalBarWidth);

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = themeForeground();

    for (let i = 0; i < barCount; i++) {
      const barIndex = Math.floor((i / barCount) * bars.length);
      const x = i * totalBarWidth;
      const barH = bars[barIndex] * (h - 4);
      const y = (h - barH) / 2;
      const pct = (i + 1) / barCount;

      // Mesma cor do tema em duas intensidades: tocado vs. restante.
      ctx.globalAlpha = isActive && pct <= progress ? 0.9 : 0.15;

      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barH, 1);
      ctx.fill();
    }
  }, [progress, isActive]);

  const handleClick = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pct = (e.clientX - rect.left) / rect.width;
    onSeek(Math.max(0, Math.min(1, pct)));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      onSeek(Math.min(1, progress + 0.05));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      onSeek(Math.max(0, progress - 0.05));
    } else if (e.key === "Home") {
      e.preventDefault();
      onSeek(0);
    } else if (e.key === "End") {
      e.preventDefault();
      onSeek(1);
    }
  };

  const valueNow = Math.round(progress * 100);

  return (
    <div
      ref={containerRef}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={valueNow}
      aria-valuetext={`${formatTime(duration * progress)} de ${formatTime(duration)}`}
      className="flex-1 h-10 cursor-pointer rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-foreground"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <canvas ref={canvasRef} className="w-full h-full" aria-hidden="true" />
    </div>
  );
}

// ─── Format Time ──────────────────────────────────────────────

function formatTime(seconds: number): string {
  if (!isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─── Track Row ────────────────────────────────────────────────

function TrackRow({
  track,
  isActive,
  isPlaying,
  progress,
  duration,
  onPlay,
  onPause,
  onSeek,
  onFavorite,
  isFavorite,
  showDelete,
  onDelete,
  onEdit,
  isHidden,
  onToggleHide,
}: {
  track: Track;
  isActive: boolean;
  isPlaying: boolean;
  progress: number;
  duration: number;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (pct: number) => void;
  onFavorite: () => void;
  isFavorite: boolean;
  showDelete?: boolean;
  onDelete?: () => void;
  onEdit?: () => void;
  isHidden?: boolean;
  onToggleHide?: () => void;
}) {
  const confirm = useConfirm();
  const [deleting, setDeleting] = useState(false);
  const [hiding, setHiding] = useState(false);

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = track.downloadUrl;
    a.download = track.filename;
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
      const storagePath = getStoragePath("sons-e-audios", track.filename);
      const res = await fetch("/api/assets/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storagePath, previewPath: storagePath }),
      });
      if (res.ok) {
        notify.success("Asset excluído");
        onDelete?.();
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

  const playing = isActive && isPlaying;

  return (
    <div
      className="group relative flex items-center gap-3 px-4 py-2.5 transition-colors"
    >
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-l from-white/[0.04] to-transparent transition-opacity ${
        isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
      }`} />

      <div className="relative z-10 shrink-0 flex items-center justify-center">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={playing ? `Pausar ${track.title}` : `Reproduzir ${track.title}`}
          aria-pressed={playing}
          onClick={playing ? onPause : onPlay}
          className="hover:scale-110 transition-transform hover:bg-transparent"
        >
          {playing ? (
            <Pause className="size-5 text-white fill-white" />
          ) : (
            <SmPlaySolidIcon
              className={`size-6 ${
                isActive ? "text-white" : "text-surface-500 group-hover:text-white"
              }`}
            />
          )}
        </Button>
      </div>

      <div className="relative z-10 w-32 md:w-48 shrink-0 min-w-0">
        <p
          className={`text-sm font-medium truncate ${
            isActive ? "text-white" : "text-surface-200"
          }`}
        >
          {track.title}
        </p>
        <p className="text-xs text-surface-500 truncate">
          {track.artist}
        </p>
      </div>

      <div className="relative z-10 hidden md:flex items-center gap-1 w-40 shrink-0 overflow-hidden">
        {track.tags.map((tag) => (
          <span
            key={tag}
            className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
              tag === "sfx"
                ? "bg-warning/15 text-warning"
                : "bg-white/[0.06] text-surface-400"
            }`}
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="relative z-10 hidden md:block flex-1 min-w-0">
        <Waveform
          isActive={isActive}
          progress={progress}
          duration={duration}
          onSeek={onSeek}
          label={`Posição em ${track.title}`}
        />
      </div>

      <span className="relative z-10 hidden md:inline w-12 shrink-0 text-right text-xs text-surface-500 tabular-nums">
        {isActive ? formatTime(duration * progress) : formatTime(duration)}
      </span>

      <div className="relative z-10 flex items-center gap-1.5 shrink-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={isFavorite ? "Remover dos favoritos" : "Salvar nos favoritos"}
              aria-pressed={isFavorite}
              className={`text-surface-500 hover:text-white hover:bg-white/10 ${
                isFavorite ? "!opacity-100 text-white" : ""
              }`}
              onClick={onFavorite}
            >
              {isFavorite ? <SmStarSolidIcon /> : <SmStarLineIcon />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">{isFavorite ? "Remover dos favoritos" : "Salvar nos favoritos"}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Baixar ${track.title}`}
              className="text-surface-500 hover:text-white hover:bg-white/10"
              onClick={handleDownload}
            >
              <SmDownloadSolidIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">Baixar arquivo</TooltipContent>
        </Tooltip>
        {showDelete && onEdit && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-white/20 text-muted-foreground hover:bg-white/10 hover:border-white/40 hover:text-white text-xs"
            onClick={onEdit}
          >
            <span>Editar</span>
          </Button>
        )}
        {showDelete && onToggleHide && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-white/20 text-muted-foreground hover:bg-white/10 hover:border-white/40 hover:text-white text-xs"
            onClick={async () => {
              setHiding(true);
              await onToggleHide();
              setHiding(false);
            }}
            loading={hiding}
            loadingText={isHidden ? "Desocultando…" : "Ocultando…"}
            aria-pressed={!!isHidden}
          >
            <span>{isHidden ? "Desocultar" : "Ocultar"}</span>
          </Button>
        )}
        {showDelete && (
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
      </div>
    </div>
  );
}

// ─── Main Music Bank ──────────────────────────────────────────

function applyOverride(base: Track, override: AssetMetadataOverride | undefined): Track {
  if (!override) return base;
  return {
    ...base,
    title: override.title ?? base.title,
    artist: override.author ?? base.artist,
    tags: override.tags.length > 0 ? override.tags : base.tags,
  };
}

const TAG_BASE = "px-3 py-1 rounded-full text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-foreground";
const TAG_INACTIVE = "bg-surface-900 text-surface-400 hover:text-surface-200";

export function MusicBank() {
  const { user } = useAuth();
  const allTags = getAllMusicTags();
  // Filtros vivem na URL (?q=&tags=&view=hidden); `search` é o input local (sem debounce).
  const { search, setSearch, q, activeTags, toggleTag, clearFilters, hasFilters, showHidden, setShowHidden } = useAssetFilters();
  // Atalho "/" foca a busca, como nos demais bancos.
  const searchRef = useRef<HTMLInputElement>(null);
  useSlashFocus(searchRef);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleted, setDeleted] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<Track | null>(null);
  const { isHidden, hide, unhide } = useHiddenAssets("audio");
  const metadata = useAssetMetadata("audio");
  const showUpload = user && canUpload(user.role);
  const isAdmin = user && canDelete(user.role);
  const uploadConfig = getUploadConfig("sons-e-audios");

  const mergedTracks = useMemo(
    () => tracks.map((t) => applyOverride(t, metadata.get(t.id))),
    [metadata],
  );

  const {
    activeTrack,
    isPlaying,
    progress,
    durations,
    playTrack,
    pauseTrack,
    seekTrack,
  } = useMusicPlayer();

  const { isFavorite, toggleFavorite: globalToggleFavorite } = useFavorites();

  const handleToggleHide = async (id: string) => {
    if (isHidden(id)) await unhide(id);
    else await hide(id);
  };

  const availableTracks = mergedTracks.filter((t) => !deleted.has(t.id));
  const hiddenCount = availableTracks.filter((t) => isHidden(t.id)).length;
  const visibleCount = availableTracks.length - hiddenCount;

  const filtered = useMemo(() => {
    // Busca insensível a acento: "musica" encontra "Música".
    const needle = normalizeText(q);
    return mergedTracks.filter((t) => {
      if (deleted.has(t.id)) return false;
      if (showHidden ? !isHidden(t.id) : isHidden(t.id)) return false;
      const matchesTags = activeTags.size === 0 || t.tags.some((tag) => activeTags.has(tag));
      const matchesSearch =
        !needle ||
        matchesNormalized(t.title, needle) ||
        matchesNormalized(t.artist, needle) ||
        t.tags.some((tag) => matchesNormalized(tag, needle));
      return matchesTags && matchesSearch;
    });
  }, [mergedTracks, deleted, showHidden, isHidden, activeTags, q]);

  const { visibleItems: pagedTracks, hasMore, setSentinel } = useInfiniteScroll(filtered);

  return (
    <div className="flex flex-col h-full">
      {/* Banner */}
      <Banner size="sm">
        <BannerImage gradient={getGradient("sons-e-audios")} />
        <BannerContent>
          <BannerTitle>Sons e áudios</BannerTitle>
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
            aria-label="Buscar sons e músicas…"
            aria-keyshortcuts="/"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            placeholder="Buscar sons e músicas…"
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

      {/* Tag filter */}
      <div className="container-content flex flex-wrap gap-1.5 pb-2" role="group" aria-label="Filtrar por tag">
        <button
          type="button"
          aria-pressed={activeTags.size === 0}
          onClick={() => toggleTag("__all__")}
          className={`${TAG_BASE} ${activeTags.size === 0 ? "bg-white text-black" : TAG_INACTIVE}`}
        >
          Todos
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            type="button"
            aria-pressed={activeTags.has(tag)}
            onClick={() => toggleTag(tag)}
            className={`${TAG_BASE} ${
              activeTags.has(tag)
                ? tag === "sfx"
                  ? "bg-warning text-black"
                  : "bg-white text-black"
                : TAG_INACTIVE
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Contador de resultados */}
      <div className="container-content pb-2">
        <span className="text-xs text-muted-foreground" aria-live="polite">
          {filtered.length} {filtered.length === 1 ? "faixa" : "faixas"}
        </span>
      </div>

      {/* Track list */}
      <div className="flex-1 overflow-auto pb-16 pt-10">
        {pagedTracks.map((track) => (
          <TrackRow
            key={track.id}
            track={track}
            isActive={activeTrack?.id === track.id}
            isPlaying={activeTrack?.id === track.id && isPlaying}
            progress={activeTrack?.id === track.id ? progress : 0}
            duration={durations[track.id] ?? 0}
            onPlay={() => playTrack(track)}
            onPause={pauseTrack}
            onSeek={seekTrack}
            onFavorite={() => globalToggleFavorite({ id: track.id, type: "audio", title: track.title, subtitle: track.artist })}
            isFavorite={isFavorite(track.id)}
            showDelete={!!isAdmin}
            onDelete={() => setDeleted((prev) => new Set(prev).add(track.id))}
            onEdit={isAdmin ? () => setEditing(track) : undefined}
            isHidden={isHidden(track.id)}
            onToggleHide={() => handleToggleHide(track.id)}
          />
        ))}
        {hasMore && <div ref={setSentinel} className="h-8" aria-hidden="true" />}

        {filtered.length === 0 && (
          <div className="container-content py-16">
            <EmptyState
              variant={hasFilters ? "filtered" : "empty"}
              icon={<SmGraphicEqLineIcon className="size-6" />}
              title={hasFilters ? "Nenhum som encontrado" : showHidden ? "Nenhum asset oculto" : "Nenhum som ainda"}
              description={hasFilters ? "Nenhum resultado para a busca ou as tags selecionadas." : showHidden ? undefined : "Envie o primeiro som ou música para o banco."}
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

      {/* Upload Modal */}
      {uploadConfig && (
        <AssetUploadModal
          config={uploadConfig}
          open={uploadOpen}
          onOpenChange={setUploadOpen}
        />
      )}

      {editing && (
        <AssetEditDialog
          open={!!editing}
          onOpenChange={(open) => { if (!open) setEditing(null); }}
          config={{
            assetType: "audio",
            authorLabel: "Artista",
            hideCaption: true,
            hideYear: true,
            hideSourceUrl: true,
          }}
          assetKey={editing.id}
          initial={{
            title: editing.title ?? "",
            caption: "",
            author: editing.artist ?? "",
            year: "",
            sourceUrl: "",
            tags: editing.tags ?? [],
          }}
          onSaved={() => setEditing(null)}
        />
      )}
    </div>
  );
}
