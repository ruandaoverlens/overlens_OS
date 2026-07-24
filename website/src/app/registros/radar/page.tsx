import { createClient } from "@/lib/supabase/server";
import {
  RadarPageClient,
  type CandidatoComContexto,
} from "@/components/registros/radar-page-client";
import type {
  RadarExecucaoRow,
  RadarCandidatoRow,
} from "@/lib/registros/radar";
import type { MarcaRow } from "@/lib/registros/types";

export const dynamic = "force-dynamic";

export default async function RadarPage() {
  const supabase = await createClient();

  const [{ data: execData }, { data: candData }, { data: marcasData }] =
    await Promise.all([
      supabase
        .from("registro_radar_execucoes")
        .select("*")
        .order("executado_em", { ascending: false })
        .limit(10),
      supabase
        .from("registro_radar_candidatos")
        .select("*")
        .in("status", ["pendente", "alerta"])
        .order("score", { ascending: false }),
      supabase.from("registro_marcas").select("id, nome"),
    ]);

  const execucoes = (execData ?? []) as RadarExecucaoRow[];
  const marcas = (marcasData ?? []) as Pick<MarcaRow, "id" | "nome">[];
  const nomePorMarca = new Map(marcas.map((m) => [m.id, m.nome]));

  const candidatos: CandidatoComContexto[] = ((candData ?? []) as RadarCandidatoRow[]).map(
    (c) => ({
      ...c,
      nossaMarcaNome: c.marca_id ? nomePorMarca.get(c.marca_id) ?? null : null,
    }),
  );

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-heading uppercase tracking-wide">Radar</h1>
        <p className="text-sm text-muted-foreground">
          Monitoramento de publicações semelhantes na Revista da Propriedade
          Industrial. Todo alerta é revisado por uma pessoa antes de virar ação.
        </p>
      </div>
      <RadarPageClient execucoes={execucoes} candidatos={candidatos} />
    </div>
  );
}
