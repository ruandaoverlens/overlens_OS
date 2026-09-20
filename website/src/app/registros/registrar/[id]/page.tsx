import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { JornadaStepper } from "@/components/registros/jornada-stepper";
import type { JornadaRow, JornadaEvidenciaRow } from "@/lib/registros/jornada";

export const dynamic = "force-dynamic";

// Deduplicado por request: generateMetadata e a página usam a mesma consulta.
const getJornada = cache(async (id: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("registro_jornadas")
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
  const jornada = await getJornada(id);
  return {
    title: jornada ? (jornada as JornadaRow).nome_marca : "Não encontrado",
  };
}

export default async function JornadaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [jornadaData, { data: evidenciasData }] = await Promise.all([
    getJornada(id),
    supabase
      .from("registro_jornada_evidencias")
      .select("*")
      .eq("jornada_id", id)
      .order("created_at"),
  ]);

  if (!jornadaData) notFound();

  const jornada = jornadaData as JornadaRow;
  const evidencias = (evidenciasData ?? []) as JornadaEvidenciaRow[];

  const descricao = [
    jornada.titular,
    jornada.classes ? `NCL ${jornada.classes}` : null,
    jornada.processo_numero ? `Processo ${jornada.processo_numero}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <PageHeader
        title={jornada.nome_marca}
        description={descricao}
        backHref="/registros/registrar"
        backLabel="Registro"
      />

      <JornadaStepper jornada={jornada} evidencias={evidencias} />
    </div>
  );
}
