"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  SmDownloadLineIcon,
  SmDeleteLineIcon,
  SmLockLineIcon,
  SmVisibilitySolidIcon,
} from "@/components/icons";
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
  const [previewOpen, setPreviewOpen] = useState(false);

  const inlineUrl = `/api/registros/documentos/download?id=${documento.id}&inline=1`;
  const mime = documento.mime_type ?? "";
  const isImagem = mime.startsWith("image/");
  const isPdf = mime === "application/pdf";
  const suportaPreview = isImagem || isPdf;

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
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setPreviewOpen(true)}
          aria-label="Visualizar"
        >
          <SmVisibilitySolidIcon />
        </Button>
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

      {/* Modal de preview — o arquivo vem do nosso storage privado via rota
          autenticada; imagens e PDFs renderizam inline, o resto cai no download. */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="truncate">{documento.titulo}</DialogTitle>
            <DialogDescription>
              {DOCUMENTO_TIPO_LABEL[documento.tipo]}
              {marcaNome ? ` · ${marcaNome}` : ""} · {formatarTamanho(documento.tamanho)}
            </DialogDescription>
          </DialogHeader>
          {previewOpen && suportaPreview ? (
            isImagem ? (
              <div className="flex items-center justify-center rounded-md bg-[var(--surface-900)] p-8">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={inlineUrl}
                  alt={documento.titulo}
                  className="max-h-[65vh] max-w-full rounded-md"
                />
              </div>
            ) : (
              <iframe
                src={inlineUrl}
                title={documento.titulo}
                className="h-[70vh] w-full rounded-md border border-[var(--surface-800)]"
              />
            )
          ) : (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                Este tipo de arquivo não tem visualização no navegador.
              </p>
              <Button asChild variant="outline" size="sm">
                <a href={`/api/registros/documentos/download?id=${documento.id}`}>
                  <SmDownloadLineIcon />
                  Baixar arquivo
                </a>
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
