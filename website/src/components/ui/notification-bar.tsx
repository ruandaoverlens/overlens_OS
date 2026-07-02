"use client"

import * as React from "react"
import { Popover as PopoverPrimitive } from "radix-ui"
import { SmHistoryLineIcon, SmCheckLineIcon, SmArrowBackLineIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import { useIsMobile } from "@/hooks/use-mobile"

import { cn } from "@/lib/utils"

const NotificationBarContext = React.createContext<{
  open: boolean
  onOpenChange: (open: boolean) => void
  allRead: boolean
  markAllAsRead: () => void
  cleared: boolean
  clearAll: () => void
  unreadCount: number
  registerUnread: (id: string) => void
  markAsRead: (id: string) => void
}>({ open: false, onOpenChange: () => {}, allRead: false, markAllAsRead: () => {}, cleared: false, clearAll: () => {}, unreadCount: 0, registerUnread: () => {}, markAsRead: () => {} })

/** Hook that provides notification bar open state and toggle controls. */
function useNotificationBar() {
  return React.useContext(NotificationBarContext)
}

/** Popover dropdown for displaying notifications, anchored to the trigger element. */
function NotificationBar({
  children,
  defaultOpen,
  open: openProp,
  onOpenChange: onOpenChangeProp,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  const [open, setOpen] = React.useState(defaultOpen ?? false)
  const controlled = openProp !== undefined
  const isOpen = controlled ? openProp : open
  const onOpenChange = controlled ? onOpenChangeProp! : setOpen

  const [unreadIds, setUnreadIds] = React.useState<Set<string>>(new Set())
  const [allRead, setAllRead] = React.useState(false)
  const [cleared, setCleared] = React.useState(false)

  const registerUnread = React.useCallback((id: string) => {
    setUnreadIds((prev) => new Set(prev).add(id))
  }, [])

  const markAsRead = React.useCallback((id: string) => {
    setUnreadIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  const markAllAsRead = React.useCallback(() => {
    setAllRead(true)
    setUnreadIds(new Set())
  }, [])

  const clearAll = React.useCallback(() => {
    setCleared(true)
    setAllRead(true)
    setUnreadIds(new Set())
  }, [])

  return (
    <NotificationBarContext.Provider value={{ open: isOpen, onOpenChange, allRead, markAllAsRead, cleared, clearAll, unreadCount: unreadIds.size, registerUnread, markAsRead }}>
      <PopoverPrimitive.Root
        data-slot="notification-bar"
        open={isOpen}
        onOpenChange={onOpenChange}
        {...props}
      >
        {children}
      </PopoverPrimitive.Root>
    </NotificationBarContext.Provider>
  )
}

/** Element that opens the notification bar when activated. */
function NotificationBarTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return (
    <PopoverPrimitive.Trigger
      data-slot="notification-bar-trigger"
      asChild
      {...props}
    />
  )
}

/** Popover content panel for the notification bar. Full-screen overlay on mobile. */
function NotificationBarContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  const isMobile = useIsMobile()
  const { open } = React.useContext(NotificationBarContext)

  if (isMobile) {
    if (!open) return null

    return (
      <div
        data-slot="notification-bar-content"
        data-mobile=""
        className={cn(
          "fixed inset-0 z-50 flex flex-col bg-[var(--surface-950)] text-card-foreground animate-in slide-in-from-right-full duration-200 fill-mode-both",
          className
        )}
      >
        {children}
      </div>
    )
  }

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="notification-bar-content"
        align="center"
        sideOffset={4}
        collisionPadding={{ right: 12 }}
        className={cn(
          "bg-[var(--surface-950)] text-card-foreground w-80 max-w-[calc(100vw-1rem)] h-[min(32rem,calc(100vh-4rem))] rounded-xl shadow-none dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)] outline-hidden flex flex-col p-0 z-50",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 fill-mode-both",
          className
        )}
        {...props}
      >
        {children}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  )
}

/** Header area with title and resolve-all button for the notification bar. */
function NotificationBarHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const isMobile = useIsMobile()

  return (
    <div
      data-slot="notification-bar-header"
      className={cn(
        "flex shrink-0 items-center justify-between pr-2 pt-4",
        isMobile ? "pl-2 pb-2" : "pl-4 pb-4",
        className
      )}
      {...props}
    />
  )
}

/** Title text for the notification bar header. On mobile, renders with a back arrow. */
function NotificationBarTitle({
  className,
  children,
  ...props
}: React.ComponentProps<"h2">) {
  const isMobile = useIsMobile()
  const { onOpenChange } = React.useContext(NotificationBarContext)

  return (
    <h2
      data-slot="notification-bar-title"
      className={cn(
        "text-base font-semibold text-foreground",
        isMobile && "flex items-center gap-2",
        className
      )}
      {...props}
    >
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          aria-label="Voltar"
          onClick={() => onOpenChange(false)}
        >
          <SmArrowBackLineIcon className="size-5" />
        </Button>
      )}
      {children}
    </h2>
  )
}

