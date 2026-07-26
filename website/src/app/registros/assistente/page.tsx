import { createClient } from "@/lib/supabase/server";
import { AssistenteHome } from "@/components/registros/assistente-home";
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

  return <AssistenteHome marcas={marcas} documentos={documentos} />;
}
