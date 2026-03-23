import * as React from "react"
import { SmArrowForwardIosLineIcon, SmMoreSolidIcon } from "@/components/icons"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"

/** Navigation breadcrumb trail showing the current page hierarchy. */
function Breadcrumb({ ...props }: React.ComponentProps<"nav">) {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />
}

/** Ordered list of breadcrumb items with separator spacing. */
function BreadcrumbList({
  className,
  collapsible = false,
  ...props
}: React.ComponentProps<"ol"> & {
  /** On mobile, collapse to `… > Current Page`. Tap `…` to expand via popover. */
  collapsible?: boolean
}) {
  const listClassName = cn(
    "text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5",
    className
  )

  if (!collapsible) {
    return (
      <ol data-slot="breadcrumb-list" className={listClassName} {...props} />
    )
  }

  const children = React.Children.toArray(props.children)

  // Separate into breadcrumb items (no separators, no ellipsis)
  const allItems = children.filter((child) => {
    if (!React.isValidElement(child)) return false
    if (child.type === BreadcrumbSeparator) return false
    const inner = (child.props as { children?: React.ReactNode }).children
    if (React.isValidElement(inner) && inner.type === BreadcrumbEllipsis)
      return false
    return true
  })

  const firstChild = allItems[0]
  const middleItems = allItems.slice(1, -1)
  const lastChild = allItems[allItems.length - 1]

  const getInner = (child: React.ReactNode) =>
    React.isValidElement(child)
      ? ((child as React.ReactElement).props as { children?: React.ReactNode })
          .children
      : child

  /** Renders a list of items inside a popover */
  function PopoverItemList({
    items,
    showCurrentPage,
  }: {
    items: React.ReactNode[]
    showCurrentPage?: boolean
  }) {
    return (
      <nav aria-label="Full breadcrumb trail">
        <ol className="flex flex-col gap-4 text-sm">
          {items.map((child, index) => {
            const inner = getInner(child)
            const isLast = index === items.length - 1
            if (
              isLast &&
              showCurrentPage &&
              React.isValidElement(inner) &&
              inner.type === BreadcrumbPage
            ) {
              return (
                <li
                  key={index}
                  className="inline-flex items-center gap-1.5 text-[var(--surface-500)] pointer-events-none"
                  aria-disabled="true"
                >
                  {(inner.props as { children?: React.ReactNode }).children}
                </li>
              )
            }
            return (
              <li key={index} className="inline-flex items-center gap-1.5">
                {inner}
              </li>
            )
          })}
        </ol>
      </nav>
    )
  }

  /** Ellipsis button that opens a popover */
  function EllipsisPopover({
    items,
    showCurrentPage,
    label,
  }: {
    items: React.ReactNode[]
    showCurrentPage?: boolean
    label: string
  }) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex size-9 items-center justify-center hover:text-foreground transition-colors"
            aria-label={label}
          >
            <SmMoreSolidIcon className="size-6" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto max-w-72">
          <PopoverItemList items={items} showCurrentPage={showCurrentPage} />
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <ol data-slot="breadcrumb-list" className={listClassName} {...props}>
      {/* ── Mobile: … > Current Page ── */}
      <li className="inline-flex items-center gap-1.5 md:hidden">
        <EllipsisPopover
          items={allItems}
          showCurrentPage
          label="Show full breadcrumb trail"
        />
      </li>
      <li
        role="presentation"
        aria-hidden="true"
        className="[&>svg]:size-3.5 md:hidden"
      >
        <SmArrowForwardIosLineIcon />
      </li>
      <li className="inline-flex items-center gap-1.5 md:hidden">
        {getInner(lastChild)}
      </li>

      {/* ── Desktop: First > … > Current Page ── */}
      {firstChild && React.isValidElement(firstChild) && (
        <li className="hidden md:inline-flex items-center gap-1.5">
          {getInner(firstChild)}
        </li>
      )}
      <li
        role="presentation"
        aria-hidden="true"
        className="hidden md:inline-flex [&>svg]:size-3.5"
      >
        <SmArrowForwardIosLineIcon />
      </li>
      {middleItems.length > 0 && (
        <>
          <li className="hidden md:inline-flex items-center gap-1.5">
            <EllipsisPopover
              items={middleItems}
              label="Show collapsed breadcrumb items"
            />
          </li>
          <li
            role="presentation"
            aria-hidden="true"
            className="hidden md:inline-flex [&>svg]:size-3.5"
          >
            <SmArrowForwardIosLineIcon />
          </li>
        </>
      )}
      {lastChild && React.isValidElement(lastChild) && (
        <li className="hidden md:inline-flex items-center gap-1.5">
          {getInner(lastChild)}
        </li>
      )}
    </ol>
  )
}

/** Individual breadcrumb item in the trail. */
function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props}
    />
  )
}

/** Clickable link within a breadcrumb item. */
function BreadcrumbLink({
  asChild,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean
}) {
  const Comp = asChild ? Slot.Root : "a"

  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn("text-foreground hover:text-foreground transition-colors", className)}
      {...props}
    />
  )
}

/** Current page indicator in the breadcrumb trail (non-interactive). */
function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("text-[var(--surface-500)] font-normal", className)}
      {...props}
    />
  )
}

/** Arrow separator between breadcrumb items. */
function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("[&>svg]:size-3.5", className)}
      {...props}
    >
      {children ?? <SmArrowForwardIosLineIcon />}
    </li>
  )
}

/** Ellipsis indicator for collapsed breadcrumb items. */
function BreadcrumbEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <SmMoreSolidIcon className="size-6" />
      <span className="sr-only">More</span>
    </span>
  )
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
}
