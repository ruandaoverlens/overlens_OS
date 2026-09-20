import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { BuscaPageClient } from "@/components/registros/busca-page-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Busca" };

export default async function BuscaPage({
  searchParams,
}: {
  searchParams: Promise<{ nome?: string; classes?: string }>;
}) {
  const { nome, classes } = await searchParams;
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <PageHeader
        title="Busca"
        description="Verifique a disponibilidade de um nome de marca cruzando a base local com a consulta ao vivo do INPI. A análise é indicativa — a decisão final é sempre humana."
      />
      <BuscaPageClient initialNome={nome ?? ""} initialClasses={classes ?? ""} />
    </div>
  );
}
