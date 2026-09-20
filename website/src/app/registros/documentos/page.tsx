import { Suspense } from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ListSkeleton } from "@/components/skeletons";
import { PageHeader } from "@/components/page-header";
import {
  DocumentosPageClient,
  type DocumentoComMarca,
} from "@/components/registros/documentos-page-client";
import type { DocumentoRow, MarcaRow } from "@/lib/registros/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Documentos" };

export default async function DocumentosPage() {
  const supabase = await createClient();

  const [{ data: docsData }, { data: marcasData }] = await Promise.all([
    supabase.from("registro_documentos").select("*").order("created_at", { ascending: false }),
    supabase.from("registro_marcas").select("id, nome").order("nome"),
  ]);

  const marcas = (marcasData ?? []) as Pick<MarcaRow, "id" | "nome">[];
  const nomePorMarca = new Map(marcas.map((m) => [m.id, m.nome]));

  const documentos: DocumentoComMarca[] = ((docsData ?? []) as DocumentoRow[]).map((d) => ({
    ...d,
    marcaNome: d.marca_id ? nomePorMarca.get(d.marca_id) ?? null : null,
  }));

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <PageHeader
        title="Documentos"
        description="Certificados, protocolos, despachos e demais documentos jurídicos das marcas."
      />
      {/* useUrlState (useSearchParams) exige Suspense no App Router. */}
      <Suspense fallback={<ListSkeleton rows={4} />}>
        <DocumentosPageClient documentos={documentos} marcas={marcas} />
      </Suspense>
    </div>
  );
}