/** Button that marks all notifications as read. */
function NotificationBarResolveAll({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const [tooltipOpen, setTooltipOpen] = React.useState(false)
  const { unreadCount, markAllAsRead } = React.useContext(NotificationBarContext)

  return (
    <TooltipProvider>
      <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
        <TooltipTrigger asChild>
          <div className="relative">
            <Button
              data-slot="notification-bar-resolve-all"
              variant="ghost"
              size="icon"
              aria-label="Marcar como lidas"
              className={cn(className)}
              onPointerEnter={() => setTooltipOpen(true)}
              onPointerLeave={() => setTooltipOpen(false)}
              onFocus={(e) => e.preventDefault()}
              onClick={markAllAsRead}
              {...props}
            >
              <SmHistoryLineIcon className="size-5" />
            </Button>
            {unreadCount > 0 && (
              <span className="pointer-events-none absolute top-1 right-1 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--brand-atmos)] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--brand-atmos)]" />
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>Marcar como lidas</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/** Button that clears all notifications. */
function NotificationBarClearAll({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const [tooltipOpen, setTooltipOpen] = React.useState(false)
  const { clearAll } = React.useContext(NotificationBarContext)

  return (
    <TooltipProvider>
      <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
        <TooltipTrigger asChild>
          <Button
            data-slot="notification-bar-clear-all"
            variant="ghost"
            size="icon"
            aria-label="Concluir todas"
            className={cn(className)}
            onPointerEnter={() => setTooltipOpen(true)}
            onPointerLeave={() => setTooltipOpen(false)}
            onFocus={(e) => e.preventDefault()}
            onClick={clearAll}
            {...props}
          >
            <SmCheckLineIcon className="size-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Concluir todas</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/** Scrollable body area containing notification cards. Hidden when all notifications are cleared. */
function NotificationBarBody({
  className,
  children,
  emptyState,
  ...props
}: React.ComponentProps<"div"> & { emptyState?: React.ReactNode }) {
  const isMobile = useIsMobile()
  const { cleared } = React.useContext(NotificationBarContext)

  return (
    <div
      data-slot="notification-bar-body"
      className={cn(
        "flex flex-col gap-2.5 px-2 pt-2 pb-2",
        !isMobile && "flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-thumb]:border-[4px] [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-thumb]:bg-clip-content [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-track]:mt-1 [&::-webkit-scrollbar-track]:mb-1",
        cleared && "items-center justify-center pb-10",
        className
      )}
      {...props}
    >
      {cleared ? emptyState : children}
    </div>
  )
}

/** Tabbed navigation for notification categories (e.g. Inbox / General). */
function NotificationBarTabs({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Tabs>) {
  const isMobile = useIsMobile()
  const { unreadCount } = React.useContext(NotificationBarContext)

  return (
    <Tabs
      data-slot="notification-bar-tabs"
      defaultValue="general"
      className={cn(
        "flex flex-col flex-1 min-h-0",
        isMobile && "overflow-y-auto",
        className
      )}
      {...props}
    >
      <TabsList className={cn("w-full px-4 pt-1 pb-0", isMobile && "shrink-0 w-auto max-w-xs self-start")}>
        <TabsTrigger value="general">Geral</TabsTrigger>
        <TabsTrigger value="inbox" className="gap-1.5">
          Amigos
          {unreadCount > 0 && (
            <span className="inline-flex items-center justify-center rounded-full bg-[var(--brand-atmos)] px-1.5 text-[10px] font-semibold leading-4 text-black">
              {unreadCount}
            </span>
          )}
        </TabsTrigger>
      </TabsList>
      <div className={cn("grid grid-cols-[minmax(0,1fr)]", !isMobile && "flex-1 min-h-0")}>
        {children}
      </div>
    </Tabs>
  )
}

/** Footer with "Ver tudo" link. Hidden on mobile (full-screen already shows all). */
function NotificationBarFooter({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const isMobile = useIsMobile()

  if (isMobile) return null

  return (
    <div
      data-slot="notification-bar-footer"
      className={cn(
        "flex shrink-0 items-center justify-center border-t border-white/5 px-2 py-2",
        className
      )}
      {...props}
    >
      {children ?? (
        <Button variant="ghost" size="sm" className="w-full text-sm text-muted-foreground">
          Ver tudo
        </Button>
      )}
    </div>
  )
}

/** Content panel for a notification bar tab. */
function NotificationBarTabContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsContent>) {
  return (
    <TabsContent
      data-slot="notification-bar-tab-content"
      forceMount
      className={cn(
        "flex flex-col min-h-0 [grid-area:1/1] [transition:none] data-[state=active]:z-10 data-[state=inactive]:z-0 data-[state=inactive]:opacity-0 data-[state=inactive]:pointer-events-none",
        className
      )}
      {...props}
    />
  )
}

export {
  NotificationBar,
  NotificationBarTrigger,
  NotificationBarContent,
  NotificationBarHeader,
  NotificationBarTitle,
  NotificationBarFooter,
  NotificationBarResolveAll,
  NotificationBarClearAll,
  NotificationBarBody,
  NotificationBarTabs,
  NotificationBarTabContent,
  useNotificationBar,
}
