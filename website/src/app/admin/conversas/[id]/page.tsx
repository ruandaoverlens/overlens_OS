import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isStaffOrAdmin } from "@/lib/route-access";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveCitedTitle, resolveSources } from "@/lib/ai/sources";
import { UserMessage } from "@/components/chat/user-message";
import { AssistantMessage } from "@/components/chat/assistant-message";
import { PageHeader } from "@/components/page-header";
import type { ChatAttachment } from "@/lib/ai/types";

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

type ConversationRow = {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
};

/**
 * Cabeçalho da conversa, só para staff/admin. As tabelas de chat têm RLS
 * por dono, então a leitura usa o service role depois de confirmar o role.
 * `cache()` compartilha o resultado entre `generateMetadata` e a página.
 */
const getConversation = cache(async (id: string): Promise<ConversationRow | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || !isStaffOrAdmin(profile.role)) return null;

  const admin = createAdminClient();
  const { data: conversation } = await admin
    .from("chat_conversations")
    .select("id, user_id, title, created_at")
    .eq("id", id)
    .maybeSingle();
  return (conversation as ConversationRow | null) ?? null;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const conversation = await getConversation(id);
  return { title: conversation?.title || "Conversa" };
}

/** Visão read-only de uma conversa de qualquer membro, para admins. */
export default async function AdminConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const conversation = await getConversation(id);
  if (!conversation) notFound();

  const admin = createAdminClient();

  const [{ data: owner }, { data: messages }] = await Promise.all([
    admin
      .from("profiles")
      .select("name, email")
      .eq("id", conversation.user_id)
      .maybeSingle(),
    admin
      .from("chat_messages")
      .select("id, role, content, cited_segments, routed_doc_ids, attachments")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true }),
  ]);

  const createdAt = new Date(conversation.created_at).toLocaleDateString(
    "pt-BR",
    { day: "2-digit", month: "long", year: "numeric" },
  );

  const description = [
    owner?.name ?? "Membro desconhecido",
    owner?.email,
    createdAt,
    "visão somente leitura",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <PageHeader
        title={conversation.title}
        description={description}
        backHref="/admin/insights"
        backLabel="Insights de IA"
        className="mb-6"
      />

      <div>
        {(messages ?? [])
          .filter((m) => m.role === "user" || m.role === "assistant")
          .map((m) =>
            m.role === "user" ? (
              <UserMessage
                key={m.id as string}
                content={m.content as string}
                citedTitle={resolveCitedTitle(m.cited_segments as string[] | null)}
                attachments={parseAttachments(m.attachments)}
              />
            ) : (
              <AssistantMessage
                key={m.id as string}
                messageId={m.id as string}
                content={m.content as string}
                sources={resolveSources(m.routed_doc_ids as string[] | null)}
                readOnly
              />
            ),
          )}
      </div>
    </div>
  );
}
