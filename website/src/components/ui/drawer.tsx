"use client"

import * as React from "react"
import { Drawer as DrawerPrimitive } from "vaul"
import { cn } from "@/lib/utils"

/** Swipeable drawer panel powered by Vaul, slides from any direction. */
function Drawer({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) {
  return <DrawerPrimitive.Root data-slot="drawer" {...props} />
}

/** Element that opens the drawer when activated. */
function DrawerTrigger({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />
}

/** Portal that renders drawer content outside the DOM hierarchy. */
function DrawerPortal({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />
}

/** Button that closes the drawer. */
function DrawerClose({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />
}

/** Semi-transparent backdrop behind the drawer. */
function DrawerOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  return (
    <DrawerPrimitive.Overlay
      data-slot="drawer-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fill-mode-both fixed inset-0 z-50 bg-black/70 backdrop-blur-sm",
        className
      )}
      {...props}
    />
  )
}

/** Drawer panel with direction-aware borders and a drag handle for bottom drawers. */
function DrawerContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content>) {
  return (
    <DrawerPortal data-slot="drawer-portal">
      <DrawerOverlay />
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        className={cn(
          "group/drawer-content bg-background/70 backdrop-blur-xl text-card-foreground fixed z-50 flex h-auto flex-col pb-6 shadow-none dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]",
          "data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-xl",
          "data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:rounded-t-xl",
          "data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-sm",
          "data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-full data-[vaul-drawer-direction=left]:sm:max-w-sm",
          className
        )}
        {...props}
      >
        <div className="bg-[var(--surface-700)] mx-auto mt-4 mb-5 hidden h-0.5 w-[100px] shrink-0 rounded-full group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />
        {children}
        <div className="bg-[var(--surface-700)] mx-auto mb-4 hidden h-0.5 w-[100px] shrink-0 rounded-full group-data-[vaul-drawer-direction=top]/drawer-content:block" />
      </DrawerPrimitive.Content>
    </DrawerPortal>
  )
}

/** Container for the drawer title and description. */
function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn(
        "flex flex-col gap-0.5 p-4 group-data-[vaul-drawer-direction=bottom]/drawer-content:text-center md:gap-1.5 md:text-left",
        className
      )}
      {...props}
    />
  )
}

/** Footer area for drawer action buttons. */
function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn("mt-4 flex flex-row gap-2 p-4 group-data-[vaul-drawer-direction=top]/drawer-content:justify-center", className)}
      {...props}
    />
  )
}

/** Accessible title for the drawer. */
function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  )
}

/** Accessible description text for the drawer. */
function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

/** Container for a group of menu items inside the drawer. */
function DrawerMenuGroup({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-menu-group"
      className={cn("flex flex-col gap-1 px-2", className)}
      {...props}
    />
  )
}

/** Non-interactive label for a group of drawer menu items. */
function DrawerMenuLabel({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="drawer-menu-label"
      className={cn(
        "text-muted-foreground font-heading uppercase tracking-wide px-5 py-2 text-xs",
        className
      )}
      {...props}
    />
  )
}

/** Selectable menu item inside the drawer. Follows sidebar menu-button styling. Supports destructive variant. */
function DrawerMenuItem({
  className,
  isActive = false,
  variant = "default",
  ...props
}: React.ComponentProps<"button"> & {
  isActive?: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <button
      data-slot="drawer-menu-item"
      data-variant={variant}
      data-active={isActive}
      type="button"
      className={cn(
        "flex w-full items-center gap-2 rounded-md p-2 text-left text-sm font-normal text-[var(--surface-500)] outline-hidden transition-colors",
        "hover:bg-[var(--surface-900)] hover:text-foreground focus-visible:bg-[var(--surface-900)] focus-visible:text-foreground active:bg-[var(--surface-900)] active:text-foreground",
        "data-[active=true]:bg-[var(--surface-900)] data-[active=true]:font-medium data-[active=true]:text-foreground data-[active=true]:[&>svg]:opacity-100",
        "data-[variant=destructive]:text-destructive data-[variant=destructive]:hover:bg-accent data-[variant=destructive]:focus-visible:bg-accent",
        "[&>svg]:size-6 [&>svg]:shrink-0 [&>svg]:opacity-50 [&>svg]:pointer-events-none hover:[&>svg]:opacity-100",
        "[&>span:last-child]:truncate",
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

/** Visual divider between drawer menu item groups. */
function DrawerMenuSeparator({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-menu-separator"
      className={cn("bg-border my-1 h-px", className)}
      {...props}
    />
  )
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  DrawerMenuGroup,
  DrawerMenuLabel,
  DrawerMenuItem,
  DrawerMenuSeparator,
}
