"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useSlashFocus } from "@/lib/use-slash-focus"
import {
  SmAdd2LineIcon,
  SmArrowUpwardLineIcon,
  SmClipsLineIcon,
  SmCloseLineIcon,
  SmCognitionLineIcon,
  SmFolderLineIcon,
} from "@/components/icons"
import { CitationPill } from "@/components/chat/citation-pill"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { notify } from "@/lib/notifications/toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  CommandDialog,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command"

export type CitableSection = {
  title: string
  segments: string[]
  groupTitle: string
}

export type SelectedSection = {
  title: string
  segments: string[]
}

export type PromptSubmitPayload = {
  text: string
  planMode: boolean
  selectedSection: SelectedSection | null
  attachments: File[]
}

type PromptAreaProps = {
  placeholder?: string
  className?: string
  citableSections?: CitableSection[]
  basePath?: string
  onSubmit?: (payload: PromptSubmitPayload) => void | Promise<void>
  disabled?: boolean
  loading?: boolean
  autoFocus?: boolean
  /** When true, clears the textarea after a successful submit. Default: true. */
  clearOnSubmit?: boolean
  /**
   * Registra o atalho global "/" para focar o composer. Só deve ser ligado
   * pelo composer principal da rota (chat); índices de system não o usam.
   * Default: false.
   */
  focusShortcut?: boolean
  /** Texto inicial do composer (ex.: vindo de `?q=`). */
  initialValue?: string
  /** Anexos iniciais (ex.: restaurados após uma falha de envio). */
  initialAttachments?: File[]
}

const ACCEPTED_TYPES = "image/*,.pdf,.md"
/** Limite por anexo — acima disso o arquivo é recusado com aviso. */
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024
const ACCEPTED_TYPES_LABEL = "Imagens, PDF ou Markdown"

/** Tipos aceitos: qualquer imagem, PDF ou Markdown (por MIME ou extensão). */
function isAcceptedType(file: File): boolean {
  if (file.type.startsWith("image/")) return true
  if (file.type === "application/pdf") return true
  if (file.type === "text/markdown") return true
  return /\.(pdf|md|markdown)$/i.test(file.name)
}

type RejectReason = "size" | "type"

