"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

export type FavoriteType = "audio" | "video" | "logo" | "image" | "icon" | "color" | "typography" | "reference";

export interface FavoriteItem {
  id: string;
  type: FavoriteType;
  title: string;
  subtitle?: string;
  thumbnail?: string;
}

interface FavoritesState {
  items: FavoriteItem[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (item: FavoriteItem) => void;
  removeFavorite: (id: string) => void;
}

const FavoritesContext = createContext<FavoritesState | null>(null);

const STORAGE_KEY = "overlens-favorites";

function loadFavorites(): FavoriteItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveFavorites(items: FavoriteItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // quota exceeded — silently ignore
  }
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setItems(loadFavorites());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) saveFavorites(items);
  }, [items, mounted]);

  const isFavorite = useCallback(
    (id: string) => items.some((item) => item.id === id),
    [items]
  );

  const toggleFavorite = useCallback((item: FavoriteItem) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.id === item.id);
      if (exists) return prev.filter((i) => i.id !== item.id);
      return [...prev, item];
    });
  }, []);

  const removeFavorite = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  return (
    <FavoritesContext value={{ items, isFavorite, toggleFavorite, removeFavorite }}>
      {children}
    </FavoritesContext>
  );
}

export function useFavorites(): FavoritesState {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
