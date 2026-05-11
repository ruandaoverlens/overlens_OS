// Browser-side data access for notifications.
// Uses fetch() against /api/notifications/* — keeps RLS server-side and consistent.

import type { Notification, NotificationRow } from "./types";
import { rowToNotification } from "./types";

export async function listNotifications(limit = 50): Promise<Notification[]> {
  const res = await fetch(`/api/notifications/list?limit=${limit}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Falha ao carregar notificações (${res.status})`);
  }
  const { items } = (await res.json()) as { items: NotificationRow[] };
  return (items ?? []).map(rowToNotification);
}

export async function markRead(id: string): Promise<void> {
  const res = await fetch(`/api/notifications/${encodeURIComponent(id)}/read`, {
    method: "PATCH",
  });
  if (!res.ok) {
    throw new Error(`Falha ao marcar como lida (${res.status})`);
  }
}

export async function markAllRead(): Promise<void> {
  const res = await fetch(`/api/notifications/mark-all-read`, { method: "POST" });
  if (!res.ok) {
    throw new Error(`Falha ao marcar tudo como lido (${res.status})`);
  }
}

export async function clearAll(): Promise<void> {
  const res = await fetch(`/api/notifications/clear`, { method: "POST" });
  if (!res.ok) {
    throw new Error(`Falha ao limpar notificações (${res.status})`);
  }
}
