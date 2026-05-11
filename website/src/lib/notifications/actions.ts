// Server-side notification creation.
// Use APENAS em API routes / Server Actions — usa o admin client (service role).

import { createAdminClient } from "@/lib/supabase/admin";
import type { CreateNotificationInput, NotificationRow } from "./types";

/**
 * Insere uma notificação para um usuário específico.
 * Não tem policy de insert para 'authenticated' — service role é obrigatório.
 */
export async function createNotification(
  input: CreateNotificationInput,
): Promise<NotificationRow | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("notifications")
    .insert({
      user_id: input.userId,
      variant: input.variant,
      category: input.category,
      title: input.title,
      description: input.description ?? null,
      cover_url: input.coverUrl ?? null,
      action_url: input.actionUrl ?? null,
      entity_type: input.entityType ?? null,
      entity_id: input.entityId ?? null,
      metadata: input.metadata ?? {},
    })
    .select()
    .single();

  if (error) {
    console.error("[notifications] insert failed:", error.message);
    return null;
  }
  return data as NotificationRow;
}

/**
 * Cria várias notificações de uma vez (mesma `category`/`variant` para vários `userId`).
 * Útil para broadcasts a admins.
 */
export async function createNotifications(
  inputs: CreateNotificationInput[],
): Promise<number> {
  if (inputs.length === 0) return 0;
  const admin = createAdminClient();
  const rows = inputs.map((i) => ({
    user_id: i.userId,
    variant: i.variant,
    category: i.category,
    title: i.title,
    description: i.description ?? null,
    cover_url: i.coverUrl ?? null,
    action_url: i.actionUrl ?? null,
    entity_type: i.entityType ?? null,
    entity_id: i.entityId ?? null,
    metadata: i.metadata ?? {},
  }));
  const { error, count } = await admin.from("notifications").insert(rows, { count: "exact" });
  if (error) {
    console.error("[notifications] bulk insert failed:", error.message);
    return 0;
  }
  return count ?? rows.length;
}
