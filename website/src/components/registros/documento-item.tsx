"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SmDownloadLineIcon, SmDeleteLineIcon, SmLockLineIcon } from "@/components/icons";
import {
  DOCUMENTO_TIPO_LABEL,
  formatarData,
  formatarTamanho,
} from "@/lib/registros/types";
import type { DocumentoRow } from "@/lib/registros/types";

interface DocumentoItemProps {
  documento: DocumentoRow;
  /** Rótulo opcional da marca (usado na listagem geral). */
  marcaNome?: string;
}

export function DocumentoItem({ documento, marcaNome }: DocumentoItemProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Remover este documento? Esta ação não pode ser desfeita.")) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/registros/documentos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: documento.id }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Erro ao remover");
      }
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao remover documento");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-lg bg-[var(--surface-950)] px-4 py-3">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">{documento.titulo}</span>
          {documento.sensivel && (
            <Badge variant="warning">
              <SmLockLineIcon />
              Sensível
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline">{DOCUMENTO_TIPO_LABEL[documento.tipo]}</Badge>
          {marcaNome && <span>{marcaNome}</span>}
          <span>{formatarTamanho(documento.tamanho)}</span>
          <span>{formatarData(documento.created_at)}</span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button variant="ghost" size="icon" asChild aria-label="Baixar">
          <a href={`/api/registros/documentos/download?id=${documento.id}`}>
            <SmDownloadLineIcon />
          </a>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          disabled={deleting}
          aria-label="Remover"
        >
          <SmDeleteLineIcon />
        </Button>
      </div>
    </div>
  );
}
