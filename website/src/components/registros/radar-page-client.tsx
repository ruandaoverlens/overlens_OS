"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { SmGraphicEqLineIcon } from "@/components/icons";
import { formatarData } from "@/lib/registros/types";
import {
  RADAR_EXECUCAO_STATUS_LABEL,
  RADAR_EXECUCAO_STATUS_VARIANT,
  RADAR_CANDIDATO_STATUS_LABEL,
  RADAR_CANDIDATO_STATUS_VARIANT,
  TIPO_MATCH_LABEL,
  TIPO_MATCH_VARIANT,
  type RadarExecucaoRow,
  type RadarCandidatoRow,
  type RadarCandidatoStatus,
} from "@/lib/registros/radar";

export interface CandidatoComContexto extends RadarCandidatoRow {
  nossaMarcaNome: string | null;
}

interface RadarPageClientProps {
  execucoes: RadarExecucaoRow[];
  candidatos: CandidatoComContexto[];
}

export function RadarPageClient({ execucoes, candidatos }: RadarPageClientProps) {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [revista, setRevista] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function handleRun() {
    setRunning(true);
    setMsg(null);
    try {
      const body: { revista?: number } = {};
      const n = parseInt(revista.trim(), 10);
      if (revista.trim() && Number.isFinite(n)) body.revista = n;

      const res = await fetch("/api/registros/radar/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao executar o radar");

      if (data.jaProcessada) {
        setMsg(`Revista ${data.rpi_numero} já processada.`);
      } else {
        setMsg(
          `RPI ${data.rpi_numero}: ${data.total_publicacoes ?? 0} publicações, ` +
            `${data.total_candidatos ?? 0} candidato(s).`,
        );
      }
      router.refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setRunning(false);
    }
  }

  async function changeStatus(id: string, status: RadarCandidatoStatus) {
    setBusyId(id);
    try {
      const res = await fetch("/api/registros/radar/candidatos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Erro ao atualizar");
      }
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao atualizar candidato");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          size="sm"
          className="w-40"
          placeholder="Nº da revista (opcional)"
          inputMode="numeric"
          value={revista}
          onChange={(e) => setRevista(e.target.value)}
        />
        <Button size="sm" onClick={handleRun} disabled={running}>
          {running ? "Executando…" : "Executar radar agora"}
        </Button>
        {msg && <span className="text-sm text-muted-foreground">{msg}</span>}
      </div>

      {/* Candidatos pendentes/alerta */}
      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Candidatos para revisão
        </h2>
        {candidatos.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia contained>
                <SmGraphicEqLineIcon />
              </EmptyMedia>
              <EmptyTitle>Nenhum candidato pendente</EmptyTitle>
              <EmptyDescription>
                Execute o radar para verificar as publicações mais recentes da RPI
                contra as marcas cadastradas.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="flex flex-col gap-2">
            {candidatos.map((c) => (
              <div
                key={c.id}
                className="flex flex-col gap-3 rounded-lg bg-[var(--surface-950)] px-4 py-3 sm:flex-row sm:items-start"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={TIPO_MATCH_VARIANT[c.tipo_match]}>
                      {TIPO_MATCH_LABEL[c.tipo_match]} · {c.score ?? "—"}
                    </Badge>
                    <Badge variant={RADAR_CANDIDATO_STATUS_VARIANT[c.status]}>
                      {RADAR_CANDIDATO_STATUS_LABEL[c.status]}
                    </Badge>
                    <span className="truncate text-sm font-medium">
                      {c.nossaMarcaNome ? `${c.nossaMarcaNome} × ` : ""}
                      {c.marca_texto ?? "—"}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {c.classe && <span>classe {c.classe}</span>}
                    {c.titular && <span>· {c.titular}</span>}
                    {c.processo_numero && <span>· proc. {c.processo_numero}</span>}
                  </div>
                  {c.resumo_ia && (
                    <p className="text-xs text-muted-foreground">{c.resumo_ia}</p>
                  )}
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-1">
                  {c.status !== "alerta" && (
                    <Button
                      size="sm"
                      disabled={busyId === c.id}
                      onClick={() => changeStatus(c.id, "alerta")}
                    >
                      Gerar alerta
                    </Button>
                  )}
                  {c.status !== "descartado" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={busyId === c.id}
                      onClick={() => changeStatus(c.id, "descartado")}
                    >
                      Descartar
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Histórico de execuções */}
      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Execuções recentes
        </h2>
        {execucoes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma execução ainda.</p>
        ) : (
          <div className="flex flex-col gap-1">
            {execucoes.map((e) => (
              <div
                key={e.id}
                className="flex flex-wrap items-center gap-3 rounded-lg bg-[var(--surface-950)] px-4 py-2 text-xs"
              >
                <Badge variant={RADAR_EXECUCAO_STATUS_VARIANT[e.status]}>
                  {RADAR_EXECUCAO_STATUS_LABEL[e.status]}
                </Badge>
                <span className="font-medium">RPI {e.rpi_numero}</span>
                <span className="text-muted-foreground">
                  {formatarData(e.executado_em)}
                </span>
                <span className="text-muted-foreground">
                  {e.total_publicacoes ?? 0} pub. · {e.total_candidatos ?? 0} cand.
                </span>
                {e.erro && <span className="text-destructive">{e.erro}</span>}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
