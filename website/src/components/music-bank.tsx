"use client";

import React, { useState, useRef, useEffect } from "react";
import { tracks, getAllMusicTags, type Track } from "@/lib/musicas";
import { useMusicPlayer } from "@/lib/music-player";
import { useFavorites } from "@/lib/favorites";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
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
  SmStarLineIcon,
  SmStarSolidIcon,
  SmPlaySolidIcon,
  SmSearchLineIcon,
} from "@/components/icons";

const MUSIC_GRADIENT = "linear-gradient(135deg, #4A5FA8 0%, #7B8FCC 50%, #B4C0E8 100%)";
import { Pause } from "lucide-react";
import { useAuth, canUpload } from "@/lib/auth";
import { AssetUploadModal } from "@/components/asset-upload-modal";
import { getUploadConfig } from "@/lib/upload-configs";

// ─── Waveform Visualizer ──────────────────────────────────────

function Waveform({
  isActive,
  progress,
  onSeek,
}: {
  isActive: boolean;
  progress: number;
  onSeek: (pct: number) => void;
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

    for (let i = 0; i < barCount; i++) {
      const barIndex = Math.floor((i / barCount) * bars.length);
      const x = i * totalBarWidth;
      const barH = bars[barIndex] * (h - 4);
      const y = (h - barH) / 2;
      const pct = (i + 1) / barCount;

      if (isActive && pct <= progress) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      } else {
        ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      }

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

  return (
    <div
      ref={containerRef}
      className="flex-1 h-10 cursor-pointer"
      onClick={handleClick}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
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
}) {
  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = track.downloadUrl;
    a.download = track.filename;
    a.click();
  };

  return (
    <div
      className="group relative flex items-center gap-3 px-4 py-2.5 transition-colors"
    >
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-l from-white/[0.04] to-transparent transition-opacity ${
        isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
      }`} />

      <div className="relative z-10 w-6 shrink-0 flex items-center justify-center">
        {isActive && isPlaying ? (
          <button onClick={onPause} className="hover:scale-110 transition-transform">
            <Pause className="size-5 text-white fill-white" />
          </button>
        ) : (
          <button onClick={onPlay} className="hover:scale-110 transition-transform">
            <SmPlaySolidIcon
              className={`size-6 ${
                isActive ? "text-white" : "text-[var(--surface-500)] group-hover:text-white"
              }`}
            />
          </button>
        )}
      </div>

      <div className="relative z-10 w-32 md:w-48 shrink-0 min-w-0">
        <p
          className={`text-sm font-medium truncate ${
            isActive ? "text-white" : "text-[var(--surface-200)]"
          }`}
        >
          {track.title}
        </p>
        <p className="text-xs text-[var(--surface-500)] truncate">
          {track.artist}
        </p>
      </div>

      <div className="relative z-10 hidden md:flex items-center gap-1 w-40 shrink-0 overflow-hidden">
        {track.tags.map((tag) => (
          <span
            key={tag}
            className={`px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${
              tag === "sfx"
                ? "bg-amber-500/15 text-amber-400"
                : "bg-white/[0.06] text-[var(--surface-400)]"
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
          onSeek={onSeek}
        />
      </div>

      <span className="relative z-10 hidden md:inline w-12 shrink-0 text-right text-xs text-[var(--surface-500)] tabular-nums">
        {isActive ? formatTime(duration * progress) : formatTime(duration)}
      </span>

      <div className="relative z-10 flex items-center gap-1.5 shrink-0">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`text-[var(--surface-500)] hover:text-white hover:bg-white/10 ${
                  isFavorite ? "!opacity-100 text-white" : ""
                }`}
                onClick={onFavorite}
              >
                {isFavorite ? <SmStarSolidIcon /> : <SmStarLineIcon />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Salvar nos favoritos</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-[var(--surface-500)] hover:text-white hover:bg-white/10"
                onClick={handleDownload}
              >
                <SmDownloadSolidIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Baixar arquivo</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

// ─── Main Music Bank ──────────────────────────────────────────

export function MusicBank() {
  const { user } = useAuth();
  const allTags = getAllMusicTags();
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const showUpload = user && canUpload(user.role);
  const uploadConfig = getUploadConfig("sons-e-audios");

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

  const handleToggleTag = (tag: string) => {
    if (tag === "__all__") {
      setActiveTags(new Set());
      return;
    }
    setActiveTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  const filtered = tracks.filter((t) => {
    const matchesTags = activeTags.size === 0 || t.tags.some((tag) => activeTags.has(tag));
    const q = search.toLowerCase().trim();
    const matchesSearch = !q || t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q) || t.tags.some((tag) => tag.includes(q));
    return matchesTags && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Banner */}
      <Banner size="sm">
        <BannerImage gradient={MUSIC_GRADIENT} />
        <BannerContent>
          <BannerTitle>Sons e áudios</BannerTitle>
        </BannerContent>
      </Banner>

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
            placeholder="Buscar sons e músicas..."
          />
        </InputGroup>
        {showUpload && uploadConfig && (
          <Button variant="default" size="sm" className="shrink-0" onClick={() => setUploadOpen(true)}>
            <span>Upload</span>
          </Button>
        )}
      </div>

      {/* Tag filter */}
      <div className="flex flex-wrap gap-1.5 px-4 pb-2">
        <button
          onClick={() => handleToggleTag("__all__")}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            activeTags.size === 0
              ? "bg-white text-black"
              : "bg-[var(--surface-900)] text-[var(--surface-400)] hover:text-[var(--surface-200)]"
          }`}
        >
          Todos
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => handleToggleTag(tag)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              activeTags.has(tag)
                ? tag === "sfx"
                  ? "bg-amber-500 text-black"
                  : "bg-white text-black"
                : "bg-[var(--surface-900)] text-[var(--surface-400)] hover:text-[var(--surface-200)]"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Track list */}
      <div className="flex-1 overflow-auto pb-16 pt-[40px]">
        {filtered.map((track) => (
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
          />
        ))}
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