function isImage(file: File) {
  return file.type.startsWith("image/")
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

type ImagePreviewProps = {
  file: File
  onRemove: () => void
}

function ImagePreview({ file, onRemove }: ImagePreviewProps) {
  const [url, setUrl] = React.useState<string | null>(null)
  React.useEffect(() => {
    const objectUrl = URL.createObjectURL(file)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  return (
    <div
      data-slot="prompt-area-image-preview"
      className="relative size-18 shrink-0 overflow-hidden rounded-xl border border-border/50 bg-muted"
    >
      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={file.name}
          className="h-full w-full object-cover"
        />
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={onRemove}
        aria-label={`Remover ${file.name}`}
        className="absolute right-1 top-1 bg-black/70 text-white hover:bg-black/85 hover:text-white"
      >
        <SmCloseLineIcon className="size-3.5" />
      </Button>
    </div>
  )
}

type FileChipProps = {
  file: File
  onRemove: () => void
}

function FileChip({ file, onRemove }: FileChipProps) {
  return (
    <div
      data-slot="prompt-area-file-chip"
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full pl-3 pr-1 text-sm font-medium transition-colors",
        "bg-brand-sahara/10 text-brand-sahara",
      )}
    >
      <SmFolderLineIcon className="size-4" aria-hidden="true" />
      <span className="max-w-[180px] truncate">{file.name}</span>
      <span className="text-xs">{formatBytes(file.size)}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={onRemove}
        aria-label={`Remover ${file.name}`}
        className="ml-0.5 shrink-0 text-brand-sahara hover:bg-brand-sahara/15 hover:text-brand-sahara"
      >
        <SmCloseLineIcon className="size-4" />
      </Button>
    </div>
  )
}

export function PromptArea({
  placeholder = "Pergunte alguma coisa",
  className,
  citableSections = [],
  onSubmit,
  disabled = false,
  loading = false,
  autoFocus = false,
  clearOnSubmit = true,
  focusShortcut = false,
  initialValue,
  initialAttachments,
}: PromptAreaProps) {
  const [value, setValue] = React.useState(initialValue ?? "")
  const [planMode, setPlanMode] = React.useState(false)
  const [selectedSection, setSelectedSection] = React.useState<SelectedSection | null>(null)
  const [sectionPickerOpen, setSectionPickerOpen] = React.useState(false)
  const [isDragOver, setIsDragOver] = React.useState(false)
  const [attachments, setAttachments] = React.useState<File[]>(initialAttachments ?? [])
  const [attachmentError, setAttachmentError] = React.useState<string | null>(null)
  const dragCounter = React.useRef(0)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const attachmentErrorId = React.useId()

  const hasValue = value.trim().length > 0
  const hasAttachments = attachments.length > 0
  const canSubmit = (hasValue || hasAttachments) && !disabled && !loading && Boolean(onSubmit)

  React.useEffect(() => {
    if (autoFocus) textareaRef.current?.focus()
  }, [autoFocus])

  // "/" foca o composer quando o foco não está num campo de texto.
  // Só o composer principal da rota registra o atalho (focusShortcut).
  useSlashFocus(textareaRef, focusShortcut && !disabled)

  function appendFiles(files: File[]) {
    if (files.length === 0) return
    const accepted: File[] = []
    const rejected: { file: File; reason: RejectReason }[] = []
    for (const file of files) {
      if (!isAcceptedType(file)) rejected.push({ file, reason: "type" })
      else if (file.size > MAX_ATTACHMENT_BYTES) rejected.push({ file, reason: "size" })
      else accepted.push(file)
    }
    if (rejected.length > 0) {
      const tooBig = rejected.filter((r) => r.reason === "size")
      const badType = rejected.filter((r) => r.reason === "type")
      const parts: string[] = []
      if (tooBig.length > 0) {
        parts.push(
          tooBig.length === 1
            ? `"${tooBig[0].file.name}" ultrapassa ${formatBytes(MAX_ATTACHMENT_BYTES)}.`
            : `${tooBig.length} arquivos ultrapassam ${formatBytes(MAX_ATTACHMENT_BYTES)}.`,
        )
      }
      if (badType.length > 0) {
        parts.push(
          badType.length === 1
            ? `"${badType[0].file.name}" não é um formato aceito (${ACCEPTED_TYPES_LABEL}).`
            : `${badType.length} arquivos não são de um formato aceito (${ACCEPTED_TYPES_LABEL}).`,
        )
      }
      const message = parts.join(" ")
      setAttachmentError(message)
      notify.warning(
        rejected.length === 1 ? "Anexo recusado" : "Anexos recusados",
        { description: message },
      )
    } else {
      setAttachmentError(null)
    }
    if (accepted.length === 0) return
    setAttachments((prev) => [...prev, ...accepted])
  }

  function removeAttachment(index: number) {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
    setAttachmentError(null)
  }

  async function handleSubmit() {
    if (!canSubmit || !onSubmit) return
    const trimmed = value.trim()
    const filesToSend = attachments
    // Clear immediately so the textarea is empty during streaming.
    // (Parent's onSubmit may resolve only after the entire stream finishes.)
    if (clearOnSubmit) {
      setValue("")
      setAttachments([])
    }
    try {
      await onSubmit({
        text: trimmed,
        planMode,
        selectedSection,
        attachments: filesToSend,
      })
    } catch (err) {
      // Parent is responsible for surfacing errors (toast, etc.), but o rascunho
      // é nosso: um envio que falha não pode apagar o que a pessoa escreveu.
      console.error("PromptArea submit failed:", err)
      if (clearOnSubmit) {
        setValue((current) => (current.trim().length > 0 ? current : trimmed))
        setAttachments((current) => (current.length > 0 ? current : filesToSend))
      }
    }
  }

  function handleAddFilesClick() {
    fileInputRef.current?.click()
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files ? Array.from(e.target.files) : []
    appendFiles(files)
    // Reset so picking the same file twice in a row still triggers change.
    e.target.value = ""
  }

  function handlePaste(e: React.ClipboardEvent) {
    const items = e.clipboardData?.items
    if (!items || items.length === 0) return
    const pastedFiles: File[] = []
    for (const item of Array.from(items)) {
      if (item.kind !== "file") continue
      const file = item.getAsFile()
      if (file && isImage(file)) pastedFiles.push(file)
    }
    if (pastedFiles.length > 0) {
      // Prevent the default text-paste only when we actually consumed an image.
      // (When pasting plain text, items may include "string" entries — let those through.)
      e.preventDefault()
      appendFiles(pastedFiles)
    }
  }

  function isSectionDrag(e: React.DragEvent) {
    return e.dataTransfer.types.includes("application/x-overlens-section")
  }

  function handleDragEnter(e: React.DragEvent) {
    if (!isSectionDrag(e)) return
    e.preventDefault()
    dragCounter.current += 1
    setIsDragOver(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    if (!isSectionDrag(e)) return
    dragCounter.current -= 1
    if (dragCounter.current <= 0) {
      dragCounter.current = 0
      setIsDragOver(false)
    }
  }

  function handleDragOver(e: React.DragEvent) {
    if (!isSectionDrag(e)) return
    e.preventDefault()
    e.dataTransfer.dropEffect = "copy"
  }

  function handleDrop(e: React.DragEvent) {
    if (!isSectionDrag(e)) return
    e.preventDefault()
    dragCounter.current = 0
    setIsDragOver(false)
    try {
      const raw = e.dataTransfer.getData("application/x-overlens-section")
      const data = JSON.parse(raw) as { title: string; segments: string[] }
      if (data.title && Array.isArray(data.segments)) {
        setSelectedSection({ title: data.title, segments: data.segments })
      }
    } catch {
      // ignore malformed payload
    }
  }

  const groupedSections = React.useMemo(() => {
    const map = new Map<string, CitableSection[]>()
    for (const s of citableSections) {
      const list = map.get(s.groupTitle) ?? []
      list.push(s)
      map.set(s.groupTitle, list)
    }
    return Array.from(map.entries())
  }, [citableSections])

  function handleSectionSelect(section: CitableSection) {
    setSelectedSection({ title: section.title, segments: section.segments })
    setSectionPickerOpen(false)
  }

  const imageAttachments = attachments
    .map((file, index) => ({ file, index }))
    .filter(({ file }) => isImage(file))
  const fileAttachments = attachments
    .map((file, index) => ({ file, index }))
    .filter(({ file }) => !isImage(file))

  return (
    <>
      <div
        data-slot="prompt-area"
        data-filled={hasValue || undefined}
        data-drag-over={isDragOver || undefined}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onPaste={handlePaste}
        className={cn(
          "group/prompt relative -mx-0.5 flex w-[calc(100%+4px)] flex-col gap-7 overflow-hidden rounded-prompt px-2 pt-4 pb-2",
          "bg-input/30",
          "border-2 border-transparent",
          "transition-[background-color,border-color,box-shadow]",
          "hover:bg-input/50",
          "focus-within:ring-2 focus-within:ring-foreground/70 focus-within:bg-transparent",
          isDragOver && "border-brand-sahara bg-brand-sahara/5",
          className
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          multiple
          onChange={handleFileInputChange}
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
        />

        {hasAttachments && (
          <div
            data-slot="prompt-area-attachments"
            className="-mb-4 flex w-full items-center gap-2 overflow-x-auto px-2 pb-1 scrollbar-hidden"
          >
            {imageAttachments.map(({ file, index }) => (
              <ImagePreview
                key={`img-${index}-${file.name}`}
                file={file}
                onRemove={() => removeAttachment(index)}
              />
            ))}
            {fileAttachments.map(({ file, index }) => (
              <FileChip
                key={`file-${index}-${file.name}`}
                file={file}
                onRemove={() => removeAttachment(index)}
              />
            ))}
          </div>
        )}

        {attachmentError && (
          <p
            id={attachmentErrorId}
            role="alert"
            data-slot="prompt-area-attachment-error"
            className={cn("-mb-4 px-3 text-sm text-destructive", hasAttachments && "-mt-2")}
          >
            {attachmentError}
          </p>
        )}

        <div className="flex items-start gap-2 pl-3 pr-2">
          <textarea
            ref={textareaRef}
            data-slot="prompt-area-input"
            aria-label={placeholder}
            aria-describedby={attachmentError ? attachmentErrorId : undefined}
            aria-keyshortcuts={focusShortcut ? "/" : undefined}
            placeholder={placeholder}
            value={value}
            disabled={disabled}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== "Enter") return
              // Shift/Ctrl/Cmd + Enter → quebra de linha (comportamento default do textarea)
              if (e.shiftKey || e.metaKey || e.ctrlKey) return
              // Enter "puro" → envia
              e.preventDefault()
              void handleSubmit()
            }}
            className={cn(
              "min-h-[24px] max-h-[160px] w-full resize-none overflow-y-auto bg-transparent font-body text-base leading-relaxed tracking-normal outline-none",
              "placeholder:text-muted-foreground",
              "text-foreground",
              "field-sizing-content",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
            rows={1}
          />
        </div>

        <div className="flex items-center justify-between gap-2 px-1 pb-1">
          <div className="flex items-center gap-1.5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  data-slot="prompt-area-add"
                  aria-label="Adicionar anexos, Modo Plano ou citação"
                  className={cn(
                    "shrink-0 text-muted-foreground hover:text-foreground",
                    "hover:bg-input/50",
                    "data-[state=open]:bg-input/50 data-[state=open]:text-foreground",
                  )}
                >
                  <SmAdd2LineIcon className="size-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" sideOffset={8} className="min-w-[220px] pb-2">
                <DropdownMenuItem onSelect={handleAddFilesClick}>
                  <SmClipsLineIcon />
                  Adicionar fotos e arquivos
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setPlanMode((v) => !v)}>
                  <SmCognitionLineIcon />
                  Modo Plano
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setSectionPickerOpen(true)}>
                  <SmFolderLineIcon />
                  Citar Seção
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {planMode && (
              <div
                className={cn(
                  "flex h-9 shrink-0 items-center gap-1.5 rounded-full pl-3 pr-2 text-sm font-medium transition-colors",
                  "bg-brand-atmos/10 text-brand-atmos",
                )}
              >
                <SmCognitionLineIcon className="size-4" aria-hidden="true" />
                <span>Modo Plano</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setPlanMode(false)}
                  aria-label="Desativar Modo Plano"
                  className="shrink-0 text-brand-atmos hover:bg-brand-atmos/15 hover:text-brand-atmos"
                >
                  <SmCloseLineIcon className="size-4" />
                </Button>
              </div>
            )}

            {selectedSection && (
              <CitationPill
                title={selectedSection.title}
                onRemove={() => setSelectedSection(null)}
              />
            )}
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="inverted"
                size="icon"
                data-slot="prompt-area-submit"
                disabled={!canSubmit}
                onClick={handleSubmit}
                aria-label={loading ? "Enviando" : "Enviar"}
                aria-busy={loading || undefined}
                className="shrink-0 bg-white text-black hover:bg-white/90 disabled:opacity-30"
              >
                {loading ? (
                  <Spinner aria-hidden="true" role="presentation" className="size-4 text-black" />
                ) : (
                  <SmArrowUpwardLineIcon className="size-5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              {loading ? "Enviando…" : "Enviar"}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <CommandDialog
        open={sectionPickerOpen}
        onOpenChange={setSectionPickerOpen}
        title="Citar seção"
        description="Busque e selecione uma seção para citar."
        placeholder="Buscar seção…"
        showCloseButton={false}
        className="rounded-prompt"
        suggestions={groupedSections.map(([groupTitle, items]) => (
          <CommandGroup key={groupTitle} heading={groupTitle}>
            {items.map((section) => {
              const key = section.segments.join("/")
              return (
                <CommandItem
                  key={`${groupTitle}-${key}`}
                  value={`${groupTitle} ${section.title}`}
                  onSelect={() => handleSectionSelect(section)}
                >
                  <SmFolderLineIcon />
                  {section.title}
                </CommandItem>
              )
            })}
          </CommandGroup>
        ))}
      >
        {groupedSections.map(([groupTitle, items]) => (
          <CommandGroup key={groupTitle} heading={groupTitle}>
            {items.map((section) => {
              const key = section.segments.join("/")
              return (
                <CommandItem
                  key={`${groupTitle}-${key}`}
                  value={`${groupTitle} ${section.title}`}
                  onSelect={() => handleSectionSelect(section)}
                >
                  <SmFolderLineIcon />
                  {section.title}
                </CommandItem>
              )
            })}
          </CommandGroup>
        ))}
      </CommandDialog>
    </>
  )
}
