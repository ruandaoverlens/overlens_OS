"use client"

import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { MdSearchLineIcon, MdArrowForwardLineIcon } from "@/components/icons"

import { cn } from "@/lib/utils"
import { cmdkGroupLabelClasses, menuShortcutClasses } from "@/components/ui/menu-recipes"

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

/** Remove acentos e caixa para que "acao" encontre "Ação". */
function normalize(text: string) {
  return text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase()
}

/**
 * Filtro padrão do Command: insensível a acentos e a caixa, e por tokens —
 * cada palavra da busca precisa aparecer no valor, em qualquer ordem
 * ("tom voz" e "verbal tom" encontram "Tom de Voz"). O score 1 (trecho contíguo)
 * vs. 0.5 (tokens soltos) faz o cmdk ranquear as correspondências exatas acima.
 */
function commandFilter(value: string, search: string) {
  const haystack = normalize(value)
  const needle = normalize(search)
  if (!needle.trim()) return 1
  if (haystack.includes(needle)) return 1
  const tokens = needle.split(/\s+/).filter(Boolean)
  return tokens.every((token) => haystack.includes(token)) ? 0.5 : 0
}

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
        "bg-surface-950 border border-surface-800 flex w-full flex-col overflow-hidden text-popover-foreground transition-all max-sm:h-full max-sm:!rounded-none sm:mx-auto sm:min-w-[min(464px,calc(100vw-2rem))]",
        className
      )}
      shouldFilter
      filter={commandFilter}
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
          <CommandList className="max-h-64 max-sm:max-h-none max-sm:h-full overflow-y-auto scroll-py-1 px-1 pb-4 scrollbar-thin">
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
  description = "Buscar páginas e comandos…",
  children,
  className,
  showCloseButton = true,
  placeholder,
  suggestions,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string
  description?: string
  className?: string
  showCloseButton?: boolean
  placeholder?: string
  suggestions?: React.ReactNode
}) {
  const isMobile = useIsMobile()

  const commandContent = (
    <Command
      placeholder={placeholder}
      suggestions={suggestions}
      className={cn(
        "min-w-0 rounded-none border-0 [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5",
        !isMobile && "sm:min-w-[min(464px,calc(100vw-2rem))] sm:rounded-2xl sm:border sm:border-surface-800"
      )}
    >
      {children}
    </Command>
  )

  if (isMobile) {
    return (
      <DrawerPrimitive.Root open={props.open} onOpenChange={props.onOpenChange}>
        <DrawerPrimitive.Portal>
          <DrawerPrimitive.Overlay className="fixed inset-0 z-50 bg-scrim backdrop-blur-sm" />
          <DrawerPrimitive.Content className="group/drawer-content bg-surface-950 text-card-foreground fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col rounded-t-xl pb-6 shadow-popover">
            <div className="bg-surface-700 mx-auto mt-4 mb-5 h-0.5 w-25 shrink-0 rounded-full" />
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
      <DialogContent
        className={cn(
          "overflow-hidden gap-0 p-0",
          className
        )}
        showCloseButton={showCloseButton}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
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
    placeholder = "Buscar…",
    hasQuery = false,
    ...props
  },
  ref
) {
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Reenvia um Enter nativo para o input: o cmdk escuta o keydown na raiz e
  // aciona o item atualmente selecionado na lista.
  const submitSelected = React.useCallback(() => {
    const el = inputRef.current
    if (!el) return
    el.focus()
    el.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true })
    )
  }, [])

  return (
    <div
      ref={ref}
      data-slot="command-input-wrapper"
      className="flex items-center gap-3 py-2 pl-4 pr-2"
    >
      <MdSearchLineIcon className="size-6 shrink-0 text-muted-foreground" />
      <CommandPrimitive.Input
        ref={inputRef}
        data-slot="command-input"
        value={value}
        onValueChange={onValueChange}
        placeholder={placeholder}
        aria-label={placeholder ?? "Buscar"}
        className={cn(
          "placeholder:text-muted-foreground flex h-10 w-full rounded-field-sm bg-transparent py-3 text-base font-body outline-hidden focus-visible:ring-transparent disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
      <Button
        type="button"
        size="icon"
        aria-label="Abrir resultado"
        disabled={!hasQuery}
        onClick={submitSelected}
        className={cn(
          hasQuery && "hover:bg-white hover:text-background"
        )}
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
      className="py-6 text-center text-sm text-surface-500"
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
        cmdkGroupLabelClasses,
        "text-foreground overflow-hidden p-1 pt-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5",
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
        "data-[selected=true]:bg-surface-900 data-[selected=true]:text-accent-foreground min-h-10 [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-6",
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
        menuShortcutClasses,
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
