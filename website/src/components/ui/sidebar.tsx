"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { SmDockToRightLineIcon, SmSearchLineIcon, SmDehazeLineIcon } from "@/components/icons"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Command } from "@/components/ui/command"
import { Slot } from "radix-ui"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "3rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"
const SIDEBAR_COLLAPSE_BREAKPOINT = 1180

type SidebarContextProps = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContextProps | null>(null)

/** Hook that provides sidebar state and toggle controls. */
function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }

  return context
}

/** Context provider that manages sidebar open/collapsed state and keyboard shortcuts. */
function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const isMobile = useIsMobile()
  const [openMobile, setOpenMobile] = React.useState(false)

  // This is the internal state of the sidebar.
  // We use openProp and setOpenProp for control from outside the component.
  const [_open, _setOpen] = React.useState(defaultOpen)
  const open = openProp ?? _open
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value
      if (setOpenProp) {
        setOpenProp(openState)
      } else {
        _setOpen(openState)
      }

      // This sets the cookie to keep the sidebar state.
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
    },
    [setOpenProp, open]
  )

  // Auto-collapse sidebar when viewport crosses below the breakpoint.
  const setOpenRef = React.useRef(setOpen)
  const isMobileRef = React.useRef(isMobile)
  React.useEffect(() => { setOpenRef.current = setOpen }, [setOpen])
  React.useEffect(() => { isMobileRef.current = isMobile }, [isMobile])

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${SIDEBAR_COLLAPSE_BREAKPOINT - 1}px)`)
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches && !isMobileRef.current) {
        setOpenRef.current(false)
      }
    }
    // Collapse on mount if already below breakpoint
    if (mql.matches && !isMobileRef.current) {
      setOpenRef.current(false)
    }
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  // Helper to toggle the sidebar.
  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open)
  }, [isMobile, setOpen, setOpenMobile])

  // Adds a keyboard shortcut to toggle the sidebar.
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault()
        toggleSidebar()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleSidebar])

  // We add a state so that we can do data-state="expanded" or "collapsed".
  // This makes it easier to style the sidebar with Tailwind classes.
  const state = open ? "expanded" : "collapsed"

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
  )

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          data-slot="sidebar-wrapper"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          className={cn(
            "group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  )
}

/**
 * Collapsible sidebar panel with responsive mobile sheet fallback.
 * This sidebar is left-only by design - there is no right-side variant.
 */
function Sidebar({
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children,
  mobileHeader,
  ...props
}: React.ComponentProps<"div"> & {
  variant?: "sidebar" | "floating" | "inset"
  collapsible?: "offcanvas" | "icon" | "none"
  /** Content rendered at the top of the mobile drawer (e.g. stats, counters). */
  mobileHeader?: React.ReactNode
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

  if (collapsible === "none") {
    return (
      <div
        data-slot="sidebar"
        className={cn(
          "bg-sidebar text-sidebar-foreground flex h-full w-(--sidebar-width) flex-col",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }

  if (isMobile) {
    // Filter children to only render SidebarContent (skip header/footer/logo)
    const contentOnly = React.Children.toArray(children).filter((child) => {
      return React.isValidElement(child) && child.type === SidebarContent
    })

    return (
      <>
        <Button
          data-sidebar="mobile-trigger"
          data-slot="sidebar-mobile-trigger"
          variant="ghost"
          size="icon"
          className="fixed top-1.5 left-3 z-50 size-9 text-muted-foreground hover:bg-transparent dark:hover:bg-transparent hover:text-foreground md:hidden"
          onClick={() => setOpenMobile(true)}
        >
          <SmDehazeLineIcon className="size-5" />
          <span className="sr-only">Open menu</span>
        </Button>
        <Drawer open={openMobile} onOpenChange={setOpenMobile}>
          <DrawerContent
            data-sidebar="sidebar"
            data-slot="sidebar"
            data-mobile="true"
            className="text-sidebar-foreground max-h-[80vh] p-0 [&>button]:hidden [&_[data-sidebar=search]]:hidden"
          >
            <DrawerHeader className="sr-only">
              <DrawerTitle>Sidebar</DrawerTitle>
              <DrawerDescription>Displays the mobile sidebar.</DrawerDescription>
            </DrawerHeader>
            <div className="flex h-full w-full flex-col overflow-y-auto p-2 pb-6">
              {mobileHeader && (
                <div data-slot="sidebar-mobile-header" className="flex items-center justify-center gap-2 px-2 pb-8 [&_button]:inline-flex [&_button]:bg-accent/50">
                  {mobileHeader}
                </div>
              )}
              {contentOnly}
            </div>
          </DrawerContent>
        </Drawer>
      </>
    )
  }

  return (
    <div
      className="group peer text-sidebar-foreground hidden md:block"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side="left"
      data-slot="sidebar"
    >
      {/* This is what handles the sidebar gap on desktop */}
      <div
        data-slot="sidebar-gap"
        className={cn(
          "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
          "group-data-[collapsible=offcanvas]:group-data-[state=collapsed]:w-10 group-data-[collapsible=offcanvas]:group-data-[state=expanded]:w-0",
          variant === "floating" || variant === "inset"
            ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)"
        )}
      >
        {/* Persistent trigger that appears when sidebar is collapsed in offcanvas mode */}
        {collapsible === "offcanvas" && (
          <SidebarTrigger
            data-slot="sidebar-offcanvas-trigger"
            className={cn(
              "fixed top-[9px] left-3 z-40 transition-opacity duration-200",
              state === "collapsed" ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
          />
        )}
      </div>
      <div
        data-slot="sidebar-container"
        className={cn(
          "fixed inset-y-0 z-40 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex",
          "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]",
          // Adjust the padding for floating and inset variants.
          variant === "floating" || variant === "inset"
            ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)",
          className
        )}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          data-slot="sidebar-inner"
          className="bg-sidebar group-data-[variant=floating]:border-sidebar-border flex h-full w-full flex-col overflow-hidden group-data-[variant=floating]:rounded-xl group-data-[variant=floating]:border group-data-[variant=floating]:shadow-none dark:group-data-[variant=floating]:shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
        >
          {children}
        </div>
      </div>
    </div>
  )
}

/** Icon button that toggles the sidebar open/collapsed state. */
function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon"
      className={cn("size-7 text-[var(--surface-700)] hover:bg-transparent dark:hover:bg-transparent hover:text-foreground", className)}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      <SmDockToRightLineIcon className="size-[22px]" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
}

/** Search button in the sidebar that opens a command dialog with keyboard shortcut. */
function SidebarSearch({
  className,
  shortcut = "K",
  children,
  ...props
}: React.ComponentProps<"button"> & {
  shortcut?: string
}) {
  const [open, setOpen] = React.useState(false)
  const { state } = useSidebar()

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toUpperCase() === shortcut && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [shortcut])

  const searchButton = (
    <button
      data-slot="sidebar-search"
      data-sidebar="search"
      className={cn(
        "bg-accent/50 dark:bg-input/30 hover:bg-accent dark:hover:bg-input/50 flex h-12 w-full items-center gap-2 rounded-[8px] px-2 text-sm text-muted-foreground outline-none transition-colors [&>svg]:size-6 [&>svg]:shrink-0 group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-md group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:px-0! group-data-[collapsible=icon]:hover:bg-sidebar-accent",
        className
      )}
      onClick={() => setOpen(true)}
      {...props}
    >
      <SmSearchLineIcon />
      <span className="flex-1 text-left group-data-[collapsible=icon]:hidden">Buscar...</span>
      <kbd className="pointer-events-none hidden h-5 items-center gap-0.5 rounded border-none bg-[var(--surface-400)] hover:bg-[var(--surface-300)] dark:bg-[var(--surface-900)] dark:hover:bg-[var(--surface-800)] px-1.5 pt-1 font-mono text-[11px] font-medium text-[var(--surface-600)] dark:text-[var(--surface-500)] select-none sm:flex group-data-[collapsible=icon]:!hidden">
        <span className="text-[13px]">⌘</span>{shortcut}
      </kbd>
    </button>
  )

  return (
    <>
      {state === "collapsed" ? (
        <Tooltip>
          <TooltipTrigger asChild>{searchButton}</TooltipTrigger>
          <TooltipContent side="right" align="center">
            Buscar (⌘{shortcut})
          </TooltipContent>
        </Tooltip>
      ) : (
        searchButton
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader className="sr-only">
          <DialogTitle>Buscar</DialogTitle>
          <DialogDescription>Buscar páginas e comandos</DialogDescription>
        </DialogHeader>
        <DialogContent className="overflow-visible p-0 shadow-none bg-transparent sm:max-w-[620px] top-[80px] translate-y-0" showCloseButton={false}>
          <Command className="bg-[var(--surface-950)] rounded-2xl">
            {children}
          </Command>
        </DialogContent>
      </Dialog>
    </>
  )
}

/** Thin rail along the sidebar edge for click-to-toggle interaction. */
function SidebarRail({ className, ...props }: React.ComponentProps<"button">) {
  const { toggleSidebar } = useSidebar()

  return (
    <button
      data-sidebar="rail"
      data-slot="sidebar-rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn(
        "hover:after:bg-sidebar-border absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear -right-4 after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] sm:flex",
        "cursor-w-resize",
        "[[data-state=collapsed]_&]:cursor-e-resize",
        "hover:group-data-[collapsible=offcanvas]:bg-sidebar group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full",
        "[[data-collapsible=offcanvas]_&]:-right-2",
        className
      )}
      {...props}
    />
  )
}

/** Main content area that adjusts layout when paired with a sidebar. */
function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        "bg-background relative flex min-w-0 w-full flex-1 flex-col",
        "md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2",
        className
      )}
      {...props}
    />
  )
}

/** Text input styled for use inside the sidebar. */
function SidebarInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      data-slot="sidebar-input"
      data-sidebar="input"
      className={cn("bg-background h-8 w-full shadow-none", className)}
      {...props}
    />
  )
}

/** Header area at the top of the sidebar. */
function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      className={cn("flex flex-col gap-2 p-0 group-data-[collapsible=icon]:pt-2", className)}
      {...props}
    />
  )
}

/** Footer area at the bottom of the sidebar. */
function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      data-sidebar="footer"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  )
}

/** Horizontal divider line within the sidebar. */
function SidebarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="sidebar-separator"
      data-sidebar="separator"
      className={cn("bg-[var(--surface-800)] mx-2 w-auto", className)}
      {...props}
    />
  )
}

/** Scrollable main content area of the sidebar. */
function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden group-data-[collapsible=icon]:overflow-hidden scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]",
        className
      )}
      {...props}
    />
  )
}

/** Section group within the sidebar content. */
function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
      {...props}
    />
  )
}

/** Label heading for a sidebar group section. */
function SidebarGroupLabel({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "div"

  return (
    <Comp
      data-slot="sidebar-group-label"
      data-sidebar="group-label"
      className={cn(
        "text-sidebar-foreground/70 ring-sidebar-ring flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-6 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
        className
      )}
      {...props}
    />
  )
}

/** Action button positioned at the top-right of a sidebar group. Uses Button icon variant for consistent sizing and hover. */
function SidebarGroupAction({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<typeof Button> & { asChild?: boolean }) {
  if (asChild) {
    return (
      <Slot.Root
        data-slot="sidebar-group-action"
        data-sidebar="group-action"
        className={cn(
          "absolute top-2 right-2 group-data-[collapsible=icon]:hidden",
          className
        )}
        {...props}
      />
    )
  }

  return (
    <Button
      data-slot="sidebar-group-action"
      data-sidebar="group-action"
      variant="ghost"
      size="icon"
      className={cn(
        "absolute top-2 right-2 size-7 text-sidebar-foreground/70 hover:text-sidebar-foreground",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

/** Content container within a sidebar group. */
function SidebarGroupContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      className={cn("w-full text-sm", className)}
      {...props}
    />
  )
}

/** Navigation menu list within the sidebar. */
function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={cn("flex w-full min-w-0 flex-col gap-1", className)}
      {...props}
    />
  )
}

/** Individual menu item in the sidebar navigation. */
function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      className={cn("group/menu-item relative", className)}
      {...props}
    />
  )
}

const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm font-normal text-[var(--surface-500)] outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:[&>span]:hidden [&>span:last-child]:truncate [&>svg]:size-6 [&>svg]:shrink-0 [&>svg]:opacity-50 data-[active=true]:[&>svg]:opacity-100 hover:[&>svg]:opacity-100",
  {
    variants: {
      size: {
        default: "h-10 text-sm group-data-[collapsible=icon]:size-10!",
        sm: "h-8 text-sm group-data-[collapsible=icon]:size-8!",
        lg: "h-12 text-sm group-data-[collapsible=icon]:size-12! group-data-[collapsible=icon]:p-0!",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

/** Interactive button for a sidebar menu item with tooltip support when collapsed. */
function SidebarMenuButton({
  asChild = false,
  isActive = false,
  outlined = false,
  size = "default",
  tooltip,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean
  isActive?: boolean
  outlined?: boolean
  tooltip?: string | React.ComponentProps<typeof TooltipContent>
} & VariantProps<typeof sidebarMenuButtonVariants>) {
  const Comp = asChild ? Slot.Root : "button"
  const { isMobile, state } = useSidebar()

  const button = (
    <Comp
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        sidebarMenuButtonVariants({ size }),
        outlined
          ? "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]"
          : "",
        className
      )}
      {...props}
    />
  )

  if (!tooltip) {
    return button
  }

  if (typeof tooltip === "string") {
    tooltip = {
      children: tooltip,
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side="right"
        align="center"
        hidden={state !== "collapsed" || isMobile}
        {...tooltip}
      />
    </Tooltip>
  )
}

/** Secondary action button overlaid on a sidebar menu item. Uses Button icon variant for consistent sizing and hover. */
function SidebarMenuAction({
  className,
  asChild = false,
  showOnHover = false,
  ...props
}: React.ComponentProps<typeof Button> & {
  asChild?: boolean
  showOnHover?: boolean
}) {
  const sharedClassName = cn(
    "absolute right-1 peer-hover/menu-button:text-sidebar-accent-foreground",
    "peer-data-[size=sm]/menu-button:top-1",
    "peer-data-[size=default]/menu-button:top-1.5",
    "peer-data-[size=lg]/menu-button:top-2.5",
    "group-data-[collapsible=icon]:hidden",
    showOnHover &&
      "peer-data-[active=true]/menu-button:text-sidebar-accent-foreground group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 md:opacity-0",
    className
  )

  if (asChild) {
    return (
      <Slot.Root
        data-slot="sidebar-menu-action"
        data-sidebar="menu-action"
        className={sharedClassName}
        {...props}
      />
    )
  }

  return (
    <Button
      data-slot="sidebar-menu-action"
      data-sidebar="menu-action"
      variant="ghost"
      size="icon"
      className={cn(
        "size-7 text-sidebar-foreground/70 hover:text-sidebar-foreground",
        sharedClassName
      )}
      {...props}
    />
  )
}

/** Badge indicator displayed on a sidebar menu item. */
function SidebarMenuBadge({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      className={cn(
        "text-sidebar-foreground pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums select-none",
        "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

/** Skeleton loading placeholder for a sidebar menu item. */
function SidebarMenuSkeleton({
  className,
  showIcon = false,
  ...props
}: React.ComponentProps<"div"> & {
  showIcon?: boolean
}) {
  // Deterministic width based on component instance for skeleton loading state.
  const id = React.useId()
  const width = React.useMemo(() => {
    const widths = ["70%", "55%", "85%", "60%", "75%", "50%", "90%", "65%"]
    return widths[Math.abs(id.charCodeAt(0)) % widths.length]
  }, [id])

  return (
    <div
      data-slot="sidebar-menu-skeleton"
      data-sidebar="menu-skeleton"
      className={cn("flex h-8 items-center gap-2 rounded-md px-2", className)}
      {...props}
    >
      {showIcon && (
        <Skeleton
          className="size-4 rounded-md"
          data-sidebar="menu-skeleton-icon"
        />
      )}
      <Skeleton
        className="h-4 max-w-(--skeleton-width) flex-1"
        data-sidebar="menu-skeleton-text"
        style={
          {
            "--skeleton-width": width,
          } as React.CSSProperties
        }
      />
    </div>
  )
}

/** Nested sub-menu list within a sidebar menu item. */
function SidebarMenuSub({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu-sub"
      data-sidebar="menu-sub"
      className={cn(
        "ml-0 flex min-w-0 flex-col gap-1 border-l border-sidebar-border pl-2 pt-1",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

/** Individual item within a sidebar sub-menu. */
function SidebarMenuSubItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      data-sidebar="menu-sub-item"
      className={cn("group/menu-sub-item relative", className)}
      {...props}
    />
  )
}

/** Button or link for a sidebar sub-menu item. Renders a chevron indicator for hierarchy. */
function SidebarMenuSubButton({
  asChild = false,
  size = "md",
  isActive = false,
  className,
  children,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean
  size?: "sm" | "md"
  isActive?: boolean
}) {
  const Comp = asChild ? Slot.Root : "a"

  return (
    <Comp
      data-slot="sidebar-menu-sub-button"
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        "text-[var(--surface-500)] ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground flex h-8 min-w-0 w-full items-center gap-2 overflow-hidden rounded-md px-2 outline-hidden focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground",
        size === "sm" && "text-sm",
        size === "md" && "text-sm",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  )
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSearch,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
}
