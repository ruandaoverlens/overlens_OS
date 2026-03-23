"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { SmArrowUpwardLineIcon } from "@/components/icons"

type PromptAreaProps = {
  placeholder?: string
  className?: string
}

export function PromptArea({
  placeholder = "Pergunte qualquer coisa sobre este system...",
  className,
}: PromptAreaProps) {
  const [value, setValue] = React.useState("")

  const hasValue = value.length > 0

  return (
    <div
      data-slot="prompt-area"
      data-filled={hasValue || undefined}
      className={cn(
        "group/prompt relative flex w-full items-center gap-2 overflow-hidden rounded-full pl-5 pr-2.5 py-2.5",
        "bg-accent/50 dark:bg-input/30",
        "border-2 border-transparent",
        "transition-[background-color,border-color]",
        "hover:bg-accent dark:hover:bg-input/50",
        "focus-within:border-input focus-within:bg-transparent",
        "dark:focus-within:bg-transparent",
        className
      )}
    >
      <textarea
        data-slot="prompt-area-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault()
          }
        }}
        className={cn(
          "min-h-[24px] max-h-[160px] w-full resize-none overflow-y-auto bg-transparent font-body text-sm leading-[1.6] tracking-[0.16px] outline-none",
          "placeholder:text-muted-foreground",
          "text-foreground",
          "field-sizing-content",
        )}
        rows={1}
      />
      <button
        type="button"
        data-slot="prompt-area-submit"
        disabled={!hasValue}
        aria-label="Enviar"
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
  )
}
