import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { SmLanguageLineIcon } from "@/components/icons";
import { DominioDialog } from "@/components/registros/dominio-dialog";
import { formatarData } from "@/lib/registros/types";
import type { DominioRow } from "@/lib/registros/types";

export const dynamic = "force-dynamic";

function expiracaoBadge(dominio: DominioRow) {
  if (!dominio.data_expiracao) return null;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const expira = new Date(dominio.data_expiracao.slice(0, 10) + "T00:00:00");
  const dias = Math.round((expira.getTime() - hoje.getTime()) / 86_400_000);

  if (dias < 0) return <Badge variant="destructive">Expirado</Badge>;
  if (dias <= 60 && !dominio.renovacao_automatica)
    return <Badge variant="warning">Expira em {dias} {dias === 1 ? "dia" : "dias"}</Badge>;
  return null;
}

export default async function DominiosPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("registro_dominios")
    .select("*")
    .order("dominio");
  const dominios = (data ?? []) as DominioRow[];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading uppercase tracking-wide">Domínios</h1>
          <p className="text-sm text-muted-foreground">
            Inventário dos domínios de internet da Overlens: registrador, expiração e renovação.
          </p>
        </div>
        <DominioDialog />
      </div>

      {dominios.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia contained>
              <SmLanguageLineIcon />
            </EmptyMedia>
            <EmptyTitle>Nenhum domínio cadastrado</EmptyTitle>
            <EmptyDescription>
              Cadastre os domínios da Overlens para acompanhar registrador, datas de
              expiração e renovação em um só lugar.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-3">
          {dominios.map((d) => (
            <Card key={d.id} className="flex-row items-center justify-between gap-4">
              <div className="flex min-w-0 flex-col gap-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-lg font-medium">{d.dominio}</span>
                  {d.renovacao_automatica ? (
                    <Badge variant="success">Renovação automática</Badge>
                  ) : (
                    <Badge variant="secondary">Renovação manual</Badge>
                  )}
                  {expiracaoBadge(d)}
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                  <span>{d.registrador ?? "Registrador não informado"}</span>
                  <span>Expira em {formatarData(d.data_expiracao)}</span>
                </div>
                {d.observacoes && (
                  <p className="text-xs text-muted-foreground">{d.observacoes}</p>
                )}
              </div>
              <DominioDialog dominio={d} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
