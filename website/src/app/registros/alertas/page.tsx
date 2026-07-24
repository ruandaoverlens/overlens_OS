import { createClient } from "@/lib/supabase/server";
import {
  AlertasPageClient,
  type AlertaComContexto,
} from "@/components/registros/alertas-page-client";
import type { AlertaRow, ProcessoRow, MarcaRow } from "@/lib/registros/types";

export const dynamic = "force-dynamic";

const STATUS_ORDER: Record<string, number> = {
  pendente: 0,
  revisado: 1,
  resolvido: 2,
  descartado: 3,
};

export default async function AlertasPage() {
  const supabase = await createClient();

  const [{ data: alertasData }, { data: processosData }, { data: marcasData }] = await Promise.all([
    supabase.from("registro_alertas").select("*").order("created_at", { ascending: false }),
    supabase.from("registro_processos").select("id, numero, marca_id"),
    supabase.from("registro_marcas").select("id, nome"),
  ]);

  const processos = (processosData ?? []) as Pick<ProcessoRow, "id" | "numero" | "marca_id">[];
  const marcas = (marcasData ?? []) as Pick<MarcaRow, "id" | "nome">[];
  const procById = new Map(processos.map((p) => [p.id, p]));
  const nomePorMarca = new Map(marcas.map((m) => [m.id, m.nome]));

  const alertas: AlertaComContexto[] = ((alertasData ?? []) as AlertaRow[])
    .map((a) => {
      const proc = a.processo_id ? procById.get(a.processo_id) : undefined;
      return {
        ...a,
        processoNumero: proc?.numero ?? null,
        marcaNome: proc ? nomePorMarca.get(proc.marca_id) ?? null : null,
      };
    })
    .sort((a, b) => (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9));

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-heading uppercase tracking-wide">Alertas</h1>
        <p className="text-sm text-muted-foreground">
          Prazos de renovação, exigências e oposições. O sistema espelha o controle;
          a responsabilidade formal permanece com o escritório de PI.
        </p>
      </div>
      <AlertasPageClient alertas={alertas} />
    </div>
  );
}
