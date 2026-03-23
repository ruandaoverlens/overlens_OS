"use client"

import * as React from "react"
import { type VariantProps } from "class-variance-authority"
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { toggleVariants } from "@/components/ui/toggle"

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants> & {
    outlined?: boolean
    spacing?: number
  }
>({
  size: "default",
  outlined: false,
  spacing: 0,
})

/** Group of toggle buttons supporting single or multiple selection. */
function ToggleGroup({
  className,
  outlined = false,
  size,
  spacing = 0,
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleVariants> & {
    outlined?: boolean
    spacing?: number
  }) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={outlined ? "outline" : "default"}
      data-size={size}
      data-spacing={spacing}
      style={{ "--gap": spacing } as React.CSSProperties}
      className={cn(
        "group/toggle-group flex w-fit items-center gap-0.5 rounded-lg data-[spacing=default]:data-[variant=outline]:shadow-none",
        className
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ outlined, size, spacing }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  )
}

/** Individual toggle button within a ToggleGroup. Inherits variant and size from the group context. */
function ToggleGroupItem({
  className,
  children,
  outlined,
  size,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> &
  VariantProps<typeof toggleVariants> & { outlined?: boolean }) {
  const context = React.useContext(ToggleGroupContext)

  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={context.outlined || outlined ? "outline" : "default"}
      data-size={context.size || size}
      data-spacing={context.spacing}
      className={cn(
        "inline-flex items-center justify-center gap-2 text-sm font-medium outline-none transition-all disabled:pointer-events-none disabled:opacity-20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-6 focus-visible:ring-2 focus-visible:ring-foreground whitespace-nowrap",
        "w-auto min-w-0 shrink-0 rounded-[6px] border-none bg-transparent shadow-none",
        "text-[var(--surface-700)] dark:text-[var(--surface-400)]",
        "hover:bg-accent hover:text-[var(--surface-200)] dark:hover:text-[var(--surface-200)]",
        "data-[state=on]:bg-accent data-[state=on]:text-[var(--surface-200)]",
        context.size === "sm" || size === "sm" ? "h-8 px-2 min-w-8" :
        context.size === "lg" || size === "lg" ? "h-10 px-3 min-w-10" :
        "h-9 px-2.5 min-w-9",
        "focus:z-10 focus-visible:z-10",
        className
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  )
}

export { ToggleGroup, ToggleGroupItem }
