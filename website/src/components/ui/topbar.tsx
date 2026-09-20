import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"
import {
  NotificationBar,
  NotificationBarTrigger,
  useNotificationBar,
} from "@/components/ui/notification-bar"
import {
  SmAsteriskLineIcon,
  SmCrownLineIcon,
  SmCrownSolidIcon,
  SmNotificationLineIcon,
  SmNotificationSolidIcon,
  SmSearchLineIcon,
  MdAppsLineIcon,
  MdBoltSolidIcon,
} from "@/components/icons"

/** Full-width top navigation bar with breadcrumb on the left and actions on the right. */
function Topbar({ className, ...props }: React.ComponentProps<"header">) {
  return (
    <header
      data-slot="topbar"
      className={cn(
        "sticky top-0 z-30 flex h-12 w-full items-center justify-end pb-0.5",
        "bg-surface-black md:bg-background/70 md:backdrop-blur-xl md:justify-between md:pl-5",
        "md:shadow-[inset_3rem_0_2rem_-1rem_var(--surface-black)]",
        className
      )}
      {...props}
    />
  )
}

/** Absolutely centered area within the topbar (e.g., status notices). Hidden on mobile. */
function TopbarCenter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="topbar-center"
      className={cn(
        "pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center md:flex",
        className,
      )}
      {...props}
    />
  )
}

/** Left-aligned breadcrumb area within the topbar. */
function TopbarBreadcrumb({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="topbar-breadcrumb"
      className={cn("hidden items-center md:flex", className)}
      {...props}
    />
  )
}

/** Container for action buttons within the topbar. */
function TopbarActions({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="topbar-actions"
      className={cn("flex items-center gap-1 md:gap-0", className)}
      {...props}
    />
  )
}

/** Fractals counter button displaying a numeric value with an asterisk icon. */
function TopbarFractals({
  count,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  count: number
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          data-slot="topbar-fractals"
          aria-label={`Fractals: ${count.toLocaleString()}`}
          className={cn(
            "hidden h-9 cursor-pointer items-center rounded-full border-0 bg-transparent text-base font-mono text-muted-foreground tabular-nums outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-foreground md:inline-flex",
            className
          )}
          {...props}
        >
          <span className="pl-2.5">{count.toLocaleString()}</span>
          <SmAsteriskLineIcon className="ml-1 mr-1.5 size-5" aria-hidden="true" />
        </button>
      </TooltipTrigger>
      <TooltipContent>Fractals</TooltipContent>
    </Tooltip>
  )
}

/** Streak (Ofensiva) counter button displaying a numeric value with a bolt icon. */
function TopbarStreak({
  count,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  count: number
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          data-slot="topbar-streak"
          aria-label={`Ofensiva: ${count.toLocaleString()} ${count === 1 ? "dia" : "dias"}`}
          className={cn(
            "hidden h-9 cursor-pointer items-center rounded-full border-0 bg-transparent text-base font-mono text-muted-foreground tabular-nums outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-foreground md:inline-flex",
            className
          )}
          {...props}
        >
          <span className="pl-2.5">{count.toLocaleString()}</span>
          <MdBoltSolidIcon className="ml-1 mr-1.5 size-5" aria-hidden="true" />
        </button>
      </TooltipTrigger>
      <TooltipContent>Ofensiva</TooltipContent>
    </Tooltip>
  )
}

/** Internal badge that reads unread count from NotificationBar context. */
function TopbarNotificationsBadge() {
  const { unreadCount } = useNotificationBar()
  if (unreadCount <= 0) return null
  return (
    <span className="pointer-events-none absolute top-1 right-1 flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full motion-safe:animate-ping rounded-full bg-brand-atmos opacity-75" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-atmos" />
    </span>
  )
}

/** Internal button that swaps to solid icon when popover is open. */
function TopbarNotificationsButton({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { open } = useNotificationBar()

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          data-slot="topbar-notifications"
          variant="ghost"
          size="icon"
          className={cn(
            "group/notif text-muted-foreground",
            open && "bg-accent/50 text-foreground",
            className
          )}
          {...props}
        >
          <SmNotificationLineIcon className={cn("size-5.5 group-hover/notif:hidden", open && "hidden")} />
          <SmNotificationSolidIcon className={cn("hidden size-5.5 group-hover/notif:block", open && "block")} />
          <span className="sr-only">Notificações</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>Notificações</TooltipContent>
    </Tooltip>
  )
}

