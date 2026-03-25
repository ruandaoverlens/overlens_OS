"use client";

import { useState, useEffect } from "react";
import { createClient, waitForAuth } from "@/lib/supabase/client";
import {
  MagnyReviewPanel,
  type ReviewReport,
  type ReviewReportSection,
} from "@/components/magny/review-panel";
import { Separator } from "@/components/ui/separator";
import { Loader2, ClipboardCheck } from "lucide-react";

// ─── Component ─────────────────────────────────────────────

interface ReviewData {
  report: ReviewReport;
  sections: ReviewReportSection[];
}

export default function MagnyReviewPage() {
  const [data, setData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReviewReport() {
      try {
        await waitForAuth();
        const supabase = createClient();

        // Fetch the latest draft or in_review report
        const { data: reports, error: dbError } = await supabase
          .from("reports")
          .select("*, report_sections(*)")
          .in("status", ["draft", "in_review"])
          .order("created_at", { ascending: false })
          .limit(1);

        if (dbError) throw dbError;

        if (!reports || reports.length === 0) {
          setData(null);
          return;
        }

        const report = reports[0];
        setData({
          report: {
            id: report.id,
            slug: report.slug,
            title: report.title,
            status: report.status,
            week_start: report.week_start,
            week_end: report.week_end,
            published_at: report.published_at,
            review_notes: report.review_notes ?? null,
          },
          sections: (report.report_sections ?? []).sort(
            (a: ReviewReportSection, b: ReviewReportSection) =>
              a.order_index - b.order_index
          ),
        });
      } catch {
        setError("Erro ao carregar o relatório para revisão.");
      } finally {
        setLoading(false);
      }
    }

    fetchReviewReport();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-6 pt-12 pb-8 md:px-8">
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  // No report available for review
  if (!data) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 px-6 pt-4 pb-8 md:px-8 md:pt-5 md:pb-10">
        <div>
          <h1 className="font-heading text-[40px] font-normal uppercase tracking-normal leading-none text-balance text-foreground">
            Revisão
          </h1>
          <p className="mt-2 text-sm leading-7 text-pretty text-muted-foreground">
            Revise e aprove relatórios antes da publicação.
          </p>
        </div>
        <Separator />
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-accent/20 text-center">
          <div className="rounded-full bg-accent/50 p-4">
            <ClipboardCheck className="size-7 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Nenhum relatório pendente</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Não há relatórios aguardando revisão no momento.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <MagnyReviewPanel report={data.report} sections={data.sections} />;
}
