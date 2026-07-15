"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth, getRoleLabel, type UserRole } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// ─── Types (espelham /api/admin/insights) ──────────────────

interface Overview {
  totalMembers: number;
  activeUsers: number;
  totalConversations: number;
  totalMessages: number;
  userMessages: number;
  assistantMessages: number;
  msgsLast30d: number;
  totalTokensOut: number;
}
interface Member {
  userId: string;
  name: string;
  email: string;
  role: string;
  conversations: number;
  messages: number;
  questions: number;
  tokensOut: number;
  lastActive: string | null;
}
interface Topic {
  id: string;
  count: number;
  title: string;
  href: string | null;
}
interface Question {
  id: string;
  content: string;
  name: string;
  email: string;
  conversationId: string;
  createdAt: string;
}
interface Feedback {
  up: number;
  down: number;
  neutral: number;
  none: number;
}
interface InsightsData {
  overview: Overview;
  topMembers: Member[];
  topTopics: Topic[];
  feedback: Feedback;
  volumeByDay: { day: string; count: number }[];
  questions: Question[];
  query: string | null;
}

// ─── Helpers ───────────────────────────────────────────────

const nf = new Intl.NumberFormat("pt-BR");

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs font-medium text-muted-foreground">{label}</div>
        <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
        {hint && <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div>}
      </CardContent>
    </Card>
  );
}

// ─── Page ──────────────────────────────────────────────────

