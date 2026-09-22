"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useConfirm } from "@/components/ui/confirm-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SmCloseLineIcon,
  SmImageLineIcon,
} from "@/components/icons";
import { MYCELIUM_TYPES, type MyceliumType } from "@/lib/mycelium-types";
import {
  MyceliumAttachmentUploader,
  MYCELIUM_MAX_FILE_MB,
  MYCELIUM_MAX_TOTAL_MB,
  MYCELIUM_MAX_TOTAL_BYTES,
  formatMB,
  type AttachmentDraft,
} from "@/components/mycelium-attachment-uploader";
import { notify } from "@/lib/notifications";

interface MyceliumPostFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (id: string) => void;
}

interface OgResponse {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
}

/**
 * O formulário envia tudo em um único multipart para a Route Handler
 * `/api/mycelium/create`, e o corpo de uma Route Handler na Vercel é limitado a
 * ~4,5 MB — não há caminho de upload direto reutilizável para o Mycelium
 * (`lib/direct-upload.ts` fala com `/api/assets/*` e grava registros de asset).
 * São dois tetos diferentes: um por arquivo (a capa não pode sozinha consumir o
 * envio inteiro) e o do total, que é o limite real da plataforma. Ambos são
 * validados a cada arquivo escolhido, nunca só no submit.
 */
const MAX_COVER_MB = MYCELIUM_MAX_FILE_MB;

const MAX_TOTAL_BYTES = MYCELIUM_MAX_TOTAL_BYTES;

function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === "AbortError";
}

/** Aceita apenas http(s) com host válido. */
function isValidHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return (u.protocol === "http:" || u.protocol === "https:") && u.hostname.includes(".");
  } catch {
    return false;
  }
}

async function fileFromUrl(url: string): Promise<File | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    const ext =
      blob.type && blob.type.split("/")[1]
        ? blob.type.split("/")[1].split(";")[0]
        : "jpg";
    const filename = `og-cover.${ext}`;
    return new File([blob], filename, { type: blob.type || "image/jpeg" });
  } catch {
    return null;
  }
}

/** POST multipart via XHR para expor progresso de envio e permitir cancelamento. */
function postFormWithProgress(args: {
  url: string;
  form: FormData;
  signal: AbortSignal;
  onProgress: (pct: number) => void;
}): Promise<{ ok: boolean; status: number; body: unknown }> {
  const { url, form, signal, onProgress } = args;
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.responseType = "json";

    const onAbort = () => xhr.abort();
    signal.addEventListener("abort", onAbort, { once: true });
    const cleanup = () => signal.removeEventListener("abort", onAbort);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      cleanup();
      resolve({ ok: xhr.status >= 200 && xhr.status < 300, status: xhr.status, body: xhr.response });
    };
    xhr.onerror = () => {
      cleanup();
      reject(new Error("Falha de rede durante o envio"));
    };
    xhr.onabort = () => {
      cleanup();
      reject(new DOMException("Aborted", "AbortError"));
    };
    xhr.send(form);
  });
}

