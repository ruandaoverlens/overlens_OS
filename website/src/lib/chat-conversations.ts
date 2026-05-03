import { createClient } from "@/lib/supabase/server";
import type { ChatConversationLink } from "@/components/doc-sidebar";

export async function getChatConversations(): Promise<ChatConversationLink[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: rows } = await supabase
    .from("chat_conversations")
    .select("id, title, updated_at")
    .order("updated_at", { ascending: false })
    .limit(50);

  return (rows ?? []).map((r) => ({
    id: r.id as string,
    title: r.title as string,
  }));
}
