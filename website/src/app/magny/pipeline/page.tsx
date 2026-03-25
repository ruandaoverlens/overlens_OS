"use client";

import { useState, useEffect } from "react";
import { createClient, waitForAuth } from "@/lib/supabase/client";
import { PipelineStatus, type PipelineRun } from "@/components/magny/pipeline-status";
import { Loader2 } from "lucide-react";

export default function MagnyPipelinePage() {
  const [runs, setRuns] = useState<PipelineRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRuns() {
      try {
        await waitForAuth();
        const supabase = createClient();
        const { data, error: dbError } = await supabase
          .from("pipeline_runs")
          .select("*, pipeline_steps(*)")
          .eq("archived", false)
          .order("created_at", { ascending: false })
          .limit(20);

        if (dbError) throw dbError;
        setRuns(data ?? []);
      } catch {
        setError("Erro ao carregar as execuções do pipeline.");
      } finally {
        setLoading(false);
      }
    }

    fetchRuns();
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

  return <PipelineStatus runs={runs} />;
}
