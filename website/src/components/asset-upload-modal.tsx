"use client"

import { useState, useCallback, useEffect, useId, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import {
  Upload,
  UploadTrigger,
  UploadFile,
  UploadSummary,
  UploadMessage,
} from "@/components/ui/upload"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useConfirm } from "@/components/ui/confirm-dialog"
import { FieldError } from "@/components/ui/field"
import { TagsInput } from "@/components/tags-input"
import {
  SmDocSolidIcon,
  SmCloseSolidIcon,
  SmCheckSolidIcon,
  SmAlertSolidIcon,
} from "@/components/icons"
import { useAuth } from "@/lib/auth"
import { uploadAssetDirect, type DirectUploadPhase } from "@/lib/direct-upload"
import { compressImageIfNeeded } from "@/lib/browser-image-compress"
import { notify } from "@/lib/notifications"
import type {
  AssetUploadConfig,
  UploadFieldConfig,
  UploadFormValues,
  UploadPayload,
} from "@/lib/asset-upload-types"

// ─── Field Renderer ──────────────────────────────────────────────

function UploadField({
  id,
  field,
  value,
  onChange,
  error,
  errorId,
  disabled,
}: {
  id: string
  field: UploadFieldConfig
  value: string | string[] | boolean | number
  onChange: (value: string | string[] | boolean | number) => void
  /** Mensagem de erro do campo (renderizada abaixo com role="alert"). */
  error?: string
  /** id do elemento de erro — ligado via aria-describedby. */
  errorId?: string
  /** Trava o campo durante o envio. */
  disabled?: boolean
}) {
  const a11y = {
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? errorId : undefined,
  }
  const errorNode = error ? (
    <FieldError id={errorId} className="text-xs pl-1">
      {error}
    </FieldError>
  ) : null

  switch (field.type) {
    case "text":
      return (
        <>
          <Input
            id={id}
            size="sm"
            disabled={disabled}
            placeholder={field.placeholder}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            {...a11y}
          />
          {errorNode}
        </>
      )

    case "number":
      return (
        <>
          <Input
            id={id}
            size="sm"
            type="number"
            disabled={disabled}
            placeholder={field.placeholder}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            {...a11y}
          />
          {errorNode}
        </>
      )

    case "textarea":
      return (
        <>
          <Textarea
            id={id}
            size="sm"
            disabled={disabled}
            placeholder={field.placeholder}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            {...a11y}
          />
          {errorNode}
        </>
      )

    case "select":
      return (
        <>
          <NativeSelect
            id={id}
            size="sm"
            disabled={disabled}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            {...a11y}
          >
            <NativeSelectOption value="">
              {field.placeholder ?? "Selecione…"}
            </NativeSelectOption>
            {field.options?.map((opt) => (
              <NativeSelectOption key={opt.value} value={opt.value}>
                {opt.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          {errorNode}
        </>
      )

    case "tags":
      return (
        <>
          <fieldset disabled={disabled} className="contents">
            <TagsInput
              id={id}
              value={(value as string[]) ?? []}
              onChange={(tags) => onChange(tags)}
              placeholder={field.placeholder}
              {...a11y}
            />
          </fieldset>
          {errorNode}
        </>
      )

    case "switch":
      return (
        <div className="flex flex-col items-end gap-1">
          <Switch
            id={id}
            disabled={disabled}
            checked={(value as boolean) ?? false}
            onCheckedChange={(checked) => onChange(checked)}
            {...a11y}
          />
          {errorNode}
        </div>
      )

    default:
      return null
  }
}

/** O arquivo casa com algum padrão de `accept` (".png", "image/*", "video/mp4")? */
function matchesAccept(file: File, accept?: string): boolean {
  if (!accept) return true
  const patterns = accept
    .split(",")
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean)
  if (patterns.length === 0) return true
  const name = file.name.toLowerCase()
  const mime = (file.type || "").toLowerCase()
  return patterns.some((pattern) => {
    if (pattern === "*" || pattern === "*/*") return true
    if (pattern.startsWith(".")) return name.endsWith(pattern)
    if (pattern.endsWith("/*")) return mime.startsWith(pattern.slice(0, -1))
    return mime === pattern
  })
}

// ─── Progress helpers ──────────────────────────────────────────────

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

type ProgressPhase = DirectUploadPhase | "compressing" | "done"

function phaseLabel(phase: ProgressPhase, bytes?: number, total?: number, failed?: number): string {
  if (phase === "done" && failed && failed > 0) {
    return failed === 1 ? "Concluído com 1 falha" : `Concluído com ${failed} falhas`
  }
  switch (phase) {
    case "signing":
      return "Preparando upload…"
    case "compressing":
      return "Comprimindo imagem…"
    case "uploading-original":
      if (bytes != null && total != null && total > 0) {
        return `Enviando arquivo… (${formatBytes(bytes)} de ${formatBytes(total)})`
      }
      return "Enviando arquivo…"
    case "optimizing":
      return "Gerando preview…"
    case "uploading-preview":
      if (bytes != null && total != null && total > 0) {
        return `Enviando preview… (${formatBytes(bytes)} de ${formatBytes(total)})`
      }
      return "Enviando preview…"
    case "finalizing":
      return "Finalizando…"
    case "done":
      return "Concluído"
  }
}

function overallPercent(p: {
  completed: number
  total: number
  phase: ProgressPhase
  bytesUploaded?: number
  totalBytes?: number
  failed?: number
}): number {
  if (p.total === 0) return 0
  // Each file has 4 sub-phases worth of progress; weight current-file
  // upload bytes inside the file's own slice so the bar moves smoothly.
  const base = (p.completed / p.total) * 100
  // Terminou: a barra reflete só o que realmente foi enviado — com falhas ela
  // não pode chegar a 100% e contradizer a mensagem de erro.
  if (p.phase === "done") {
    const ok = Math.max(0, p.completed - (p.failed ?? 0))
    return (ok / p.total) * 100
  }

  let intra = 0
  switch (p.phase) {
    case "signing":
    case "compressing":
      intra = 0.05
      break
    case "uploading-original":
      if (p.bytesUploaded != null && p.totalBytes && p.totalBytes > 0) {
        intra = 0.1 + (p.bytesUploaded / p.totalBytes) * 0.6
      } else {
        intra = 0.3
      }
      break
    case "optimizing":
      intra = 0.75
      break
    case "uploading-preview":
      if (p.bytesUploaded != null && p.totalBytes && p.totalBytes > 0) {
        intra = 0.8 + (p.bytesUploaded / p.totalBytes) * 0.15
      } else {
        intra = 0.85
      }
      break
    case "finalizing":
      intra = 0.95
      break
  }
  return Math.min(100, base + (intra / p.total) * 100)
}

// ─── Per-file row ────────────────────────────────────────────────

type FileStatus = "pending" | "uploading" | "ok" | "error"

const STATUS_LABEL: Record<FileStatus, string> = {
  pending: "Pendente",
  uploading: "Enviando…",
  ok: "Enviado",
  error: "Falhou",
}

function FileRow({
  file,
  status,
  error,
  onRemove,
  onRetry,
}: {
  file: File
  status: FileStatus
  error?: string
  /** Ausente = remoção bloqueada (durante o envio). */
  onRemove?: () => void
  onRetry?: () => void
}) {
  const statusClass =
    status === "ok"
      ? "text-success"
      : status === "error"
        ? "text-destructive"
        : "text-muted-foreground"

  return (
    <div data-slot="upload-file" className="flex flex-col gap-0.5 py-1.5 text-sm text-surface-300">
      <div className="flex items-center gap-1.5">
        {status === "ok" ? (
          <SmCheckSolidIcon className="size-6 shrink-0 text-success" aria-hidden="true" />
        ) : status === "error" ? (
          <SmAlertSolidIcon className="size-6 shrink-0 text-destructive" aria-hidden="true" />
        ) : (
          <SmDocSolidIcon className="size-6 shrink-0 text-muted-foreground" aria-hidden="true" />
        )}
        <span className="truncate min-w-0 flex-1">{file.name}</span>
        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{formatBytes(file.size)}</span>
        <span className={`shrink-0 text-xs ${statusClass}`} aria-live="polite">
          {STATUS_LABEL[status]}
        </span>
        {status === "error" && onRetry && (
          <Button type="button" variant="outline" size="sm" onClick={onRetry} className="shrink-0">
            Tentar novamente
          </Button>
        )}
        {onRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Remover ${file.name}`}
            onClick={onRemove}
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            <SmCloseSolidIcon className="size-5" />
          </Button>
        )}
      </div>
      {status === "error" && error && (
        <FieldError className="text-xs pl-8">{error}</FieldError>
      )}
    </div>
  )
}

// ─── Upload Modal ────────────────────────────────────────────────

interface AssetUploadModalProps {
  config: AssetUploadConfig
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: (payload: UploadPayload) => void
}

const THUMB_MAX_BYTES = 2 * 1024 * 1024

export function AssetUploadModal({
  config,
  open,
  onOpenChange,
  onSubmit,
}: AssetUploadModalProps) {
  const { user } = useAuth()
  const confirm = useConfirm()
  const uid = useId()
  const fieldId = useCallback((name: string) => `${uid}-${name}`, [uid])
  const [mode, setMode] = useState<"file" | "link">("file")
  const [files, setFiles] = useState<File[]>([])
  const [fileStatus, setFileStatus] = useState<Record<number, FileStatus>>({})
  const [fileErrors, setFileErrors] = useState<Record<number, string>>({})
  const [filesError, setFilesError] = useState<string | null>(null)
  const [linkUrl, setLinkUrl] = useState("")
  const [linkError, setLinkError] = useState<string | null>(null)
  const [linkThumbnail, setLinkThumbnail] = useState<File | null>(null)
  const [thumbError, setThumbError] = useState<string | null>(null)
  const [formValues, setFormValues] = useState<UploadFormValues>({})
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [compressImages, setCompressImages] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{
    completed: number
    total: number
    phase: ProgressPhase
    bytesUploaded?: number
    totalBytes?: number
    currentName?: string
    failed?: number
  } | null>(null)
  const [previewWarnings, setPreviewWarnings] = useState<string[]>([])
  const abortRef = useRef<AbortController | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  /** Fechamento adiado após sucesso — guardado para poder ser cancelado. */
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancelCloseTimer = useCallback(() => {
    if (closeTimerRef.current !== null) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }, [])

  // Reabrir o modal dentro da janela de 1,2s não pode fechar a instância nova.
  useEffect(() => {
    if (open) cancelCloseTimer()
  }, [open, cancelCloseTimer])

  useEffect(() => () => cancelCloseTimer(), [cancelCloseTimer])

  const updateField = useCallback(
    (name: string, value: string | string[] | boolean | number) => {
      setFormValues((prev) => ({ ...prev, [name]: value }))
      setFieldErrors((prev) => (prev[name] ? { ...prev, [name]: "" } : prev))
    },
    []
  )

  const resetAll = useCallback(() => {
    setFiles([])
    setFileStatus({})
    setFileErrors({})
    setFilesError(null)
    setLinkUrl("")
    setLinkError(null)
    setLinkThumbnail(null)
    setThumbError(null)
    setMode("file")
    setFormValues({})
    setFieldErrors({})
    setError(null)
    setSubmitting(false)
    setUploadProgress(null)
    setPreviewWarnings([])
    setCompressImages(false)
  }, [])

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return
      const incoming = Array.from(fileList)

      // Valida tipo e tamanho — rejeita só os arquivos inválidos, mantém o resto.
      const limit = config.maxSizeMB * 1024 * 1024
      const wrongType = incoming.filter((f) => !matchesAccept(f, config.accept))
      const typeOk = incoming.filter((f) => matchesAccept(f, config.accept))
      const oversized = typeOk.filter((f) => f.size > limit)
      const accepted = typeOk.filter((f) => f.size <= limit)

      const messages: string[] = []

      if (wrongType.length > 0) {
        const names = wrongType.map((f) => f.name).join(", ")
        messages.push(
          wrongType.length === 1
            ? `${names} não é um formato aceito e foi ignorado. Formatos aceitos: ${config.accept}.`
            : `Estes arquivos não estão num formato aceito e foram ignorados: ${names}. Formatos aceitos: ${config.accept}.`
        )
        notify.warning("Formato não aceito", {
          description: `Formatos aceitos: ${config.accept}. Ignorado: ${names}`,
        })
      }

      if (oversized.length > 0) {
        const names = oversized.map((f) => f.name).join(", ")
        messages.push(
          oversized.length === 1
            ? `${names} excede o limite de ${config.maxSizeMB} MB e foi ignorado.`
            : `Estes arquivos excedem o limite de ${config.maxSizeMB} MB e foram ignorados: ${names}`
        )
        notify.warning("Arquivo acima do limite", {
          description: `Limite de ${config.maxSizeMB} MB por arquivo. Ignorado: ${names}`,
        })
      }

      setFilesError(messages.length > 0 ? messages.join(" ") : null)

      if (accepted.length === 0) return
      if (config.multiple) {
        setFiles((prev) => [...prev, ...accepted])
      } else {
        setFiles(accepted.slice(0, 1))
        setFileStatus({})
        setFileErrors({})
      }
    },
    [config.accept, config.maxSizeMB, config.multiple]
  )

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    // Reindexa status/erros por posição.
    const shift = (map: Record<number, string>) => {
      const next: Record<number, string> = {}
      for (const [k, v] of Object.entries(map)) {
        const i = Number(k)
        if (i < index) next[i] = v
        else if (i > index) next[i - 1] = v
      }
      return next
    }
    setFileStatus((prev) => shift(prev) as Record<number, FileStatus>)
    setFileErrors((prev) => shift(prev))
  }, [])

  const handleThumbnail = useCallback((fl: FileList | null) => {
    const f = fl?.[0]
    if (!f) return
    if (!f.type.startsWith("image/")) {
      setThumbError("A thumbnail precisa ser uma imagem (PNG, JPG, WebP ou SVG).")
      return
    }
    if (f.size > THUMB_MAX_BYTES) {
      setThumbError(`A thumbnail excede o limite de 2 MB (${formatBytes(f.size)}).`)
      return
    }
    setThumbError(null)
    setLinkThumbnail(f)
  }, [])

  /** Valida campos obrigatórios + bloco de arquivos/link. Retorna o id do primeiro inválido. */
  const validate = useCallback((): string | null => {
    let firstInvalid: string | null = null
    const nextFieldErrors: Record<string, string> = {}

    for (const f of config.fields) {
      const val = formValues[f.name]

      if (f.required) {
        const empty = Array.isArray(val)
          ? val.length === 0
          : typeof val === "boolean"
            ? !val
            : String(val ?? "").trim() === ""
        if (empty) {
          nextFieldErrors[f.name] =
            f.type === "switch"
              ? `${f.label} precisa estar ativado.`
              : f.type === "select"
                ? `Selecione ${f.label.toLowerCase()}.`
                : f.type === "tags"
                  ? `Adicione pelo menos uma tag em ${f.label.toLowerCase()}.`
                  : `${f.label} é obrigatório.`
          firstInvalid ??= fieldId(f.name)
          continue
        }
      }

      // Validações por tipo, mesmo em campos opcionais já preenchidos.
      const raw = typeof val === "string" ? val.trim() : ""

      if (f.type === "number" && raw !== "") {
        const n = Number(raw.replace(",", "."))
        if (!Number.isFinite(n)) {
          nextFieldErrors[f.name] = `${f.label} precisa ser um número válido.`
          firstInvalid ??= fieldId(f.name)
        } else if (n < 0) {
          nextFieldErrors[f.name] = `${f.label} não pode ser negativo.`
          firstInvalid ??= fieldId(f.name)
        }
      }

      if (f.type === "select" && raw !== "" && f.options && !f.options.some((o) => o.value === raw)) {
        nextFieldErrors[f.name] = `Selecione uma opção válida para ${f.label.toLowerCase()}.`
        firstInvalid ??= fieldId(f.name)
      }
    }

    if (mode === "file" && files.length === 0) {
      setFilesError("Selecione pelo menos um arquivo.")
      firstInvalid ??= "__trigger__"
    }

    if (mode === "link") {
      const trimmed = linkUrl.trim()
      let msg: string | null = null
      if (!trimmed) {
        msg = "Cole a URL do link."
      } else {
        try {
          const u = new URL(trimmed)
          if (u.protocol !== "http:" && u.protocol !== "https:") {
            msg = "A URL precisa começar com http:// ou https://"
          }
        } catch {
          msg = "URL inválida. Use um endereço completo, com https://"
        }
      }
      setLinkError(msg)
      if (msg) firstInvalid ??= fieldId("link-url")
    }

    setFieldErrors(nextFieldErrors)
    return firstInvalid
  }, [config.fields, formValues, mode, files.length, linkUrl, fieldId])

  const focusById = (id: string) => {
    if (id === "__trigger__") {
      contentRef.current
        ?.querySelector<HTMLElement>('[data-slot="upload-trigger"] button')
        ?.focus()
      return
    }
    document.getElementById(id)?.focus()
  }

  /**
   * Envia um subconjunto de arquivos (índices). Erros são capturados por índice,
   * sem derrubar o lote; retorna quantos concluíram e quantos falharam.
   */
  const runFileUploads = useCallback(
    async (targets: { file: File; index: number }[], abort: AbortController) => {
      if (!user) return { ok: 0, failed: 0, okIndexes: [] as number[] }
      const total = targets.length
      let completed = 0
      let failed = 0
      const okIndexes: number[] = []
      const inFlight = new Map<number, string>()

      const metadata = {
        ...formValues,
        uploadedBy: { id: user.id, name: user.name, email: user.email },
        uploadedAt: new Date().toISOString(),
      }

      const renderProgress = (
        phase: DirectUploadPhase | "compressing",
        bytesUploaded?: number,
        totalBytes?: number,
      ) => {
        const lastName = Array.from(inFlight.values()).pop()
        setUploadProgress({
          completed: completed + failed,
          total,
          phase,
          bytesUploaded,
          totalBytes,
          currentName: lastName,
        })
      }

      const processOne = async ({ file, index }: { file: File; index: number }) => {
        inFlight.set(index, file.name)
        setFileStatus((prev) => ({ ...prev, [index]: "uploading" }))
        setFileErrors((prev) => {
          if (!prev[index]) return prev
          const next = { ...prev }
          delete next[index]
          return next
        })
        renderProgress("signing")

        try {
          let toUpload = file
          if (compressImages && file.type.startsWith("image/") && file.size > 4 * 1024 * 1024) {
            renderProgress("compressing")
            try {
              const result = await compressImageIfNeeded(file, {
                maxBytes: 4 * 1024 * 1024,
                signal: abort.signal,
              })
              if (result.compressed) toUpload = result.file
            } catch (err) {
              if ((err as Error).name === "AbortError") throw err
              console.warn("[upload] compression failed, sending original:", err)
              notify.warning("Compressão falhou", {
                description: `${file.name}: enviando original`,
              })
            }
          }

          const result = await uploadAssetDirect({
            file: toUpload,
            assetType: config.slug,
            metadata,
            signal: abort.signal,
            onProgress: (p) => renderProgress(p.phase, p.bytesUploaded, p.totalBytes),
          })

          if (result.previewError) {
            setPreviewWarnings((prev) => [
              ...prev,
              `${file.name}: preview não gerado (${result.previewError}). O original foi salvo, mas pode não aparecer na galeria até o problema ser resolvido.`,
            ])
            notify.warning("Preview não gerado", {
              description: `${file.name}: ${result.previewError}`,
            })
          }

          setFileStatus((prev) => ({ ...prev, [index]: "ok" }))
          okIndexes.push(index)
          completed += 1
        } catch (err) {
          if ((err as Error).name === "AbortError") {
            setFileStatus((prev) => ({ ...prev, [index]: "pending" }))
            throw err
          }
          const message = (err as Error).message ?? "Falha no envio"
          setFileStatus((prev) => ({ ...prev, [index]: "error" }))
          setFileErrors((prev) => ({ ...prev, [index]: message }))
          failed += 1
        } finally {
          inFlight.delete(index)
        }
        renderProgress("finalizing")
      }

      // Worker pool — cada worker puxa o próximo item até a fila esvaziar.
      const CONCURRENCY = 3
      const queue = [...targets]
      const workers: Promise<void>[] = []
      for (let w = 0; w < Math.min(CONCURRENCY, queue.length); w++) {
        workers.push(
          (async () => {
            while (queue.length > 0) {
              if (abort.signal.aborted) return
              const next = queue.shift()
              if (!next) return
              await processOne(next)
            }
          })()
        )
      }
      await Promise.all(workers)

      setUploadProgress({ completed: completed + failed, total, phase: "done", failed })
      return { ok: completed, failed, okIndexes }
    },
    [user, formValues, compressImages, config.slug]
  )

  const finishBatch = useCallback(
    (sentFiles: File[]) => {
      if (!user) return
      const payload: UploadPayload = {
        files: sentFiles,
        metadata: formValues,
        assetType: config.slug,
        uploadedBy: { id: user.id, name: user.name, email: user.email },
        uploadedAt: new Date().toISOString(),
      }
      onSubmit?.(payload)
    },
    [user, formValues, config.slug, onSubmit]
  )

  const closeAfterSuccess = useCallback(() => {
    // Com avisos, mantém o modal aberto para leitura.
    setPreviewWarnings((current) => {
      if (current.length === 0) {
        cancelCloseTimer()
        closeTimerRef.current = setTimeout(() => {
          closeTimerRef.current = null
          resetAll()
          onOpenChange(false)
        }, 1200)
      }
      return current
    })
  }, [resetAll, onOpenChange, cancelCloseTimer])

  const handleSubmit = useCallback(async () => {
    if (submitting) return
    setError(null)
    cancelCloseTimer()

    const firstInvalid = validate()
    if (firstInvalid) {
      focusById(firstInvalid)
      return
    }
    if (!user) return

    setSubmitting(true)
    setPreviewWarnings([])

    const abort = new AbortController()
    abortRef.current = abort

    try {
      if (mode === "link") {
        notify.loading("Salvando link…", { id: "upload-batch" })
        setUploadProgress({ completed: 0, total: 1, phase: "finalizing" })

        const formData = new FormData()
        formData.append("url", linkUrl.trim())
        formData.append("assetType", config.slug)
        formData.append(
          "metadata",
          JSON.stringify({
            ...formValues,
            uploadedBy: { id: user.id, name: user.name, email: user.email },
            uploadedAt: new Date().toISOString(),
          })
        )
        if (linkThumbnail) formData.append("thumbnail", linkThumbnail)

        const res = await fetch("/api/assets/upload-link", {
          method: "POST",
          body: formData,
          signal: abort.signal,
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({ error: "Erro desconhecido" }))
          throw new Error(data.error ?? `Falha ao salvar link (${res.status})`)
        }

        setUploadProgress({ completed: 1, total: 1, phase: "done" })
        notify.success("Link salvo", { description: linkUrl.trim(), id: "upload-batch" })
        finishBatch([])
        closeAfterSuccess()
        return
      }

      // Modo arquivo: envia só o que ainda não foi concluído (pendentes + falhos).
      const targets = files
        .map((file, index) => ({ file, index }))
        .filter(({ index }) => fileStatus[index] !== "ok")
      if (targets.length === 0) {
        // Reenvio sem pendências: nada a anunciar nem a enviar.
        closeAfterSuccess()
        return
      }
      notify.uploadStarted(targets.length)

      // `okIndexes` vem da própria rotina de envio: o `fileStatus` deste render
      // é uma closure velha e entregaria como enviado o que acabou de falhar.
      const { ok, failed, okIndexes } = await runFileUploads(targets, abort)

      // Abort sem requisição em voo faz cada worker retornar sem lançar, então
      // `Promise.all` resolve e o fluxo cairia no caminho de sucesso com a fila
      // intacta. O sinal é a fonte da verdade sobre o cancelamento.
      if (abort.signal.aborted) {
        notify.dismiss("upload-batch")
        setUploadProgress(null)
        return
      }

      if (failed > 0) {
        notify.uploadPartial(ok, failed)
        setError(
          failed === 1
            ? "1 arquivo não foi enviado. Você pode tentar novamente na lista."
            : `${failed} arquivos não foram enviados. Você pode tentar novamente na lista.`
        )
        if (ok > 0) {
          const sent = new Set(okIndexes)
          finishBatch(targets.filter(({ index }) => sent.has(index)).map((t) => t.file))
        }
        return
      }

      // Conta e reemite só o lote deste envio (`targets`), não a lista inteira:
      // num reenvio após falha parcial, `files` incluiria o que já subiu.
      notify.uploadSuccess(ok, { description: config.title })
      if (ok >= 3) {
        // Notificação persistida para lotes grandes. Fire-and-forget.
        void fetch("/api/assets/upload/batch-notification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assetType: config.slug, count: ok, title: config.title }),
        }).catch(() => {
          /* non-critical */
        })
      }
      finishBatch(targets.map((t) => t.file))
      closeAfterSuccess()
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        notify.dismiss("upload-batch")
        return
      }
      const message = (err as Error).message ?? "Erro ao fazer upload"
      setError(message)
      notify.uploadFailed(message)
      setUploadProgress(null)
    } finally {
      setSubmitting(false)
    }
  }, [
    submitting, validate, user, mode, linkUrl, config, formValues, linkThumbnail,
    files, fileStatus, runFileUploads, finishBatch, closeAfterSuccess, cancelCloseTimer,
  ])

  /** Reenvia um único arquivo que falhou. */
  const retryFile = useCallback(
    async (index: number) => {
      if (submitting || !user) return
      const file = files[index]
      if (!file) return
      setSubmitting(true)
      setError(null)
      const abort = new AbortController()
      abortRef.current = abort
      try {
        const { ok, failed } = await runFileUploads([{ file, index }], abort)
        if (failed > 0) {
          notify.error("Falha no reenvio", { description: file.name })
        } else if (ok > 0) {
          notify.success("Arquivo enviado", { description: file.name })
          finishBatch([file])
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          notify.fromError(err, "Falha no reenvio")
        }
      } finally {
        setSubmitting(false)
      }
    },
    [submitting, user, files, runFileUploads, finishBatch]
  )

  /** Cancela o envio em andamento sem fechar o modal. */
  const cancelUpload = useCallback(() => {
    abortRef.current?.abort()
    setSubmitting(false)
    setUploadProgress(null)
    notify.dismiss("upload-batch")
    notify.info("Envio cancelado")
  }, [])

  /** Algo foi preenchido/selecionado e seria perdido ao fechar? */
  const isDirty =
    files.length > 0 ||
    linkUrl.trim() !== "" ||
    linkThumbnail !== null ||
    Object.values(formValues).some((v) =>
      Array.isArray(v) ? v.length > 0 : typeof v === "boolean" ? v : String(v ?? "").trim() !== ""
    )

  const requestClose = useCallback(async () => {
    // Durante o envio o fechamento é bloqueado — use "Cancelar envio".
    if (submitting) return
    if (isDirty) {
      const ok = await confirm({
        destructive: true,
        title: "Descartar este upload?",
        description: "Os arquivos selecionados e os dados preenchidos serão perdidos.",
        confirmLabel: "Descartar",
        cancelLabel: "Continuar editando",
      })
      if (!ok) return
    }
    resetAll()
    onOpenChange(false)
  }, [confirm, isDirty, onOpenChange, resetAll, submitting])

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        onOpenChange(true)
        return
      }
      void requestClose()
    },
    [onOpenChange, requestClose]
  )

  const handleOpenAutoFocus = useCallback(
    (e: Event) => {
      e.preventDefault()
      const root = contentRef.current
      if (!root) return
      const target = config.allowLink
        ? root.querySelector<HTMLElement>('[role="tablist"] [data-state="active"]')
        : root.querySelector<HTMLElement>('[data-slot="upload-trigger"] button')
      target?.focus()
    },
    [config.allowLink]
  )

  const sentCount = Object.values(fileStatus).filter((s) => s === "ok").length
  const failedCount = Object.values(fileStatus).filter((s) => s === "error").length
  const filesErrorId = fieldId("files-error")
  const formErrorId = fieldId("form-error")
  const linkErrorId = fieldId("link-url-error")
  const thumbErrorId = fieldId("link-thumb-error")

  const renderFileRow = (f: File, i: number) => (
    <FileRow
      key={`${f.name}-${i}`}
      file={f}
      status={fileStatus[i] ?? "pending"}
      error={fileErrors[i]}
      onRemove={submitting || fileStatus[i] === "ok" ? undefined : () => removeFile(i)}
      onRetry={submitting ? undefined : () => void retryFile(i)}
    />
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        ref={contentRef}
        className="sm:max-w-lg"
        onOpenAutoFocus={handleOpenAutoFocus}
        onEscapeKeyDown={(e) => { if (submitting) e.preventDefault() }}
        onPointerDownOutside={(e) => { if (submitting) e.preventDefault() }}
        onInteractOutside={(e) => { if (submitting) e.preventDefault() }}
      >
        <DialogHeader>
          <DialogTitle>{config.title}</DialogTitle>
          <DialogDescription>{config.description}</DialogDescription>
        </DialogHeader>

        <form
          noValidate
          className="contents"
          aria-describedby={error ? formErrorId : undefined}
          onSubmit={(e) => {
            e.preventDefault()
            void handleSubmit()
          }}
        >
        <div className="flex flex-col gap-4">
          {/* Mode toggle (file vs link) — only if config supports links */}
          {config.allowLink && (
            <Tabs
              value={mode}
              onValueChange={(v) => {
                if (submitting) return
                setMode(v as "file" | "link")
                setError(null)
              }}
            >
              <TabsList>
                <TabsTrigger value="file" disabled={submitting}>Arquivo</TabsTrigger>
                <TabsTrigger value="link" disabled={submitting}>Link</TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          {/* File picker — only in file mode */}
          {mode === "file" && (
            <Upload>
              <UploadTrigger
                accept={config.accept}
                multiple={config.multiple}
                onChange={handleFiles}
                disabled={submitting}
                aria-describedby={[fieldId("files-hint"), filesError ? filesErrorId : null].filter(Boolean).join(" ")}
              >
                Selecionar arquivo{config.multiple ? "s" : ""}
              </UploadTrigger>

              <p id={fieldId("files-hint")} className="text-xs text-muted-foreground pl-2">
                Até {config.maxSizeMB} MB por arquivo.
              </p>

              {filesError && (
                <UploadMessage id={filesErrorId} variant="error" role="alert">{filesError}</UploadMessage>
              )}

              {files.length > 0 && files.length <= 3 && files.map(renderFileRow)}

              {files.length > 3 && (
                <UploadSummary count={files.length} defaultOpen={submitting || failedCount > 0}>
                  {files.map(renderFileRow)}
                </UploadSummary>
              )}

              {files.some(
                (f) => f.type.startsWith("image/") && f.size > 4 * 1024 * 1024,
              ) && (
                <div className="flex items-center justify-between gap-3 px-1 pt-1">
                  <div>
                    <Label htmlFor={fieldId("compress")} className="text-xs">
                      Comprimir imagens grandes antes de enviar
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Reduz arquivos &gt; 4 MB para acelerar o envio (mantém qualidade visual).
                    </p>
                  </div>
                  <Switch
                    id={fieldId("compress")}
                    checked={compressImages}
                    onCheckedChange={setCompressImages}
                    disabled={submitting}
                  />
                </div>
              )}
            </Upload>
          )}

          {/* Link inputs — only in link mode */}
          {mode === "link" && (
            <div className="flex flex-col gap-3">
              <div className="space-y-2">
                <Label htmlFor={fieldId("link-url")}>
                  URL <span className="text-destructive ml-1" aria-hidden="true">*</span>
                </Label>
                <Input
                  id={fieldId("link-url")}
                  size="sm"
                  type="url"
                  required
                  aria-required="true"
                  aria-invalid={linkError ? true : undefined}
                  aria-describedby={linkError ? linkErrorId : undefined}
                  placeholder="https://figma.com/file/…"
                  value={linkUrl}
                  onChange={(e) => {
                    setLinkUrl(e.target.value)
                    if (linkError) setLinkError(null)
                  }}
                  disabled={submitting}
                />
                {linkError && (
                  <FieldError id={linkErrorId} className="text-xs pl-1">
                    {linkError}
                  </FieldError>
                )}
              </div>

              <div className="space-y-2">
                <p id={fieldId("link-thumb-label")} className="text-sm font-medium">Thumbnail (opcional)</p>
                <p id={fieldId("link-thumb-hint")} className="text-xs text-muted-foreground -mt-1">
                  Imagem de preview pro card, até 2 MB. Se vazio, usamos um ícone genérico.
                </p>
                {linkThumbnail ? (
                  <UploadFile
                    name={`${linkThumbnail.name} · ${formatBytes(linkThumbnail.size)}`}
                    onRemove={submitting ? undefined : () => setLinkThumbnail(null)}
                  />
                ) : (
                  <Upload>
                    <UploadTrigger
                      aria-labelledby={fieldId("link-thumb-label")}
                      aria-describedby={[fieldId("link-thumb-hint"), thumbError ? thumbErrorId : null].filter(Boolean).join(" ")}
                      accept="image/*,.png,.jpg,.jpeg,.webp,.svg"
                      multiple={false}
                      onChange={handleThumbnail}
                      disabled={submitting}
                    >
                      Selecionar thumbnail
                    </UploadTrigger>
                    {thumbError && (
                      <UploadMessage id={thumbErrorId} variant="error" role="alert">{thumbError}</UploadMessage>
                    )}
                  </Upload>
                )}
              </div>
            </div>
          )}

          {/* Dynamic metadata fields */}
          {config.fields.map((field) => (
            <div
              key={field.name}
              className={
                field.type === "switch"
                  ? "flex items-center justify-between gap-3"
                  : "space-y-2"
              }
            >
              <div>
                <Label htmlFor={fieldId(field.name)}>
                  {field.label}
                  {field.required && (
                    <span className="text-destructive ml-1" aria-hidden="true">*</span>
                  )}
                </Label>
                {field.helperText && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {field.helperText}
                  </p>
                )}
              </div>
              <UploadField
                id={fieldId(field.name)}
                field={field}
                value={formValues[field.name] ?? (field.type === "tags" ? [] : field.type === "switch" ? false : "")}
                onChange={(val) => updateField(field.name, val)}
                error={fieldErrors[field.name] || undefined}
                errorId={fieldId(`${field.name}-error`)}
                disabled={submitting}
              />
            </div>
          ))}

          {/* Uploader info */}
          {user && (
            <div className="flex items-center gap-2 px-1 pt-2 border-t border-surface-900">
              <span className="text-xs text-muted-foreground">
                Enviado por <span className="text-foreground font-medium">{user.name}</span>
              </span>
            </div>
          )}
        </div>

        {/* Upload progress */}
        {uploadProgress && (
          <div
            role="status"
            aria-live="polite"
            className="flex flex-col gap-2 px-1 py-3 border-t border-surface-900"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground truncate pr-2">
                {phaseLabel(
                  uploadProgress.phase,
                  uploadProgress.bytesUploaded,
                  uploadProgress.totalBytes,
                  uploadProgress.failed,
                )}
                {uploadProgress.currentName && uploadProgress.phase !== "done" && (
                  <span className="text-foreground"> · {uploadProgress.currentName}</span>
                )}
              </span>
              <span className="text-muted-foreground tabular-nums shrink-0">
                {uploadProgress.completed}/{uploadProgress.total}
              </span>
            </div>
            <div className="h-1 w-full rounded-full bg-surface-900 overflow-hidden">
              <div
                className="h-full rounded-full bg-foreground transition-all duration-500"
                style={{
                  width: `${overallPercent(uploadProgress)}%`,
                  opacity: uploadProgress.phase === "done" ? 1 : 0.7,
                }}
              />
            </div>
          </div>
        )}

        {error && (
          <FieldError id={formErrorId} className="text-xs px-1">{error}</FieldError>
        )}

        {previewWarnings.length > 0 && (
          <div role="alert" className="flex flex-col gap-1 px-3 py-2 border border-warning/30 bg-warning/5 rounded-md text-xs text-warning">
            <span className="font-medium">Upload concluído com aviso</span>
            {previewWarnings.map((w, i) => (
              <span key={i} className="text-warning">{w}</span>
            ))}
          </div>
        )}

        <DialogFooter className="sm:justify-start">
          <Button
            type="submit"
            variant="default"
            size="sm"
            loading={submitting}
            loadingText={
              uploadProgress
                ? `Enviando ${uploadProgress.completed}/${uploadProgress.total}…`
                : "Enviando…"
            }
          >
            {mode === "link"
              ? "Salvar link"
              : failedCount > 0
                ? `Reenviar ${failedCount === 1 ? "1 arquivo" : `${failedCount} arquivos`}`
                : "Fazer upload"}
          </Button>
          {submitting ? (
            <Button type="button" variant="outline" size="sm" onClick={cancelUpload}>
              Cancelar envio
              {uploadProgress && mode === "file" ? ` (${sentCount}/${files.length})` : ""}
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void requestClose()}
            >
              Cancelar
            </Button>
          )}
        </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
