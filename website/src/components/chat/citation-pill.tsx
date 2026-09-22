"use client"

import * as React from "react"
import { SmCloseLineIcon, SmFolderLineIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type CitationPillProps = {
  title: string
  /** Show a close (X) button. */
  onRemove?: () => void
  /** Static (non-removable) compact display. */
  compact?: boolean
  className?: string
}

/**
 * Amber pill used to surface a cited section — both inside the prompt area
 * (with a remove button) and above messages (read-only/compact).
 */
export function CitationPill({
  title,
  onRemove,
  compact = false,
  className,
}: CitationPillProps) {
  const isCompact = compact || !onRemove
  return (
    <div
      data-slot="citation-pill"
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full font-medium text-brand-sahara-text bg-brand-sahara/10 transition-colors",
        isCompact
          ? "h-7 pl-2.5 pr-3 text-xs"
          : "h-9 pl-3 pr-2 text-sm",
        className,
      )}
    >
      <SmFolderLineIcon className={isCompact ? "size-3.5" : "size-4"} aria-hidden="true" />
      <span className="max-w-[240px] truncate">{title}</span>
      {onRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={onRemove}
          aria-label={`Remover seção citada: ${title}`}
          className="shrink-0 text-brand-sahara-text hover:bg-brand-sahara/15 hover:text-brand-sahara-text"
        >
          <SmCloseLineIcon className="size-4" />
        </Button>
      )}
    </div>
  )
}
