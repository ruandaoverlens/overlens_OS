"use client";

import React, { useRef, useEffect } from "react";
import { useMusicPlayer } from "@/lib/music-player";
import { useFavorites } from "@/lib/favorites";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  SmDownloadSolidIcon,
  SmStarLineIcon,
  SmStarSolidIcon,
  SmPlaySolidIcon,
} from "@/components/icons";
import { Pause, SkipBack, SkipForward } from "lucide-react";

// ─── Mini Waveform ───────────────────────────────────────────

function MiniWaveform({
  progress,
  onSeek,
}: {
  progress: number;
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

    for (let i = 0; i < barCount; i++) {
      const barIndex = Math.floor((i / barCount) * bars.length);
      const x = i * totalBarWidth;
      const barH = bars[barIndex] * (h - 2);
      const y = (h - barH) / 2;
      const pct = (i + 1) / barCount;

      if (pct <= progress) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      } else {
        ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      }

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

  return (
    <div
      ref={containerRef}
      className="flex-1 h-8 cursor-pointer"
      onClick={handleClick}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}

// ─── Format Time ─────────────────────────────────────────────

function formatTime(seconds: number): string {
  if (!isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─── Now Playing Bar ─────────────────────────────────────────

export function NowPlayingBar() {
  const {
    activeTrack,
    isPlaying,
    progress,
    duration,
    togglePlayPause,
    seekTrack,
    nextTrack,
    prevTrack,
  } = useMusicPlayer();

  const { isFavorite, toggleFavorite: globalToggleFavorite } = useFavorites();

  if (!activeTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface-950)] border-t border-[var(--surface-900)]">
      <div className="flex items-center gap-3 px-4 pt-2.5">
        {/* Prev */}
        <button
          onClick={prevTrack}
          className="size-8 flex items-center justify-center text-[var(--surface-400)] hover:text-white transition-colors shrink-0"
        >
          <SkipBack className="size-4 fill-current" />
        </button>

        {/* Play/Pause */}
        <button
          onClick={togglePlayPause}
          className="size-10 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform shrink-0"
        >
          {isPlaying ? (
            <Pause className="size-4 text-black fill-black" />
          ) : (
            <SmPlaySolidIcon className="size-5 text-black" />
          )}
        </button>

        {/* Next */}
        <button
          onClick={nextTrack}
          className="size-8 flex items-center justify-center text-[var(--surface-400)] hover:text-white transition-colors shrink-0"
        >
          <SkipForward className="size-4 fill-current" />
        </button>

        {/* Track info */}
        <div className="min-w-0 flex-1">
          <p className="text-sm text-white font-medium truncate">
            {activeTrack.title}
          </p>
          <p className="text-xs text-[var(--surface-500)] truncate">
            {activeTrack.artist}
          </p>
        </div>

        {/* Time */}
        <span className="text-xs text-[var(--surface-500)] tabular-nums shrink-0">
          {formatTime(duration * progress)} / {formatTime(duration)}
        </span>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`text-[var(--surface-500)] hover:text-white hover:bg-white/10 ${
                    isFavorite(activeTrack.id) ? "text-white" : ""
                  }`}
                  onClick={() => globalToggleFavorite({ id: activeTrack.id, type: "audio", title: activeTrack.title, subtitle: activeTrack.artist })}
                >
                  {isFavorite(activeTrack.id) ? <SmStarSolidIcon /> : <SmStarLineIcon />}
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
          </TooltipProvider>
        </div>
      </div>

      {/* Waveform below */}
      <div className="px-4 pb-2.5 pt-1.5">
        <MiniWaveform progress={progress} onSeek={seekTrack} />
      </div>
    </div>
  );
}
