import * as React from "react"
import { SmCloseLineIcon } from "@/components/icons"

import { cn } from "@/lib/utils"

/** Compact label chip with optional dismiss button. Useful for filters, categories, or multi-select values. */
function Tag({
  className,
  small = false,
  disabled = false,
  onDismiss,
  children,
  ...props
}: Omit<React.ComponentProps<"span">, "disabled"> & {
    small?: boolean
    disabled?: boolean
    onDismiss?: () => void
  }) {
  return (
    <span
      data-slot="tag"
      data-disabled={disabled || undefined}
      aria-disabled={disabled || undefined}
      className={cn(
        "inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-[4px] font-mono uppercase overflow-clip transition-all leading-4 outline-none bg-black/10 text-[var(--surface-700)] hover:bg-black/20 active:bg-black/30 dark:bg-[var(--surface-200)]/10 dark:text-[var(--surface-300)] dark:hover:bg-white/20 dark:active:bg-white/30 focus-visible:ring-2 focus-visible:ring-[var(--surface-200)] cursor-default [&:hover]:cursor-pointer data-[disabled]:pointer-events-none data-[disabled]:opacity-20",
        small ? "px-2 py-0.5 text-xs font-normal" : "px-2 py-1 text-sm font-normal",
        className
      )}
      {...props}
    >
      {children}
      {onDismiss && (
        <button
          type="button"
          aria-label="Remove"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation()
            onDismiss()
          }}
          className="inline-flex items-center justify-center size-4 shrink-0 opacity-70 hover:opacity-100 transition-opacity disabled:pointer-events-none"
        >
          <SmCloseLineIcon className="size-4 stroke-current stroke-1" />
        </button>
      )}
    </span>
  )
}

export { Tag }
