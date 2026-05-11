"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth";
import {
  clearAll as apiClearAll,
  listNotifications,
  markAllRead as apiMarkAllRead,
  markRead as apiMarkRead,
} from "./client";
import { rowToNotification, type Notification, type NotificationRow } from "./types";

interface NotificationsContextValue {
  items: Notification[];
  unreadCount: number;
  loading: boolean;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  clearAll: () => Promise<void>;
  refresh: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [supabase] = useState(() => createClient());
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const list = await listNotifications();
      setItems(list);
    } catch (err) {
      console.error("[notifications] refresh failed:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial load + reload on user change
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Realtime: assina mudanças na própria fila do usuário
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const row = payload.new as NotificationRow;
          setItems((prev) => {
            if (prev.some((n) => n.id === row.id)) return prev;
            return [rowToNotification(row), ...prev];
          });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const row = payload.new as NotificationRow;
          setItems((prev) => prev.map((n) => (n.id === row.id ? rowToNotification(row) : n)));
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const row = payload.old as NotificationRow;
          setItems((prev) => prev.filter((n) => n.id !== row.id));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase]);

  const markRead = useCallback(async (id: string) => {
    // Optimistic
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)),
    );
    try {
      await apiMarkRead(id);
    } catch (err) {
      console.error("[notifications] markRead failed:", err);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    const now = new Date().toISOString();
    setItems((prev) => prev.map((n) => (n.readAt ? n : { ...n, readAt: now })));
    try {
      await apiMarkAllRead();
    } catch (err) {
      console.error("[notifications] markAllRead failed:", err);
    }
  }, []);

  const clearAll = useCallback(async () => {
    setItems([]);
    try {
      await apiClearAll();
    } catch (err) {
      console.error("[notifications] clearAll failed:", err);
    }
  }, []);

  const unreadCount = useMemo(() => items.filter((n) => !n.readAt).length, [items]);

  const value = useMemo<NotificationsContextValue>(
    () => ({ items, unreadCount, loading, markRead, markAllRead, clearAll, refresh }),
    [items, unreadCount, loading, markRead, markAllRead, clearAll, refresh],
  );

  return (
    <NotificationsContext value={value}>{children}</NotificationsContext>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}
