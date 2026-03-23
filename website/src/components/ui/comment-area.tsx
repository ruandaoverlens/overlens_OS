// @ts-nocheck
"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { SmAdd2LineIcon, SmUploadLineIcon, SmCognitionLineIcon } from "@/components/icons"
import { SmEmojiSolidIcon } from "@/components/icons"
import { SmArrowUpwardLineIcon } from "@/components/icons"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Tag } from "@/components/ui/tag"

/** File attachment metadata for the comment area. */
type CommentAreaFile = {
  id: string
  name: string
}

type CommentAreaProps = {
  placeholder?: string
  value?: string
  defaultValue?: string
  disabled?: boolean
  maxLength?: number
  files?: CommentAreaFile[]
  onValueChange?: (value: string) => void
  onSubmit?: (value: string) => void
  onUpload?: () => void
  onAIHelp?: () => void
  onFileRemove?: (id: string) => void
  actions?: React.ReactNode
  className?: string
}

/** Rich text comment input with file attachments, emoji, AI help, and submit via Cmd+Enter. */
function CommentArea({
  placeholder = "Deixe seu comentário",
  value: controlledValue,
  defaultValue = "",
  disabled = false,
  maxLength,
  onValueChange,
  onSubmit,
  onUpload,
  onAIHelp,
  onFileRemove,
  files = [],
  actions,
  className,
}: CommentAreaProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : internalValue
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const newValue = e.target.value
    if (!isControlled) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
  }

  function handleSubmit() {
    if (!value.trim() || disabled) return
    onSubmit?.(value)
    if (!isControlled) {
      setInternalValue("")
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const hasValue = value.length > 0

  return (
    <div
      data-slot="comment-area"
      data-disabled={disabled || undefined}
      data-filled={hasValue || undefined}
      className={cn(
        "group/comment relative flex w-full flex-col gap-1 overflow-hidden rounded-2xl px-3 pb-3.5 pt-5 sm:w-[420px]",
        "bg-accent/50 dark:bg-input/30",
        "border-2 border-transparent",
        "transition-[background-color,border-color]",
        "hover:bg-accent dark:hover:bg-input/50",
        "focus-within:border-input focus-within:bg-transparent",
        "dark:focus-within:bg-transparent",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
    >
      {/* Textarea */}
      <div className="pl-1.5 pb-2">
        <textarea
          ref={textareaRef}
          data-slot="comment-area-input"
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          maxLength={maxLength}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className={cn(
            "min-h-[40px] max-h-[160px] w-full resize-none overflow-y-auto bg-transparent font-body text-base leading-[1.6] tracking-[0.16px] outline-none",
            "placeholder:text-muted-foreground",
            "text-foreground",
            "field-sizing-content",
            "[&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-thumb]:border-[4px] [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-thumb]:bg-clip-content [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-track]:mt-1 [&::-webkit-scrollbar-track]:mb-1",
          )}
        />
      </div>
      {/* Attached files */}
      {files.length > 0 && (
        <div
          data-slot="comment-area-files"
          className="flex flex-wrap gap-1.5 px-1 pb-2"
        >
          {files.map((file) => (
            <Tag
              key={file.id}
              size="sm"
              className="max-w-[160px]"
              onDismiss={
                disabled ? undefined : () => onFileRemove?.(file.id)
              }
            >
              <span className="truncate">{file.name}</span>
            </Tag>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div
        data-slot="comment-area-toolbar"
        className="flex items-center justify-between"
      >
        {/* Left actions */}
        <div className="flex items-center gap-1">
          {actions ?? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <CommentAreaAction aria-label="Mais opções">
                    <SmAdd2LineIcon />
                  </CommentAreaAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="start" alignOffset={-16} sideOffset={8} className="pt-1.5 pb-1.5">
                  <DropdownMenuItem onSelect={onUpload}>
                    <SmUploadLineIcon />
                    Fazer upload de arquivo
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={onAIHelp}>
                    <SmCognitionLineIcon />
                    Pedir ajuda para IA
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <CommentAreaAction aria-label="Emoji">
                <SmEmojiSolidIcon />
              </CommentAreaAction>
            </>
          )}
        </div>

        {/* Counter + Submit */}
        <div className="flex items-center gap-2">
          {maxLength !== undefined && (
            <span className="pt-0.5 font-mono text-sm text-[var(--surface-600)]">
              ({value.length}/{maxLength})
            </span>
          )}
        <button
          type="button"
          data-slot="comment-area-submit"
          disabled={disabled || !hasValue}
          onClick={handleSubmit}
          aria-label="Enviar comentário"
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full transition-colors outline-none",
            "bg-foreground/80 text-background",
            "hover:bg-foreground",
            "disabled:opacity-30 disabled:pointer-events-none"
          )}
        >
          <SmArrowUpwardLineIcon className="size-5" />
        </button>
        </div>
      </div>
    </div>
  )
}

/** Circular icon button for toolbar actions in the comment area. */
function CommentAreaAction({
  className,
  children,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      data-slot="comment-area-action"
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full transition-colors outline-none",
        "text-muted-foreground",
        "hover:text-foreground hover:bg-accent",
        "focus-visible:ring-2 focus-visible:ring-foreground",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export { CommentArea, CommentAreaAction, type CommentAreaFile }
