import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded px-2 py-0.5 text-xs font-medium font-mono uppercase tracking-wide w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none outline-none focus-visible:ring-2 focus-visible:ring-foreground aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-all overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/80",
        primary:
          "bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        destructive:
          "bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        success:
          "bg-success text-success-foreground [a&]:hover:bg-success/90",
        warning:
          "bg-warning text-warning-foreground [a&]:hover:bg-warning/90",
        info:
          "bg-info text-info-foreground [a&]:hover:bg-info/90",
        outline:
          "border border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        secondary:
          "bg-accent text-foreground/80 [a&]:hover:bg-accent/80",
        ghost: "text-foreground/80 [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

/** Inline status indicator with semantic color variants (default, primary, destructive, success, warning, info, outline). */
function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
