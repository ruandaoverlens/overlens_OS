"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Toggle as TogglePrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium text-surface-400 hover:bg-muted hover:text-surface-200 disabled:pointer-events-none disabled:opacity-20 data-[state=on]:bg-accent data-[state=on]:text-surface-200 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-6 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-foreground transition-all aria-invalid:ring-destructive/40 aria-invalid:border-destructive whitespace-nowrap bg-transparent",
  {
    variants: {
      size: {
        default: "h-10 px-2 min-w-10",
        sm: "h-10 px-1.5 min-w-10",
        lg: "h-10 px-2.5 min-w-10",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

/** Two-state toggle button. Use `outlined` for a bordered variant. */
function Toggle({
  className,
  outlined = false,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants> & { outlined?: boolean }) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      data-variant={outlined ? "outline" : "default"}
      className={cn(
        toggleVariants({ size }),
        outlined && "border border-border shadow-none hover:bg-accent hover:text-accent-foreground",
        className
      )}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }
