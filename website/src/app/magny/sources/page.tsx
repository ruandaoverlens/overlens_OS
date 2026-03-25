"use client";

import { useState, useEffect } from "react";
import { createClient, waitForAuth } from "@/lib/supabase/client";
import { MagnySourcesManager, type Source } from "@/components/magny/sources-manager";
import { Loader2 } from "lucide-react";

export default function MagnySourcesPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSources() {
      try {
        await waitForAuth();
        const supabase = createClient();
        const { data, error: dbError } = await supabase
          .from("sources")
          .select("*")
          .order("created_at", { ascending: false });

        if (dbError) throw dbError;
        setSources(data ?? []);
      } catch {
        setError("Erro ao carregar as fontes.");
      } finally {
        setLoading(false);
      }
    }

    fetchSources();
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

  return <MagnySourcesManager initialSources={sources} />;
}
