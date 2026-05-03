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

export function PromptArea({
  placeholder = "Pergunte alguma coisa",
  className,
  citableSections = [],
  basePath = "",
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
  const dragCounter = React.useRef(0)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const hasValue = value.trim().length > 0
  const canSubmit = hasValue && !disabled && !loading && Boolean(onSubmit)

  React.useEffect(() => {
    if (autoFocus) textareaRef.current?.focus()
  }, [autoFocus])

  async function handleSubmit() {
    if (!canSubmit || !onSubmit) return
    const trimmed = value.trim()
    // Clear immediately so the textarea is empty during streaming.
    // (Parent's onSubmit may resolve only after the entire stream finishes.)
    if (clearOnSubmit) setValue("")
    try {
      await onSubmit({ text: trimmed, planMode, selectedSection })
    } catch (err) {
      // Parent is responsible for surfacing errors (toast, etc.)
      console.error("PromptArea submit failed:", err)
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
                <DropdownMenuItem>
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
