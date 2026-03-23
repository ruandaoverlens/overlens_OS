import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/** Heading block - uppercase Outfit title with an optional Inter description beneath. */
function Heading({
  className,
  children,
  ...props
}: React.ComponentProps<"header">) {
  return (
    <header
      data-slot="heading"
      className={cn("flex flex-col gap-1 pb-2", className)}
      {...props}
    >
      {children}
    </header>
  )
}

const headingTitleVariants = cva(
  "font-heading font-normal uppercase tracking-wide text-foreground",
  {
    variants: {
      size: {
        sm: "text-lg",
        default: "text-2xl",
        lg: "text-3xl font-light",
        xl: "text-4xl font-light",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

/** Uppercase heading rendered in Outfit (font-heading). */
function HeadingTitle({
  className,
  size,
  ...props
}: React.ComponentProps<"h2"> &
  VariantProps<typeof headingTitleVariants>) {
  return (
    <h2
      data-slot="heading-title"
      className={cn(headingTitleVariants({ size }), className)}
      {...props}
    />
  )
}

const headingDescriptionVariants = cva(
  "font-body text-[var(--surface-500)]",
  {
    variants: {
      size: {
        sm: "text-sm",
        default: "text-base",
        lg: "text-lg",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

/** Optional description beneath the title - Inter, surface-500. */
function HeadingDescription({
  className,
  size,
  ...props
}: React.ComponentProps<"p"> &
  VariantProps<typeof headingDescriptionVariants>) {
  return (
    <p
      data-slot="heading-description"
      className={cn(headingDescriptionVariants({ size }), className)}
      {...props}
    />
  )
}

export {
  Heading,
  HeadingTitle,
  HeadingDescription,
  headingTitleVariants,
  headingDescriptionVariants,
}
