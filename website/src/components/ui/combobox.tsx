// @ts-nocheck
"use client"

import * as React from "react"
import { Combobox as ComboboxPrimitive } from "@base-ui/react"
import { SmCheckLineIcon, SmArrowForwardIosLineIcon, SmCloseLineIcon } from "@/components/icons"

import { cn } from "@/lib/utils"
import { menuGroupLabelClasses } from "@/components/ui/menu-recipes"
import { Tag } from "@/components/ui/tag"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"

const ComboboxAnchorContext = React.createContext<HTMLElement | null>(null)
const ComboboxAnchorSetContext = React.createContext<React.Dispatch<React.SetStateAction<HTMLElement | null>> | null>(null)

/** Autocomplete combobox root with search filtering, single/multi-select, and chip input support. */
function Combobox(props: ComboboxPrimitive.Root.Props) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null)

  return (
    <ComboboxAnchorSetContext.Provider value={setAnchorEl}>
      <ComboboxAnchorContext.Provider value={anchorEl}>
        <ComboboxPrimitive.Root {...props} />
      </ComboboxAnchorContext.Provider>
    </ComboboxAnchorSetContext.Provider>
  )
}

/** Displays the current combobox selection as text. */
function ComboboxValue({ ...props }: ComboboxPrimitive.Value.Props) {
  return <ComboboxPrimitive.Value data-slot="combobox-value" {...props} />
}

/** Button that toggles the combobox dropdown open/closed. */
function ComboboxTrigger({
  className,
  children,
  ...props
}: ComboboxPrimitive.Trigger.Props) {
  return (
    <ComboboxPrimitive.Trigger
      data-slot="combobox-trigger"
      aria-label="Abrir opções"
      className={cn(
        "flex cursor-default items-center justify-center p-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-foreground",
        className
      )}
      {...props}
    >
      {children}
      <SmArrowForwardIosLineIcon
        data-slot="combobox-trigger-icon"
        className="text-muted-foreground pointer-events-none mr-1 size-6 rotate-90"
      />
    </ComboboxPrimitive.Trigger>
  )
}

/** Button that clears the current combobox selection. */
function ComboboxClear({ className, ...props }: ComboboxPrimitive.Clear.Props) {
  return (
    <ComboboxPrimitive.Clear
      data-slot="combobox-clear"
      aria-label="Limpar seleção"
      className={cn(
        "relative inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-foreground after:absolute after:-inset-1 after:content-[''] mr-1",
        className
      )}
      {...props}
    >
      <SmCloseLineIcon className="pointer-events-none" />
    </ComboboxPrimitive.Clear>
  )
}

/** Search input field for filtering combobox options. Wraps in an InputGroup with optional trigger/clear buttons. */
function ComboboxInput({
  className,
  children,
  disabled = false,
  showTrigger = true,
  showClear = false,
  ...props
}: ComboboxPrimitive.Input.Props & {
  showTrigger?: boolean
  showClear?: boolean
}) {
  const setAnchorEl = React.useContext(ComboboxAnchorSetContext)

  return (
    <InputGroup ref={setAnchorEl} className={cn("w-full", className)}>
      <ComboboxPrimitive.Input
        render={<InputGroupInput disabled={disabled} aria-label={props.placeholder ?? "Buscar"} />}
        {...props}
      />
      <InputGroupAddon align="inline-end">
        {showTrigger && (
          <ComboboxTrigger
            className="group-has-data-[slot=combobox-clear]/input-group:hidden"
            disabled={disabled}
          />
        )}
        {showClear && <ComboboxClear disabled={disabled} />}
      </InputGroupAddon>
      {children}
    </InputGroup>
  )
}

/** Floating dropdown panel containing the combobox option list. */
function ComboboxContent({
  className,
  side = "bottom",
  sideOffset = 6,
  align = "start",
  alignOffset = 0,
  anchor,
  ...props
}: ComboboxPrimitive.Popup.Props &
  Pick<
    ComboboxPrimitive.Positioner.Props,
    "side" | "align" | "sideOffset" | "alignOffset" | "anchor"
  >) {
  const inputAnchorEl = React.useContext(ComboboxAnchorContext)
  const resolvedAnchor = anchor ?? inputAnchorEl

  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        anchor={resolvedAnchor}
        className="isolate z-50"
      >
        <ComboboxPrimitive.Popup
          data-slot="combobox-content"
          data-chips={!!anchor}
          className={cn(
            "bg-popover text-popover-foreground data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ring-foreground/10 *:data-[slot=input-group]:bg-input/30 *:data-[slot=input-group]:border-input/30 group/combobox-content relative max-h-96 w-(--anchor-width) max-w-(--available-width) min-w-(--anchor-width) origin-(--transform-origin) overflow-clip rounded-xl p-1.5 shadow-popover duration-100 data-[chips=true]:min-w-(--anchor-width) *:data-[slot=input-group]:m-1 *:data-[slot=input-group]:mb-0 *:data-[slot=input-group]:h-8 *:data-[slot=input-group]:shadow-none",
            className
          )}
          {...props}
        />
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  )
}

/** Scrollable list container for combobox options. */
function ComboboxList({ className, children, ...props }: ComboboxPrimitive.List.Props) {
  return (
    <ComboboxPrimitive.List
      data-slot="combobox-list"
      className={cn(
        "max-h-60 scroll-py-1 overflow-y-auto overflow-x-hidden data-empty:p-0",
        "scrollbar-thin",
        className
      )}
      {...props}
    >
      {children}
    </ComboboxPrimitive.List>
  )
}

