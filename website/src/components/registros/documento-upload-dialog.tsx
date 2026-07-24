"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { SmUploadLineIcon } from "@/components/icons";
import { DOCUMENTO_TIPO_OPTIONS, DOCUMENTO_TIPO_LABEL } from "@/lib/registros/types";
import type { DocumentoTipo } from "@/lib/registros/types";

interface MarcaOption {
  id: string;
  nome: string;
}

interface ProcessoOption {
  id: string;
  numero: string;
}

interface DocumentoUploadDialogProps {
  marcas: MarcaOption[];
  /** Quando definido, a marca é fixa e o seletor de marca não aparece. */
  fixedMarcaId?: string;
  /** Processos da marca fixa, para vínculo opcional do documento. */
  processos?: ProcessoOption[];
  triggerLabel?: string;
}

async function putToSignedUrl(uploadUrl: string, token: string, file: File) {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "x-upsert": "false",
      ...(file.type ? { "Content-Type": file.type } : {}),
    },
    body: file,
  });
  if (!res.ok) {
    throw new Error(`Falha no upload (HTTP ${res.status})`);
  }
}

export function DocumentoUploadDialog({
  marcas,
  fixedMarcaId,
  processos = [],
  triggerLabel = "Enviar documento",
}: DocumentoUploadDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [marcaId, setMarcaId] = useState(fixedMarcaId ?? "");
  const [processoId, setProcessoId] = useState("");
  const [tipo, setTipo] = useState<DocumentoTipo>("outro");
  const [titulo, setTitulo] = useState("");
  const [sensivel, setSensivel] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setMarcaId(fixedMarcaId ?? "");
    setProcessoId("");
    setTipo("outro");
    setTitulo("");
    setSensivel(true);
    setFile(null);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const alvoMarca = fixedMarcaId ?? marcaId;
    if (!alvoMarca) {
      setError("Selecione uma marca.");
      return;
    }
    if (!file) {
      setError("Selecione um arquivo.");
      return;
    }

    setLoading(true);
    try {
      // 1. URL de upload assinada
      const signRes = await fetch("/api/registros/documentos/sign-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marcaId: alvoMarca, filename: file.name, size: file.size }),
      });
      const signData = await signRes.json();
      if (!signRes.ok) throw new Error(signData.error ?? "Erro ao preparar upload");

      // 2. Upload direto ao Storage
      await putToSignedUrl(signData.uploadUrl, signData.token, file);

      // 3. Registro dos metadados
      const metaRes = await fetch("/api/registros/documentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marcaId: alvoMarca,
          processoId: processoId || null,
          tipo,
          titulo: titulo.trim() || file.name,
          storagePath: signData.path,
          mimeType: file.type || null,
          tamanho: file.size,
          sensivel,
        }),
      });
      const metaData = await metaRes.json();
      if (!metaRes.ok) throw new Error(metaData.error ?? "Erro ao registrar documento");

      setOpen(false);
      reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <SmUploadLineIcon />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enviar documento</DialogTitle>
          <DialogDescription>
            Certificados, protocolos, despachos e outros documentos jurídicos.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!fixedMarcaId && (
            <div className="flex flex-col gap-1.5">
              <Label>Marca</Label>
              <NativeSelect
                size="sm"
                value={marcaId}
                onChange={(e) => setMarcaId(e.target.value)}
              >
                <NativeSelectOption value="">Selecione…</NativeSelectOption>
                {marcas.map((m) => (
                  <NativeSelectOption key={m.id} value={m.id}>
                    {m.nome}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
          )}

          {fixedMarcaId && processos.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <Label>Processo (opcional)</Label>
              <NativeSelect
                size="sm"
                value={processoId}
                onChange={(e) => setProcessoId(e.target.value)}
              >
                <NativeSelectOption value="">Nenhum</NativeSelectOption>
                {processos.map((p) => (
                  <NativeSelectOption key={p.id} value={p.id}>
                    {p.numero}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label>Tipo</Label>
            <NativeSelect
              size="sm"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as DocumentoTipo)}
            >
              {DOCUMENTO_TIPO_OPTIONS.map((t) => (
                <NativeSelectOption key={t} value={t}>
                  {DOCUMENTO_TIPO_LABEL[t]}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Título</Label>
            <Input
              size="sm"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex.: Certificado de registro"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Arquivo</Label>
            <Input
              size="sm"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <label className="flex items-center gap-2 pl-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={sensivel}
              onChange={(e) => setSensivel(e.target.checked)}
            />
            Documento sensível
          </label>

          {error && <p className="pl-2 text-sm text-destructive">{error}</p>}

          <DialogFooter showCloseButton>
            <Button type="submit" disabled={loading}>
              {loading ? "Enviando…" : "Enviar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
