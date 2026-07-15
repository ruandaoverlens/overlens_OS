"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import {
  InsightsProvider,
  nf,
  type InsightsData,
} from "./insights-context";

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

// O fetch mora no layout (não nas páginas) para o resultado sobreviver à
// navegação entre Perguntas/Membros/Temas — layouts não remontam.
export default function AdminInsightsLayout({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  const reload = useCallback(
    async (q?: string) => {
      setSearching(true);
      setError(null);
      try {
        const d = await load(q);
        setData(d);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro na busca");
      } finally {
        setSearching(false);
      }
    },
    [load],
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

  if (error && !data) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
        <p className="text-sm font-medium text-destructive">Erro ao carregar</p>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const o = data.overview;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Insights de IA</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          O que os {nf.format(o.totalMembers)} membros estão perguntando à Gemma e como usam o sistema.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatTile label="Membros" value={nf.format(o.totalMembers)} hint={`${nf.format(o.activeUsers)} usaram a IA`} />
        <StatTile label="Conversas" value={nf.format(o.totalConversations)} />
        <StatTile label="Perguntas" value={nf.format(o.userMessages)} />
        <StatTile label="Respostas" value={nf.format(o.assistantMessages)} />
        <StatTile label="Msgs (30d)" value={nf.format(o.msgsLast30d)} />
        <StatTile label="Tokens gerados" value={nf.format(o.totalTokensOut)} />
      </section>

      <div className="mt-8">
        <InsightsProvider value={{ data, reload, searching }}>
          {children}
        </InsightsProvider>
      </div>
    </div>
  );
}