/** Individual selectable option within the combobox dropdown. */
function ComboboxItem({
  className,
  children,
  ...props
}: ComboboxPrimitive.Item.Props) {
  return (
    <ComboboxPrimitive.Item
      data-slot="combobox-item"
      className={cn(
        "hover:bg-accent hover:text-accent-foreground data-highlighted:bg-accent data-highlighted:text-accent-foreground data-highlighted:ring-2 data-highlighted:ring-inset data-highlighted:ring-ring min-h-10 relative flex w-full cursor-default items-center gap-2 rounded-md py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-6",
        className
      )}
      {...props}
    >
      {children}
      <ComboboxPrimitive.ItemIndicator
        data-slot="combobox-item-indicator"
        render={
          <span className="pointer-events-none absolute right-2 flex size-6 items-center justify-center" />
        }
      >
        <SmCheckLineIcon className="pointer-events-none size-5" />
      </ComboboxPrimitive.ItemIndicator>
    </ComboboxPrimitive.Item>
  )
}

/** Groups related combobox options under a shared label. */
function ComboboxGroup({ className, ...props }: ComboboxPrimitive.Group.Props) {
  return (
    <ComboboxPrimitive.Group
      data-slot="combobox-group"
      className={cn(className)}
      {...props}
    />
  )
}

/** Label for a group of combobox options. */
function ComboboxLabel({
  className,
  ...props
}: ComboboxPrimitive.GroupLabel.Props) {
  return (
    <ComboboxPrimitive.GroupLabel
      data-slot="combobox-label"
      className={cn(
        menuGroupLabelClasses,
        "px-2 py-1.5 pointer-coarse:px-3 pointer-coarse:py-2 pointer-coarse:text-sm",
        className
      )}
      {...props}
    />
  )
}

/** Virtualized collection for large datasets in the combobox. */
function ComboboxCollection({ ...props }: ComboboxPrimitive.Collection.Props) {
  return (
    <ComboboxPrimitive.Collection data-slot="combobox-collection" {...props} />
  )
}

/** Placeholder shown when no combobox options match the search query. */
function ComboboxEmpty({ className, ...props }: ComboboxPrimitive.Empty.Props) {
  return (
    <ComboboxPrimitive.Empty
      data-slot="combobox-empty"
      className={cn(
        "text-muted-foreground hidden w-full justify-center py-2 text-center text-sm group-data-empty/combobox-content:flex",
        className
      )}
      {...props}
    />
  )
}

/** Visual divider between combobox option groups. */
function ComboboxSeparator({
  className,
  ...props
}: ComboboxPrimitive.Separator.Props) {
  return (
    <ComboboxPrimitive.Separator
      data-slot="combobox-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

/** Multi-select chip container that acts as an anchor for the combobox dropdown. */
function ComboboxChips({
  className,
  ...props
}: React.ComponentPropsWithRef<typeof ComboboxPrimitive.Chips> &
  ComboboxPrimitive.Chips.Props) {
  return (
    <ComboboxPrimitive.Chips
      data-slot="combobox-chips"
      className={cn(
        "bg-input/30 border border-border focus-within:ring-ring has-aria-invalid:ring-destructive/40 has-aria-invalid:border-destructive/50 flex min-h-10 w-full flex-wrap items-center gap-3 rounded-lg bg-clip-padding px-2.5 py-1.5 text-sm shadow-none transition-all focus-within:ring-2 has-aria-invalid:ring-2 has-data-[slot=combobox-chip]:px-1.5",
        className
      )}
      {...props}
    />
  )
}

/** Individual removable chip representing a selected combobox value. Styled like the Tag component. */
function ComboboxChip({
  className,
  children,
  showRemove = true,
  ...props
}: ComboboxPrimitive.Chip.Props & {
  showRemove?: boolean
}) {
  return (
    <ComboboxPrimitive.Chip
      data-slot="combobox-chip"
      className={cn(
        "inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-sm font-mono uppercase overflow-visible transition-all leading-4 outline-none focus-visible:ring-2 focus-visible:ring-foreground bg-surface-200/10 text-surface-300 hover:bg-white/20 active:bg-white/30 px-2 py-0.5 text-xs font-normal has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      {showRemove && (
        <ComboboxPrimitive.ChipRemove
          className="inline-flex items-center justify-center size-4 shrink-0 rounded-sm opacity-70 hover:opacity-100 transition-opacity outline-none focus-visible:ring-2 focus-visible:ring-foreground relative z-0 hover:z-10 focus-visible:z-10 after:absolute after:-inset-1.5 after:content-['']"
          data-slot="combobox-chip-remove"
        >
          <SmCloseLineIcon className="size-4 pointer-events-none" />
        </ComboboxPrimitive.ChipRemove>
      )}
    </ComboboxPrimitive.Chip>
  )
}

/** Inline text input rendered inside the ComboboxChips container for search-as-you-type. */
function ComboboxChipsInput({
  className,
  children,
  ...props
}: ComboboxPrimitive.Input.Props) {
  return (
    <ComboboxPrimitive.Input
      data-slot="combobox-chip-input"
      className={cn("min-w-16 flex-1 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-foreground/70 [&:not(:only-child)]:placeholder:text-transparent", className)}
      {...props}
    />
  )
}

/** Creates a ref to use as a custom anchor element for the combobox dropdown positioning. */
function useComboboxAnchor() {
  return React.useRef<HTMLDivElement | null>(null)
}

export {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxCollection,
  ComboboxEmpty,
  ComboboxSeparator,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxTrigger,
  ComboboxValue,
  useComboboxAnchor,
}
