import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PROCESSO_STATUS_LABEL,
  PROCESSO_STATUS_VARIANT,
  ALERTA_TIPO_LABEL,
  ALERTA_STATUS_VARIANT,
  ALERTA_STATUS_LABEL,
  DOCUMENTO_TIPO_LABEL,
  formatarData,
} from "@/lib/registros/types";
import type {
  ProcessoRow,
  ProcessoStatus,
  AlertaRow,
  DocumentoRow,
  MarcaRow,
} from "@/lib/registros/types";

export const dynamic = "force-dynamic";

export default async function VisaoGeralPage() {
  const supabase = await createClient();

  const [{ count: totalMarcas }, { data: processosData }, { data: alertasData }, { data: docsData }, { data: marcasData }] =
    await Promise.all([
      supabase.from("registro_marcas").select("id", { count: "exact", head: true }),
      supabase.from("registro_processos").select("status"),
      supabase
        .from("registro_alertas")
        .select("*")
        .eq("status", "pendente")
        .order("data_limite", { ascending: true, nullsFirst: false })
        .limit(6),
      supabase
        .from("registro_documentos")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6),
      supabase.from("registro_marcas").select("id, nome"),
    ]);

  const processos = (processosData ?? []) as Pick<ProcessoRow, "status">[];
  const alertas = (alertasData ?? []) as AlertaRow[];
  const documentos = (docsData ?? []) as DocumentoRow[];
  const marcas = (marcasData ?? []) as Pick<MarcaRow, "id" | "nome">[];
  const nomePorMarca = new Map(marcas.map((m) => [m.id, m.nome]));

  const contagem = new Map<ProcessoStatus, number>();
  for (const p of processos) contagem.set(p.status, (contagem.get(p.status) ?? 0) + 1);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-heading uppercase tracking-wide">Visão Geral</h1>
        <p className="text-sm text-muted-foreground">
          Panorama do portfólio de marcas, processos e prazos.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="flex flex-col gap-1">
            <span className="text-4xl font-heading">{totalMarcas ?? 0}</span>
            <span className="text-sm text-muted-foreground">
              {totalMarcas === 1 ? "marca" : "marcas"}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1">
            <span className="text-4xl font-heading">{processos.length}</span>
            <span className="text-sm text-muted-foreground">
              {processos.length === 1 ? "processo" : "processos"}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1">
            <span className="text-4xl font-heading">{alertas.length}</span>
            <span className="text-sm text-muted-foreground">alertas pendentes</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Processos por status</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {contagem.size === 0 ? (
              <span className="text-sm text-muted-foreground">Nenhum processo cadastrado.</span>
            ) : (
              [...contagem.entries()].map(([status, n]) => (
                <Badge key={status} variant={PROCESSO_STATUS_VARIANT[status]}>
                  {n} {PROCESSO_STATUS_LABEL[status]}
                </Badge>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Próximos prazos
              <Link href="/registros/alertas" className="text-sm font-normal text-muted-foreground hover:text-foreground">
                Ver todos
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {alertas.length === 0 ? (
              <span className="text-sm text-muted-foreground">Nenhum alerta pendente.</span>
            ) : (
              alertas.map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <Badge variant={ALERTA_STATUS_VARIANT[a.status]}>
                      {ALERTA_STATUS_LABEL[a.status]}
                    </Badge>
                    <span className="truncate text-sm">{a.titulo}</span>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {ALERTA_TIPO_LABEL[a.tipo]}
                    {a.data_limite ? ` · ${formatarData(a.data_limite)}` : ""}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Últimos documentos
            <Link href="/registros/documentos" className="text-sm font-normal text-muted-foreground hover:text-foreground">
              Ver todos
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {documentos.length === 0 ? (
            <span className="text-sm text-muted-foreground">Nenhum documento enviado.</span>
          ) : (
            documentos.map((d) => (
              <div key={d.id} className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <Badge variant="outline">{DOCUMENTO_TIPO_LABEL[d.tipo]}</Badge>
                  <span className="truncate text-sm">{d.titulo}</span>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {d.marca_id ? nomePorMarca.get(d.marca_id) ?? "" : ""} · {formatarData(d.created_at)}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