/**
 * Bell icon button that integrates NotificationBar.
 * Wraps the notification popover provider and trigger internally.
 * Pass NotificationBarContent as children to render the popover dropdown.
 *
 * ```tsx
 * <TopbarNotifications>
 *   <NotificationBarContent>
 *     <NotificationBarHeader>...</NotificationBarHeader>
 *     <NotificationBarTabs>
 *       <NotificationBarTabContent value="inbox">
 *         <NotificationBarBody>...</NotificationBarBody>
 *       </NotificationBarTabContent>
 *     </NotificationBarTabs>
 *   </NotificationBarContent>
 * </TopbarNotifications>
 * ```
 */
function TopbarNotifications({
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "children"> & {
  children?: React.ReactNode
}) {
  return (
    <NotificationBar>
      <div className="relative">
        <NotificationBarTrigger>
          <TopbarNotificationsButton className={className} {...props} />
        </NotificationBarTrigger>
        <TopbarNotificationsBadge />
      </div>
      {children}
    </NotificationBar>
  )
}

/** Ranking position counter button displaying a numeric position with a crown icon. Hidden on desktop by default (used in mobile drawer). */
function TopbarRankPosition({
  position,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  position: number
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          data-slot="topbar-rank-position"
          aria-label={`Ranking: posição ${position}`}
          className={cn(
            "hidden h-9 cursor-pointer items-center rounded-full border-0 bg-transparent text-base font-mono text-muted-foreground tabular-nums outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-foreground md:inline-flex",
            className
          )}
          {...props}
        >
          <span className="pl-2.5">{position}</span>
          <SmCrownSolidIcon className="ml-1 mr-1.5 size-5" aria-hidden="true" />
        </button>
      </TooltipTrigger>
      <TooltipContent>Ranking</TooltipContent>
    </Tooltip>
  )
}

/** Crown icon button for accessing the ranking/leaderboard. */
function TopbarRanking({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          data-slot="topbar-ranking"
          variant="ghost"
          size="icon"
          className={cn("group/rank text-muted-foreground", className)}
          {...props}
        >
          <SmCrownLineIcon className="size-5.5 group-hover/rank:hidden" />
          <SmCrownSolidIcon className="hidden size-5.5 group-hover/rank:block" />
          <span className="sr-only">Ranking</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>Ranking</TooltipContent>
    </Tooltip>
  )
}

/** Search icon button visible only on mobile. */
function TopbarSearch({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          data-slot="topbar-search"
          variant="ghost"
          size="icon"
          className={cn("text-muted-foreground md:hidden", className)}
          {...props}
        >
          <SmSearchLineIcon className="size-5" />
          <span className="sr-only">Buscar</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>Buscar</TooltipContent>
    </Tooltip>
  )
}

/**
 * Grid icon button that opens the apps launcher popover.
 * Pass TopbarAppsContent with TopbarAppsItem children to populate the grid.
 *
 * ```tsx
 * <TopbarApps>
 *   <TopbarAppsContent>
 *     <TopbarAppsItem icon={<MdHomeSolidIcon />} label="Inicio" />
 *     <TopbarAppsItem icon={<MdShopSolidIcon />} label="Loja" />
 *   </TopbarAppsContent>
 * </TopbarApps>
 * ```
 */
function TopbarApps({
  className,
  children,
  open,
  onOpenChange,
  ...props
}: React.ComponentProps<"button"> & {
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              data-slot="topbar-apps"
              className={cn(
                "inline-flex size-10 cursor-pointer items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-foreground",
                className
              )}
              {...props}
            >
              <MdAppsLineIcon className="size-7" />
              <span className="sr-only">Apps</span>
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Apps</TooltipContent>
      </Tooltip>
      {children}
    </Popover>
  )
}

/** Popover content panel that renders a 3-column grid of app items. */
function TopbarAppsContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <PopoverContent
      align="end"
      sideOffset={8}
      className={cn("mt-2 w-70 bg-background p-3 pb-4", className)}
    >
      <div
        data-slot="topbar-apps-grid"
        className="grid grid-cols-3 gap-1"
        {...props}
      />
    </PopoverContent>
  )
}

/** Single app item inside TopbarAppsContent - large icon with label underneath. */
function TopbarAppsItem({
  icon,
  label,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      data-slot="topbar-apps-item"
      className={cn(
        "flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border-0 bg-transparent p-3 text-muted-foreground outline-none transition-colors hover:bg-accent/50 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      {...props}
    >
      <span className="flex size-10 items-center justify-center text-foreground [&>svg]:size-7">
        {icon}
      </span>
      <span className="max-w-full text-center text-xs leading-tight line-clamp-2">{label}</span>
    </button>
  )
}

export {
  Topbar,
  TopbarActions,
  TopbarBreadcrumb,
  TopbarCenter,
  TopbarFractals,
  TopbarStreak,
  TopbarNotifications,
  TopbarRanking,
  TopbarRankPosition,
  TopbarSearch,
  TopbarApps,
  TopbarAppsContent,
  TopbarAppsItem,
}
