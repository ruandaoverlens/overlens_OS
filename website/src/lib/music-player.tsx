"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
} from "react";
import { tracks, type Track } from "@/lib/musicas";

interface MusicPlayerState {
  activeTrack: Track | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  durations: Record<string, number>;
  favorites: Set<string>;
  playTrack: (track: Track) => void;
  pauseTrack: () => void;
  togglePlayPause: () => void;
  seekTrack: (pct: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  toggleFavorite: (id: string) => void;
  setDuration: (id: string, dur: number) => void;
}

const MusicPlayerContext = createContext<MusicPlayerState | null>(null);

export function useMusicPlayer() {
  const ctx = useContext(MusicPlayerContext);
  if (!ctx) throw new Error("useMusicPlayer must be used within MusicPlayerProvider");
  return ctx;
}

export function MusicPlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [durations, setDurations] = useState<Record<string, number>>({});
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const animRef = useRef<number>(0);

  const activeTrack = tracks.find((t) => t.id === activeTrackId) ?? null;
  const duration = activeTrackId ? (durations[activeTrackId] ?? 0) : 0;

  // Create audio element once on mount
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = "metadata";
    }
    return () => {
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  const updateProgress = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.duration) {
      setProgress(audio.currentTime / audio.duration);
    }
    animRef.current = requestAnimationFrame(updateProgress);
  }, []);

  const playTrack = useCallback(
    (track: Track) => {
      const audio = audioRef.current;
      if (!audio) return;

      if (activeTrackId === track.id) {
        audio.play();
        setIsPlaying(true);
        cancelAnimationFrame(animRef.current);
        animRef.current = requestAnimationFrame(updateProgress);
        return;
      }

      audio.src = track.src;
      audio.load();
      audio.play().catch(() => {});
      setActiveTrackId(track.id);
      setIsPlaying(true);
      setProgress(0);
      cancelAnimationFrame(animRef.current);
      animRef.current = requestAnimationFrame(updateProgress);
    },
    [activeTrackId, updateProgress]
  );

  const pauseTrack = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
    cancelAnimationFrame(animRef.current);
  }, []);

  const togglePlayPause = useCallback(() => {
    if (!activeTrack) return;
    if (isPlaying) {
      pauseTrack();
    } else {
      playTrack(activeTrack);
    }
  }, [activeTrack, isPlaying, pauseTrack, playTrack]);

  const seekTrack = useCallback((pct: number) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    audio.currentTime = pct * audio.duration;
    setProgress(pct);
  }, []);

  const nextTrack = useCallback(() => {
    if (!activeTrackId) return;
    const idx = tracks.findIndex((t) => t.id === activeTrackId);
    const next = tracks[(idx + 1) % tracks.length];
    if (next) playTrack(next);
  }, [activeTrackId, playTrack]);

  const prevTrack = useCallback(() => {
    if (!activeTrackId) return;
    const audio = audioRef.current;
    // If more than 3 seconds in, restart current track
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      setProgress(0);
      return;
    }
    const idx = tracks.findIndex((t) => t.id === activeTrackId);
    const prev = tracks[(idx - 1 + tracks.length) % tracks.length];
    if (prev) playTrack(prev);
  }, [activeTrackId, playTrack]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const setDuration = useCallback((id: string, dur: number) => {
    setDurations((prev) => ({ ...prev, [id]: dur }));
  }, []);

  // Wire up audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => {
      if (activeTrackId) {
        setDurations((prev) => ({ ...prev, [activeTrackId]: audio.duration }));
      }
    };

    const onEnded = () => {
      nextTrack();
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, [activeTrackId, nextTrack]);

  // Load durations for all tracks on mount
  useEffect(() => {
    const loadDurations = async () => {
      for (const track of tracks) {
        const tempAudio = new Audio();
        tempAudio.preload = "metadata";
        tempAudio.src = track.src;
        await new Promise<void>((resolve) => {
          tempAudio.onloadedmetadata = () => {
            setDurations((prev) => ({ ...prev, [track.id]: tempAudio.duration }));
            resolve();
          };
          tempAudio.onerror = () => resolve();
        });
      }
    };
    loadDurations();
  }, []);

  return (
    <MusicPlayerContext.Provider
      value={{
        activeTrack,
        isPlaying,
        progress,
        duration,
        durations,
        favorites,
        playTrack,
        pauseTrack,
        togglePlayPause,
        seekTrack,
        nextTrack,
        prevTrack,
        toggleFavorite,
        setDuration,
      }}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
}
