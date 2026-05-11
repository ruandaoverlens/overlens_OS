"use client"

import { useState, useCallback, useRef } from "react"
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
import { TagsInput } from "@/components/tags-input"
import { useAuth } from "@/lib/auth"
import { uploadAssetDirect, type DirectUploadPhase } from "@/lib/direct-upload"
import { compressImageIfNeeded } from "@/lib/browser-image-compress"
import type {
  AssetUploadConfig,
  UploadFieldConfig,
  UploadFormValues,
  UploadPayload,
} from "@/lib/asset-upload-types"

// ─── Field Renderer ──────────────────────────────────────────────

function UploadField({
  field,
  value,
  onChange,
}: {
  field: UploadFieldConfig
  value: string | string[] | boolean | number
  onChange: (value: string | string[] | boolean | number) => void
}) {
  switch (field.type) {
    case "text":
      return (
        <Input
          size="sm"
          placeholder={field.placeholder}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )

    case "number":
      return (
        <Input
          size="sm"
          type="number"
          placeholder={field.placeholder}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )

    case "textarea":
      return (
        <Textarea
          size="sm"
          placeholder={field.placeholder}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )

    case "select":
      return (
        <NativeSelect
          size="sm"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        >
          <NativeSelectOption value="">
            {field.placeholder ?? "Selecione..."}
          </NativeSelectOption>
          {field.options?.map((opt) => (
            <NativeSelectOption key={opt.value} value={opt.value}>
              {opt.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      )

    case "tags":
      return (
        <TagsInput
          value={(value as string[]) ?? []}
          onChange={(tags) => onChange(tags)}
          placeholder={field.placeholder}
        />
      )

    case "switch":
      return (
        <Switch
          checked={(value as boolean) ?? false}
          onCheckedChange={(checked) => onChange(checked)}
        />
      )

    default:
      return null
  }
}

// ─── Progress helpers ────────────────────────────────────────────

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

type ProgressPhase = DirectUploadPhase | "compressing" | "done"

function phaseLabel(phase: ProgressPhase, bytes?: number, total?: number): string {
  switch (phase) {
    case "signing":
      return "Preparando upload..."
    case "compressing":
      return "Comprimindo imagem..."
    case "uploading-original":
      if (bytes != null && total != null && total > 0) {
        return `Enviando arquivo... (${formatBytes(bytes)} de ${formatBytes(total)})`
      }
      return "Enviando arquivo..."
    case "optimizing":
      return "Gerando preview..."
    case "uploading-preview":
      if (bytes != null && total != null && total > 0) {
        return `Enviando preview... (${formatBytes(bytes)} de ${formatBytes(total)})`
      }
      return "Enviando preview..."
    case "finalizing":
      return "Finalizando..."
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
}): number {
  if (p.total === 0) return 0
  // Each file has 4 sub-phases worth of progress; weight current-file
  // upload bytes inside the file's own slice so the bar moves smoothly.
  const base = (p.completed / p.total) * 100
  if (p.phase === "done") return 100

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

// ─── Upload Modal ────────────────────────────────────────────────

interface AssetUploadModalProps {
  config: AssetUploadConfig
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: (payload: UploadPayload) => void
}

export function AssetUploadModal({
  config,
  open,
  onOpenChange,
  onSubmit,
}: AssetUploadModalProps) {
  const { user } = useAuth()
  const [mode, setMode] = useState<"file" | "link">("file")
  const [files, setFiles] = useState<File[]>([])
  const [linkUrl, setLinkUrl] = useState("")
  const [linkThumbnail, setLinkThumbnail] = useState<File | null>(null)
  const [formValues, setFormValues] = useState<UploadFormValues>({})
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [compressImages, setCompressImages] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{
    completed: number
    total: number
    phase: DirectUploadPhase | "compressing" | "done"
    bytesUploaded?: number
    totalBytes?: number
    currentName?: string
    savings?: string
  } | null>(null)
  const [previewWarnings, setPreviewWarnings] = useState<string[]>([])
  const abortRef = useRef<AbortController | null>(null)

  const updateField = useCallback(
    (name: string, value: string | string[] | boolean | number) => {
      setFormValues((prev) => ({ ...prev, [name]: value }))
    },
    []
  )

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return
      const incoming = Array.from(fileList)

      // Validate size
      const oversized = incoming.filter(
        (f) => f.size > config.maxSizeMB * 1024 * 1024
      )
      if (oversized.length > 0) {
        setError(
          `Arquivo(s) excede(m) o limite de ${config.maxSizeMB}MB: ${oversized.map((f) => f.name).join(", ")}`
        )
        return
      }

      setError(null)
      if (config.multiple) {
        setFiles((prev) => [...prev, ...incoming])
      } else {
        setFiles(incoming.slice(0, 1))
      }
    },
    [config.maxSizeMB, config.multiple]
  )

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleSubmit = useCallback(async () => {
    // Validate required fields
    const missing = config.fields
      .filter((f) => f.required)
      .filter((f) => {
        const val = formValues[f.name]
        if (Array.isArray(val)) return val.length === 0
        if (typeof val === "boolean") return false
        return !val
      })

    if (missing.length > 0) {
      setError(
        `Preencha os campos obrigatórios: ${missing.map((f) => f.label).join(", ")}`
      )
      return
    }

    if (mode === "file" && files.length === 0) {
      setError("Selecione pelo menos um arquivo.")
      return
    }

    if (mode === "link") {
      const trimmed = linkUrl.trim()
      if (!trimmed) {
        setError("Cole a URL do link.")
        return
      }
      try {
        const u = new URL(trimmed)
        if (u.protocol !== "http:" && u.protocol !== "https:") {
          setError("A URL precisa começar com http:// ou https://")
          return
        }
      } catch {
        setError("URL inválida.")
        return
      }
    }

    if (!user) return

    setSubmitting(true)
    setError(null)
    setPreviewWarnings([])

    const abort = new AbortController()
    abortRef.current = abort

    try {
      if (mode === "link") {
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
        if (linkThumbnail) {
          formData.append("thumbnail", linkThumbnail)
        }

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
      } else {
        const total = files.length
        let completed = 0
        const inFlight = new Map<number, string>() // index → filename

        const metadata = {
          ...formValues,
          uploadedBy: { id: user.id, name: user.name, email: user.email },
          uploadedAt: new Date().toISOString(),
        }

        // Limit concurrent uploads so the browser doesn't open 20 sockets
        // and crawl. 3 is a good balance for typical residential connections.
        const CONCURRENCY = 3
        const queue = files.map((f, i) => ({ file: f, index: i }))

        const renderProgress = (
          phase: DirectUploadPhase | "compressing",
          bytesUploaded?: number,
          totalBytes?: number,
        ) => {
          // Show the most recently active file's name as a hint.
          const lastName = Array.from(inFlight.values()).pop()
          setUploadProgress({
            completed,
            total,
            phase,
            bytesUploaded,
            totalBytes,
            currentName: lastName,
          })
        }

        const processOne = async ({ file, index }: { file: File; index: number }) => {
          inFlight.set(index, file.name)
          renderProgress("signing")

          // Optional preflight compression for big images.
          let toUpload = file
          if (
            compressImages &&
            file.type.startsWith("image/") &&
            file.size > 4 * 1024 * 1024
          ) {
            renderProgress("compressing")
            try {
              const result = await compressImageIfNeeded(file, {
                maxBytes: 4 * 1024 * 1024,
                signal: abort.signal,
              })
              if (result.compressed) {
                toUpload = result.file
              }
            } catch (err) {
              if ((err as Error).name === "AbortError") throw err
              console.warn("[upload] compression failed, sending original:", err)
            }
          }

          const result = await uploadAssetDirect({
            file: toUpload,
            assetType: config.slug,
            metadata,
            signal: abort.signal,
            onProgress: (p) => {
              renderProgress(p.phase, p.bytesUploaded, p.totalBytes)
            },
          })

          if (result.previewError) {
            setPreviewWarnings((prev) => [
              ...prev,
              `${file.name}: preview não gerado (${result.previewError}). O original foi salvo, mas pode não aparecer na galeria até o problema ser resolvido.`,
            ])
          }

          inFlight.delete(index)
          completed += 1
          renderProgress("finalizing")
        }

        // Worker pool — each worker pulls the next item until queue is empty.
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

        setUploadProgress({ completed, total, phase: "done" })
      }

      // Also call the original onSubmit for any consumer-side logic
      const payload: UploadPayload = {
        files: mode === "file" ? files : [],
        metadata: formValues,
        assetType: config.slug,
        uploadedBy: { id: user.id, name: user.name, email: user.email },
        uploadedAt: new Date().toISOString(),
      }
      onSubmit?.(payload)

      // If there are warnings, keep the modal open so the user can read them.
      // Otherwise close after a brief delay.
      setSubmitting(false)
      setPreviewWarnings((current) => {
        if (current.length === 0) {
          setTimeout(() => {
            setFiles([])
            setLinkUrl("")
            setLinkThumbnail(null)
            setFormValues({})
            setError(null)
            setUploadProgress(null)
            setCompressImages(false)
            onOpenChange(false)
          }, 1200)
        }
        return current
      })
    } catch (err) {
      if ((err as Error).name === "AbortError") return
      setError((err as Error).message ?? "Erro ao fazer upload")
      setSubmitting(false)
      setUploadProgress(null)
    }
  }, [config, files, formValues, linkUrl, linkThumbnail, mode, user, onSubmit, onOpenChange])

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        abortRef.current?.abort()
        setFiles([])
        setLinkUrl("")
        setLinkThumbnail(null)
        setMode("file")
        setFormValues({})
        setError(null)
        setSubmitting(false)
        setUploadProgress(null)
        setPreviewWarnings([])
        setCompressImages(false)
      }
      onOpenChange(open)
    },
    [onOpenChange]
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-foreground/20 [&::-webkit-scrollbar-track]:bg-transparent">
        <DialogHeader>
          <DialogTitle>{config.title}</DialogTitle>
          <DialogDescription>{config.description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Mode toggle (file vs link) — only if config supports links */}
          {config.allowLink && (
            <Tabs
              value={mode}
              onValueChange={(v) => {
                setMode(v as "file" | "link")
                setError(null)
              }}
            >
              <TabsList>
                <TabsTrigger value="file">Arquivo</TabsTrigger>
                <TabsTrigger value="link">Link</TabsTrigger>
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
              >
                Selecionar arquivo{config.multiple ? "s" : ""}
              </UploadTrigger>

              {error && <UploadMessage variant="error">{error}</UploadMessage>}

              {files.length > 0 && files.length <= 3 &&
                files.map((f, i) => (
                  <UploadFile
                    key={`${f.name}-${i}`}
                    name={f.name}
                    onRemove={() => removeFile(i)}
                  />
                ))}

              {files.length > 3 && (
                <UploadSummary count={files.length}>
                  {files.map((f, i) => (
                    <UploadFile
                      key={`${f.name}-${i}`}
                      name={f.name}
                      onRemove={() => removeFile(i)}
                    />
                  ))}
                </UploadSummary>
              )}

              {files.some(
                (f) => f.type.startsWith("image/") && f.size > 4 * 1024 * 1024,
              ) && (
                <div className="flex items-center justify-between gap-3 px-1 pt-1">
                  <div>
                    <Label htmlFor="upload-compress" className="text-xs">
                      Comprimir imagens grandes antes de enviar
                    </Label>
                    <p className="text-[11px] text-muted-foreground">
                      Reduz arquivos &gt; 4 MB para acelerar o envio (mantém qualidade visual).
                    </p>
                  </div>
                  <Switch
                    id="upload-compress"
                    checked={compressImages}
                    onCheckedChange={setCompressImages}
                  />
                </div>
              )}
            </Upload>
          )}

          {/* Link inputs — only in link mode */}
          {mode === "link" && (
            <div className="flex flex-col gap-3">
              <div className="space-y-2">
                <Label htmlFor="upload-link-url">
                  URL <span className="text-destructive ml-1">*</span>
                </Label>
                <Input
                  id="upload-link-url"
                  size="sm"
                  type="url"
                  placeholder="https://figma.com/file/..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="upload-link-thumb">Thumbnail (opcional)</Label>
                <p className="text-xs text-muted-foreground -mt-1">
                  Imagem de preview pro card. Se vazio, usamos um ícone genérico.
                </p>
                {linkThumbnail ? (
                  <UploadFile
                    name={linkThumbnail.name}
                    onRemove={() => setLinkThumbnail(null)}
                  />
                ) : (
                  <Upload>
                    <UploadTrigger
                      accept=".png,.jpg,.jpeg,.webp,.svg"
                      multiple={false}
                      onChange={(fl) => {
                        if (fl && fl[0]) setLinkThumbnail(fl[0])
                      }}
                    >
                      Selecionar thumbnail
                    </UploadTrigger>
                  </Upload>
                )}
              </div>

              {error && <UploadMessage variant="error">{error}</UploadMessage>}
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
                <Label htmlFor={`upload-${field.name}`}>
                  {field.label}
                  {field.required && (
                    <span className="text-destructive ml-1">*</span>
                  )}
                </Label>
                {field.helperText && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {field.helperText}
                  </p>
                )}
              </div>
              <UploadField
                field={field}
                value={formValues[field.name] ?? (field.type === "tags" ? [] : field.type === "switch" ? false : "")}
                onChange={(val) => updateField(field.name, val)}
              />
            </div>
          ))}

          {/* Uploader info */}
          {user && (
            <div className="flex items-center gap-2 px-1 pt-2 border-t border-[var(--surface-900)]">
              <span className="text-xs text-muted-foreground">
                Enviado por <span className="text-foreground font-medium">{user.name}</span>
              </span>
            </div>
          )}
        </div>

        {/* Upload progress */}
        {uploadProgress && (
          <div className="flex flex-col gap-2 px-1 py-3 border-t border-[var(--surface-900)]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground truncate pr-2">
                {phaseLabel(uploadProgress.phase, uploadProgress.bytesUploaded, uploadProgress.totalBytes)}
                {uploadProgress.currentName && uploadProgress.phase !== "done" && (
                  <span className="text-foreground/70"> · {uploadProgress.currentName}</span>
                )}
              </span>
              <span className="text-muted-foreground tabular-nums shrink-0">
                {uploadProgress.completed}/{uploadProgress.total}
              </span>
            </div>
            <div className="h-1 w-full rounded-full bg-[var(--surface-900)] overflow-hidden">
              <div
                className="h-full rounded-full bg-white transition-all duration-500"
                style={{
                  width: `${overallPercent(uploadProgress)}%`,
                  opacity: uploadProgress.phase === "done" ? 1 : 0.7,
                }}
              />
            </div>
          </div>
        )}

        {previewWarnings.length > 0 && (
          <div className="flex flex-col gap-1 px-3 py-2 border border-amber-500/30 bg-amber-500/5 rounded-md text-xs text-amber-300">
            <span className="font-medium">Upload concluído com aviso</span>
            {previewWarnings.map((w, i) => (
              <span key={i} className="text-amber-200/80">{w}</span>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="default"
            size="sm"
            onClick={handleSubmit}
            disabled={
              submitting ||
              (mode === "file" ? files.length === 0 : linkUrl.trim().length === 0)
            }
          >
            {submitting
              ? uploadProgress
                ? `Enviando ${uploadProgress.completed}/${uploadProgress.total}...`
                : "Enviando..."
              : mode === "link"
                ? "Salvar link"
                : "Fazer upload"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenChange(false)}
          >
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
