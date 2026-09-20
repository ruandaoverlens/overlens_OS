"use client";

import { useRef } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { SmRegisteredLineIcon, SmArrowOutwardLineIcon } from "@/components/icons";
import { MarcaDialog } from "./marca-dialog";
import { MarcaResumoDrawer, type ProcessoResumo } from "./marca-resumo-drawer";
import { PROCESSO_STATUS_LABEL, PROCESSO_STATUS_VARIANT } from "@/lib/registros/types";
import type { MarcaRow, ProcessoStatus } from "@/lib/registros/types";
import { cn } from "@/lib/utils";
import { contem, useBuscaUrl } from "./_use-busca-url";
import { useSlashFocus } from "@/lib/use-slash-focus";

interface MarcasListClientProps {
  marcas: MarcaRow[];
  processos: Array<ProcessoResumo & { marca_id: string }>;
}

export function MarcasListClient({ marcas, processos }: MarcasListClientProps) {
  const { search, setSearch, query, clear, pendente } = useBuscaUrl();
  const searchRef = useRef<HTMLInputElement>(null);
  useSlashFocus(searchRef);

  const porMarca = new Map<string, ProcessoResumo[]>();
  for (const p of processos) {
    const arr = porMarca.get(p.marca_id) ?? [];
    arr.push(p);
    porMarca.set(p.marca_id, arr);
  }

  const filtradas = marcas.filter((marca) => {
    const procs = porMarca.get(marca.id) ?? [];
    return contem(
      query,
      marca.nome,
      marca.titular,
      ...procs.map((p) => PROCESSO_STATUS_LABEL[p.status]),
    );
  });

  if (marcas.length === 0) {
    return (
      <EmptyState
        icon={<SmRegisteredLineIcon />}
        title="Nenhuma marca cadastrada"
        description="Comece cadastrando as marcas do portfólio para acompanhar seus processos, documentos e prazos."
        action={<MarcaDialog />}
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
          aria-label="Buscar marcas"
          aria-keyshortcuts="/"
          placeholder="Buscar por nome, titular ou status…"
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
        {filtradas.length} {filtradas.length === 1 ? "marca" : "marcas"}
      </span>

      {filtradas.length === 0 ? (
        <EmptyState
          icon={<SmRegisteredLineIcon />}
          title="Nenhuma marca encontrada"
          description={`Nenhuma marca corresponde a “${search.trim()}”.`}
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
          {filtradas.map((marca) => {
            const procs = porMarca.get(marca.id) ?? [];
            const contagem = new Map<ProcessoStatus, number>();
            for (const p of procs) contagem.set(p.status, (contagem.get(p.status) ?? 0) + 1);
            return (
              <li key={marca.id}>
                <Card className="group relative h-full gap-3 transition-colors focus-within:bg-surface-900 hover:bg-surface-900">
                  {/* Área principal: 1 clique leva ao detalhe. */}
                  <Link
                    href={`/registros/marcas/${marca.id}`}
                    className="flex flex-col gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-foreground"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <span className="truncate text-lg font-medium">{marca.nome}</span>
                        <span className="truncate text-xs text-muted-foreground">
                          {marca.titular}
                        </span>
                      </div>
                      <SmArrowOutwardLineIcon
                        aria-hidden="true"
                        className="mt-1 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {procs.length} {procs.length === 1 ? "processo" : "processos"}
                      </span>
                      {[...contagem.entries()].map(([status, n]) => (
                        <Badge key={status} variant={PROCESSO_STATUS_VARIANT[status]}>
                          {n} {PROCESSO_STATUS_LABEL[status]}
                        </Badge>
                      ))}
                    </div>
                  </Link>

                  {/* Ação secundária: resumo rápido no drawer, sem sair da lista. */}
                  <div className="flex justify-end">
                    <MarcaResumoDrawer marca={marca} processos={procs}>
                      <Button variant="ghost" size="sm" aria-label={`Resumo de ${marca.nome}`}>
                        Resumo
                      </Button>
                    </MarcaResumoDrawer>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
