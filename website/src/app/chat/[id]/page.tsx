import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  ChatExperience,
  type ChatMessageMeta,
} from "@/components/chat/chat-experience";
import type { UIMessage } from "@/lib/ai/types";
import type { ModelId } from "@/lib/ai/models";
import { resolveCitedTitle, resolveSources } from "@/lib/ai/sources";

export default async function ChatConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: conversation } = await supabase
    .from("chat_conversations")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!conversation) notFound();

  const { data: messages } = await supabase
    .from("chat_messages")
    .select("id, role, content, cited_segments, routed_doc_ids")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  const initialMessages: UIMessage[] = (messages ?? []).map((m) => ({
    id: m.id as string,
    role: m.role as UIMessage["role"],
    content: m.content as string,
  }));

  const initialMeta: Record<string, ChatMessageMeta> = {};
  for (const m of messages ?? []) {
    if (m.role === "user") {
      const title = resolveCitedTitle(m.cited_segments as string[] | null);
      if (title) initialMeta[m.id as string] = { citedTitle: title };
    } else if (m.role === "assistant") {
      const sources = resolveSources(m.routed_doc_ids as string[] | null);
      if (sources.length > 0) initialMeta[m.id as string] = { sources };
    }
  }

  // If the last user message has cited_segments, surface it so the auto-reload
  // can re-attach the citation when triggering the first assistant response.
  let initialCitedSegments: string[] | null = null;
  for (let i = (messages ?? []).length - 1; i >= 0; i--) {
    const m = messages![i];
    if (m.role !== "user") continue;
    const seg = m.cited_segments as string[] | null;
    if (seg && seg.length > 0) initialCitedSegments = seg;
    break;
  }

  return (
    <ChatExperience
      conversationId={id}
      model={conversation.model as ModelId}
      planMode={conversation.plan_mode as boolean}
      initialMessages={initialMessages}
      initialCitedSegments={initialCitedSegments}
      initialMeta={initialMeta}
    />
  );
}
