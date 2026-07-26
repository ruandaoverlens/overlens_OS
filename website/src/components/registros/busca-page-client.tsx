"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { SmSearchLineIcon } from "@/components/icons";
import { TIPO_MATCH_LABEL, TIPO_MATCH_VARIANT } from "@/lib/registros/radar";

type Veredicto =
  | "indisponivel"
  | "risco_alto"
  | "risco_medio"
  | "provavelmente_disponivel";

interface ResultadoItem {
  origem: "local" | "inpi_live";
  processoNumero: string;
  marca: string;
  situacao: string | null;
  titular: string | null;
  classes: string[];
  tipoMatch: "exato" | "fonetico" | "edicao";
  score: number;
}

interface ResultadoDisponibilidade {
  nome: string;
  veredicto: Veredicto;
  fontes: {
    local: { consultada: boolean; total: number };
    inpiLive: { consultada: boolean; total: number; motivo?: string };
  };
  resultados: ResultadoItem[];
}

const VEREDICTO_LABEL: Record<Veredicto, string> = {
  indisponivel: "Indisponível",
  risco_alto: "Risco alto",
  risco_medio: "Risco médio",
  provavelmente_disponivel: "Provavelmente disponível",
};

const VEREDICTO_VARIANT: Record<
  Veredicto,
  "destructive" | "warning" | "success"
> = {
  indisponivel: "destructive",
  risco_alto: "destructive",
  risco_medio: "warning",
  provavelmente_disponivel: "success",
};

const VEREDICTO_DESCRICAO: Record<Veredicto, string> = {
  indisponivel:
    "Foi encontrado um registro idêntico ou muito próximo, ativo, em classe conflitante.",
  risco_alto:
    "Há marcas semelhantes registradas ou em processo que podem gerar colidência.",
  risco_medio:
    "Existem ocorrências parecidas, mas com diferenças que podem afastar o risco.",
  provavelmente_disponivel:
    "Não foram encontradas ocorrências relevantes nas fontes consultadas.",
};

const ORIGEM_LABEL: Record<ResultadoItem["origem"], string> = {
  local: "Base local",
  inpi_live: "INPI ao vivo",
};

function parseClasses(raw: string): string[] {
  return Array.from(
    new Set(
      raw
        .split(/[,;\s]+/)
        .map((c) => c.trim())
        .filter(Boolean),
    ),
  );
}

function formatarScore(score: number): string {
  const pct = score <= 1 ? score * 100 : score;
  return `${Math.round(pct)}%`;
}

export function BuscaPageClient({
  initialNome = "",
  initialClasses = "",
}: {
  initialNome?: string;
  initialClasses?: string;
}) {
  const [nome, setNome] = useState(initialNome);
  const [classesInput, setClassesInput] = useState(initialClasses);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ResultadoDisponibilidade | null>(
    null,
  );

  const classes = parseClasses(classesInput);

  function removerClasse(classe: string) {
    setClassesInput(classes.filter((c) => c !== classe).join(", "));
  }

  async function handleBuscar() {
    const nomeTrim = nome.trim();
    if (!nomeTrim) {
      setError("Informe o nome da marca para verificar.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/registros/marcas/busca", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nomeTrim,
          ...(classes.length > 0 ? { classes } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Erro ao verificar disponibilidade");
      }
      setResultado(data as ResultadoDisponibilidade);
    } catch (err) {
      setResultado(null);
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 rounded-lg bg-[var(--surface-950)] p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex min-w-56 flex-1 flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Nome da marca
            </span>
            <Input
              size="sm"
              placeholder="Ex.: Overlens"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleBuscar();
              }}
            />
          </div>
          <div className="flex min-w-56 flex-1 flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Classes de Nice (opcional)
            </span>
            <Input
              size="sm"
              placeholder="Ex.: 09, 35, 41, 42"
              value={classesInput}
              onChange={(e) => setClassesInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleBuscar();
              }}
            />
          </div>
          <Button size="sm" onClick={handleBuscar} disabled={loading}>
            {loading ? "Verificando…" : "Verificar disponibilidade"}
          </Button>
        </div>
        {classes.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {classes.map((c) => (
              <Badge
                key={c}
                variant="outline"
                className="cursor-pointer"
                onClick={() => removerClasse(c)}
                title="Remover"
              >
                classe {c} ×
              </Badge>
            ))}
          </div>
        )}
        {error && <span className="text-sm text-destructive">{error}</span>}
      </div>

      {!resultado ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia contained>
              <SmSearchLineIcon />
            </EmptyMedia>
            <EmptyTitle>Nenhuma verificação ainda</EmptyTitle>
            <EmptyDescription>
              Informe o nome de uma marca para cruzar com a base local de
              processos e, quando disponível, com a consulta ao vivo do INPI.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Veredicto */}
          <div className="flex flex-col gap-2 rounded-lg bg-[var(--surface-950)] p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={VEREDICTO_VARIANT[resultado.veredicto]}>
                {VEREDICTO_LABEL[resultado.veredicto]}
              </Badge>
              <span className="text-sm font-medium">
                &ldquo;{resultado.nome}&rdquo;
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {VEREDICTO_DESCRICAO[resultado.veredicto]}
            </p>
            <p className="text-xs text-muted-foreground">
              Esta análise é indicativa. A colidência real depende de análise
              jurídica — a decisão final é sempre humana.
            </p>
            {!resultado.fontes.inpiLive.consultada && (
              <p className="text-xs text-warning">
                Consulta ao vivo ao INPI indisponível
                {resultado.fontes.inpiLive.motivo
                  ? ` (${resultado.fontes.inpiLive.motivo})`
                  : ""}
                — mostrando apenas a base local.
              </p>
            )}
          </div>

          {/* Resultados */}
          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Ocorrências encontradas
            </h2>
            {resultado.resultados.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia contained>
                    <SmSearchLineIcon />
                  </EmptyMedia>
                  <EmptyTitle>Nenhuma ocorrência relevante</EmptyTitle>
                  <EmptyDescription>
                    Não foram encontradas marcas semelhantes nas fontes
                    consultadas.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="flex flex-col gap-2">
                {resultado.resultados.map((r, i) => (
                  <div
                    key={`${r.origem}-${r.processoNumero}-${i}`}
                    className="flex flex-col gap-3 rounded-lg bg-[var(--surface-950)] px-4 py-3 sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">
                          {ORIGEM_LABEL[r.origem]}
                        </Badge>
                        <Badge variant={TIPO_MATCH_VARIANT[r.tipoMatch]}>
                          {TIPO_MATCH_LABEL[r.tipoMatch]}
                        </Badge>
                        <span className="truncate text-sm font-medium">
                          {r.marca}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {r.processoNumero && <span>proc. {r.processoNumero}</span>}
                        {r.titular && <span>· {r.titular}</span>}
                        {r.situacao && <span>· {r.situacao}</span>}
                        {r.classes.length > 0 && (
                          <span>· classes {r.classes.join(", ")}</span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 text-right text-xs text-muted-foreground">
                      score {formatarScore(r.score)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Fontes consultadas */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>
              Base local: {resultado.fontes.local.consultada
                ? `${resultado.fontes.local.total} resultado(s)`
                : "não consultada"}
            </span>
            <span>
              INPI ao vivo: {resultado.fontes.inpiLive.consultada
                ? `${resultado.fontes.inpiLive.total} resultado(s)`
                : "não consultada"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
