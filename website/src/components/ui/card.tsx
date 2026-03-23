import * as React from "react"

import { cn } from "@/lib/utils"

/** Container component for grouping related content with consistent styling. */
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-[var(--surface-950)] text-card-foreground flex min-w-0 flex-col gap-4 rounded-xl px-4 py-6 shadow-none dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]",
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

/** Title text for the card header. */
function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("flex items-center justify-between px-1 text-lg leading-none font-medium", className)}
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
