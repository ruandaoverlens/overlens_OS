import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { SmVerifiedLineIcon, SmArrowOutwardLineIcon } from "@/components/icons";
import { JornadaNovaDialog } from "@/components/registros/jornada-nova-dialog";
import {
  JORNADA_PASSOS,
  JORNADA_STATUS_LABEL,
  JORNADA_STATUS_VARIANT,
  TOTAL_PASSOS,
} from "@/lib/registros/jornada";
import type { JornadaRow } from "@/lib/registros/jornada";

export const dynamic = "force-dynamic";

export default async function RegistrarPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("registro_jornadas")
    .select("*")
    .order("updated_at", { ascending: false });

  const jornadas = (data ?? []) as JornadaRow[];
  const ordem = { em_andamento: 0, concluida: 1, arquivada: 2 } as const;
  jornadas.sort((a, b) => ordem[a.status] - ordem[b.status]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading uppercase tracking-wide">Registro</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhamento guiado do registro de marca junto ao INPI — um passo
            de cada vez, com evidência a cada avanço.
          </p>
        </div>
        <JornadaNovaDialog />
      </div>

      {jornadas.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia contained>
              <SmVerifiedLineIcon />
            </EmptyMedia>
            <EmptyTitle>Nenhum registro em andamento</EmptyTitle>
            <EmptyDescription>
              Clique em Registrar para iniciar o passo a passo do registro de
              uma marca: busca prévia, classes, GRU, depósito, RPI, exame e
              certificado.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {jornadas.map((jornada) => {
            const concluidos =
              jornada.status === "concluida" ? TOTAL_PASSOS : jornada.passo_atual - 1;
            const passoAtual = JORNADA_PASSOS.find(
              (p) => p.numero === jornada.passo_atual,
            );
            return (
              <Link key={jornada.id} href={`/registros/registrar/${jornada.id}`}>
                <Card className="group h-full cursor-pointer gap-3 transition-colors hover:bg-[var(--surface-900)]">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-lg font-medium">{jornada.nome_marca}</span>
                      <span className="text-xs text-muted-foreground">
                        {jornada.titular}
                        {jornada.classes ? ` · NCL ${jornada.classes}` : ""}
                        {jornada.processo_numero
                          ? ` · Processo ${jornada.processo_numero}`
                          : ""}
                      </span>
                    </div>
                    <SmArrowOutwardLineIcon className="mt-1 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
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
                    <Progress value={Math.round((concluidos / TOTAL_PASSOS) * 100)} />
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
