import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { HeadingTitle } from "@/components/ui/heading";
import { MarcaDialog } from "@/components/registros/marca-dialog";
import { JornadaNovaDialog } from "@/components/registros/jornada-nova-dialog";
import { ProcessoDialog } from "@/components/registros/processo-dialog";
import { EventoDialog } from "@/components/registros/evento-dialog";
import { DocumentoUploadDialog } from "@/components/registros/documento-upload-dialog";
import { DocumentoItem } from "@/components/registros/documento-item";
import { Timeline, type TimelineEvento } from "@/components/registros/timeline";
import {
  PROCESSO_STATUS_LABEL,
  PROCESSO_STATUS_VARIANT,
  formatarData,
} from "@/lib/registros/types";
import type {
  MarcaRow,
  ProcessoRow,
  EventoRow,
  DocumentoRow,
} from "@/lib/registros/types";

export const dynamic = "force-dynamic";

// Deduplicado por request: generateMetadata e a página usam a mesma consulta.
const getMarca = cache(async (id: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("registro_marcas")
    .select("*")
    .eq("id", id)
    .single();
  return data;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const marca = await getMarca(id);
  return { title: marca ? (marca as MarcaRow).nome : "Não encontrado" };
}

export default async function MarcaDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const marcaData = await getMarca(id);

  if (!marcaData) notFound();
  const marca = marcaData as MarcaRow;

  const { data: processosData } = await supabase
    .from("registro_processos")
    .select("*")
    .eq("marca_id", id)
    .order("numero");
  const processos = (processosData ?? []) as ProcessoRow[];
  const processoIds = processos.map((p) => p.id);
  const numeroPorProcesso = new Map(processos.map((p) => [p.id, p.numero]));

  const [{ data: eventosData }, { data: docsData }] = await Promise.all([
    processoIds.length > 0
      ? supabase
          .from("registro_eventos")
          .select("*")
          .in("processo_id", processoIds)
          .order("data", { ascending: false })
      : Promise.resolve({ data: [] as EventoRow[] }),
    supabase
      .from("registro_documentos")
      .select("*")
      .eq("marca_id", id)
      .order("created_at", { ascending: false }),
  ]);

  const eventos: TimelineEvento[] = ((eventosData ?? []) as EventoRow[]).map((ev) => ({
    ...ev,
    processoNumero: numeroPorProcesso.get(ev.processo_id) ?? null,
  }));
  const documentos = (docsData ?? []) as DocumentoRow[];

  const processoOptions = processos.map((p) => ({ id: p.id, numero: p.numero }));

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      {/* Cabeçalho + dados da marca */}
      <PageHeader
        title={marca.nome}
        description={marca.titular}
        backHref="/registros/marcas"
        backLabel="Marcas"
        actions={
          <>
            <JornadaNovaDialog
              defaultNome={marca.nome}
              defaultTitular={marca.titular}
              triggerLabel="Iniciar registro"
              triggerVariant="outline"
            />
            <MarcaDialog marca={marca} />
          </>
        }
      />

      <Card>
        <CardContent className="flex flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-0.5">
              <HeadingTitle as="h2" size="eyebrow">Titular</HeadingTitle>
              <span className="text-sm">{marca.titular}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <HeadingTitle as="h2" size="eyebrow">Apresentação</HeadingTitle>
              <span className="text-sm">{marca.apresentacao}</span>
            </div>
          </div>
          {marca.observacoes && (
            <div className="flex flex-col gap-0.5">
              <HeadingTitle as="h2" size="eyebrow">Observações</HeadingTitle>
              <span className="text-sm whitespace-pre-wrap">{marca.observacoes}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Processos / classes */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <HeadingTitle as="h2" size="sm">
            Processos e classes
          </HeadingTitle>
          <ProcessoDialog marcaId={marca.id} />
        </div>
        {processos.length === 0 ? (
          <EmptyState
            size="sm"
            title="Nenhum processo cadastrado ainda"
            description="Registre o número, a classe e o status do processo junto ao INPI."
            action={<ProcessoDialog marcaId={marca.id} />}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {processos.map((p) => (
              <Card key={p.id}>
                <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-sm font-medium">{p.numero}</span>
                      <Badge variant={PROCESSO_STATUS_VARIANT[p.status]}>
                        {PROCESSO_STATUS_LABEL[p.status]}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Classe {p.classe}
                      {p.classe_descricao ? `: ${p.classe_descricao}` : ""}
                    </span>
                    {p.situacao && (
                      <span className="text-xs text-muted-foreground">{p.situacao}</span>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-8">
                    <div className="flex flex-col gap-0.5 text-xs">
                      <span className="text-muted-foreground">Depósito</span>
                      <span>{formatarData(p.data_deposito)}</span>
                    </div>
                    <div className="flex flex-col gap-0.5 text-xs">
                      <span className="text-muted-foreground">Concessão</span>
                      <span>{formatarData(p.data_concessao)}</span>
                    </div>
                    <div className="flex flex-col gap-0.5 text-xs">
                      <span className="text-muted-foreground">Renovação</span>
                      <span>{formatarData(p.proxima_renovacao)}</span>
                    </div>
                    <ProcessoDialog marcaId={marca.id} processo={p} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Timeline agregada */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <HeadingTitle as="h2" size="sm">
            Timeline
          </HeadingTitle>
          <EventoDialog processos={processoOptions} />
        </div>
        <Card>
          <CardContent>
            <Timeline eventos={eventos} processos={processoOptions} />
          </CardContent>
        </Card>
      </div>

      {/* Documentos da marca */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <HeadingTitle as="h2" size="sm">
            Documentos
          </HeadingTitle>
          <DocumentoUploadDialog
            marcas={[{ id: marca.id, nome: marca.nome }]}
            fixedMarcaId={marca.id}
            processos={processoOptions}
          />
        </div>
        {documentos.length === 0 ? (
          <EmptyState
            size="sm"
            title="Nenhum documento enviado ainda"
            description="Certificados, protocolos e despachos desta marca ficam aqui."
            action={
              <DocumentoUploadDialog
                marcas={[{ id: marca.id, nome: marca.nome }]}
                fixedMarcaId={marca.id}
                processos={processoOptions}
              />
            }
          />
        ) : (
          <div className="flex flex-col gap-2">
            {documentos.map((doc) => (
              <DocumentoItem key={doc.id} documento={doc} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
