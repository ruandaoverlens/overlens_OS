"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  SmAdd2LineIcon,
  SmArrowUpwardLineIcon,
  SmClipsLineIcon,
  SmCloseLineIcon,
  SmCognitionLineIcon,
  SmFolderLineIcon,
} from "@/components/icons"
import { CitationPill } from "@/components/chat/citation-pill"
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
}

const ACCEPTED_TYPES = "image/*,.pdf,.md"

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
      className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl border border-border/50 bg-muted"
    >
      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={file.name}
          className="h-full w-full object-cover"
        />
      )}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remover ${file.name}`}
        className={cn(
          "absolute right-1 top-1 flex size-5 items-center justify-center rounded-full transition-colors outline-none",
          "bg-black/70 text-white hover:bg-black/85",
        )}
      >
        <SmCloseLineIcon className="size-3.5" />
      </button>
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
        "bg-[#D6A461]/10 text-[#D6A461]",
      )}
    >
      <SmFolderLineIcon className="size-4" />
      <span className="max-w-[180px] truncate">{file.name}</span>
      <span className="text-xs opacity-70">{formatBytes(file.size)}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remover ${file.name}`}
        className={cn(
          "ml-0.5 flex size-7 shrink-0 items-center justify-center rounded-full transition-colors outline-none",
          "text-[#D6A461] hover:bg-[#D6A461]/15",
        )}
      >
        <SmCloseLineIcon className="size-4" />
      </button>
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
}: PromptAreaProps) {
  const [value, setValue] = React.useState("")
  const [planMode, setPlanMode] = React.useState(false)
  const [selectedSection, setSelectedSection] = React.useState<SelectedSection | null>(null)
  const [sectionPickerOpen, setSectionPickerOpen] = React.useState(false)
  const [isDragOver, setIsDragOver] = React.useState(false)
  const [attachments, setAttachments] = React.useState<File[]>([])
  const dragCounter = React.useRef(0)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const hasValue = value.trim().length > 0
  const hasAttachments = attachments.length > 0
  const canSubmit = (hasValue || hasAttachments) && !disabled && !loading && Boolean(onSubmit)

  React.useEffect(() => {
    if (autoFocus) textareaRef.current?.focus()
  }, [autoFocus])

  function appendFiles(files: File[]) {
    if (files.length === 0) return
    setAttachments((prev) => [...prev, ...files])
  }

  function removeAttachment(index: number) {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
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
      // Parent is responsible for surfacing errors (toast, etc.)
      console.error("PromptArea submit failed:", err)
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
          "group/prompt relative -mx-0.5 flex w-[calc(100%+4px)] flex-col gap-7 overflow-hidden rounded-3xl px-2 pt-4 pb-2",
          "bg-accent/50 dark:bg-input/30",
          "border-2 border-transparent",
          "transition-[background-color,border-color]",
          "hover:bg-accent dark:hover:bg-input/50",
          "focus-within:border-input focus-within:bg-transparent",
          "dark:focus-within:bg-transparent",
          isDragOver && "border-[#D6A461] bg-[#D6A461]/5 dark:bg-[#D6A461]/5",
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

        <div className="flex items-start gap-2 pl-3 pr-2">
          <textarea
            ref={textareaRef}
            data-slot="prompt-area-input"
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
              "min-h-[24px] max-h-[160px] w-full resize-none overflow-y-auto bg-transparent font-body text-base leading-[1.6] tracking-[0.16px] outline-none",
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
                <button
                  type="button"
                  data-slot="prompt-area-add"
                  aria-label="Adicionar"
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full transition-colors outline-none",
                    "text-muted-foreground/60 hover:bg-accent hover:text-foreground",
                    "dark:hover:bg-input/50",
                    "data-[state=open]:bg-accent data-[state=open]:text-foreground",
                    "dark:data-[state=open]:bg-input/50",
                  )}
                >
                  <SmAdd2LineIcon className="size-6" />
                </button>
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
                  "bg-[#77C5D5]/10 text-[#77C5D5]",
                )}
              >
                <SmCognitionLineIcon className="size-4" />
                <span>Modo Plano</span>
                <button
                  type="button"
                  onClick={() => setPlanMode(false)}
                  aria-label="Desativar Modo Plano"
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full transition-colors outline-none",
                    "text-[#77C5D5] hover:bg-[#77C5D5]/15",
                  )}
                >
                  <SmCloseLineIcon className="size-4" />
                </button>
              </div>
            )}

            {selectedSection && (
              <CitationPill
                title={selectedSection.title}
                onRemove={() => setSelectedSection(null)}
              />
            )}
          </div>

          <button
            type="button"
            data-slot="prompt-area-submit"
            disabled={!canSubmit}
            onClick={handleSubmit}
            aria-label={loading ? "Enviando" : "Enviar"}
            aria-busy={loading || undefined}
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-full transition-colors outline-none",
              "bg-white text-black",
              "hover:bg-white/90",
              "disabled:opacity-30 disabled:pointer-events-none",
            )}
          >
            {loading ? (
              <span
                aria-hidden="true"
                className="size-4 animate-spin rounded-full border-2 border-black/20 border-t-black"
              />
            ) : (
              <SmArrowUpwardLineIcon className="size-5" />
            )}
          </button>
        </div>
      </div>

      <CommandDialog
        open={sectionPickerOpen}
        onOpenChange={setSectionPickerOpen}
        title="Citar seção"
        description="Busque e selecione uma seção para citar."
        placeholder="Buscar seção..."
        showCloseButton={false}
        className="rounded-[28px]"
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
