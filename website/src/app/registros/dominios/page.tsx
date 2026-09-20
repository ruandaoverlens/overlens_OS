import { Suspense } from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { ListSkeleton } from "@/components/skeletons";
import { DominioDialog } from "@/components/registros/dominio-dialog";
import { DominiosListClient } from "@/components/registros/dominios-list-client";
import type { DominioRow } from "@/lib/registros/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Domínios" };

export default async function DominiosPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("registro_dominios")
    .select("*")
    .order("dominio");
  const dominios = (data ?? []) as DominioRow[];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <PageHeader
        title="Domínios"
        description="Inventário dos domínios de internet da Overlens: registrador, expiração e renovação."
        actions={<DominioDialog />}
      />

      {/* useUrlState (useSearchParams) exige Suspense no App Router. */}
      <Suspense fallback={<ListSkeleton rows={4} />}>
        <DominiosListClient dominios={dominios} />
      </Suspense>
    </div>
  );
}
