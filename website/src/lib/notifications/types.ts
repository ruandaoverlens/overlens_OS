// Domain types for the notifications subsystem.
// Mirror NotificationCardVariant in src/components/ui/notification-card.tsx.

export type NotifyVariant =
  | "follow"
  | "comment"
  | "post"
  | "like"
  | "mention"
  | "achievement"
  | "system";

export type NotifyCategory = "asset" | "reference" | "mycelium" | "system" | "social";

export interface Notification {
  id: string;
  userId: string;
  variant: NotifyVariant;
  category: NotifyCategory;
  title: string;
  description: string | null;
  coverUrl: string | null;
  actionUrl: string | null;
  entityType: string | null;
  entityId: string | null;
  metadata: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationRow {
  id: string;
  user_id: string;
  variant: NotifyVariant;
  category: NotifyCategory;
  title: string;
  description: string | null;
  cover_url: string | null;
  action_url: string | null;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

export interface CreateNotificationInput {
  userId: string;
  variant: NotifyVariant;
  category: NotifyCategory;
  title: string;
  description?: string;
  coverUrl?: string;
  actionUrl?: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

export function rowToNotification(row: NotificationRow): Notification {
  return {
    id: row.id,
    userId: row.user_id,
    variant: row.variant,
    category: row.category,
    title: row.title,
    description: row.description,
    coverUrl: row.cover_url,
    actionUrl: row.action_url,
    entityType: row.entity_type,
    entityId: row.entity_id,
    metadata: row.metadata ?? {},
    readAt: row.read_at,
    createdAt: row.created_at,
  };
}
