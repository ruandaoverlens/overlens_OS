"use client"

import * as React from "react"
import { SmCloseLineIcon } from "@/components/icons"
import { Dialog as DialogPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

/** Modal dialog that overlays content and requires user interaction. */
function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

/** Button or element that opens the dialog when clicked. */
function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

/** Portal that renders dialog content outside the DOM hierarchy. */
function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

/** Button that closes the dialog. */
function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

/** Semi-transparent backdrop behind the dialog content. */
function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fill-mode-both fixed inset-0 z-50 bg-scrim-strong backdrop-blur-sm",
        className
      )}
      {...props}
    />
  )
}

/** Centered dialog panel with overlay, close button, and animated transitions. */
function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
}) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "bg-surface-950 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fill-mode-both fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] max-h-[calc(100svh-2rem)] overflow-y-auto scrollbar-thin -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl px-4 pt-6 pb-5 shadow-popover duration-200 outline-none sm:max-w-lg",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close asChild>
            <Button
              data-slot="dialog-close"
              variant="ghost"
              size="icon-sm"
              aria-label="Fechar"
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground data-[state=open]:bg-accent"
            >
              <SmCloseLineIcon className="size-6" />
            </Button>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

/** Container for the dialog title and description. */
function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-3 text-left", className)}
      {...props}
    />
  )
}

/** Footer area for dialog action buttons. Optionally includes a close button. */
function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-start",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <Button variant="outline">Fechar</Button>
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

/** Accessible title for the dialog. */
function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-medium pl-1", className)}
      {...props}
    />
  )
}

/** Accessible description text below the dialog title. */
function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm pl-1", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
