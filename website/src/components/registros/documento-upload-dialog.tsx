"use client";

import { useEffect, useId, useRef, useState } from "react";
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
import { Progress } from "@/components/ui/progress";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { notify } from "@/lib/notifications/toast";
import { DOCUMENTO_TIPO_OPTIONS, DOCUMENTO_TIPO_LABEL } from "@/lib/registros/types";
import type { DocumentoTipo } from "@/lib/registros/types";
import { FieldError } from "@/components/ui/field";
import { SmCloseLineIcon } from "@/components/icons";
import {
  UPLOAD_ACCEPT,
  formatarTamanho,
  isAbortError,
  putToSignedUrl,
  validarArquivo,
} from "./_upload";

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

type Campo = "marca" | "arquivo";

export function DocumentoUploadDialog({
  marcas,
  fixedMarcaId,
  processos = [],
  triggerLabel = "Enviar documento",
}: DocumentoUploadDialogProps) {
  const router = useRouter();
  const confirm = useConfirm();
  const id = useId();
  const [open, setOpen] = useState(false);
  const [marcaId, setMarcaId] = useState(fixedMarcaId ?? "");
  const [processoId, setProcessoId] = useState("");
  const [tipo, setTipo] = useState<DocumentoTipo>("outro");
  const [titulo, setTitulo] = useState("");
  const [sensivel, setSensivel] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [errors, setErrors] = useState<Partial<Record<Campo, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // O arquivo já chegou ao Storage nesta tentativa (antes do POST de metadados).
  const uploadConcluidoRef = useRef(false);

  const ids = {
    marca: `${id}-marca`,
    processo: `${id}-processo`,
    tipo: `${id}-tipo`,
    titulo: `${id}-titulo`,
    arquivo: `${id}-arquivo`,
    sensivel: `${id}-sensivel`,
  };

  const alvoMarca = fixedMarcaId ?? marcaId;
  // Cancela um upload em andamento ao desmontar.
  useEffect(() => () => abortRef.current?.abort(), []);

  /** Aborta o upload em andamento; retorna `true` se havia algo para cancelar. */
  function cancelarUpload(): boolean {
    const controller = abortRef.current;
    if (!controller) return false;
    controller.abort();
    abortRef.current = null;
    return true;
  }

  function cancelarEnvio() {
    if (!cancelarUpload()) return;
    if (uploadConcluidoRef.current) {
      // O objeto já subiu; só o registro não aconteceu. Dizer "nada subiu"
      // seria mentira — não há rota para apagar um objeto sem linha no banco.
      notify.warning("Registro cancelado", {
        description:
          "O arquivo chegou ao armazenamento, mas não foi registrado. Envie novamente para concluir.",
      });
    } else {
      notify.info("Envio cancelado");
    }
  }

  /** Limpa o arquivo escolhido (e o valor do input nativo). */
  function removerArquivo() {
    setFile(null);
    setErrors((prev) => ({ ...prev, arquivo: undefined }));
    if (fileInputRef.current) fileInputRef.current.value = "";
    fileInputRef.current?.focus();
  }

  function reset() {
    setMarcaId(fixedMarcaId ?? "");
    setProcessoId("");
    setTipo("outro");
    setTitulo("");
    setSensivel(true);
    setFile(null);
    setProgress(null);
    setErrors({});
    setServerError(null);
    uploadConcluidoRef.current = false;
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const sujo =
    file !== null ||
    titulo.trim() !== "" ||
    marcaId !== (fixedMarcaId ?? "") ||
    processoId !== "" ||
    tipo !== "outro" ||
    sensivel !== true;

  /** Fecha o diálogo; com rascunho preenchido, confirma o descarte antes. */
  async function requestClose() {
    if (loading) return;
    if (sujo) {
      const ok = await confirm({
        title: "Descartar alterações?",
        description: "O que você preencheu neste formulário será perdido.",
        confirmLabel: "Descartar",
        destructive: true,
      });
      if (!ok) return;
    }
    reset();
    setOpen(false);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.files?.[0] ?? null;
    setFile(next);
    const msg = next ? validarArquivo(next) : undefined;
    setErrors((prev) => ({ ...prev, arquivo: msg ?? undefined }));
    // O erro do servidor era sobre o arquivo anterior: deixar de mostrá-lo.
    setServerError(null);
  }

  function validar(): boolean {
    const next: Partial<Record<Campo, string>> = {};
    if (!alvoMarca) next.marca = "Selecione uma marca.";
    if (!file) next.arquivo = "Selecione um arquivo.";
    else {
      const msg = validarArquivo(file);
      if (msg) next.arquivo = msg;
    }
    setErrors(next);
    const primeiro = (Object.keys(next) as Campo[])[0];
    if (primeiro) document.getElementById(ids[primeiro])?.focus();
    return !primeiro;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setServerError(null);
    if (!validar() || !file) return;

    const controller = new AbortController();
    abortRef.current = controller;
    uploadConcluidoRef.current = false;
    setLoading(true);
    setProgress(0);
    try {
      // 1. URL de upload assinada
      const signRes = await fetch("/api/registros/documentos/sign-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marcaId: alvoMarca, filename: file.name, size: file.size }),
        signal: controller.signal,
      });
      const signData = await signRes.json();
      if (!signRes.ok) throw new Error(signData.error ?? "Erro ao preparar upload");

      // 2. Upload direto ao Storage (com progresso)
      await putToSignedUrl({
        uploadUrl: signData.uploadUrl,
        token: signData.token,
        file,
        signal: controller.signal,
        onProgress: setProgress,
      });
      uploadConcluidoRef.current = true;

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
        signal: controller.signal,
      });
      const metaData = await metaRes.json();
      if (!metaRes.ok) throw new Error(metaData.error ?? "Erro ao registrar documento");

      setOpen(false);
      reset();
      notify.success("Documento enviado");
      router.refresh();
    } catch (err) {
      if (isAbortError(err)) return;
      setServerError(err instanceof Error ? err.message : "Erro inesperado");
      notify.fromError(err, "Não foi possível enviar o documento");
    } finally {
      abortRef.current = null;
      uploadConcluidoRef.current = false;
      setLoading(false);
      setProgress(null);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (v) setOpen(true);
        else void requestClose();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent
        onEscapeKeyDown={(e) => {
          if (loading) e.preventDefault();
        }}
        onPointerDownOutside={(e) => {
          if (loading) e.preventDefault();
        }}
        onInteractOutside={(e) => {
          if (loading) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Enviar documento</DialogTitle>
          <DialogDescription>
            Certificados, protocolos, despachos e outros documentos jurídicos.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          {!fixedMarcaId && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={ids.marca}>Marca</Label>
              <NativeSelect
                id={ids.marca}
                size="sm"
                autoFocus
                value={marcaId}
                onChange={(e) => {
                  setMarcaId(e.target.value);
                  if (errors.marca) setErrors((p) => ({ ...p, marca: undefined }));
                }}
                disabled={loading}
                aria-invalid={!!errors.marca || undefined}
                aria-describedby={errors.marca ? `${ids.marca}-erro` : undefined}
              >
                <NativeSelectOption value="">Selecione…</NativeSelectOption>
                {marcas.map((m) => (
                  <NativeSelectOption key={m.id} value={m.id}>
                    {m.nome}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError id={`${ids.marca}-erro`}>{errors.marca}</FieldError>
            </div>
          )}

          {fixedMarcaId && processos.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={ids.processo}>Processo (opcional)</Label>
              <NativeSelect
                id={ids.processo}
                size="sm"
                autoFocus
                value={processoId}
                onChange={(e) => setProcessoId(e.target.value)}
                disabled={loading}
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
            <Label htmlFor={ids.tipo}>Tipo</Label>
            <NativeSelect
              id={ids.tipo}
              size="sm"
              autoFocus={!!fixedMarcaId && processos.length === 0}
              value={tipo}
              onChange={(e) => setTipo(e.target.value as DocumentoTipo)}
              disabled={loading}
            >
              {DOCUMENTO_TIPO_OPTIONS.map((t) => (
                <NativeSelectOption key={t} value={t}>
                  {DOCUMENTO_TIPO_LABEL[t]}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={ids.titulo}>Título</Label>
            <Input
              id={ids.titulo}
              size="sm"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex.: Certificado de registro"
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={ids.arquivo}>Arquivo</Label>
            <Input
              id={ids.arquivo}
              ref={fileInputRef}
              size="sm"
              type="file"
              accept={UPLOAD_ACCEPT}
              onChange={handleFileChange}
              disabled={loading}
              required
              aria-invalid={!!errors.arquivo || undefined}
              aria-describedby={errors.arquivo ? `${ids.arquivo}-erro` : `${ids.arquivo}-ajuda`}
            />
            {file && (
              <div className="flex items-center gap-2 pl-2 text-xs text-muted-foreground">
                <span className="min-w-0 truncate">
                  {file.name} · {formatarTamanho(file.size)}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="shrink-0"
                  disabled={loading}
                  onClick={removerArquivo}
                >
                  <SmCloseLineIcon aria-hidden="true" />
                  <span>Remover</span>
                </Button>
              </div>
            )}
            <FieldError id={`${ids.arquivo}-erro`}>{errors.arquivo}</FieldError>
            {!errors.arquivo && (
              <p id={`${ids.arquivo}-ajuda`} className="pl-2 text-xs text-muted-foreground">
                PDF, PNG, JPG ou WEBP até 100 MB.
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 pl-2 text-sm text-muted-foreground">
            <input
              id={ids.sensivel}
              type="checkbox"
              checked={sensivel}
              onChange={(e) => setSensivel(e.target.checked)}
              disabled={loading}
            />
            <Label htmlFor={ids.sensivel} className="pl-0 font-normal text-muted-foreground">
              Documento sensível
            </Label>
          </div>

          {progress !== null && (
            <div className="flex flex-col gap-1.5">
              <Progress
                value={progress}
                aria-label="Progresso do upload"
                aria-valuetext={`${progress}%`}
              />
              <span className="pl-2 text-xs text-muted-foreground" aria-live="polite">
                {progress < 100 ? `Enviando… ${progress}%` : "Registrando documento…"}
              </span>
            </div>
          )}

          {serverError && (
            <FieldError>{serverError}</FieldError>
          )}

          <DialogFooter>
            <Button
              type="submit"
              loading={loading}
              loadingText="Enviando…"
            >
              Enviar
            </Button>
            {progress !== null ? (
              <Button type="button" variant="outline" onClick={cancelarEnvio}>
                Cancelar envio
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={() => void requestClose()}
              >
                Fechar
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
