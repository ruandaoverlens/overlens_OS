"use client"

import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { MdSearchLineIcon, MdArrowForwardLineIcon } from "@/components/icons"

import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Drawer as DrawerPrimitive } from "vaul"

/**
 * Internal search command with pill shape, animated results list, and submit button.
 * Always used inside `CommandDialog` - not meant to be rendered standalone.
 */
function Command({
  className,
  children,
  suggestions,
  placeholder,
  ...props
}: React.ComponentProps<typeof CommandPrimitive> & {
  placeholder?: string
  suggestions?: React.ReactNode
}) {
  const [query, setQuery] = React.useState("")
  const hasQuery = query.length > 0
  const showList = hasQuery || !!suggestions
  const inputRef = React.useRef<HTMLDivElement>(null)
  const [radius, setRadius] = React.useState(28)

  React.useLayoutEffect(() => {
    if (!inputRef.current) return
    setRadius(inputRef.current.offsetHeight / 2)
    const observer = new ResizeObserver(() => {
      if (inputRef.current) {
        setRadius(inputRef.current.offsetHeight / 2)
      }
    })
    observer.observe(inputRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <CommandPrimitive
      data-slot="command"
      style={{ borderRadius: `${radius}px` }}
      className={cn(
        "bg-[var(--surface-950)] border border-[var(--surface-800)] flex w-full flex-col overflow-hidden text-popover-foreground transition-all max-sm:h-full max-sm:!rounded-none sm:mx-auto sm:min-w-[464px]",
        className
      )}
      shouldFilter
      {...props}
    >
      <CommandInput
        ref={inputRef}
        value={query}
        onValueChange={setQuery}
        placeholder={placeholder}
        hasQuery={hasQuery}
      />
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out max-sm:flex-1",
          showList ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden max-sm:h-full">
          <CommandList className="max-h-64 max-sm:max-h-none max-sm:h-full overflow-y-auto scroll-py-1 px-1 pb-4 [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-thumb]:border-[4px] [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-thumb]:bg-clip-content [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-track]:mt-1 [&::-webkit-scrollbar-track]:mb-1">
            {!hasQuery && suggestions}
            {hasQuery && children}
            {hasQuery && (
              <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
            )}
          </CommandList>
        </div>
      </div>
    </CommandPrimitive>
  )
}

/**
 * Command palette - renders inside a Drawer on mobile, Dialog on desktop.
 * This is the primary entry point - all Command usage goes through this component.
 */
function CommandDialog({
  title = "Buscar",
  description = "Buscar páginas e comandos...",
  children,
  className,
  showCloseButton = true,
  placeholder,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string
  description?: string
  className?: string
  showCloseButton?: boolean
  placeholder?: string
}) {
  const isMobile = useIsMobile()

  const commandContent = (
    <Command
      placeholder={placeholder}
      className={cn(
        "min-w-0 rounded-none border-0 [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5",
        !isMobile && "sm:min-w-[464px] sm:rounded-2xl sm:border sm:border-[var(--surface-800)]"
      )}
    >
      {children}
    </Command>
  )

  if (isMobile) {
    return (
      <DrawerPrimitive.Root open={props.open} onOpenChange={props.onOpenChange}>
        <DrawerPrimitive.Portal>
          <DrawerPrimitive.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
          <DrawerPrimitive.Content className="group/drawer-content bg-[var(--surface-950)] text-card-foreground fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col rounded-t-xl pb-6 shadow-none dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
            <div className="bg-[var(--surface-700)] mx-auto mt-4 mb-5 h-0.5 w-[100px] shrink-0 rounded-full" />
            <DrawerPrimitive.Title className="sr-only">{title}</DrawerPrimitive.Title>
            <DrawerPrimitive.Description className="sr-only">{description}</DrawerPrimitive.Description>
            {commandContent}
          </DrawerPrimitive.Content>
        </DrawerPrimitive.Portal>
      </DrawerPrimitive.Root>
    )
  }

  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent
        className={cn(
          "overflow-hidden gap-0 p-0",
          className
        )}
        showCloseButton={showCloseButton}
      >
        {commandContent}
      </DialogContent>
    </Dialog>
  )
}

/** Search input field with icon and submit button. */
const CommandInput = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof CommandPrimitive.Input> & {
    placeholder?: string
    hasQuery?: boolean
  }
>(function CommandInput(
  {
    className,
    value,
    onValueChange,
    placeholder = "Buscar...",
    hasQuery = false,
    ...props
  },
  ref
) {
  return (
    <div
      ref={ref}
      data-slot="command-input-wrapper"
      className="flex items-center gap-3 py-2 pl-4 pr-2"
    >
      <MdSearchLineIcon className="size-6 shrink-0 text-muted-foreground" />
      <CommandPrimitive.Input
        data-slot="command-input"
        value={value}
        onValueChange={onValueChange}
        placeholder={placeholder}
        className={cn(
          "placeholder:text-[var(--surface-600)] flex h-10 w-full bg-transparent py-3 text-base font-body outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
      <Button
        type="button"
        size="icon"
        disabled={!hasQuery}
        className={cn(
          hasQuery && "hover:bg-white hover:text-background"
        )}
        tabIndex={-1}
      >
        <MdArrowForwardLineIcon />
      </Button>
    </div>
  )
})

/** Scrollable list container for command items and groups. */
function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(
        "scroll-py-1 overflow-hidden",
        className
      )}
      {...props}
    />
  )
}

/** Empty state displayed when no command items match the search query. */
function CommandEmpty({
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className="py-6 text-center text-sm text-[var(--surface-500)]"
      {...props}
    />
  )
}

/** Named group of related command items with a heading. */
function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "text-foreground [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:font-heading [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide overflow-hidden p-1 pt-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs",
        className
      )}
      {...props}
    />
  )
}

/** Visual divider between command groups. */
function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn("bg-border -mx-1 my-2 h-px", className)}
      {...props}
    />
  )
}

/** Selectable item within the command palette. */
function CommandItem({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "data-[selected=true]:bg-[var(--surface-900)] data-[selected=true]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-6",
        className
      )}
      {...props}
    />
  )
}

/** Keyboard shortcut hint displayed alongside a command item. */
function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs font-mono uppercase tracking-widest hidden sm:inline",
        className
      )}
      {...props}
    />
  )
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}
