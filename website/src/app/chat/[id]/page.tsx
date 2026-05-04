import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  ChatExperience,
  type ChatMessageMeta,
} from "@/components/chat/chat-experience";
import type { ChatAttachment, UIMessage } from "@/lib/ai/types";
import type { ModelId } from "@/lib/ai/models";
import { resolveCitedTitle, resolveSources } from "@/lib/ai/sources";

function parseAttachments(value: unknown): ChatAttachment[] | null {
  if (!Array.isArray(value)) return null;
  const items: ChatAttachment[] = [];
  for (const raw of value) {
    if (
      raw &&
      typeof raw === "object" &&
      typeof (raw as ChatAttachment).name === "string" &&
      typeof (raw as ChatAttachment).contentType === "string" &&
      typeof (raw as ChatAttachment).url === "string"
    ) {
      items.push(raw as ChatAttachment);
    }
  }
  return items.length > 0 ? items : null;
}

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
    .select("id, role, content, cited_segments, routed_doc_ids, attachments")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  const initialMessages: UIMessage[] = (messages ?? []).map((m) => {
    const attachments = parseAttachments(m.attachments);
    const msg: UIMessage = {
      id: m.id as string,
      role: m.role as UIMessage["role"],
      content: m.content as string,
    };
    if (attachments) msg.experimental_attachments = attachments;
    return msg;
  });

  const initialMeta: Record<string, ChatMessageMeta> = {};
  for (const m of messages ?? []) {
    if (m.role === "user") {
      const title = resolveCitedTitle(m.cited_segments as string[] | null);
      const attachments = parseAttachments(m.attachments);
      if (title || attachments) {
        initialMeta[m.id as string] = {
          citedTitle: title ?? null,
          attachments: attachments ?? null,
        };
      }
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
