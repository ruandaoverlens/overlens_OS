"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { cn } from "@/lib/utils";
import {
  Check,
  X,
  Save,
  Loader2,
  Calendar,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────

export type ReviewStatus = "draft" | "in_review" | "approved" | "published";

export interface ReviewReportSection {
  id: string;
  section_key: string;
  title: string;
  content: string;
  order_index: number;
}

export interface ReviewReport {
  id: string;
  slug: string;
  title: string;
  status: ReviewStatus;
  week_start: string;
  week_end: string;
  published_at: string | null;
  review_notes: string | null;
}

interface ReviewPanelProps {
  report: ReviewReport;
  sections: ReviewReportSection[];
}

// ─── Helpers ───────────────────────────────────────────────

function formatWeekRange(weekStart: string, weekEnd: string): string {
  const start = new Date(weekStart + "T00:00:00");
  const end = new Date(weekEnd + "T00:00:00");

  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];

  const startDay = start.getDate();
  const endDay = end.getDate();
  const startMonth = months[start.getMonth()];
  const endMonth = months[end.getMonth()];
  const endYear = end.getFullYear();

  if (start.getMonth() === end.getMonth()) {
    return `${startDay} a ${endDay} de ${endMonth} de ${endYear}`;
  }
  return `${startDay} de ${startMonth} a ${endDay} de ${endMonth} de ${endYear}`;
}

const STATUS_LABELS: Record<ReviewStatus, string> = {
  draft: "Rascunho",
  in_review: "Em revisão",
  approved: "Aprovado",
  published: "Publicado",
};

const STATUS_BADGE_VARIANT: Record<
  ReviewStatus,
  { variant: "default" | "secondary" | "outline" | "success" | "warning" | "info" }
> = {
  draft: { variant: "outline" },
  in_review: { variant: "warning" },
  approved: { variant: "success" },
  published: { variant: "default" },
};

// ─── Component ─────────────────────────────────────────────

export function MagnyReviewPanel({ report, sections: initialSections }: ReviewPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [reviewNotes, setReviewNotes] = useState(report.review_notes ?? "");
  const [status, setStatus] = useState<ReviewStatus>(report.status as ReviewStatus);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const sorted = [...initialSections].sort((a, b) => a.order_index - b.order_index);

  const statusBadge = STATUS_BADGE_VARIANT[status] ?? { variant: "outline" as const };

  const hasUnsavedNotes = reviewNotes !== (report.review_notes ?? "");

  async function saveReview(overrides?: { status?: ReviewStatus }) {
    setIsSaving(true);
    setErrorMsg(null);

    try {
      const body: Record<string, unknown> = { review_notes: reviewNotes };
      if (overrides?.status) body.status = overrides.status;

      const res = await fetch(`/api/magny/reports/${report.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Erro ao salvar");
      }

      if (overrides?.status) setStatus(overrides.status);
      startTransition(() => router.refresh());
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleApprove() {
    await saveReview({ status: "approved" });
  }

  async function handleReject() {
    await saveReview({ status: "draft" });
  }

  async function handleSaveNotes() {
    await saveReview();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-6 pt-4 pb-8 md:px-8 md:pt-5 md:pb-10">
      {/* Report header */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="font-heading text-xl font-normal uppercase tracking-normal">
                {report.title}
              </CardTitle>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="size-3.5" />
                <span>Semana de {formatWeekRange(report.week_start, report.week_end)}</span>
              </div>
            </div>
            <Badge variant={statusBadge.variant}>
              {STATUS_LABELS[status] ?? status}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Error feedback */}
      {errorMsg && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
          <p className="text-sm text-destructive">{errorMsg}</p>
        </div>
      )}

      {/* Report content (read-only) */}
      <div className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Conteúdo do Relatório
        </h2>
        <Separator />
        {sorted.length === 0 ? (
          <div className="rounded-lg border border-border bg-accent/20 p-8 text-center text-sm text-muted-foreground">
            Nenhuma seção encontrada para este relatório.
          </div>
        ) : (
          sorted.map((section) => (
            <div
              key={section.id}
              className="rounded-lg border border-border"
            >
              {/* Section header */}
              <div className="border-b border-border px-4 py-3">
                <h3 className="text-sm font-semibold text-foreground">
                  {section.title}
                </h3>
              </div>
              {/* Section body */}
              <div className="px-4 py-4">
                <MarkdownRenderer content={section.content} />
              </div>
            </div>
          ))
        )}
      </div>

      <Separator />

      {/* Review notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notas de Revisão</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            className="min-h-[120px] resize-y"
            placeholder="Adicione notas sobre esta revisão..."
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            aria-label="Notas de revisão"
          />
        </CardContent>
      </Card>

      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border px-4 py-4">
        {/* Save notes */}
        {hasUnsavedNotes && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveNotes}
            disabled={isSaving || isPending}
          >
            {isSaving ? "Salvando..." : "Salvar notas"}
          </Button>
        )}

        <div className="flex-1" />

        {/* Reject (send back to draft) */}
        {status === "in_review" && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReject}
            disabled={isSaving || isPending}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            {isSaving ? "Processando..." : "Rejeitar"}
          </Button>
        )}

        {/* Approve */}
        {status !== "approved" && status !== "published" && (
          <Button
            size="sm"
            onClick={handleApprove}
            disabled={isSaving || isPending}
          >
            {isSaving ? "Processando..." : "Aprovar"}
          </Button>
        )}

        {status === "published" && (
          <span className="text-sm text-muted-foreground">
            Este relatório já foi publicado.
          </span>
        )}

        {status === "approved" && (
          <span className="text-sm text-muted-foreground">
            Este relatório foi aprovado.
          </span>
        )}
      </div>
    </div>
  );
}
