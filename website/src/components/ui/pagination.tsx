import * as React from "react"
import {
  SmArrowBackIosNewLineIcon,
  SmArrowForwardIosLineIcon,
  SmMoreLineIcon,
} from "@/components/icons"

import { cn } from "@/lib/utils"
import { buttonVariants, type Button } from "@/components/ui/button"

/** Navigation component for paginating through content. */
function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  )
}

/** Horizontal list of pagination items. */
function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  )
}

/** List item wrapper for a single pagination element. */
function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<"a">

/** Styled pagination page link with active state. */
function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size,
        }),
        className
      )}
      {...props}
    />
  )
}

/** Link to navigate to the previous page. */
function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Ir para página anterior"
      size="default"
      className={cn("gap-1 px-2.5 sm:pl-2.5", className)}
      {...props}
    >
      <SmArrowBackIosNewLineIcon />
      <span className="hidden sm:block">Anterior</span>
    </PaginationLink>
  )
}

/** Link to navigate to the next page. */
function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Ir para próxima página"
      size="default"
      className={cn("gap-1 px-2.5 sm:pr-2.5", className)}
      {...props}
    >
      <span className="hidden sm:block">Próximo</span>
      <SmArrowForwardIosLineIcon />
    </PaginationLink>
  )
}

/** Ellipsis indicator for skipped page numbers. */
function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <SmMoreLineIcon className="size-6" />
      <span className="sr-only">Mais páginas</span>
    </span>
  )
}

/** Mobile-friendly page indicator - "3 / 10". Hidden on sm+ by default. */
function PaginationStatus({
  current,
  total,
  className,
  ...props
}: React.ComponentProps<"span"> & {
  current: number
  total: number
}) {
  return (
    <span
      data-slot="pagination-status"
      className={cn(
        "flex items-center text-base tabular-nums text-muted-foreground sm:hidden",
        className
      )}
      {...props}
    >
      {current}
      <span className="mx-1 opacity-50">/</span>
      {total}
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
  PaginationStatus,
}
