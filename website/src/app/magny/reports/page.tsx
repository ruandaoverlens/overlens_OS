"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient, waitForAuth } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Calendar,
  ArrowRight,
  Loader2,
  Trash2,
  LayoutGrid,
  List,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────

interface Report {
  id: string;
  slug: string;
  title: string;
  status: string;
  week_start: string;
  week_end: string;
  published_at: string | null;
  cover_image_url: string | null;
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

type FilterStatus = "all" | "draft" | "in_review" | "published";
type ViewMode = "cards" | "list";

const FILTER_OPTIONS: { value: FilterStatus; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "draft", label: "Rascunhos" },
  { value: "in_review", label: "Em Revisão" },
  { value: "published", label: "Publicados" },
];

const GRADIENTS = [
  "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)",
  "linear-gradient(135deg, #0f172a 0%, #4a2c2a 50%, #0f172a 100%)",
  "linear-gradient(135deg, #0f172a 0%, #2a3a2a 50%, #0f172a 100%)",
  "linear-gradient(135deg, #0f172a 0%, #3a2a4a 50%, #0f172a 100%)",
];

function getGradient(index: number): string {
  return GRADIENTS[index % GRADIENTS.length];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── Component ─────────────────────────────────────────────

export default function MagnyReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReports() {
      try {
        await waitForAuth();
        const supabase = createClient();
        const { data, error: dbError } = await supabase
          .from("reports")
          .select("id, slug, title, status, week_start, week_end, published_at, cover_image_url")
          .order("created_at", { ascending: false });

        if (dbError) throw dbError;
        setReports(data ?? []);
      } catch {
        setError("Erro ao carregar relatórios. Tente novamente.");
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, []);

  async function handleDelete(reportId: string) {
    if (confirmDeleteId !== reportId) {
      setConfirmDeleteId(reportId);
      return;
    }
    setDeletingId(reportId);
    try {
      const res = await fetch(`/api/magny/reports/${reportId}`, { method: "DELETE" });
      if (res.ok) {
        setReports((prev) => prev.filter((r) => r.id !== reportId));
      }
    } catch {
      // silent fail
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  }

  const filtered =
    filter === "all"
      ? reports
      : reports.filter((r) => r.status === filter);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 pt-4 pb-8 md:px-8 md:pt-5 md:pb-10">
      {/* Page header */}
      <div>
        <h1 className="font-heading text-[40px] font-normal uppercase tracking-normal leading-none text-balance text-foreground">
          Relatórios
        </h1>
        <p className="mt-2 text-sm leading-7 text-pretty text-muted-foreground">
          Todos os relatórios de pesquisa de mercado gerados pelo Magny.
        </p>
      </div>

      <Separator />

      {/* Filter tabs + view toggle */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {FILTER_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              variant={filter === opt.value ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
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

      {/* Empty state */}
      {!loading && !error && filtered.length === 0 && (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-accent/20 text-center">
          <div className="rounded-full bg-accent/50 p-4">
            <FileText className="size-7 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Nenhum relatório encontrado</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {filter !== "all"
                ? "Tente alterar o filtro acima."
                : "Execute o pipeline para gerar o primeiro relatório."}
            </p>
          </div>
        </div>
      )}

      {/* Card view */}
      {!loading && !error && filtered.length > 0 && viewMode === "cards" && (
        <MediaCardGrid>
          {filtered.map((report, i) => (
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
                    className={report.status === "published" ? "bg-white text-black hover:bg-white/90 text-[10px]" : "text-[10px]"}
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
      )}

      {/* List view */}
      {!loading && !error && filtered.length > 0 && viewMode === "list" && (
        <div className="flex flex-col gap-4">
          {filtered.map((report) => (
            <Card key={report.id} className="overflow-hidden transition-shadow hover:shadow-md">
              {report.cover_image_url && (
                <div className="relative h-40 w-full">
                  <img
                    src={report.cover_image_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <CardTitle className="font-heading text-xl font-normal uppercase tracking-normal">
                      {report.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1.5">
                      <Calendar className="size-3.5" />
                      <span>
                        {formatDate(report.week_start)} &mdash;{" "}
                        {formatDate(report.week_end)}
                      </span>
                    </CardDescription>
                  </div>
                  <Badge
                    variant={STATUS_BADGE_VARIANT[report.status] ?? "outline"}
                  >
                    {STATUS_LABELS[report.status] ?? report.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  {report.published_at && (
                    <span className="text-xs text-muted-foreground">
                      Publicado em {formatDate(report.published_at)}
                    </span>
                  )}
                  <div className="ml-auto flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className={
                        confirmDeleteId === report.id
                          ? "border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          : ""
                      }
                      onClick={() => handleDelete(report.id)}
                      onBlur={() => setConfirmDeleteId(null)}
                      disabled={deletingId === report.id}
                    >
                      {deletingId === report.id
                        ? "Apagando..."
                        : confirmDeleteId === report.id
                          ? "Confirmar exclusão"
                          : "Apagar"}
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/magny/reports/${report.slug}`}>
                        Ver relatório
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
