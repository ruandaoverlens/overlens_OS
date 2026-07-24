import { createClient } from "@/lib/supabase/server";
import { AssistenteChat } from "@/components/registros/assistente-chat";
import type { DocumentoRow, MarcaRow } from "@/lib/registros/types";

export const dynamic = "force-dynamic";

export default async function AssistentePage() {
  const supabase = await createClient();

  const [{ data: marcasData }, { data: documentosData }] = await Promise.all([
    supabase.from("registro_marcas").select("id, nome").order("nome"),
    supabase
      .from("registro_documentos")
      .select("id, marca_id, titulo, tipo, sensivel, mime_type")
      .order("titulo"),
  ]);

  const marcas = (marcasData ?? []) as Pick<MarcaRow, "id" | "nome">[];
  const documentos = (documentosData ?? []) as Pick<
    DocumentoRow,
    "id" | "marca_id" | "titulo" | "tipo" | "sensivel" | "mime_type"
  >[];

  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-heading uppercase tracking-wide">Assistente</h1>
        <p className="text-sm text-muted-foreground">
          Copiloto de análise jurídica com validação humana obrigatória.
        </p>
      </div>
      <AssistenteChat marcas={marcas} documentos={documentos} className="min-h-0 flex-1" />
    </div>
  );
}
