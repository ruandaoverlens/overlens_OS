"use client";

import { Suspense, useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useAuth, getRoleLabel, type UserRole, isStaffOrAdmin } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { notify } from "@/lib/notifications/toast";
import { useUrlState } from "@/lib/use-url-state";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { useSlashFocus } from "@/lib/use-slash-focus";
import { SmSearchLineIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

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

async function fetchInsights(q: string, signal: AbortSignal): Promise<InsightsData> {
  const url = q ? `/api/admin/insights?q=${encodeURIComponent(q)}` : "/api/admin/insights";
  const res = await fetch(url, { signal });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Erro ${res.status}`);
  }
  return (await res.json()) as InsightsData;
}

function isAbort(err: unknown): boolean {
  return err instanceof DOMException && err.name === "AbortError";
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

function InsightsSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="mx-auto max-w-6xl px-6 py-8"
    >
      <span className="sr-only">Carregando insights</span>
      <Skeleton className="h-8 w-48" />
      <Skeleton className="mt-2 h-4 w-80" />
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="mt-8 h-64" />
    </div>
  );
}

export default function AdminInsightsPage() {
  // `useUrlState` lê `useSearchParams`, que exige um limite de Suspense na rota.
  return (
    <Suspense fallback={<InsightsSkeleton />}>
      <AdminInsightsContent />
    </Suspense>
  );
}

function AdminInsightsContent() {
  const { user, loading: authLoading } = useAuth();
  const searchId = useId();
  const searchRef = useRef<HTMLInputElement>(null);
  useSlashFocus(searchRef);
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const canView = !!user && isStaffOrAdmin(user.role);

  // Busca: a URL (?q=) é a fonte de verdade; o input é local e vai para a URL
  // com debounce. Quando a URL muda (voltar/avançar, limpar), o input sincroniza.
  const [q, setQ] = useUrlState<string>("q", "");
  // A aba ativa vai para a URL para permitir link direto.
  const [tab, setTab] = useUrlState<string>("tab", "perguntas");
  const [search, setSearch] = useState(q);
  const [prevQ, setPrevQ] = useState(q);
  if (q !== prevQ) {
    setPrevQ(q);
    setSearch(q);
  }
  const debouncedSearch = useDebouncedValue(search, 250);
  useEffect(() => {
    if (search !== debouncedSearch) return; // ainda digitando
    if (debouncedSearch.trim() !== q) setQ(debouncedSearch.trim());
  }, [search, debouncedSearch, q, setQ]);

  // Carrega (ou refaz a busca) sempre que a query da URL muda. Requisições
  // anteriores são abortadas para não sobrescrever o resultado mais recente.
  useEffect(() => {
    if (authLoading) return;
    if (!canView) {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    const initial = data === null;
    if (initial) setLoading(true);
    else setSearching(true);
    setError(null);
    fetchInsights(q, controller.signal)
      .then((d) => setData(d))
      .catch((e) => {
        if (isAbort(e)) return;
        if (initial) setError(e instanceof Error ? e.message : "Erro ao carregar");
        else notify.fromError(e, "Erro na busca");
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        setLoading(false);
        setSearching(false);
      });
    return () => controller.abort();
    // `data` só decide se é carga inicial ou busca; não deve disparar o efeito.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, canView, q, reloadKey]);

  const clearSearch = useCallback(() => {
    setSearch("");
    setQ("");
  }, [setQ]);

  // Busca ao vivo (debounce de 250ms). O botão Buscar existe para dar alvo ao
  // submit e mostrar o estado: sem ele só o Enter funcionava e nada indicava
  // que uma requisição estava em voo.
  const runSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setQ(search.trim());
    },
    [search, setQ],
  );

  if (authLoading || loading) {
    return <InsightsSkeleton />;
  }

  if (!canView) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
        <p className="text-sm font-medium">Acesso restrito</p>
        <p className="text-sm text-muted-foreground">
          Este painel é exclusivo para a equipe.
        </p>
        <Link href="/docs" className="mt-2 text-sm text-primary hover:underline">
          Voltar ao Brand System
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <EmptyState
          variant="error"
          title="Erro ao carregar"
          description={error}
          onRetry={() => setReloadKey((k) => k + 1)}
        />
      </div>
    );
  }

  if (!data) return null;

  const { overview: o } = data;
  const fb = data.feedback;
  const totalFb = fb.up + fb.down + fb.neutral;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <PageHeader
        title="Insights de IA"
        description={`O que os ${nf.format(o.totalMembers)} membros estão perguntando à Gemma e como usam o sistema.`}
        className="mb-6"
      />

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
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="perguntas">Perguntas</TabsTrigger>
            <TabsTrigger value="membros">Membros</TabsTrigger>
            <TabsTrigger value="temas">Temas &amp; Feedback</TabsTrigger>
          </TabsList>

          {/* ── Perguntas ── */}
          <TabsContent value="perguntas" className="mt-4">
            <form onSubmit={runSearch} role="search" className="mb-4 flex flex-wrap items-center gap-2">
              <Label htmlFor={searchId} className="sr-only">
                Buscar nas perguntas dos membros
              </Label>
              <div className="relative flex-1 max-w-md">
                <Input
                  id={searchId}
                  ref={searchRef}
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar nas perguntas dos membros… (ex: posicionamento, tom de voz)"
                  aria-keyshortcuts="/"
                  className="pr-10"
                />
                <kbd
                  aria-hidden="true"
                  className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-border/60 bg-surface-900 px-1.5 text-caption font-mono text-muted-foreground sm:block"
                >
                  /
                </kbd>
              </div>
              <Button
                type="submit"
                variant="secondary"
                size="sm"
                loading={searching}
                loadingText="Buscando…"
              >
                <SmSearchLineIcon className="size-4" aria-hidden="true" />
                <span>Buscar</span>
              </Button>
              {(data.query || search) && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={searching}
                  onClick={clearSearch}
                >
                  Limpar
                </Button>
              )}
            </form>

            <p aria-live="polite" className="mb-2 text-xs text-muted-foreground">
              {searching
                ? "Buscando…"
                : data.query
                  ? `${data.questions.length} resultado(s) para "${data.query}"`
                  : `${data.questions.length} perguntas mais recentes`}
            </p>

            <div
              aria-busy={searching || undefined}
              className={cn("space-y-2 transition-opacity", searching && "opacity-60")}
            >
              {data.questions.length === 0 ? (
                <EmptyState
                  title="Nenhuma pergunta encontrada"
                  variant={data.query ? "filtered" : "empty"}
                  onClear={data.query ? clearSearch : undefined}
                />
              ) : (
                data.questions.map((q) => (
                  <Link
                    key={q.id}
                    href={`/admin/conversas/${q.conversationId}`}
                    className="block rounded-lg border p-3 transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
                  >
                    <p className="line-clamp-2 text-sm">{q.content}</p>
                    <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{q.name || q.email}</span>
                      <span aria-hidden="true">·</span>
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
                <TableCaption className="sr-only">Membros que mais usaram a IA</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col">Membro</TableHead>
                    <TableHead scope="col">Papel</TableHead>
                    <TableHead scope="col" className="text-right">Perguntas</TableHead>
                    <TableHead scope="col" className="text-right">Conversas</TableHead>
                    <TableHead scope="col" className="text-right">Tokens</TableHead>
                    <TableHead scope="col" className="text-right">Última atividade</TableHead>
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
                    <EmptyState
                      size="sm"
                      title="Sem dados de roteamento ainda"
                      description="Os temas aparecem conforme os membros conversam com a Gemma."
                    />
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
                        <Link key={t.id} href={t.href} className="block rounded-md transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground">
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
                  <div className="grid grid-cols-1 gap-3 text-center sm:grid-cols-3">
                    <div>
                      <div className="text-2xl font-semibold text-success">{nf.format(fb.up)}</div>
                      <div className="text-xs text-muted-foreground"><span aria-hidden="true">👍</span> Positivos</div>
                    </div>
                    <div>
                      <div className="text-2xl font-semibold text-destructive">{nf.format(fb.down)}</div>
                      <div className="text-xs text-muted-foreground"><span aria-hidden="true">👎</span> Negativos</div>
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
