"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { nf, useInsights } from "../insights-context";

export default function AdminInsightsTopicsPage() {
  const { data } = useInsights();
  const fb = data.feedback;
  const totalFb = fb.up + fb.down + fb.neutral;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Temas mais consultados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.topTopics.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem dados de roteamento ainda.</p>
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
                <Link key={t.id} href={t.href} className="block transition-opacity hover:opacity-80">
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
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-2xl font-semibold text-green-500">{nf.format(fb.up)}</div>
              <div className="text-xs text-muted-foreground">👍 Positivos</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-red-500">{nf.format(fb.down)}</div>
              <div className="text-xs text-muted-foreground">👎 Negativos</div>
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
  );
}
