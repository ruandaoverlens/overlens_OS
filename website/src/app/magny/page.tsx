"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient, waitForAuth } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  MediaCard,
  MediaCardImage,
  MediaCardBadge,
  MediaCardContent,
  MediaCardTitle,
  MediaCardMeta,
  MediaCardMetaItem,
  MediaCardGrid,
} from "@/components/ui/media-card";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Workflow,
  Rss,
  Play,
  Loader2,
  Calendar,
  ArrowRight,
  LayoutGrid,
  List,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────

interface ReportSummary {
  id: string;
  slug: string;
  title: string;
  status: string;
  week_start: string;
  week_end: string;
  published_at: string | null;
  cover_image_url: string | null;
}

interface DashboardData {
  totalReports: number;
  publishedReports: ReportSummary[];
  activeSources: number;
  lastPipelineRun: string | null;
}

// ─── Helpers ───────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  draft: "Rascunho",
  in_review: "Em revisão",
  approved: "Aprovado",
  published: "Publicado",
};

const STATUS_BADGE_VARIANT: Record<string, "default" | "secondary" | "outline" | "success" | "warning" | "info"> = {
  draft: "outline",
  in_review: "warning",
  approved: "success",
  published: "default",
};

type ViewMode = "cards" | "list";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── Gradient fallback for reports without cover image ─────

const GRADIENTS = [
  "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)",
  "linear-gradient(135deg, #0f172a 0%, #4a2c2a 50%, #0f172a 100%)",
  "linear-gradient(135deg, #0f172a 0%, #2a3a2a 50%, #0f172a 100%)",
  "linear-gradient(135deg, #0f172a 0%, #3a2a4a 50%, #0f172a 100%)",
];

function getGradient(index: number): string {
  return GRADIENTS[index % GRADIENTS.length];
}

// ─── Component ─────────────────────────────────────────────

export default function MagnyDashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("cards");

  useEffect(() => {
    async function fetchDashboard() {
      try {
        await waitForAuth();
        const supabase = createClient();
        const [reportsRes, sourcesRes, pipelineRes] = await Promise.all([
          supabase
            .from("reports")
            .select("id, slug, title, status, week_start, week_end, published_at, cover_image_url")
            .order("created_at", { ascending: false })
            .limit(20),
          supabase
            .from("sources")
            .select("id", { count: "exact", head: true })
            .eq("is_active", true),
          supabase
            .from("pipeline_runs")
            .select("started_at")
            .order("started_at", { ascending: false })
            .limit(1),
        ]);

        const reports = reportsRes.data ?? [];
        const published = reports
          .filter((r) => r.status === "published")
          .sort((a, b) => {
            const aDate = a.published_at ?? a.week_end;
            const bDate = b.published_at ?? b.week_end;
            return new Date(bDate).getTime() - new Date(aDate).getTime();
          });
        const lastRun = pipelineRes.data?.[0]?.started_at ?? null;

        setData({
          totalReports: reports.length,
          publishedReports: published,
          activeSources: sourcesRes.count ?? 0,
          lastPipelineRun: lastRun,
        });
      } catch {
        setError("Erro ao carregar o dashboard. Tente novamente.");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 pt-4 pb-8 md:px-8 md:pt-5 md:pb-10">
      {/* Page header */}
      <div>
        <h1 className="font-heading text-[40px] font-normal uppercase tracking-normal leading-none text-balance text-foreground">
          Magny
        </h1>
        <p className="mt-2 text-sm leading-7 text-pretty text-muted-foreground">
          Pesquisa de mercado automatizada. Acompanhe relatórios, pipeline e fontes.
        </p>
      </div>

      <Separator />

      {/* Loading state */}
      {loading && (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Dashboard content */}
      {data && !loading && (
        <>
          {/* Quick actions */}
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm" asChild>
              <Link href="/magny/pipeline">
                Pipeline
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/magny/reports">
                Ver Relatórios
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/magny/sources">
                Gerenciar Fontes
              </Link>
            </Button>
          </div>

          {/* Quick stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <CardDescription>Total de Relatórios</CardDescription>
                <CardTitle className="text-2xl tabular-nums">
                  {data.totalReports}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <FileText className="size-3" />
                  <span>relatórios gerados</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardDescription>Última Execução</CardDescription>
                <CardTitle className="text-2xl tabular-nums">
                  {data.lastPipelineRun
                    ? formatDate(data.lastPipelineRun)
                    : "--"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Workflow className="size-3" />
                  <span>pipeline</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardDescription>Fontes Ativas</CardDescription>
                <CardTitle className="text-2xl tabular-nums">
                  {data.activeSources}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Rss className="size-3" />
                  <span>fontes cadastradas</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Published reports feed */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Pesquisas Publicadas
              </h2>
              <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
                <button
                  onClick={() => setViewMode("cards")}
                  className={`rounded-md p-1.5 transition-colors ${
                    viewMode === "cards"
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  aria-label="Visualização em cards"
                >
                  <LayoutGrid className="size-3.5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`rounded-md p-1.5 transition-colors ${
                    viewMode === "list"
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  aria-label="Visualização em lista"
                >
                  <List className="size-3.5" />
                </button>
              </div>
            </div>
            <Separator />
            {data.publishedReports.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-accent/20 px-4 py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Nenhuma pesquisa publicada ainda.
                </p>
              </div>
            ) : viewMode === "cards" ? (
              <MediaCardGrid>
                {data.publishedReports.map((report, i) => (
                  <MediaCard
                    key={report.id}
                    onClick={() => router.push(`/magny/reports/${report.slug}`)}
                  >
                    <MediaCardImage
                      src={report.cover_image_url ?? undefined}
                      gradient={!report.cover_image_url ? getGradient(i) : undefined}
                      alt={report.title}
                    >
                      <MediaCardBadge>
                        <Badge
                          variant={STATUS_BADGE_VARIANT[report.status] ?? "outline"}
                          className={`text-[10px] ${report.status === "published" ? "bg-white text-black hover:bg-white/90" : ""}`}
                        >
                          {STATUS_LABELS[report.status] ?? report.status}
                        </Badge>
                      </MediaCardBadge>
                    </MediaCardImage>
                    <MediaCardContent>
                      <MediaCardTitle>{report.title}</MediaCardTitle>
                      <MediaCardMeta>
                        <MediaCardMetaItem>
                          {formatDate(report.week_start)} — {formatDate(report.week_end)}
                        </MediaCardMetaItem>
                      </MediaCardMeta>
                    </MediaCardContent>
                  </MediaCard>
                ))}
              </MediaCardGrid>
            ) : (
              <div className="flex flex-col gap-4">
                {data.publishedReports.map((report) => (
                  <Card key={report.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <CardTitle className="font-heading text-xl font-normal uppercase tracking-normal">
                          {report.title}
                        </CardTitle>
                        <Badge variant={STATUS_BADGE_VARIANT[report.status] ?? "outline"}>
                          {STATUS_LABELS[report.status] ?? report.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Calendar className="size-3.5" />
                        <span>
                          {formatDate(report.week_start)} &mdash;{" "}
                          {formatDate(report.week_end)}
                        </span>
                      </div>
                      {report.published_at && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Publicado em {formatDate(report.published_at)}
                        </p>
                      )}
                      <div className="mt-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/magny/reports/${report.slug}`}>
                            Ver relatório
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
