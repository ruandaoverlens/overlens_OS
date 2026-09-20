"use client";

import { useRef } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/empty-state";
import { SmVerifiedLineIcon, SmArrowOutwardLineIcon } from "@/components/icons";
import { JornadaNovaDialog } from "./jornada-nova-dialog";
import {
  JORNADA_PASSOS,
  JORNADA_STATUS_LABEL,
  JORNADA_STATUS_VARIANT,
  TOTAL_PASSOS,
} from "@/lib/registros/jornada";
import type { JornadaRow } from "@/lib/registros/jornada";
import { contem, useBuscaUrl } from "./_use-busca-url";
import { useSlashFocus } from "@/lib/use-slash-focus";
import { cn } from "@/lib/utils";

export function RegistrarListClient({ jornadas }: { jornadas: JornadaRow[] }) {
  const { search, setSearch, query, clear, pendente } = useBuscaUrl();
  const searchRef = useRef<HTMLInputElement>(null);
  useSlashFocus(searchRef);

  const filtradas = jornadas.filter((j) =>
    contem(query, j.nome_marca, j.titular, j.processo_numero, JORNADA_STATUS_LABEL[j.status]),
  );

  if (jornadas.length === 0) {
    return (
      <EmptyState
        icon={<SmVerifiedLineIcon />}
        title="Nenhum registro em andamento"
        description="Inicie o passo a passo do registro de uma marca: busca prévia, classes, GRU, depósito, RPI, exame e certificado."
        action={<JornadaNovaDialog />}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative max-w-sm">
        <Input
          ref={searchRef}
          type="search"
          size="sm"
          className="pr-10"
          aria-label="Buscar registros"
          aria-keyshortcuts="/"
          placeholder="Buscar por marca, titular ou status…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <kbd
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-border/60 bg-surface-900 px-1.5 text-caption font-mono text-muted-foreground sm:block"
        >
          /
        </kbd>
      </div>

      <span className="text-xs text-muted-foreground" aria-live="polite">
        {filtradas.length} {filtradas.length === 1 ? "registro" : "registros"}
      </span>

      {filtradas.length === 0 ? (
        <EmptyState
          icon={<SmVerifiedLineIcon />}
          title="Nenhum registro encontrado"
          description={`Nenhum registro corresponde a “${search.trim()}”.`}
          variant="filtered"
          onClear={clear}
        />
      ) : (
        <ul
          aria-busy={pendente || undefined}
          className={cn(
            "grid gap-3 transition-opacity sm:grid-cols-2",
            pendente && "opacity-60",
          )}
        >
          {filtradas.map((jornada) => {
            const concluidos =
              jornada.status === "concluida" ? TOTAL_PASSOS : jornada.passo_atual - 1;
            const passoAtual = JORNADA_PASSOS.find((p) => p.numero === jornada.passo_atual);
            const progresso = Math.round((concluidos / TOTAL_PASSOS) * 100);
            return (
              <li key={jornada.id}>
                <Link
                  href={`/registros/registrar/${jornada.id}`}
                  className="block h-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-foreground"
                >
                  <Card className="group h-full gap-3 transition-colors hover:bg-surface-900">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <span className="truncate text-lg font-medium">{jornada.nome_marca}</span>
                        <span className="text-xs text-muted-foreground">
                          {jornada.titular}
                          {jornada.classes ? ` · NCL ${jornada.classes}` : ""}
                          {jornada.processo_numero ? ` · Processo ${jornada.processo_numero}` : ""}
                        </span>
                      </div>
                      <SmArrowOutwardLineIcon
                        aria-hidden="true"
                        className="mt-1 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-muted-foreground">
                          {jornada.status === "em_andamento" && passoAtual
                            ? `Passo ${jornada.passo_atual} de ${TOTAL_PASSOS} — ${passoAtual.titulo}`
                            : `${concluidos} de ${TOTAL_PASSOS} passos concluídos`}
                        </span>
                        <Badge variant={JORNADA_STATUS_VARIANT[jornada.status]}>
                          {JORNADA_STATUS_LABEL[jornada.status]}
                        </Badge>
                      </div>
                      <Progress
                        value={progresso}
                        aria-label={`Progresso do registro de ${jornada.nome_marca}`}
                      />
                    </div>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
