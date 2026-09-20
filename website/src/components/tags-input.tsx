"use client"

import { useState, useCallback, type KeyboardEvent } from "react"
import { Input } from "@/components/ui/input"
import { SmCloseSolidIcon } from "@/components/icons"
import { cn } from "@/lib/utils"

interface TagsInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  className?: string
  /** `id` do input — use com `<Label htmlFor>`. */
  id?: string
  /** Nome acessível quando não há `<Label>` associado. */
  "aria-label"?: string
  /** Repassado ao input interno para sinalizar erro de validação. */
  "aria-invalid"?: boolean
  /** Repassado ao input interno — id da mensagem de erro/ajuda. */
  "aria-describedby"?: string
}

export function TagsInput({
  value,
  onChange,
  placeholder = "Digite e pressione Enter…",
  className,
  id,
  "aria-label": ariaLabel,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: TagsInputProps) {
  const [input, setInput] = useState("")

  const addTag = useCallback(
    (tag: string) => {
      const trimmed = tag.trim().toLowerCase()
      if (trimmed && !value.includes(trimmed)) {
        onChange([...value, trimmed])
      }
      setInput("")
    },
    [value, onChange]
  )

  const removeTag = useCallback(
    (tag: string) => {
      onChange(value.filter((t) => t !== tag))
    },
    [value, onChange]
  )

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addTag(input)
    } else if (e.key === "Backspace" && !input && value.length > 0) {
      removeTag(value[value.length - 1])
    }
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Input
        id={id}
        aria-label={ariaLabel}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        size="sm"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => input && addTag(input)}
        placeholder={placeholder}
      />
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-900 text-surface-300"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                aria-label={`Remover ${tag}`}
                className="relative inline-flex items-center justify-center size-3.5 rounded-full text-surface-500 hover:text-foreground focus-visible:text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-foreground after:absolute after:-inset-2 after:content-['']"
              >
                <SmCloseSolidIcon className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
