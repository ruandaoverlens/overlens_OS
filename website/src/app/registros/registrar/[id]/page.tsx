import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SmArrowBackLineIcon } from "@/components/icons";
import { JornadaStepper } from "@/components/registros/jornada-stepper";
import type { JornadaRow, JornadaEvidenciaRow } from "@/lib/registros/jornada";

export const dynamic = "force-dynamic";

export default async function JornadaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: jornadaData }, { data: evidenciasData }] = await Promise.all([
    supabase.from("registro_jornadas").select("*").eq("id", id).single(),
    supabase
      .from("registro_jornada_evidencias")
      .select("*")
      .eq("jornada_id", id)
      .order("created_at"),
  ]);

  if (!jornadaData) notFound();

  const jornada = jornadaData as JornadaRow;
  const evidencias = (evidenciasData ?? []) as JornadaEvidenciaRow[];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-3">
        <Link
          href="/registros/registrar"
          className="flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <SmArrowBackLineIcon className="size-4" />
          Registro
        </Link>
        <div>
          <h1 className="text-2xl font-heading uppercase tracking-wide">
            {jornada.nome_marca}
          </h1>
          <p className="text-sm text-muted-foreground">
            {jornada.titular}
            {jornada.classes ? ` · NCL ${jornada.classes}` : ""}
            {jornada.processo_numero ? ` · Processo ${jornada.processo_numero}` : ""}
          </p>
        </div>
      </div>

      <JornadaStepper jornada={jornada} evidencias={evidencias} />
    </div>
  );
}
