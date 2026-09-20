"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { FieldError } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { headingTitleVariants } from "@/components/ui/heading";
import {
  Upload,
  UploadTrigger,
  UploadFile,
  UploadMessage,
} from "@/components/ui/upload";
import { AD_PLATFORMS, type AdType } from "@/lib/ads";
import { notify } from "@/lib/notifications";

/**
 * O envio passa por `/api/ads` (multipart lido no servidor). No Vercel o corpo
 * da requisição é limitado a ~4,5 MB, então o limite por arquivo precisa ser realista.
 */
const MAX_SIZE_MB = 4;
/**
 * O corpo inteiro da requisição (todos os arquivos somados) precisa caber no
 * limite do servidor — três imagens de 4 MB num carrossel dariam 413.
 */
const MAX_TOTAL_MB = 4;
const MAX_TOTAL_BYTES = MAX_TOTAL_MB * 1024 * 1024;

function formatMB(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface AdUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

type MetricField = "ctr" | "conversion" | "retentionSeconds" | "retentionPercent";
type FieldName = "title" | "files" | MetricField;
type FieldErrors = Partial<Record<FieldName, string>>;

const FIELD_ORDER: FieldName[] = ["title", "files", "ctr", "conversion", "retentionSeconds", "retentionPercent"];

/** Valida um campo numérico opcional. `percent` aceita 0–100; `seconds` aceita ≥ 0. */
function validateMetric(raw: string, kind: "percent" | "seconds"): string | undefined {
  const t = raw.trim().replace(",", ".");
  if (!t) return undefined;
  const n = Number(t);
  if (!Number.isFinite(n)) return "Informe um número válido.";
  if (kind === "percent" && (n < 0 || n > 100)) return "Use um valor entre 0 e 100.";
  if (kind === "seconds" && n < 0) return "Use um valor maior ou igual a 0.";
  return undefined;
}

function expectedMime(type: AdType): "image/" | "video/" {
  return type === "video" ? "video/" : "image/";
}

const ACCEPT_BY_TYPE: Record<AdType, string[]> = {
  image: [".jpg", ".jpeg", ".png", ".webp", ".avif"],
  carousel: [".jpg", ".jpeg", ".png", ".webp", ".avif"],
  video: [".mp4", ".mov", ".webm", ".avi"],
};

/**
 * O browser nem sempre informa o MIME (`.mov`, `.avi` e `.webm` no Windows
 * chegam com `type === ""`): nesse caso a checagem cai na extensão.
 */
function fileMatchesType(file: File, type: AdType): boolean {
  const mime = (file.type || "").toLowerCase();
  if (mime) return mime.startsWith(expectedMime(type));
  const name = file.name.toLowerCase();
  return ACCEPT_BY_TYPE[type].some((ext) => name.endsWith(ext));
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

export function AdUploadModal({ open, onOpenChange, onCreated }: AdUploadModalProps) {
  const uid = useId();
  const fieldId = (name: string) => `${uid}-${name}`;
  const confirm = useConfirm();
  const [type, setType] = useState<AdType>("image");
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState("");
  const [ctr, setCtr] = useState("");
  const [retentionSeconds, setRetentionSeconds] = useState("");
  const [retentionPercent, setRetentionPercent] = useState("");
  const [conversion, setConversion] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  /** Erro do formulário (falha de rede/servidor) — separado dos erros de campo. */
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const abortRef = useRef<AbortController | null>(null);
  const fieldRefs = useRef<Partial<Record<FieldName, HTMLElement | null>>>({});
  const typeRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const accept =
    type === "video"
      ? ".mp4,.mov,.webm,.avi"
      : ".jpg,.jpeg,.png,.webp,.avif";

  const isDirty =
    files.length > 0 ||
    title.trim() !== "" ||
    platform !== "" ||
    ctr !== "" ||
    retentionSeconds !== "" ||
    retentionPercent !== "" ||
    conversion !== "" ||
    notes.trim() !== "";

  const reset = useCallback(() => {
    setType("image");
    setFiles([]);
    setTitle("");
    setPlatform("");
    setCtr("");
    setRetentionSeconds("");
    setRetentionPercent("");
    setConversion("");
    setNotes("");
    setErrors({});
    setFormError(null);
    setSubmitting(false);
    setProgress(0);
  }, []);

  // Aborta um envio pendente se o componente desmontar.
  useEffect(() => () => abortRef.current?.abort(), []);

  const setFieldError = (name: FieldName, message: string | undefined) =>
    setErrors((prev) => ({ ...prev, [name]: message }));

  const requestClose = useCallback(async () => {
    if (submitting) return;
    if (isDirty) {
      const ok = await confirm({
        title: "Descartar o anúncio?",
        description: "Os dados e arquivos selecionados serão perdidos.",
        confirmLabel: "Descartar",
        destructive: true,
      });
      if (!ok) return;
    }
    reset();
    onOpenChange(false);
  }, [confirm, isDirty, onOpenChange, reset, submitting]);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (next) {
        onOpenChange(true);
        return;
      }
      void requestClose();
    },
    [onOpenChange, requestClose],
  );

  /**
   * Troca o tipo preservando os arquivos compatíveis; se algum for descartado,
   * pede confirmação antes (um carrossel de 3 imagens não some em silêncio).
   * Resolve `true` quando o tipo mudou.
   */
  const handleType = async (next: AdType): Promise<boolean> => {
    if (submitting || next === type) return false;
    const compatible = files.filter((f) => fileMatchesType(f, next));
    const kept = next === "carousel" ? compatible : compatible.slice(0, 1);
    const dropped = files.length - kept.length;

    if (dropped > 0) {
      const ok = await confirm({
        destructive: true,
        title: "Trocar o tipo do anúncio?",
        description:
          dropped === files.length
            ? `Os ${files.length === 1 ? "arquivo selecionado será removido" : `${files.length} arquivos selecionados serão removidos`} — não são compatíveis com o novo tipo.`
            : `${dropped === 1 ? "1 arquivo será removido" : `${dropped} arquivos serão removidos`} — só ${kept.length === 1 ? "1 é compatível" : `${kept.length} são compatíveis`} com o novo tipo.`,
        confirmLabel: "Trocar tipo",
        cancelLabel: "Manter seleção",
      });
      if (!ok) return false;
    }

    setType(next);
    setFiles(kept);
    setFieldError("files", undefined);
    return true;
  };

  // Radiogroup com roving tabindex: setas movem a seleção entre os tipos.
  const handleTypeKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (submitting) return;
    let nextIndex: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") nextIndex = (index + 1) % typeOptions.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") nextIndex = (index - 1 + typeOptions.length) % typeOptions.length;
    else if (e.key === "Home") nextIndex = 0;
    else if (e.key === "End") nextIndex = typeOptions.length - 1;
    if (nextIndex === null) return;
    const target = nextIndex;
    e.preventDefault();
    void handleType(typeOptions[target].value).then((changed) => {
      // Confirmação recusada: o foco volta sozinho para o botão de origem.
      if (changed) typeRefs.current[target]?.focus();
    });
  };

  const handleFiles = useCallback(
    (list: FileList | null) => {
      if (!list) return;
      const incoming = Array.from(list);
      const limit = MAX_SIZE_MB * 1024 * 1024;
      const rejected: string[] = [];
      const accepted: File[] = [];
      // O carrossel acumula: o teto total conta o que já está selecionado.
      let used = type === "carousel" ? files.reduce((sum, f) => sum + f.size, 0) : 0;

      for (const f of incoming) {
        if (!fileMatchesType(f, type)) {
          rejected.push(`${f.name}: não é ${type === "video" ? "um vídeo" : "uma imagem"}`);
        } else if (f.size > limit) {
          rejected.push(`${f.name}: excede ${MAX_SIZE_MB} MB`);
        } else if (used + f.size > MAX_TOTAL_BYTES) {
          rejected.push(`${f.name}: estouraria o total de ${MAX_TOTAL_MB} MB`);
        } else {
          accepted.push(f);
          used += f.size;
        }
      }

      if (rejected.length > 0) {
        setFieldError("files", `Ignorado — ${rejected.join("; ")}.`);
        notify.warning("Alguns arquivos foram ignorados", {
          description: rejected.join("; "),
        });
      } else {
        setFieldError("files", undefined);
      }

      if (accepted.length === 0) return;
      if (type === "carousel") {
        setFiles((prev) => [...prev, ...accepted]);
      } else {
        setFiles(accepted.slice(0, 1));
      }
    },
    [type, files],
  );

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const moveFile = (idx: number, dir: -1 | 1) => {
    setFiles((prev) => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const totalBytes = files.reduce((sum, f) => sum + f.size, 0);

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    if (!title.trim()) next.title = "Informe um título.";
    if (files.length === 0) next.files = "Selecione pelo menos um arquivo.";
    else if (type === "carousel" && files.length < 2) next.files = "Carrossel precisa de pelo menos 2 imagens.";
    else if (type !== "carousel" && files.length !== 1) next.files = "Selecione exatamente 1 arquivo.";
    else if (totalBytes > MAX_TOTAL_BYTES)
      next.files = `Os arquivos somam ${formatMB(totalBytes)} — o limite total é ${MAX_TOTAL_MB} MB. Remova ou troque algum.`;
    next.ctr = validateMetric(ctr, "percent");
    next.conversion = validateMetric(conversion, "percent");
    if (type === "video") {
      next.retentionSeconds = validateMetric(retentionSeconds, "seconds");
      next.retentionPercent = validateMetric(retentionPercent, "percent");
    }
    return next;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    setFormError(null);

    const next = validate();
    setErrors(next);
    const firstInvalid = FIELD_ORDER.find((f) => next[f]);
    if (firstInvalid) {
      const target = fieldRefs.current[firstInvalid];
      // O bloco de arquivos é um contêiner: foca o botão de seleção dentro dele.
      const focusable = target instanceof HTMLInputElement ? target : target?.querySelector<HTMLElement>("button") ?? target;
      focusable?.focus();
      return;
    }

    const form = new FormData();
    form.append("type", type);
    form.append("title", title.trim());
    if (platform) form.append("platform", platform);
    if (ctr) form.append("ctr", ctr.trim().replace(",", "."));
    if (type === "video" && retentionSeconds) form.append("retention_seconds", retentionSeconds.trim().replace(",", "."));
    if (type === "video" && retentionPercent) form.append("retention_percent", retentionPercent.trim().replace(",", "."));
    if (conversion) form.append("conversion", conversion.trim().replace(",", "."));
    if (notes.trim()) form.append("notes", notes.trim());
    files.forEach((f) => form.append("files", f));

    const abort = new AbortController();
    abortRef.current = abort;
    setSubmitting(true);
    setProgress(0);
    try {
      const res = await postFormWithProgress({
        url: "/api/ads",
        form,
        signal: abort.signal,
        onProgress: setProgress,
      });
      if (!res.ok) {
        const body = res.body as { error?: string } | null;
        throw new Error(body?.error ?? `Falha no upload (${res.status})`);
      }
      notify.success("Anúncio criado", { description: title.trim() });
      onCreated?.();
      reset();
      onOpenChange(false);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        notify.info("Envio cancelado");
        setProgress(0);
        return;
      }
      const msg = err instanceof Error ? err.message : "Erro ao criar anúncio";
      // Erro de servidor é do formulário, não do campo de arquivo.
      setFormError(msg);
      notify.error("Falha ao criar anúncio", { description: msg });
      setProgress(0);
    } finally {
      abortRef.current = null;
      setSubmitting(false);
    }
  };

  const cancelUpload = () => {
    abortRef.current?.abort();
  };

  const typeOptions: Array<{ value: AdType; label: string }> = [
    { value: "image", label: "Imagem" },
    { value: "video", label: "Vídeo" },
    { value: "carousel", label: "Carrossel" },
  ];

  const metricProps = (name: MetricField) => ({
    "aria-invalid": errors[name] ? (true as const) : undefined,
    "aria-describedby": errors[name] ? fieldId(`${name}-error`) : undefined,
  });

  const renderError = (name: FieldName) =>
    errors[name] ? (
      <FieldError id={fieldId(`${name}-error`)} className="text-xs">
        {errors[name]}
      </FieldError>
    ) : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-lg"
        onPointerDownOutside={(e) => { if (submitting) e.preventDefault(); }}
        onInteractOutside={(e) => { if (submitting) e.preventDefault(); }}
        onEscapeKeyDown={(e) => { if (submitting) e.preventDefault(); }}
      >
        <DialogHeader>
          <DialogTitle>Novo anúncio</DialogTitle>
          <DialogDescription>
            Registre um anúncio (imagem, vídeo ou carrossel) e suas métricas de performance.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="contents"
          aria-describedby={formError ? fieldId("form-error") : undefined}
        >
          <div className="flex flex-col gap-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor={fieldId("title")}>Título <span className="text-destructive" aria-hidden="true">*</span></Label>
              <Input
                ref={(el) => { fieldRefs.current.title = el; }}
                id={fieldId("title")}
                size="sm"
                required
                autoFocus
                disabled={submitting}
                aria-required="true"
                aria-invalid={errors.title ? true : undefined}
                aria-describedby={errors.title ? fieldId("title-error") : undefined}
                placeholder="Ex.: Lançamento curso outubro — variação A"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title && e.target.value.trim()) setFieldError("title", undefined);
                }}
              />
              {renderError("title")}
            </div>

            {/* Type selector */}
            <div className="space-y-2">
              <p id={fieldId("type-label")} className="text-sm font-medium">Tipo de anúncio</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2" role="radiogroup" aria-labelledby={fieldId("type-label")}>
                {typeOptions.map((opt, i) => (
                  <button
                    key={opt.value}
                    ref={(el) => { typeRefs.current[i] = el; }}
                    type="button"
                    role="radio"
                    aria-checked={type === opt.value}
                    tabIndex={type === opt.value ? 0 : -1}
                    disabled={submitting}
                    aria-disabled={submitting || undefined}
                    onClick={() => void handleType(opt.value)}
                    onKeyDown={(e) => handleTypeKeyDown(e, i)}
                    className={`rounded-field-sm border px-3 py-2 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-foreground disabled:opacity-60 disabled:cursor-not-allowed ${
                      type === opt.value
                        ? "border-white/40 bg-white/10 text-white"
                        : "border-white/10 text-muted-foreground hover:text-white hover:border-white/20"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* File picker */}
            <div className="space-y-2" ref={(el) => { fieldRefs.current.files = el; }}>
              <Upload>
                <UploadTrigger
                  accept={accept}
                  multiple={type === "carousel"}
                  disabled={submitting}
                  onChange={handleFiles}
                  aria-invalid={errors.files ? true : undefined}
                  aria-describedby={[fieldId("files-hint"), errors.files ? fieldId("files-error") : null]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {type === "carousel" ? "Adicionar imagens" : "Selecionar arquivo"}
                </UploadTrigger>
                <p id={fieldId("files-hint")} className="text-xs text-muted-foreground pl-2">
                  Até {MAX_SIZE_MB} MB por arquivo e {MAX_TOTAL_MB} MB no total.
                  {files.length > 0 && (
                    <>
                      {" "}
                      <span className={totalBytes > MAX_TOTAL_BYTES ? "text-destructive" : undefined}>
                        Selecionado: {formatMB(totalBytes)} de {MAX_TOTAL_MB} MB.
                      </span>
                    </>
                  )}
                </p>
                {errors.files && (
                  <UploadMessage variant="error" role="alert" id={fieldId("files-error")}>
                    {errors.files}
                  </UploadMessage>
                )}
                {files.map((f, i) => (
                  <div key={`${f.name}-${i}`} className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <UploadFile name={f.name} onRemove={submitting ? undefined : () => removeFile(i)} />
                    </div>
                    {type === "carousel" && files.length > 1 && (
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          aria-label={`Mover ${f.name} para cima`}
                          onClick={() => moveFile(i, -1)}
                          disabled={submitting || i === 0}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <span aria-hidden="true">↑</span>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          aria-label={`Mover ${f.name} para baixo`}
                          onClick={() => moveFile(i, 1)}
                          disabled={submitting || i === files.length - 1}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <span aria-hidden="true">↓</span>
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </Upload>
            </div>

            {/* Platform */}
            <div className="space-y-2">
              <Label htmlFor={fieldId("platform")}>Plataforma</Label>
              <NativeSelect
                id={fieldId("platform")}
                size="sm"
                disabled={submitting}
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
              >
                <NativeSelectOption value="">Selecione…</NativeSelectOption>
                {AD_PLATFORMS.map((p) => (
                  <NativeSelectOption key={p.value} value={p.value}>{p.label}</NativeSelectOption>
                ))}
              </NativeSelect>
            </div>

            {/* Metrics */}
            <fieldset className="space-y-3 pt-2 border-t border-surface-900">
              <legend className={cn(headingTitleVariants({ size: "eyebrow" }), "pt-2")}>Performance (opcional)</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor={fieldId("ctr")}>CTR (%)</Label>
                  <Input
                    ref={(el) => { fieldRefs.current.ctr = el; }}
                    id={fieldId("ctr")}
                    size="sm"
                    inputMode="decimal"
                    disabled={submitting}
                    placeholder="2.5"
                    value={ctr}
                    onChange={(e) => { setCtr(e.target.value); setFieldError("ctr", undefined); }}
                    {...metricProps("ctr")}
                  />
                  {renderError("ctr")}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={fieldId("conversion")}>Conversão (%)</Label>
                  <Input
                    ref={(el) => { fieldRefs.current.conversion = el; }}
                    id={fieldId("conversion")}
                    size="sm"
                    inputMode="decimal"
                    disabled={submitting}
                    placeholder="1.2"
                    value={conversion}
                    onChange={(e) => { setConversion(e.target.value); setFieldError("conversion", undefined); }}
                    {...metricProps("conversion")}
                  />
                  {renderError("conversion")}
                </div>
              </div>
              {type === "video" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor={fieldId("retentionSeconds")}>Retenção (s)</Label>
                    <Input
                      ref={(el) => { fieldRefs.current.retentionSeconds = el; }}
                      id={fieldId("retentionSeconds")}
                      size="sm"
                      inputMode="decimal"
                      disabled={submitting}
                      placeholder="18"
                      value={retentionSeconds}
                      onChange={(e) => { setRetentionSeconds(e.target.value); setFieldError("retentionSeconds", undefined); }}
                      {...metricProps("retentionSeconds")}
                    />
                    {renderError("retentionSeconds")}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={fieldId("retentionPercent")}>Retenção (%)</Label>
                    <Input
                      ref={(el) => { fieldRefs.current.retentionPercent = el; }}
                      id={fieldId("retentionPercent")}
                      size="sm"
                      inputMode="decimal"
                      disabled={submitting}
                      placeholder="65"
                      value={retentionPercent}
                      onChange={(e) => { setRetentionPercent(e.target.value); setFieldError("retentionPercent", undefined); }}
                      {...metricProps("retentionPercent")}
                    />
                    {renderError("retentionPercent")}
                  </div>
                </div>
              )}
            </fieldset>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor={fieldId("notes")}>Notas</Label>
              <Textarea
                id={fieldId("notes")}
                size="sm"
                rows={4}
                disabled={submitting}
                placeholder="Hook, contexto da campanha, aprendizados…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {formError && (
              <FieldError id={fieldId("form-error")} className="text-xs">
                {formError}
              </FieldError>
            )}

            {submitting && (
              <div className="space-y-1.5" aria-live="polite">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Enviando arquivos…</span>
                  <span className="tabular-nums">{progress}%</span>
                </div>
                <Progress value={progress} aria-label="Progresso do envio" />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" variant="default" size="sm" loading={submitting} loadingText="Enviando…">
              Criar anúncio
            </Button>
            {submitting ? (
              <Button type="button" variant="outline" size="sm" onClick={cancelUpload}>
                Cancelar envio
              </Button>
            ) : (
              <Button type="button" variant="outline" size="sm" onClick={() => void requestClose()}>
                Cancelar
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
