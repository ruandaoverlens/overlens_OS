import { BuscaPageClient } from "@/components/registros/busca-page-client";

export const dynamic = "force-dynamic";

export default async function BuscaPage({
  searchParams,
}: {
  searchParams: Promise<{ nome?: string; classes?: string }>;
}) {
  const { nome, classes } = await searchParams;
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-heading uppercase tracking-wide">Busca</h1>
        <p className="text-sm text-muted-foreground">
          Verifique a disponibilidade de um nome de marca cruzando a base local
          com a consulta ao vivo do INPI. A análise é indicativa — a decisão
          final é sempre humana.
        </p>
      </div>
      <BuscaPageClient initialNome={nome ?? ""} initialClasses={classes ?? ""} />
    </div>
  );
}
