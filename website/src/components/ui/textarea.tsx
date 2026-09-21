"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const textareaVariants = cva(
  [
    "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
    "bg-input/30",
    "w-full field-sizing-content font-normal font-body shadow-none border-2 border-transparent",
    "transition-[color,border-color,background-color] outline-none resize-none",
    "hover:bg-input/50",
    "focus-visible:border-foreground/70 focus-visible:bg-transparent",
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
    "aria-invalid:border-destructive aria-invalid:focus-visible:border-destructive",
    "autofill:shadow-[inset_0_0_0px_1000px_var(--input-autofill)] autofill:[-webkit-text-fill-color:var(--color-foreground)]",
    "scrollbar-thin",
  ].join(" "),
  {
    variants: {
      size: {
        lg: "min-h-30 rounded-field px-4 pt-3 pb-5 text-base",
        default: "min-h-25 rounded-field px-4 pt-3 pb-4 text-base",
        sm: "min-h-20 rounded-field px-4 pt-2.5 pb-3 text-sm",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

/** Multi-line text input with auto-sizing content, custom resize handle, and size variants. */
function Textarea({
  className,
  size,
  ...props
}: React.ComponentProps<"textarea"> &
  VariantProps<typeof textareaVariants>) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const handlePointerDown = React.useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      const textarea = textareaRef.current
      if (!textarea) return

      const startY = e.clientY
      const startHeight = textarea.offsetHeight

      const onPointerMove = (ev: PointerEvent) => {
        const delta = ev.clientY - startY
        textarea.style.height = `${Math.max(60, startHeight + delta)}px`
      }

      const onPointerUp = () => {
        document.removeEventListener("pointermove", onPointerMove)
        document.removeEventListener("pointerup", onPointerUp)
      }

      document.addEventListener("pointermove", onPointerMove)
      document.addEventListener("pointerup", onPointerUp)
    },
    []
  )

  return (
    <div className="relative grid w-full">
      <textarea
        ref={textareaRef}
        data-slot="textarea"
        className={cn(
          textareaVariants({ size }),
          "[grid-area:1/1]",
          className
        )}
        {...props}
      />
      <span
        aria-hidden="true"
        data-slot="textarea-handle"
        onPointerDown={handlePointerDown}
        className="cursor-ns-resize [grid-area:1/1] z-10 self-end justify-self-end mr-2 mb-1.5 size-4 flex items-center justify-center"
      >
        <span className="h-3 w-0.5 origin-bottom-right rotate-45 rounded-full bg-muted-foreground/40" />
      </span>
    </div>
  )
}

export { Textarea, textareaVariants }
