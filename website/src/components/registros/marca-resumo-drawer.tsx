"use client";

// Drawer lateral de resumo de uma marca, aberto ao clicar no card da lista.
// Mostra os dados principais e os processos; o aprofundamento fica na página
// de detalhe ("Ver mais").

import Link from "next/link";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PROCESSO_STATUS_LABEL,
  PROCESSO_STATUS_VARIANT,
  formatarData,
} from "@/lib/registros/types";
import type { MarcaRow, ProcessoStatus } from "@/lib/registros/types";

export interface ProcessoResumo {
  id: string;
  numero: string;
  classe: string;
  status: ProcessoStatus;
  proxima_renovacao: string | null;
}

interface MarcaResumoDrawerProps {
  marca: MarcaRow;
  processos: ProcessoResumo[];
  children: React.ReactNode;
}

export function MarcaResumoDrawer({ marca, processos, children }: MarcaResumoDrawerProps) {
  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="bg-[var(--surface-950)] border-l border-[var(--surface-800)]">
        <DrawerHeader>
          <DrawerTitle className="font-heading text-xl uppercase tracking-wide">
            {marca.nome}
          </DrawerTitle>
          <DrawerDescription>{marca.titular}</DrawerDescription>
        </DrawerHeader>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              Apresentação
            </span>
            <span className="text-sm capitalize">{marca.apresentacao}</span>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              Processos ({processos.length})
            </span>
            {processos.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum processo cadastrado.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {processos.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-2 rounded-md border border-[var(--surface-800)] px-3 py-2"
                  >
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="font-mono text-xs">{p.numero}</span>
                      <span className="text-xs text-muted-foreground">
                        Classe {p.classe}
                        {p.proxima_renovacao
                          ? ` · Renovação ${formatarData(p.proxima_renovacao)}`
                          : ""}
                      </span>
                    </div>
                    <Badge variant={PROCESSO_STATUS_VARIANT[p.status]}>
                      {PROCESSO_STATUS_LABEL[p.status]}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {marca.observacoes && (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                Observações
              </span>
              <span className="text-sm whitespace-pre-wrap text-muted-foreground">
                {marca.observacoes}
              </span>
            </div>
          )}
        </div>

        <DrawerFooter>
          <Button asChild className="flex-1">
            <Link href={`/registros/marcas/${marca.id}`}>Ver mais</Link>
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Fechar</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
