"use client";

import React, { useRef, useEffect, useState } from "react";
import { useMusicPlayer } from "@/lib/music-player";
import { useFavorites } from "@/lib/favorites";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import {
  SmDownloadSolidIcon,
  SmStarLineIcon,
  SmStarSolidIcon,
  SmCloseLineIcon,
  SmPlaySolidIcon,
  SmSoundSolidIcon,
  SmMediumSoundSolidIcon,
  SmNoSoundSolidIcon,
} from "@/components/icons";
// Pause/SkipBack/SkipForward não têm equivalente na biblioteca de ícones (ver lucide-mapping.ts).
import { Pause, SkipBack, SkipForward } from "lucide-react";

/** Cor do texto (`--foreground`) resolvida do tema para pintar o canvas. */
function themeForeground(): string {
  if (typeof document === "undefined") return "#ffffff";
  const value = getComputedStyle(document.documentElement).getPropertyValue("--foreground").trim();
  return value || "#ffffff";
}

// ─── Format Time ─────────────────────────────────────────────

function formatTime(seconds: number): string {
  if (!isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─── Mini Waveform ───────────────────────────────────────────

function MiniWaveform({
  progress,
  duration,
  onSeek,
}: {
  progress: number;
  duration: number;
  onSeek: (pct: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const barsRef = useRef<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    barsRef.current = Array.from({ length: 300 }, () =>
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
    const gap = 1;
    const totalBarWidth = barWidth + gap;
    const barCount = Math.floor(w / totalBarWidth);

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = themeForeground();

    for (let i = 0; i < barCount; i++) {
      const barIndex = Math.floor((i / barCount) * bars.length);
      const x = i * totalBarWidth;
      const barH = bars[barIndex] * (h - 2);
      const y = (h - barH) / 2;
      const pct = (i + 1) / barCount;

      // Mesma cor do tema em duas intensidades: tocado vs. restante.
      ctx.globalAlpha = pct <= progress ? 0.8 : 0.1;

      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barH, 1);
      ctx.fill();
    }
  }, [progress]);

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

  return (
    <div
      ref={containerRef}
      role="slider"
      tabIndex={0}
      aria-label="Posição da faixa"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      aria-valuetext={`${formatTime(duration * progress)} de ${formatTime(duration)}`}
      className="flex-1 h-8 cursor-pointer rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-foreground"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <canvas ref={canvasRef} className="w-full h-full" aria-hidden="true" />
    </div>
  );
}

// ─── Now Playing Bar ─────────────────────────────────────────

export function NowPlayingBar() {
  const {
    activeTrack,
    isPlaying,
    progress,
    duration,
    volume,
    togglePlayPause,
    seekTrack,
    nextTrack,
    prevTrack,
    setVolume,
    closePlayer,
  } = useMusicPlayer();

  const { isFavorite, toggleFavorite: globalToggleFavorite } = useFavorites();
  const [volumeOpen, setVolumeOpen] = useState(false);
  const closeTimeoutRef = useRef<number | null>(null);

  const openVolume = () => {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setVolumeOpen(true);
  };

  const scheduleCloseVolume = () => {
    if (closeTimeoutRef.current) window.clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = window.setTimeout(() => setVolumeOpen(false), 120);
  };

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) window.clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  const barRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (!activeTrack) {
      root.style.setProperty("--now-playing-h", "0px");
      return;
    }
    const el = barRef.current;
    if (!el) return;
    const update = () => {
      root.style.setProperty("--now-playing-h", `${el.offsetHeight}px`);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      ro.disconnect();
      root.style.setProperty("--now-playing-h", "0px");
    };
  }, [activeTrack]);

  if (!activeTrack) return null;

  const VolumeIcon = volume === 0 ? SmNoSoundSolidIcon : volume < 0.5 ? SmMediumSoundSolidIcon : SmSoundSolidIcon;
  const favorited = isFavorite(activeTrack.id);

  return (
    <section
      ref={barRef}
      aria-label="Player de áudio"
      className="fixed bottom-0 left-0 right-0 z-40 bg-surface-950 border-t border-surface-900"
    >
      <div className="flex items-center gap-3 px-4 pt-2.5">
        {/* Prev */}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Faixa anterior"
          onClick={prevTrack}
          className="text-surface-400 hover:text-foreground shrink-0"
        >
          <SkipBack className="size-4 fill-current" />
        </Button>

        {/* Play/Pause */}
        <Button
          type="button"
          variant="inverted"
          size="icon"
          aria-label={isPlaying ? "Pausar" : "Reproduzir"}
          aria-pressed={isPlaying}
          onClick={togglePlayPause}
          // Botão principal do player: é o inverso do fundo (branco no escuro, preto no claro).
          className="rounded-full bg-foreground text-background hover:bg-foreground/90 motion-safe:hover:scale-105 transition-transform shrink-0"
        >
          {isPlaying ? (
            <Pause className="size-4 fill-current" />
          ) : (
            <SmPlaySolidIcon className="size-5" />
          )}
        </Button>

        {/* Next */}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Próxima faixa"
          onClick={nextTrack}
          className="text-surface-400 hover:text-foreground shrink-0"
        >
          <SkipForward className="size-4 fill-current" />
        </Button>

        {/* Track info */}
        <div className="min-w-0 flex-1" aria-live="polite">
          <p className="text-sm text-foreground font-medium truncate">
            {activeTrack.title}
          </p>
          <p className="text-xs text-surface-500 truncate">
            {activeTrack.artist}
          </p>
        </div>

        {/* Time */}
        <span className="text-xs text-surface-500 tabular-nums shrink-0">
          {formatTime(duration * progress)} / {formatTime(duration)}
        </span>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Volume */}
          <Popover open={volumeOpen} onOpenChange={setVolumeOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-surface-500 hover:text-foreground hover:bg-accent"
                onMouseEnter={openVolume}
                onMouseLeave={scheduleCloseVolume}
                onClick={() => setVolume(volume === 0 ? 1 : 0)}
                aria-label={volume === 0 ? "Ativar som" : "Silenciar"}
              >
                <VolumeIcon className="size-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              side="top"
              align="center"
              sideOffset={8}
              onOpenAutoFocus={(e) => e.preventDefault()}
              onMouseEnter={openVolume}
              onMouseLeave={scheduleCloseVolume}
              className="w-40 p-3 bg-surface-900 border border-surface-800"
            >
              <Slider
                aria-label="Volume"
                value={[volume * 100]}
                min={0}
                max={100}
                step={1}
                onValueChange={([v]) => setVolume(v / 100)}
              />
            </PopoverContent>
          </Popover>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={favorited ? "Remover dos favoritos" : "Salvar nos favoritos"}
                aria-pressed={favorited}
                className={`text-surface-500 hover:text-foreground hover:bg-accent ${
                  favorited ? "text-foreground" : ""
                }`}
                onClick={() => globalToggleFavorite({ id: activeTrack.id, type: "audio", title: activeTrack.title, subtitle: activeTrack.artist })}
              >
                {favorited ? <SmStarSolidIcon /> : <SmStarLineIcon />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">{favorited ? "Remover dos favoritos" : "Salvar nos favoritos"}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Baixar ${activeTrack.title}`}
                className="text-surface-500 hover:text-foreground hover:bg-accent"
                onClick={() => {
                  const a = document.createElement("a");
                  a.href = activeTrack.downloadUrl;
                  a.download = activeTrack.filename;
                  a.click();
                }}
              >
                <SmDownloadSolidIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Baixar arquivo</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-surface-500 hover:text-foreground hover:bg-accent"
                onClick={closePlayer}
                aria-label="Fechar player"
              >
                <SmCloseLineIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Fechar</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Waveform below */}
      <div className="px-4 pb-2.5 pt-1.5 flex">
        <MiniWaveform progress={progress} duration={duration} onSeek={seekTrack} />
      </div>
    </section>
  );
}
