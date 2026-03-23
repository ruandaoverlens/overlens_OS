"use client"

import * as React from "react"
import { Tabs as TabsPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

/** Tabbed navigation component supporting horizontal and vertical orientations. */
function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        "group/tabs flex gap-2 data-[orientation=horizontal]:flex-col",
        className
      )}
      {...props}
    />
  )
}

/** Container for tab triggers with default and underline variants. */
function TabsList({
  className,
  underline = false,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & {
  underline?: boolean
}) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={underline ? "line" : "default"}
      className={cn(
        "group/tabs-list text-muted-foreground inline-flex w-fit max-w-full items-center justify-center group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col bg-transparent gap-1",
        "group-data-[orientation=horizontal]/tabs:h-9 overflow-x-auto overflow-y-hidden",
        "data-[variant=line]:overflow-visible data-[variant=line]:pb-2",
        className
      )}
      {...props}
    />
  )
}

/** Individual tab button that activates its associated content panel. */
function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "bg-accent/50 dark:bg-input/30 text-foreground/60 hover:text-foreground hover:bg-accent dark:hover:bg-input/50 dark:text-muted-foreground dark:hover:text-foreground relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-full px-4 py-1 text-sm font-normal font-body whitespace-nowrap transition-all group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-6 group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:dark:bg-transparent group-data-[variant=line]/tabs-list:hover:bg-transparent group-data-[variant=line]/tabs-list:dark:hover:bg-transparent",
        "focus-visible:outline-2 focus-visible:outline-[var(--surface-200)] focus-visible:ring-0 focus-visible:data-[state=active]:outline-0",
        "data-[state=active]:text-foreground dark:data-[state=active]:text-foreground group-data-[variant=default]/tabs-list:data-[state=active]:ring-2 group-data-[variant=default]/tabs-list:data-[state=active]:ring-inset group-data-[variant=default]/tabs-list:data-[state=active]:ring-[var(--surface-200)]",
        "after:bg-white after:absolute after:opacity-0 after:transition-opacity group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:bottom-[-5px] group-data-[orientation=horizontal]/tabs:after:h-[2px] group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:-right-1 group-data-[orientation=vertical]/tabs:after:w-[2px] group-data-[variant=line]/tabs-list:data-[state=active]:after:opacity-100",
        className
      )}
      {...props}
    />
  )
}

/** Content panel displayed when its corresponding tab trigger is active. */
function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
