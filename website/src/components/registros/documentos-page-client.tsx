"use client";

import { useMemo, useState } from "react";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { SmDocLineIcon } from "@/components/icons";
import { DocumentoItem } from "./documento-item";
import { DocumentoUploadDialog } from "./documento-upload-dialog";
import { DOCUMENTO_TIPO_OPTIONS, DOCUMENTO_TIPO_LABEL } from "@/lib/registros/types";
import type { DocumentoRow, DocumentoTipo } from "@/lib/registros/types";

interface MarcaOption {
  id: string;
  nome: string;
}

export interface DocumentoComMarca extends DocumentoRow {
  marcaNome: string | null;
}

interface DocumentosPageClientProps {
  documentos: DocumentoComMarca[];
  marcas: MarcaOption[];
}

export function DocumentosPageClient({ documentos, marcas }: DocumentosPageClientProps) {
  const [filtroTipo, setFiltroTipo] = useState<DocumentoTipo | "">("");
  const [filtroMarca, setFiltroMarca] = useState<string>("");

  const filtrados = useMemo(() => {
    return documentos.filter((d) => {
      if (filtroTipo && d.tipo !== filtroTipo) return false;
      if (filtroMarca && d.marca_id !== filtroMarca) return false;
      return true;
    });
  }, [documentos, filtroTipo, filtroMarca]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-48">
          <NativeSelect size="sm" value={filtroMarca} onChange={(e) => setFiltroMarca(e.target.value)}>
            <NativeSelectOption value="">Todas as marcas</NativeSelectOption>
            {marcas.map((m) => (
              <NativeSelectOption key={m.id} value={m.id}>
                {m.nome}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
        <div className="w-48">
          <NativeSelect size="sm" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value as DocumentoTipo | "")}>
            <NativeSelectOption value="">Todos os tipos</NativeSelectOption>
            {DOCUMENTO_TIPO_OPTIONS.map((t) => (
              <NativeSelectOption key={t} value={t}>
                {DOCUMENTO_TIPO_LABEL[t]}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
        <div className="ml-auto">
          <DocumentoUploadDialog marcas={marcas} />
        </div>
      </div>

      {filtrados.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia contained>
              <SmDocLineIcon />
            </EmptyMedia>
            <EmptyTitle>Nenhum documento</EmptyTitle>
            <EmptyDescription>
              {documentos.length === 0
                ? "Envie certificados, protocolos e despachos para centralizá-los aqui."
                : "Nenhum documento corresponde aos filtros selecionados."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-2">
          {filtrados.map((doc) => (
            <DocumentoItem key={doc.id} documento={doc} marcaNome={doc.marcaNome ?? undefined} />
          ))}
        </div>
      )}
    </div>
  );
}
