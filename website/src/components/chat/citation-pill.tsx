"use client"

import * as React from "react"
import { SmCloseLineIcon, SmFolderLineIcon } from "@/components/icons"
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
        "inline-flex shrink-0 items-center gap-1.5 rounded-full font-medium text-[#D6A461] bg-[#D6A461]/10 transition-colors",
        isCompact
          ? "h-7 pl-2.5 pr-3 text-xs"
          : "h-9 pl-3 pr-2 text-sm",
        className,
      )}
    >
      <SmFolderLineIcon className={isCompact ? "size-3.5" : "size-4"} />
      <span className="max-w-[240px] truncate">{title}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remover seção"
          className={cn(
            "flex shrink-0 items-center justify-center rounded-full transition-colors outline-none",
            "text-[#D6A461] hover:bg-[#D6A461]/15",
            "size-6",
          )}
        >
          <SmCloseLineIcon className="size-4" />
        </button>
      )}
    </div>
  )
}
