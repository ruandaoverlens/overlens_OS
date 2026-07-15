import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveCitedTitle, resolveSources } from "@/lib/ai/sources";
import { UserMessage } from "@/components/chat/user-message";
import { AssistantMessage } from "@/components/chat/assistant-message";
import { SmArrowBackLineIcon } from "@/components/icons";
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

/**
 * Visão read-only de uma conversa de qualquer membro, para admins.
 * As tabelas de chat têm RLS por dono, então a leitura usa o service role
 * depois de confirmar que quem acessa é admin.
 */
export default async function AdminConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || profile.role !== "admin") notFound();

  const admin = createAdminClient();
  const { data: conversation } = await admin
    .from("chat_conversations")
    .select("id, user_id, title, created_at")
    .eq("id", id)
    .maybeSingle();
  if (!conversation) notFound();

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

  const createdAt = new Date(conversation.created_at as string).toLocaleDateString(
    "pt-BR",
    { day: "2-digit", month: "long", year: "numeric" },
  );

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <Link
        href="/admin/insights"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <SmArrowBackLineIcon className="size-4" />
        <span>Insights de IA</span>
      </Link>

      <header className="mt-6 mb-10">
        <h1 className="text-2xl font-semibold tracking-tight">
          {conversation.title as string}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {owner?.name ?? "Membro desconhecido"}
          {owner?.email ? ` · ${owner.email}` : ""} · {createdAt} · visão somente
          leitura
        </p>
      </header>

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
