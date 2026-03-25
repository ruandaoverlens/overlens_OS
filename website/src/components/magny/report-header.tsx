"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Send,
  ClipboardCheck,
  Loader2,
  Calendar,
  Trash2,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────

export type ReportStatus = "draft" | "in_review" | "approved" | "published";

interface MagnyReportHeaderProps {
  reportId: string;
  title: string;
  weekStart: string;
  weekEnd: string;
  status: ReportStatus;
  publishedAt: string | null;
  coverImageUrl?: string | null;
  onStatusChange?: (newStatus: ReportStatus) => void;
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

function formatPublishedDate(publishedAt: string): string {
  const date = new Date(publishedAt);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

const STATUS_LABELS: Record<ReportStatus, string> = {
  draft: "Rascunho",
  in_review: "Em revisão",
  approved: "Aprovado",
  published: "Publicado",
};

const STATUS_BADGE_VARIANT: Record<
  ReportStatus,
  { variant: "default" | "secondary" | "outline" | "success" | "warning" | "info"; className?: string }
> = {
  draft: { variant: "outline" },
  in_review: {
    variant: "warning",
  },
  approved: {
    variant: "success",
  },
  published: { variant: "default" },
};

// ─── Component ─────────────────────────────────────────────

export function MagnyReportHeader({
  reportId,
  title,
  weekStart,
  weekEnd,
  status,
  publishedAt,
  coverImageUrl,
  onStatusChange,
}: MagnyReportHeaderProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [currentStatus, setCurrentStatus] = useState<ReportStatus>(status);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const weekRange = formatWeekRange(weekStart, weekEnd);
  const badgeConfig = STATUS_BADGE_VARIANT[currentStatus] ?? { variant: "outline" as const };

  async function handlePublish() {
    setIsPublishing(true);
    try {
      const res = await fetch(`/api/magny/reports/${reportId}/publish`, {
        method: "POST",
      });
      if (res.ok) {
        setCurrentStatus("published");
        onStatusChange?.("published");
        startTransition(() => router.refresh());
      }
    } catch {
      // silent fail — user can retry
    } finally {
      setIsPublishing(false);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/magny/reports/${reportId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        startTransition(() => router.push("/magny/reports"));
      }
    } catch {
      // silent fail
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  }

  async function handleSendToReview() {
    setIsReviewing(true);
    try {
      const res = await fetch(`/api/magny/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "in_review" }),
      });
      if (res.ok) {
        setCurrentStatus("in_review");
        onStatusChange?.("in_review");
        startTransition(() => router.refresh());
      }
    } catch {
      // silent fail
    } finally {
      setIsReviewing(false);
    }
  }

  return (
    <header className="bg-background">
      {/* Cover image hero */}
      {coverImageUrl && (
        <div className="relative h-56 w-full overflow-hidden sm:h-72 md:h-80">
          <img
            src={coverImageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
      )}
      <div className="mx-auto max-w-4xl px-6 md:px-8">
        {/* Report title section */}
        <div className={cn("pb-8", coverImageUrl ? "-mt-16 relative z-10 pt-0" : "pt-4")}>
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <Badge variant={badgeConfig.variant} className={cn(badgeConfig.className)}>
              {STATUS_LABELS[currentStatus]}
            </Badge>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="size-3.5" />
              <span>Semana de {weekRange}</span>
            </div>
            {publishedAt && (
              <span className="text-xs text-muted-foreground">
                Publicado em {formatPublishedDate(publishedAt)}
              </span>
            )}
          </div>

          <h1 className="font-heading text-[40px] font-normal uppercase tracking-normal leading-none text-balance text-foreground">
            {title}
          </h1>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {currentStatus === "draft" && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSendToReview}
                disabled={isReviewing || isPending}
              >
                {isReviewing ? "Enviando..." : "Enviar para Revisão"}
              </Button>
            )}

            {currentStatus !== "published" && (
              <Button
                size="sm"
                onClick={handlePublish}
                disabled={isPublishing || isPending}
              >
                {isPublishing ? "Publicando..." : "Publicar"}
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              className={cn(
                confirmDelete
                  ? "border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  : "text-muted-foreground"
              )}
              onClick={handleDelete}
              onBlur={() => setConfirmDelete(false)}
              disabled={isDeleting || isPending}
            >
              {isDeleting
                ? "Apagando..."
                : confirmDelete
                  ? "Confirmar exclusão"
                  : "Apagar"}
            </Button>
          </div>
        </div>
      </div>
      <Separator />
    </header>
  );
}
