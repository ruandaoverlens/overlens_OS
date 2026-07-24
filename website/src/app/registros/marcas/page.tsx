import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { SmRegisteredLineIcon, SmArrowForwardIosLineIcon } from "@/components/icons";
import { MarcaDialog } from "@/components/registros/marca-dialog";
import {
  PROCESSO_STATUS_LABEL,
  PROCESSO_STATUS_VARIANT,
} from "@/lib/registros/types";
import type { MarcaRow, ProcessoRow, ProcessoStatus } from "@/lib/registros/types";

export const dynamic = "force-dynamic";

export default async function MarcasPage() {
  const supabase = await createClient();

  const [{ data: marcasData }, { data: processosData }] = await Promise.all([
    supabase.from("registro_marcas").select("*").order("nome"),
    supabase.from("registro_processos").select("id, marca_id, status"),
  ]);

  const marcas = (marcasData ?? []) as MarcaRow[];
  const processos = (processosData ?? []) as Pick<ProcessoRow, "id" | "marca_id" | "status">[];

  const porMarca = new Map<string, ProcessoStatus[]>();
  for (const p of processos) {
    const arr = porMarca.get(p.marca_id) ?? [];
    arr.push(p.status);
    porMarca.set(p.marca_id, arr);
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading uppercase tracking-wide">Marcas</h1>
          <p className="text-sm text-muted-foreground">
            Portfólio de marcas registradas e seus processos junto ao INPI.
          </p>
        </div>
        <MarcaDialog />
      </div>

      {marcas.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia contained>
              <SmRegisteredLineIcon />
            </EmptyMedia>
            <EmptyTitle>Nenhuma marca cadastrada</EmptyTitle>
            <EmptyDescription>
              Comece cadastrando as marcas do portfólio para acompanhar seus processos,
              documentos e prazos.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {marcas.map((marca) => {
            const statuses = porMarca.get(marca.id) ?? [];
            const contagem = new Map<ProcessoStatus, number>();
            for (const s of statuses) contagem.set(s, (contagem.get(s) ?? 0) + 1);
            return (
              <Link key={marca.id} href={`/registros/marcas/${marca.id}`} className="group">
                <Card className="gap-3 transition-colors hover:bg-[var(--surface-900)]">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-lg font-medium">{marca.nome}</span>
                      <span className="text-xs text-muted-foreground">{marca.titular}</span>
                    </div>
                    <SmArrowForwardIosLineIcon className="mt-1 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {statuses.length} {statuses.length === 1 ? "processo" : "processos"}
                    </span>
                    {[...contagem.entries()].map(([status, n]) => (
                      <Badge key={status} variant={PROCESSO_STATUS_VARIANT[status]}>
                        {n} {PROCESSO_STATUS_LABEL[status]}
                      </Badge>
                    ))}
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
