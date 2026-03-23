"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type TableSize = "sm" | "md" | "lg"

const TableContext = React.createContext<{ size: TableSize }>({ size: "sm" })

/** Responsive data table with hover states and rounded row corners. */
function Table({ className, size = "sm", ...props }: React.ComponentProps<"table"> & { size?: TableSize }) {
  return (
    <TableContext value={{ size }}>
      <div
        data-slot="table-container"
        className="relative w-full overflow-x-auto scrollbar-hidden"
      >
        <table
          data-slot="table"
          data-size={size}
          className={cn("w-full caption-bottom text-sm [&:has(tbody>tr:first-child:hover)>thead>tr]:border-transparent", className)}
          {...props}
        />
      </div>
    </TableContext>
  )
}

/** Table header row group. */
function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b [&_tr>th:first-child]:rounded-l-[6px] [&_tr>th:last-child]:rounded-r-[6px]", className)}
      {...props}
    />
  )
}

/** Table body containing data rows. */
function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

/** Table footer row group for summary data. */
function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

/** Table row with hover highlight and selection state. */
function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors hover:border-transparent [&>td]:transition-colors [&:hover>td:first-child]:rounded-l-[6px] [&:hover>td:last-child]:rounded-r-[6px] [&[data-state=selected]>td:first-child]:rounded-l-[6px] [&[data-state=selected]>td:last-child]:rounded-r-[6px] [&:has(+:hover)]:border-transparent",
        className
      )}
      {...props}
    />
  )
}

/** Table header cell. */
function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  const { size } = React.useContext(TableContext)
  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-[var(--surface-200)] px-2 text-left align-middle font-medium font-body whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        size === "sm" && "h-10",
        size === "md" && "h-12",
        size === "lg" && "h-14",
        className
      )}
      {...props}
    />
  )
}

/** Table data cell. */
function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  const { size } = React.useContext(TableContext)
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "px-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        size === "sm" && "py-2",
        size === "md" && "py-3",
        size === "lg" && "py-4",
        className
      )}
      {...props}
    />
  )
}

/** Caption element providing a description of the table contents. */
function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
