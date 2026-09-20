"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
import { notify } from "@/lib/notifications/toast";

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
  // Espelho do estado para rollback das atualizações otimistas.
  const itemsRef = useRef<Notification[]>([]);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

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
      notify.error("Não foi possível atualizar as notificações", {
        action: { label: "Tentar novamente", onClick: () => void refresh() },
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  /** Toast padrão de falha nas ações, com "Tentar novamente" → refresh. */
  const notifyFailure = useCallback(() => {
    notify.error("Não foi possível atualizar as notificações", {
      action: { label: "Tentar novamente", onClick: () => void refresh() },
    });
  }, [refresh]);

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

  const markRead = useCallback(
    async (id: string) => {
      // Otimista, com rollback em caso de erro.
      const previous = itemsRef.current;
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)),
      );
      try {
        await apiMarkRead(id);
      } catch (err) {
        console.error("[notifications] markRead failed:", err);
        setItems(previous);
        notifyFailure();
      }
    },
    [notifyFailure],
  );

  const markAllRead = useCallback(async () => {
    const now = new Date().toISOString();
    const previous = itemsRef.current;
    setItems((prev) => prev.map((n) => (n.readAt ? n : { ...n, readAt: now })));
    try {
      await apiMarkAllRead();
    } catch (err) {
      console.error("[notifications] markAllRead failed:", err);
      setItems(previous);
      notifyFailure();
    }
  }, [notifyFailure]);

  const clearAll = useCallback(async () => {
    const previous = itemsRef.current;
    setItems([]);
    try {
      await apiClearAll();
    } catch (err) {
      console.error("[notifications] clearAll failed:", err);
      setItems(previous);
      notifyFailure();
    }
  }, [notifyFailure]);

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
