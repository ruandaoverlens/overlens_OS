import { cn } from "@/lib/utils"

/** Empty state container for displaying placeholder content when no data is available. */
function Empty({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty"
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center justify-center gap-6 rounded-lg border-dashed p-6 text-center text-balance md:p-12",
        className
      )}
      {...props}
    />
  )
}

/** Header section of the empty state containing icon, title, and description. */
function EmptyHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-header"
      className={cn(
        "flex max-w-sm flex-col items-center gap-2 text-center",
        className
      )}
      {...props}
    />
  )
}

/** Icon or illustration slot for the empty state. Use `contained` for a muted background container. */
function EmptyMedia({
  className,
  contained = false,
  ...props
}: React.ComponentProps<"div"> & { contained?: boolean }) {
  return (
    <div
      data-slot="empty-icon"
      data-variant={contained ? "icon" : "default"}
      className={cn(
        "flex shrink-0 items-center justify-center mb-2 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        contained
          ? "bg-muted text-foreground size-14 rounded-lg [&_svg:not([class*='size-'])]:size-10"
          : "bg-transparent",
        className
      )}
      {...props}
    />
  )
}

/** Title text for the empty state message. */
function EmptyTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-title"
      className={cn("text-lg font-heading uppercase tracking-wide", className)}
      {...props}
    />
  )
}

/** Descriptive text explaining the empty state. */
function EmptyDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <div
      data-slot="empty-description"
      className={cn(
        "text-muted-foreground [&>a:hover]:text-primary text-sm/relaxed [&>a]:underline [&>a]:underline-offset-4",
        className
      )}
      {...props}
    />
  )
}

/** Action area below the empty state header for buttons or links. */
function EmptyContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-content"
      className={cn(
        "flex w-full max-w-sm min-w-0 flex-col items-center gap-4 text-sm text-balance",
        className
      )}
      {...props}
    />
  )
}

export {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
}
