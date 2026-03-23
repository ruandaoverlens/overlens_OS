"use client"

import * as React from "react"
import { SmCheckLineIcon, SmArrowDownIosLineIcon, SmArrowDownwardLineIcon, SmArrowUpwardLineIcon } from "@/components/icons"
import { Select as SelectPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

/** Root component for a custom select dropdown, built on Radix Select primitive. */
function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

/** Groups related select options together. */
function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

/** Displays the currently selected value inside the trigger. */
function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

/** Button that toggles the select dropdown. Supports multiple size variants. */
function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "lg" | "md" | "default" | "sm" | "xs"
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:ring-2 aria-invalid:ring-destructive aria-invalid:data-[state=open]:ring-0 aria-invalid:data-[state=open]:ring-transparent bg-accent/50 dark:bg-input/30 border-2 border-transparent hover:bg-accent dark:hover:bg-input/50 focus-visible:border-input focus-visible:bg-transparent dark:focus-visible:bg-transparent data-[state=open]:border-input data-[state=open]:bg-transparent dark:data-[state=open]:bg-transparent flex w-full items-center justify-between gap-2 py-0 font-medium font-body whitespace-nowrap shadow-none transition-all outline-none ring-0 select-none disabled:cursor-not-allowed disabled:opacity-50 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-6",
        "data-[size=lg]:h-20 data-[size=lg]:rounded-[12px] data-[size=lg]:px-4 data-[size=lg]:text-base",
        "data-[size=md]:h-16 data-[size=md]:rounded-[12px] data-[size=md]:px-4 data-[size=md]:text-base",
        "data-[size=default]:h-12 data-[size=default]:rounded-[12px] data-[size=default]:px-4 data-[size=default]:text-base",
        "data-[size=sm]:h-10 data-[size=sm]:rounded-[8px] data-[size=sm]:px-4 data-[size=sm]:text-sm",
        "data-[size=xs]:h-8 data-[size=xs]:rounded-[6px] data-[size=xs]:px-4 data-[size=xs]:text-sm",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <SmArrowDownIosLineIcon
          className={cn(
            "opacity-50",
            "size-6"
          )}
        />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

/** Dropdown panel that contains select options. */
function SelectContent({
  className,
  children,
  position = "popper",
  side = "bottom",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left"
  sideOffset?: number
}) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-xl shadow-none dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        side={side}
        sideOffset={sideOffset}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

/** Label for a group of select options. */
function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("text-muted-foreground font-heading uppercase tracking-wide px-2 py-1.5 text-xs", className)}
      {...props}
    />
  )
}

/** Individual selectable option within the dropdown. */
function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-lg py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-6 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      )}
      {...props}
    >
      <span
        data-slot="select-item-indicator"
        className="absolute right-2 flex size-5 items-center justify-center"
      >
        <SelectPrimitive.ItemIndicator>
          <SmCheckLineIcon className="size-5" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

/** Visual divider between select option groups. */
function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

/** Scroll indicator at the top of the select dropdown when content overflows. */
function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <SmArrowUpwardLineIcon className="size-6" />
    </SelectPrimitive.ScrollUpButton>
  )
}

/** Scroll indicator at the bottom of the select dropdown when content overflows. */
function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <SmArrowDownwardLineIcon className="size-6" />
    </SelectPrimitive.ScrollDownButton>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
