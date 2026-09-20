"use client";

import { useId, useMemo } from "react";
import { useUrlState } from "@/lib/use-url-state";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { EmptyState } from "@/components/empty-state";
import { SmDocLineIcon } from "@/components/icons";
import { DocumentoItem } from "./documento-item";
import { DocumentoUploadDialog } from "./documento-upload-dialog";
import { DOCUMENTO_TIPO_OPTIONS, DOCUMENTO_TIPO_LABEL } from "@/lib/registros/types";
import type { DocumentoRow, DocumentoTipo } from "@/lib/registros/types";

function isDocumentoTipo(v: string): v is DocumentoTipo {
  return (DOCUMENTO_TIPO_OPTIONS as readonly string[]).includes(v);
}

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
  const id = useId();
  // Filtros na URL (?tipo=&marca=) para serem compartilháveis/recarregáveis.
  const [tipoParam, setFiltroTipo] = useUrlState<string>("tipo", "");
  const [filtroMarca, setFiltroMarca] = useUrlState<string>("marca", "");
  const filtroTipo: DocumentoTipo | "" = isDocumentoTipo(tipoParam) ? tipoParam : "";

  const temFiltro = !!filtroTipo || !!filtroMarca;

  const filtrados = useMemo(() => {
    return documentos.filter((d) => {
      if (filtroTipo && d.tipo !== filtroTipo) return false;
      if (filtroMarca && d.marca_id !== filtroMarca) return false;
      return true;
    });
  }, [documentos, filtroTipo, filtroMarca]);

  function limparFiltros() {
    setFiltroTipo("");
    setFiltroMarca("");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-48">
          <NativeSelect
            id={`${id}-marca`}
            aria-label="Filtrar por marca"
            size="sm"
            value={filtroMarca}
            onChange={(e) => setFiltroMarca(e.target.value)}
          >
            <NativeSelectOption value="">Todas as marcas</NativeSelectOption>
            {marcas.map((m) => (
              <NativeSelectOption key={m.id} value={m.id}>
                {m.nome}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
        <div className="w-48">
          <NativeSelect
            id={`${id}-tipo`}
            aria-label="Filtrar por tipo"
            size="sm"
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
          >
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

      <span className="text-xs text-muted-foreground" aria-live="polite">
        {filtrados.length} {filtrados.length === 1 ? "documento" : "documentos"}
      </span>

      {filtrados.length === 0 ? (
        documentos.length === 0 ? (
          <EmptyState
            icon={<SmDocLineIcon />}
            title="Nenhum documento"
            description="Envie certificados, protocolos e despachos para centralizá-los aqui."
            action={<DocumentoUploadDialog marcas={marcas} />}
          />
        ) : (
          <EmptyState
            icon={<SmDocLineIcon />}
            title="Nenhum documento encontrado"
            description="Nenhum documento corresponde aos filtros selecionados."
            variant="filtered"
            onClear={temFiltro ? limparFiltros : undefined}
          />
        )
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
