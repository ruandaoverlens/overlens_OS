import * as React from "react"

import { cn } from "@/lib/utils"
import { headingTitleVariants } from "@/components/ui/heading"

/** Container component for grouping related content with consistent styling. */
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-surface-950 text-card-foreground flex min-w-0 flex-col gap-4 rounded-xl px-4 py-6 shadow-popover",
        className
      )}
      {...props}
    />
  )
}

/** Header section of the card containing title and description. */
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header flex flex-col gap-2 [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

/**
 * Title text for the card header.
 * `size="sm"` usa a variante de rótulo (Outfit, caixa alta) usada em cards densos.
 */
function CardTitle({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & { size?: "default" | "sm" }) {
  return (
    <div
      data-slot="card-title"
      data-size={size}
      className={cn(
        "flex items-center justify-between px-1",
        size === "sm"
          // Mesma receita de título do design system (Outfit, caixa alta).
          ? headingTitleVariants({ size: "label" })
          // Exceção deliberada: o título padrão do card é prosa (Inter, caixa
          // mista) — não é um heading de bloco, e virar caixa alta mudaria
          // todos os cards do app.
          : "text-lg leading-none font-medium",
        className
      )}
      {...props}
    />
  )
}

/** Muted description text below the card title. */
function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("px-1 text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

/** Main content area of the card. */
function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-1", className)}
      {...props}
    />
  )
}

/** Footer area of the card for secondary actions. */
function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("mt-4 flex flex-row items-center gap-2 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
}
