"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient, waitForAuth } from "@/lib/supabase/client";
import { MagnyReportHeader, type ReportStatus } from "@/components/magny/report-header";
import { MagnyReportContent, type ReportSection } from "@/components/magny/report-content";
import { Loader2 } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────

interface ReportData {
  id: string;
  slug: string;
  title: string;
  status: ReportStatus;
  week_start: string;
  week_end: string;
  published_at: string | null;
  cover_image_url: string | null;
  sections: ReportSection[];
}

// ─── Component ─────────────────────────────────────────────

export default function MagnyReportDetailPage() {
  const params = useParams<{ slug: string }>();
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReport() {
      try {
        await waitForAuth();
        const supabase = createClient();
        const { data, error: dbError } = await supabase
          .from("reports")
          .select("*, report_sections(*)")
          .eq("slug", params.slug)
          .single();

        if (dbError) throw dbError;

        setReport({
          id: data.id,
          slug: data.slug,
          title: data.title,
          status: data.status,
          week_start: data.week_start,
          week_end: data.week_end,
          published_at: data.published_at,
          cover_image_url: data.cover_image_url,
          sections: (data.report_sections ?? []).sort(
            (a: ReportSection, b: ReportSection) => a.order_index - b.order_index
          ),
        });
      } catch {
        setError("Relatório não encontrado.");
      } finally {
        setLoading(false);
      }
    }

    if (params.slug) {
      fetchReport();
    }
  }, [params.slug]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="mx-auto max-w-4xl px-6 pt-12 pb-8 md:px-8">
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
          <p className="text-sm text-destructive">
            {error ?? "Relatório não encontrado."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <MagnyReportHeader
        reportId={report.id}
        title={report.title}
        weekStart={report.week_start}
        weekEnd={report.week_end}
        status={report.status}
        publishedAt={report.published_at}
        coverImageUrl={report.cover_image_url}
      />
      <div className="mx-auto max-w-4xl px-6 pt-8 pb-12 md:px-8">
        <MagnyReportContent sections={report.sections} />
      </div>
    </div>
  );
}