export default function AdminInsightsPage() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);

  const isAdmin = !!user && user.role === "admin";

  const load = useCallback(async (q?: string) => {
    const url = q ? `/api/admin/insights?q=${encodeURIComponent(q)}` : "/api/admin/insights";
    const res = await fetch(url);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? `Erro ${res.status}`);
    }
    return (await res.json()) as InsightsData;
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    load()
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [authLoading, isAdmin, load]);

  const runSearch = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSearching(true);
      setError(null);
      try {
        const d = await load(search.trim() || undefined);
        setData(d);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro na busca");
      } finally {
        setSearching(false);
      }
    },
    [load, search],
  );

  if (authLoading || loading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Carregando insights…
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
        <p className="text-sm font-medium">Acesso restrito</p>
        <p className="text-sm text-muted-foreground">
          Este painel é exclusivo para administradores.
        </p>
        <Link href="/docs" className="mt-2 text-sm text-primary hover:underline">
          Voltar ao Brand System
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
        <p className="text-sm font-medium text-destructive">Erro ao carregar</p>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const { overview: o } = data;
  const fb = data.feedback;
  const totalFb = fb.up + fb.down + fb.neutral;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Insights de IA</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          O que os {nf.format(o.totalMembers)} membros estão perguntando à Gemma e como usam o sistema.
        </p>
      </header>

      {/* Overview */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatTile label="Membros" value={nf.format(o.totalMembers)} hint={`${nf.format(o.activeUsers)} usaram a IA`} />
        <StatTile label="Conversas" value={nf.format(o.totalConversations)} />
        <StatTile label="Perguntas" value={nf.format(o.userMessages)} />
        <StatTile label="Respostas" value={nf.format(o.assistantMessages)} />
        <StatTile label="Msgs (30d)" value={nf.format(o.msgsLast30d)} />
        <StatTile label="Tokens gerados" value={nf.format(o.totalTokensOut)} />
      </section>

      <div className="mt-8">
        <Tabs defaultValue="perguntas">
          <TabsList>
            <TabsTrigger value="perguntas">Perguntas</TabsTrigger>
            <TabsTrigger value="membros">Membros</TabsTrigger>
            <TabsTrigger value="temas">Temas &amp; Feedback</TabsTrigger>
          </TabsList>

          {/* ── Perguntas ── */}
          <TabsContent value="perguntas" className="mt-4">
            <form onSubmit={runSearch} className="mb-4 flex gap-2">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar nas perguntas dos membros… (ex: posicionamento, tom de voz)"
                className="max-w-md"
              />
              <button
                type="submit"
                disabled={searching}
                className="rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {searching ? "Buscando…" : "Buscar"}
              </button>
              {data.query && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setSearching(true);
                    load()
                      .then(setData)
                      .catch((e) => setError(e.message))
                      .finally(() => setSearching(false));
                  }}
                  className="rounded-md border px-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Limpar
                </button>
              )}
            </form>

            <p className="mb-2 text-xs text-muted-foreground">
              {data.query
                ? `${data.questions.length} resultado(s) para "${data.query}"`
                : `${data.questions.length} perguntas mais recentes`}
            </p>

            <div className="space-y-2">
              {data.questions.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Nenhuma pergunta encontrada.
                </p>
              ) : (
                data.questions.map((q) => (
                  <Link
                    key={q.id}
                    href={`/admin/conversas/${q.conversationId}`}
                    className="block rounded-lg border p-3 transition-colors hover:bg-accent/50"
                  >
                    <p className="line-clamp-2 text-sm">{q.content}</p>
                    <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground/70">{q.name || q.email}</span>
                      <span>·</span>
                      <span>{fmtDate(q.createdAt)}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </TabsContent>

          {/* ── Membros ── */}
          <TabsContent value="membros" className="mt-4">
            <p className="mb-3 text-xs text-muted-foreground">
              Membros que mais usaram a IA (ordenado por perguntas feitas).
            </p>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Membro</TableHead>
                    <TableHead>Papel</TableHead>
                    <TableHead className="text-right">Perguntas</TableHead>
                    <TableHead className="text-right">Conversas</TableHead>
                    <TableHead className="text-right">Tokens</TableHead>
                    <TableHead className="text-right">Última atividade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.topMembers.map((m) => (
                    <TableRow key={m.userId}>
                      <TableCell>
                        <div className="font-medium">{m.name}</div>
                        <div className="text-xs text-muted-foreground">{m.email}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={m.role === "admin" ? "primary" : "outline"}>
                          {getRoleLabel(m.role as UserRole) ?? m.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{nf.format(m.questions)}</TableCell>
                      <TableCell className="text-right tabular-nums">{nf.format(m.conversations)}</TableCell>
                      <TableCell className="text-right tabular-nums">{nf.format(m.tokensOut)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{fmtDate(m.lastActive)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* ── Temas & Feedback ── */}
          <TabsContent value="temas" className="mt-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Temas mais consultados</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {data.topTopics.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Sem dados de roteamento ainda.</p>
                  ) : (
                    data.topTopics.map((t) => {
                      const max = data.topTopics[0]?.count || 1;
                      const pct = Math.round((t.count / max) * 100);
                      const inner = (
                        <>
                          <div className="flex items-center justify-between gap-2 text-sm">
                            <span className="truncate">{t.title}</span>
                            <span className="shrink-0 tabular-nums text-muted-foreground">{t.count}</span>
                          </div>
                          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-accent">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                          </div>
                        </>
                      );
                      return t.href ? (
                        <Link key={t.id} href={t.href} className="block transition-opacity hover:opacity-80">
                          {inner}
                        </Link>
                      ) : (
                        <div key={t.id}>{inner}</div>
                      );
                    })
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Qualidade das respostas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <div className="text-2xl font-semibold text-green-500">{nf.format(fb.up)}</div>
                      <div className="text-xs text-muted-foreground">👍 Positivos</div>
                    </div>
                    <div>
                      <div className="text-2xl font-semibold text-red-500">{nf.format(fb.down)}</div>
                      <div className="text-xs text-muted-foreground">👎 Negativos</div>
                    </div>
                    <div>
                      <div className="text-2xl font-semibold text-muted-foreground">{nf.format(fb.none)}</div>
                      <div className="text-xs text-muted-foreground">Sem avaliação</div>
                    </div>
                  </div>
                  {totalFb > 0 && (
                    <p className="mt-4 text-center text-xs text-muted-foreground">
                      Aprovação: {Math.round((fb.up / totalFb) * 100)}% das respostas avaliadas
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
