import { Suspense } from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { ListSkeleton } from "@/components/skeletons";
import { JornadaNovaDialog } from "@/components/registros/jornada-nova-dialog";
import { RegistrarListClient } from "@/components/registros/registrar-list-client";
import type { JornadaRow } from "@/lib/registros/jornada";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Registro" };

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
      <PageHeader
        title="Registro"
        description="Acompanhamento guiado do registro de marca junto ao INPI — um passo de cada vez, com evidência a cada avanço."
        actions={<JornadaNovaDialog />}
      />

      {/* useUrlState (useSearchParams) exige Suspense no App Router. */}
      <Suspense fallback={<ListSkeleton rows={4} />}>
        <RegistrarListClient jornadas={jornadas} />
      </Suspense>
    </div>
  );
}
