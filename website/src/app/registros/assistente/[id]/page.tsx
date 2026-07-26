import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  AssistenteChat,
  type AssistenteMensagem,
} from "@/components/registros/assistente-chat";
import type { DocumentoRow, MarcaRow } from "@/lib/registros/types";

export const dynamic = "force-dynamic";

export default async function AssistenteConversaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ docs?: string }>;
}) {
  const { id } = await params;
  const { docs } = await searchParams;
  const supabase = await createClient();

  const { data: conversa } = await supabase
    .from("registro_assistente_conversas")
    .select("id, titulo, marca_id")
    .eq("id", id)
    .maybeSingle();

  if (!conversa) notFound();

  const [{ data: mensagensData }, { data: marcasData }, { data: documentosData }] =
    await Promise.all([
      supabase
        .from("registro_assistente_mensagens")
        .select("id, role, content")
        .eq("conversa_id", id)
        .order("created_at", { ascending: true }),
      supabase.from("registro_marcas").select("id, nome").order("nome"),
      supabase
        .from("registro_documentos")
        .select("id, marca_id, titulo, tipo, sensivel, mime_type")
        .order("titulo"),
    ]);

  const initialMessages = (mensagensData ?? []) as AssistenteMensagem[];
  const marcas = (marcasData ?? []) as Pick<MarcaRow, "id" | "nome">[];
  const documentos = (documentosData ?? []) as Pick<
    DocumentoRow,
    "id" | "marca_id" | "titulo" | "tipo" | "sensivel" | "mime_type"
  >[];

  // Documentos pré-selecionados vindos da home (?docs=id1,id2).
  const docIdSet = new Set(documentos.map((d) => d.id));
  const initialDocIds = (docs ?? "")
    .split(",")
    .filter((d) => docIdSet.has(d));

  return (
    <AssistenteChat
      marcas={marcas}
      documentos={documentos}
      conversaId={conversa.id}
      initialMessages={initialMessages}
      initialMarcaId={conversa.marca_id as string | null}
      initialDocIds={initialDocIds}
      className="h-full"
    />
  );
}
