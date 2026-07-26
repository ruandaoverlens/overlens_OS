"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CLASSES_COMUNS_OVERLENS } from "@/lib/registros/jornada";
import type { JornadaRow, AnaliseResultado, AnaliseTermo } from "@/lib/registros/jornada";

type Analise = AnaliseResultado;

const TIPO_TERMO_LABEL: Record<AnaliseTermo["tipo"], string> = {
  fonetica: "Semelhança fonética",
  grafica: "Semelhança gráfica",
  ideologica: "Semelhança ideológica",
};

const TIPO_TERMO_ORDEM: AnaliseTermo["tipo"][] = ["fonetica", "grafica", "ideologica"];

async function pedirAnalise(
  jornadaId: string,
  modo: "termos" | "classes",
  objetivo?: string,
): Promise<Analise> {
  const res = await fetch("/api/registros/jornadas/analise-nome", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jornadaId, modo, ...(objetivo ? { objetivo } : {}) }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Erro ao gerar análise");
  return data.analise as Analise;
}

/** Passo 1 — sugestão de termos de pesquisa para a busca de anterioridade. */
export function JornadaTermosPesquisa({ jornada }: { jornada: JornadaRow }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analise, setAnalise] = useState<Analise | null>(
    jornada.analise?.termos ?? null,
  );

  async function handleGerar() {
    setLoading(true);
    setError(null);
    try {
      setAnalise(await pedirAnalise(jornada.id, "termos"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg bg-[var(--surface-950)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">
            Termos de pesquisa para “{jornada.nome_marca}”
          </span>
          <p className="text-xs text-muted-foreground">
            Variações fonéticas, gráficas e ideológicas geradas com IA (Gemma)
            para guiar a busca de anterioridade. Sugestões são indicativas.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleGerar}
          disabled={loading}
        >
          {loading
            ? "Gerando…"
            : analise
              ? "Gerar novamente"
              : "Sugerir termos de pesquisa"}
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {analise && (
        <div className="flex flex-col gap-4 border-t border-[var(--surface-800)] pt-4">
          {TIPO_TERMO_ORDEM.map((tipo) => {
            const termos = analise.termos.filter((t) => t.tipo === tipo);
            if (termos.length === 0) return null;
            return (
              <div key={tipo} className="flex flex-col gap-1.5">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {TIPO_TERMO_LABEL[tipo]}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {termos.map((t) => (
                    <a
                      key={`${tipo}-${t.termo}`}
                      href={`/registros/busca?nome=${encodeURIComponent(t.termo)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={t.motivo || "Abrir na Busca da plataforma"}
                    >
                      <Badge
                        variant="secondary"
                        className="cursor-pointer transition-colors hover:bg-[var(--surface-800)]"
                      >
                        {t.termo}
                      </Badge>
                    </a>
                  ))}
                </div>
              </div>
            );
          })}

          {analise.observacoes && (
            <p className="text-xs text-muted-foreground">{analise.observacoes}</p>
          )}

          <p className="text-xs text-muted-foreground">
            Clique num termo para abri-lo na Busca da plataforma.
          </p>
        </div>
      )}
    </div>
  );
}

/** Passo 2 — classes comuns da Overlens e sugestão de classes pelo objetivo. */
export function JornadaSugestaoClasses({ jornada }: { jornada: JornadaRow }) {
  const [objetivo, setObjetivo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analise, setAnalise] = useState<Analise | null>(
    jornada.analise?.classes ?? null,
  );

  async function handleSugerir() {
    if (!objetivo.trim()) {
      setError("Descreva o objetivo do registro para gerar as sugestões.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setAnalise(await pedirAnalise(jornada.id, "classes", objetivo.trim()));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg bg-[var(--surface-950)] p-4">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium">Apoio à escolha de classes</span>
        <p className="text-xs text-muted-foreground">
          Descreva o objetivo do registro e receba sugestões de classes de Nice
          geradas com IA (Gemma). Sugestões são indicativas — confirme na
          classificação oficial.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Classes comuns da Overlens
        </span>
        <div className="flex flex-wrap gap-1.5">
          {CLASSES_COMUNS_OVERLENS.map((c) => (
            <Badge key={c.classe} variant="outline" title={c.uso}>
              NCL {c.classe} · {c.uso}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Qual o objetivo do registro?</Label>
        <div className="flex flex-wrap gap-2">
          <Input
            size="sm"
            className="min-w-56 flex-1"
            value={objetivo}
            onChange={(e) => setObjetivo(e.target.value)}
            placeholder="Ex.: proteger o nome da escola e da plataforma de cursos online"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSugerir();
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSugerir}
            disabled={loading}
          >
            {loading ? "Analisando…" : analise ? "Gerar novamente" : "Sugerir classes"}
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {analise && (
        <div className="flex flex-col gap-4 border-t border-[var(--surface-800)] pt-4">
          {analise.classes.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Classes sugeridas para o objetivo
              </span>
              <div className="flex flex-col gap-1">
                {analise.classes.map((c) => (
                  <div key={c.classe} className="flex items-baseline gap-2 text-sm">
                    <Badge variant="info">NCL {c.classe}</Badge>
                    <span>
                      {c.titulo}
                      {c.motivo && (
                        <span className="text-muted-foreground"> — {c.motivo}</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analise.observacoes && (
            <p className="text-xs text-muted-foreground">{analise.observacoes}</p>
          )}
        </div>
      )}
    </div>
  );
}
