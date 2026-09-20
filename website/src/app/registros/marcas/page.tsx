import { Suspense } from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { ListSkeleton } from "@/components/skeletons";
import { MarcaDialog } from "@/components/registros/marca-dialog";
import { MarcasListClient } from "@/components/registros/marcas-list-client";
import type { ProcessoResumo } from "@/components/registros/marca-resumo-drawer";
import type { MarcaRow } from "@/lib/registros/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Marcas" };

export default async function MarcasPage() {
  const supabase = await createClient();

  const [{ data: marcasData }, { data: processosData }] = await Promise.all([
    supabase.from("registro_marcas").select("*").order("nome"),
    supabase
      .from("registro_processos")
      .select("id, marca_id, numero, classe, status, proxima_renovacao")
      .order("numero"),
  ]);

  const marcas = (marcasData ?? []) as MarcaRow[];
  const processos = (processosData ?? []) as Array<ProcessoResumo & { marca_id: string }>;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <PageHeader
        title="Marcas"
        description="Portfólio de marcas registradas e seus processos junto ao INPI."
        actions={<MarcaDialog />}
      />

      {/* useUrlState (useSearchParams) exige Suspense no App Router. */}
      <Suspense fallback={<ListSkeleton rows={4} />}>
        <MarcasListClient marcas={marcas} processos={processos} />
      </Suspense>
    </div>
  );
}