export function MyceliumPostForm({
  open,
  onOpenChange,
  onCreated,
}: MyceliumPostFormProps) {
  const confirm = useConfirm();
  const [type, setType] = useState<MyceliumType>("artigo");
  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [cover, setCover] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverError, setCoverError] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<AttachmentDraft[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ogLoading, setOgLoading] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const ogAbortRef = useRef<AbortController | null>(null);

  const formId = useId();
  const titleErrorId = useId();
  const urlErrorId = useId();
  const coverLabelId = useId();
  const coverButtonId = useId();
  const coverErrorId = useId();
  const mediaLabelId = useId();

  const isDirty =
    title.trim() !== "" ||
    description.trim() !== "" ||
    url.trim() !== "" ||
    cover !== null ||
    attachments.length > 0 ||
    tags.length > 0 ||
    tagInput.trim() !== "";

  // Sync coverPreview with cover File and revoke prior URLs.
  useEffect(() => {
    if (!cover) {
      setCoverPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(cover);
    setCoverPreview(objectUrl);
    return () => {
      try {
        URL.revokeObjectURL(objectUrl);
      } catch {
        /* noop */
      }
    };
  }, [cover]);

  // Aborta requisições pendentes ao desmontar.
  useEffect(
    () => () => {
      abortRef.current?.abort();
      ogAbortRef.current?.abort();
    },
    [],
  );

  const resetForm = useCallback(() => {
    ogAbortRef.current?.abort();
    ogAbortRef.current = null;
    setOgLoading(false);
    setType("artigo");
    setTitle("");
    setTitleError(null);
    setDescription("");
    setUrl("");
    setUrlError(null);
    setTags([]);
    setTagInput("");
    setCover(null);
    setCoverPreview(null);
    setCoverError(null);
    setProgress(0);
    // Revoke any attachment URLs that are still around.
    attachments.forEach((a) => {
      try {
        URL.revokeObjectURL(a.previewUrl);
      } catch {
        /* noop */
      }
    });
    setAttachments([]);
  }, [attachments]);

  /** Fecha o sheet; com dados preenchidos, pede confirmação para descartar. */
  const requestClose = useCallback(async () => {
    if (submitting) return;
    if (isDirty) {
      const ok = await confirm({
        title: "Descartar a referência?",
        description: "O que você preencheu será perdido.",
        confirmLabel: "Descartar",
        destructive: true,
      });
      if (!ok) return;
    }
    ogAbortRef.current?.abort();
    resetForm();
    onOpenChange(false);
  }, [confirm, isDirty, onOpenChange, resetForm, submitting]);

  /** Bytes já comprometidos pelas mídias adicionais. */
  const attachmentsBytes = attachments.reduce((soma, a) => soma + a.file.size, 0);
  const totalBytes = (cover?.size ?? 0) + attachmentsBytes;

  /** Valida tipo, tamanho por arquivo e teto do envio inteiro — vale tanto para
   *  a seleção manual quanto para a imagem trazida do OG do link. */
  const handleCoverChange = useCallback(
    (file: File | null) => {
      if (file) {
        if (!file.type.startsWith("image/")) {
          setCoverError("A capa precisa ser uma imagem.");
          return;
        }
        if (file.size > MAX_COVER_MB * 1024 * 1024) {
          setCoverError(`A capa excede ${MAX_COVER_MB} MB por arquivo.`);
          return;
        }
        if (file.size + attachmentsBytes > MAX_TOTAL_BYTES) {
          setCoverError(
            `A capa estouraria o total de ${MYCELIUM_MAX_TOTAL_MB} MB do envio (restam ${formatMB(
              Math.max(0, MAX_TOTAL_BYTES - attachmentsBytes),
            )}).`,
          );
          return;
        }
      }
      setCoverError(null);
      setCover(file);
    },
    [attachmentsBytes],
  );

  const handleUrlBlur = useCallback(async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setUrlError(null);
      return;
    }
    if (!isValidHttpUrl(trimmed)) {
      setUrlError("Informe um link válido, começando com http:// ou https://.");
      return;
    }
    setUrlError(null);

    ogAbortRef.current?.abort();
    const controller = new AbortController();
    ogAbortRef.current = controller;
    setOgLoading(true);
    try {
      const res = await fetch(
        `/api/mycelium/og?url=${encodeURIComponent(trimmed)}`,
        { signal: controller.signal },
      );
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      const data: OgResponse = await res.json();

      if (data.title && !title.trim()) {
        setTitle(data.title);
        setTitleError(null);
      }
      if (data.description && !description.trim()) {
        setDescription(data.description);
      }
      if (data.image && !cover) {
        const file = await fileFromUrl(data.image);
        if (file && !controller.signal.aborted) handleCoverChange(file);
      }
    } catch (err) {
      if (isAbortError(err)) return;
      notify.info("Não foi possível ler a pré-visualização do link", {
        description: "Preencha título e descrição manualmente.",
      });
    } finally {
      // O indicador pertence ao request corrente. Se outro fetch começou, o ref
      // já aponta para o novo controller e é ele quem desliga o indicador; em
      // qualquer outro caso (inclusive abort vindo do submit ou do fechamento)
      // desligamos aqui — senão "carregando metadados…" ficava para sempre.
      if (ogAbortRef.current === controller) {
        ogAbortRef.current = null;
        setOgLoading(false);
      }
    }
  }, [url, title, description, cover, handleCoverChange]);

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const next = tagInput.trim().replace(/^#/, "");
      if (next && !tags.includes(next)) {
        setTags([...tags, next]);
      }
      setTagInput("");
    } else if (e.key === "Backspace" && tagInput === "" && tags.length > 0) {
      e.preventDefault();
      setTags(tags.slice(0, -1));
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    const trimmedUrl = url.trim();
    const nextTitleError = title.trim() ? null : "Informe um título para a referência.";
    const nextUrlError =
      trimmedUrl && !isValidHttpUrl(trimmedUrl)
        ? "Informe um link válido, começando com http:// ou https://."
        : null;
    setTitleError(nextTitleError);
    setUrlError(nextUrlError);
    if (nextUrlError) {
      urlInputRef.current?.focus();
      return;
    }
    if (nextTitleError) {
      titleInputRef.current?.focus();
      return;
    }

    // Rede de segurança: o total já é validado a cada arquivo adicionado.
    if (totalBytes > MAX_TOTAL_BYTES) {
      notify.error("Arquivos grandes demais para um envio", {
        description: `O total de capa e mídias é ${formatMB(totalBytes)} e precisa caber em ${MYCELIUM_MAX_TOTAL_MB} MB. Remova ou comprima alguns arquivos.`,
      });
      return;
    }

    ogAbortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setSubmitting(true);
    setProgress(0);
    try {
      const formData = new FormData();
      formData.append(
        "payload",
        JSON.stringify({
          type,
          title: title.trim(),
          description: description.trim(),
          url: trimmedUrl,
          tags,
        }),
      );
      if (cover) formData.append("cover", cover);
      attachments.forEach((a) => formData.append("attachments", a.file));

      const res = await postFormWithProgress({
        url: "/api/mycelium/create",
        form: formData,
        signal: controller.signal,
        onProgress: setProgress,
      });

      if (res.ok) {
        const data = res.body as { reference?: { id?: string }; id?: string } | null;
        const newId: string | undefined = data?.reference?.id ?? data?.id;
        if (newId && onCreated) onCreated(newId);
        resetForm();
        onOpenChange(false);
        notify.success("Referência publicada");
      } else {
        const body = res.body as { error?: string } | null;
        notify.error("Não foi possível publicar a referência", {
          description: body?.error || `Erro ${res.status}`,
        });
      }
    } catch (err) {
      if (isAbortError(err)) {
        notify.info("Envio cancelado");
      } else {
        notify.fromError(err, "Não foi possível publicar a referência");
      }
    } finally {
      abortRef.current = null;
      setSubmitting(false);
      setProgress(0);
    }
  };

  const cancelUpload = () => {
    abortRef.current?.abort();
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (next) {
          onOpenChange(true);
          return;
        }
        void requestClose();
      }}
    >
      <SheetContent
        side="right"
        className="w-full sm:max-w-md md:max-w-lg overflow-hidden"
        onPointerDownOutside={(e) => { if (submitting) e.preventDefault(); }}
        onInteractOutside={(e) => { if (submitting) e.preventDefault(); }}
        onEscapeKeyDown={(e) => { if (submitting) e.preventDefault(); }}
      >
        <SheetHeader>
          <SheetTitle className="text-lg">Nova referência</SheetTitle>
          <SheetDescription>
            Compartilhe um artigo, vídeo, imagem ou outro material com a rede.
          </SheetDescription>
        </SheetHeader>

        <form
          id={formId}
          className="flex-1 overflow-y-auto scrollbar-thin -mx-4 px-4 py-2 flex flex-col gap-4"
          noValidate
          onSubmit={handleSubmit}
        >
          {/* Tipo */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="mycelium-type">Tipo</Label>
            <Select
              value={type}
              onValueChange={(v) => setType(v as MyceliumType)}
              disabled={submitting}
            >
              <SelectTrigger id="mycelium-type">
                <SelectValue placeholder="Selecione um tipo" />
              </SelectTrigger>
              <SelectContent>
                {MYCELIUM_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* URL */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="mycelium-url">
              Link / URL{" "}
              {ogLoading && (
                <span
                  className="text-xs text-muted-foreground font-normal"
                  aria-live="polite"
                >
                  carregando metadados…
                </span>
              )}
            </Label>
            <Input
              ref={urlInputRef}
              id="mycelium-url"
              type="url"
              inputMode="url"
              placeholder="https://"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (urlError) setUrlError(null);
              }}
              onBlur={handleUrlBlur}
              disabled={submitting}
              aria-invalid={urlError ? true : undefined}
              aria-describedby={urlError ? urlErrorId : undefined}
            />
            {urlError && (
              <FieldError id={urlErrorId}>{urlError}</FieldError>
            )}
          </div>

          {/* Título */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="mycelium-title">
              Título{" "}
              <span className="text-destructive" aria-hidden="true">
                *
              </span>
            </Label>
            <Input
              ref={titleInputRef}
              id="mycelium-title"
              type="text"
              placeholder="Dê um título à referência"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (titleError && e.target.value.trim()) setTitleError(null);
              }}
              required
              autoFocus
              disabled={submitting}
              aria-required="true"
              aria-invalid={titleError ? true : undefined}
              aria-describedby={titleError ? titleErrorId : undefined}
            />
            {titleError && (
              <FieldError id={titleErrorId}>{titleError}</FieldError>
            )}
          </div>

          {/* Descrição */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="mycelium-description">Descrição</Label>
            <Textarea
              id="mycelium-description"
              placeholder="Por que vale a pena? Qual contexto?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
              size="sm"
            />
          </div>

          {/* Capa */}
          <div className="flex flex-col gap-1.5">
            <Label id={coverLabelId}>Capa</Label>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              disabled={submitting}
              tabIndex={-1}
              aria-hidden="true"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                handleCoverChange(file);
                e.target.value = "";
              }}
            />
            {coverPreview ? (
              <div className="relative w-full rounded-field overflow-hidden bg-accent/60 border border-foreground/10">
                {/* eslint-disable-next-line @next/next/no-img-element -- blob: URL local, sem otimização */}
                <img
                  src={coverPreview}
                  alt="Pré-visualização da capa"
                  className="w-full h-40 object-cover"
                />
                <Button
                  type="button"
                  size="icon-sm"
                  variant="secondary"
                  onClick={() => handleCoverChange(null)}
                  disabled={submitting}
                  // O vermelho de `--destructive` é cor de marca nos dois temas,
                  // então o ícone sobre ele é branco literal.
                  className="absolute top-2 right-2 border border-foreground/20 bg-background/90 shadow-sm hover:bg-destructive hover:text-absolute-white"
                  aria-label="Remover capa"
                >
                  <SmCloseLineIcon className="size-4" />
                </Button>
              </div>
            ) : (
              <button
                type="button"
                id={coverButtonId}
                aria-labelledby={`${coverLabelId} ${coverButtonId}`}
                aria-describedby={coverError ? coverErrorId : undefined}
                data-invalid={coverError ? "true" : undefined}
                onClick={() => coverInputRef.current?.click()}
                disabled={submitting}
                className="flex flex-col items-center justify-center gap-2 w-full h-32 rounded-field border-2 border-dashed border-foreground/20 bg-accent/30 text-sm text-muted-foreground transition-colors hover:bg-accent/50 outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[invalid=true]:border-destructive disabled:pointer-events-none disabled:opacity-60"
              >
                <SmImageLineIcon className="size-6 text-surface-500" />
                <span>Adicionar capa (até {MAX_COVER_MB} MB)</span>
                <span className="text-xs">
                  <span className="tabular-nums">
                    {formatMB(totalBytes)} de {MYCELIUM_MAX_TOTAL_MB} MB
                  </span>{" "}
                  no envio
                </span>
              </button>
            )}
            {coverError && (
              <FieldError id={coverErrorId}>{coverError}</FieldError>
            )}
          </div>

          {/* Mídias adicionais */}
          <div className="flex flex-col gap-1.5">
            <Label id={mediaLabelId}>Mídias adicionais</Label>
            <MyceliumAttachmentUploader
              files={attachments}
              onChange={setAttachments}
              outrosBytes={cover?.size ?? 0}
              disabled={submitting}
              aria-labelledby={mediaLabelId}
            />
          </div>

          {/* Tags */}
          <div className="flex flex-col gap-2.5">
            <Label htmlFor="mycelium-tag-input">Tags</Label>
            <div className="flex flex-wrap items-center gap-2.5 rounded-field border-2 border-transparent bg-input/30 px-2 py-2 min-h-12 focus-within:border-foreground/70 focus-within:bg-transparent transition-colors">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-2 rounded-full bg-accent/80 text-secondary-foreground px-2.5 py-1 text-xs font-medium"
                >
                  #{tag}
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    onClick={() => removeTag(tag)}
                    disabled={submitting}
                    className="-my-1"
                    aria-label={`Remover ${tag}`}
                  >
                    <SmCloseLineIcon className="size-3" />
                  </Button>
                </span>
              ))}
              <input
                id="mycelium-tag-input"
                type="text"
                placeholder={
                  tags.length === 0 ? "Enter pra adicionar tags" : ""
                }
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                disabled={submitting}
                className="flex-1 min-w-[100px] bg-transparent border-0 rounded-sm outline-none focus-visible:ring-transparent text-sm placeholder:text-muted-foreground py-1 px-2"
              />
            </div>
          </div>

          {submitting && (
            <div className="space-y-1.5" aria-live="polite">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Enviando arquivos…</span>
                <span className="tabular-nums">{progress}%</span>
              </div>
              <Progress value={progress} aria-label="Progresso do envio" />
            </div>
          )}

          <SheetFooter className="sticky bottom-0 -mx-4 px-4 pb-2 bg-(--surface-950)">
            {submitting ? (
              <Button
                type="button"
                variant="outline"
                onClick={cancelUpload}
                className="flex-1"
              >
                Cancelar envio
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => void requestClose()}
                className="flex-1"
              >
                Cancelar
              </Button>
            )}
            <Button
              type="submit"
              form={formId}
              loading={submitting}
              loadingText="Publicando…"
              className="flex-1"
            >
              Publicar
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
