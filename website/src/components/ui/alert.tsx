import * as React from "react"
import { SmCloseLineIcon } from "@/components/icons"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-xl overflow-hidden text-card-foreground text-sm",
  {
    variants: {
      variant: {
        default: "",
        destructive:
          "border-destructive/30 [&_[data-slot=alert-icon]>svg]:text-destructive",
        warning:
          "border-warning/30 [&_[data-slot=alert-icon]>svg]:text-warning",
        info:
          "border-info/30 [&_[data-slot=alert-icon]>svg]:text-info",
        success:
          "border-success/30 [&_[data-slot=alert-icon]>svg]:text-success",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

/** Dismissible alert banner with semantic variants (info, success, warning, destructive). */
function Alert({
  className,
  variant,
  children,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), "bg-[var(--surface-950)]", className)}
      {...props}
    >
      <div className="bg-gradient-to-r from-[var(--surface-200)]/[0.04] to-[var(--surface-200)]/[0.08] pl-3 pr-4 pt-3 pb-4 flex flex-col gap-2">
        {children}
      </div>
    </div>
  )
}

/** Horizontal container for the alert icon, title, and close button. */
function AlertHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-header"
      className={cn("flex items-center gap-2", className)}
      {...props}
    />
  )
}

/** Container for the alert's leading icon, colored by variant. */
function AlertIcon({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-icon"
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
        className
      )}
      {...props}
    />
  )
}

/** Title text for the alert. */
function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "min-h-6 flex-1 flex items-center font-medium font-body text-sm leading-tight",
        className
      )}
      {...props}
    />
  )
}

/** Descriptive body text for the alert. */
function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-muted-foreground pl-2 text-sm font-medium font-body leading-relaxed [&_p]:leading-relaxed",
        className
      )}
      {...props}
    />
  )
}

/** Close button (X icon) that dismisses the alert. */
function AlertClose({
  className,
  onClick,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      data-slot="alert-close"
      type="button"
      aria-label="Close"
      className={cn(
        "inline-flex size-6 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-foreground",
        className
      )}
      onClick={onClick}
      {...props}
    >
      <SmCloseLineIcon className="size-6" />
    </button>
  )
}

/** Container for action buttons at the bottom of the alert. */
function AlertActions({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-actions"
      className={cn(
        "pl-1 pt-3 flex items-center gap-1",
        className
      )}
      {...props}
    />
  )
}

/** Pill-shaped action button within the alert. Supports primary and secondary variants. */
function AlertAction({
  className,
  variant = "primary",
  ...props
}: React.ComponentProps<"button"> & {
  variant?: "primary" | "secondary"
}) {
  return (
    <button
      data-slot="alert-action"
      type="button"
      className={cn(
        "inline-flex h-6 items-center rounded-full px-3 text-xs font-heading font-medium uppercase tracking-wide transition-colors outline-none focus-visible:ring-2 focus-visible:ring-foreground",
        variant === "primary" &&
          "bg-foreground/10 text-foreground/80 hover:bg-foreground/15",
        variant === "secondary" &&
          "text-foreground/80 hover:bg-foreground/5",
        className
      )}
      {...props}
    />
  )
}

export { Alert, AlertAction, AlertActions, AlertClose, AlertDescription, AlertHeader, AlertIcon, AlertTitle }
