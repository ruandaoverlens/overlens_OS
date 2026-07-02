import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveSources } from "@/lib/ai/sources";
import type { SupabaseClient } from "@supabase/supabase-js";

export const maxDuration = 60;

/**
 * GET /api/admin/insights
 *
 * Painel de inteligência do uso da IA (Gemma) e das conversas.
 * ADMIN-ONLY. As tabelas de chat têm RLS por usuário, então a agregação
 * roda com o service role (admin client) para enxergar todo o histórico.
 *
 * Query params:
 *   q — busca full-text nas perguntas dos membros (opcional)
 *
 * O volume atual é pequeno (~milhares de linhas), então agregamos em JS.
 * Se crescer muito, migrar para RPCs SQL com GROUP BY.
 */

type Profile = { id: string; name: string | null; email: string | null; role: string };
type Conversation = { id: string; user_id: string; created_at: string };
type Message = {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  tokens_out: number | null;
  feedback: number | null;
  routed_doc_ids: string[] | null;
  created_at: string;
};

/** Busca todas as linhas de uma tabela contornando o cap de 1000 do PostgREST. */
async function fetchAll<T>(
  admin: SupabaseClient,
  table: string,
  columns: string,
): Promise<T[]> {
  const PAGE = 1000;
  const MAX = 200_000;
  const rows: T[] = [];
  for (let from = 0; from < MAX; from += PAGE) {
    const { data, error } = await admin
      .from(table)
      .select(columns)
      .order("created_at", { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) throw new Error(`${table}: ${error.message}`);
    if (!data || data.length === 0) break;
    rows.push(...(data as T[]));
    if (data.length < PAGE) break;
  }
  return rows;
}

export async function GET(request: NextRequest) {
  try {
    // Auth: precisa ser admin. Checagem com o client de sessão do usuário.
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    // Agregação com service role (bypassa RLS por-usuário do chat).
    const admin = createAdminClient();
    const [profiles, conversations, messages] = await Promise.all([
      fetchAll<Profile>(admin, "profiles", "id, name, email, role"),
      fetchAll<Conversation>(admin, "chat_conversations", "id, user_id, created_at"),
      fetchAll<Message>(
        admin,
        "chat_messages",
        "id, conversation_id, role, content, tokens_out, feedback, routed_doc_ids, created_at",
      ),
    ]);

    const profileById = new Map(profiles.map((p) => [p.id, p]));
    const convById = new Map(conversations.map((c) => [c.id, c]));

    // ── Overview ──────────────────────────────────────────────
    const now = Date.now();
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
    const userMessages = messages.filter((m) => m.role === "user");
    const assistantMessages = messages.filter((m) => m.role === "assistant");
    const msgsLast30d = messages.filter(
      (m) => now - new Date(m.created_at).getTime() < THIRTY_DAYS,
    ).length;
    const totalTokensOut = assistantMessages.reduce(
      (sum, m) => sum + (m.tokens_out ?? 0),
      0,
    );
    const activeUsers = new Set(conversations.map((c) => c.user_id)).size;

    // ── Top membros por uso da IA ─────────────────────────────
    type MemberAgg = {
      userId: string;
      name: string;
      email: string;
      role: string;
      conversations: number;
      messages: number;
      questions: number;
      tokensOut: number;
      lastActive: string | null;
    };
    const memberMap = new Map<string, MemberAgg>();
    function ensureMember(userId: string): MemberAgg {
      let m = memberMap.get(userId);
      if (!m) {
        const p = profileById.get(userId);
        m = {
          userId,
          name: p?.name ?? "—",
          email: p?.email ?? "",
          role: p?.role ?? "—",
          conversations: 0,
          messages: 0,
          questions: 0,
          tokensOut: 0,
          lastActive: null,
        };
        memberMap.set(userId, m);
      }
      return m;
    }
    for (const c of conversations) {
      ensureMember(c.user_id).conversations += 1;
    }
    for (const msg of messages) {
      const conv = convById.get(msg.conversation_id);
      if (!conv) continue;
      const m = ensureMember(conv.user_id);
      m.messages += 1;
      if (msg.role === "user") m.questions += 1;
      if (msg.role === "assistant") m.tokensOut += msg.tokens_out ?? 0;
      if (!m.lastActive || msg.created_at > m.lastActive) {
        m.lastActive = msg.created_at;
      }
    }
    const topMembers = [...memberMap.values()]
      .sort((a, b) => b.questions - a.questions)
      .slice(0, 25);

    // ── Temas mais consultados (routed_doc_ids) ───────────────
    const docCounts = new Map<string, number>();
    for (const m of assistantMessages) {
      for (const id of m.routed_doc_ids ?? []) {
        docCounts.set(id, (docCounts.get(id) ?? 0) + 1);
      }
    }
    const resolved = resolveSources([...docCounts.keys()]);
    const titleById = new Map(resolved.map((r) => [r.id, r]));
    const topTopics = [...docCounts.entries()]
      .map(([id, count]) => ({
        id,
        count,
        title: titleById.get(id)?.title ?? id,
        href: titleById.get(id)?.href ?? null,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    // ── Feedback ──────────────────────────────────────────────
    const feedback = { up: 0, down: 0, neutral: 0, none: 0 };
    for (const m of assistantMessages) {
      if (m.feedback === 1) feedback.up += 1;
      else if (m.feedback === -1) feedback.down += 1;
      else if (m.feedback === 0) feedback.neutral += 1;
      else feedback.none += 1;
    }

    // ── Volume por dia (últimos 30 dias) ──────────────────────
    const dayCounts = new Map<string, number>();
    for (const m of messages) {
      const t = new Date(m.created_at).getTime();
      if (now - t >= THIRTY_DAYS) continue;
      const day = m.created_at.slice(0, 10); // YYYY-MM-DD
      dayCounts.set(day, (dayCounts.get(day) ?? 0) + 1);
    }
    const volumeByDay = [...dayCounts.entries()]
      .map(([day, count]) => ({ day, count }))
      .sort((a, b) => a.day.localeCompare(b.day));

    // ── Perguntas: busca (q) ou mais recentes ─────────────────
    const q = request.nextUrl.searchParams.get("q")?.trim().toLowerCase();
    function toQuestion(m: Message) {
      const conv = convById.get(m.conversation_id);
      const p = conv ? profileById.get(conv.user_id) : undefined;
      return {
        id: m.id,
        content: m.content,
        name: p?.name ?? "—",
        email: p?.email ?? "",
        conversationId: m.conversation_id,
        createdAt: m.created_at,
      };
    }
    let questions;
    if (q && q.length > 0) {
      questions = userMessages
        .filter((m) => m.content.toLowerCase().includes(q))
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .slice(0, 100)
        .map(toQuestion);
    } else {
      questions = [...userMessages]
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .slice(0, 40)
        .map(toQuestion);
    }

    return NextResponse.json({
      overview: {
        totalMembers: profiles.length,
        activeUsers,
        totalConversations: conversations.length,
        totalMessages: messages.length,
        userMessages: userMessages.length,
        assistantMessages: assistantMessages.length,
        msgsLast30d,
        totalTokensOut,
      },
      topMembers,
      topTopics,
      feedback,
      volumeByDay,
      questions,
      query: q ?? null,
    });
  } catch (err) {
    console.error("[admin:insights] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao gerar insights" },
      { status: 500 },
    );
  }
}
