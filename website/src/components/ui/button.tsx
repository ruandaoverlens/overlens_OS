import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-0 whitespace-nowrap rounded-full font-medium overflow-hidden transition-all disabled:pointer-events-none disabled:opacity-20 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-6 [&>svg+*:not(svg)]:pl-0 [&>svg+*:not(svg)]:pr-4 [&>*:not(svg):has(+svg)]:pr-0 [&>*:not(svg):has(+svg)]:pl-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-foreground aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground font-heading uppercase tracking-wide dark:bg-[var(--surface-200)] dark:text-background hover:bg-primary/100 dark:hover:bg-white",
        destructive:
          "bg-destructive text-white font-heading uppercase tracking-wide hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        inverted:
          "bg-background text-foreground font-heading uppercase tracking-wide dark:bg-black dark:text-white hover:bg-background/90 dark:hover:bg-black/80",
        outline:
          "border-2 border-foreground/25 bg-transparent text-foreground font-heading uppercase tracking-wide hover:border-foreground/50 dark:text-foreground dark:hover:border-foreground/50",
        "inverted-outline":
          "border-2 border-black/25 bg-transparent text-black font-heading uppercase tracking-wide hover:border-black/50",
        secondary:
          "bg-secondary/80 text-secondary-foreground font-body hover:bg-secondary dark:bg-accent/50 dark:hover:bg-accent",
        ghost:
          "text-foreground/80 font-body hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "bg-transparent text-foreground/50 font-medium underline underline-offset-4 rounded-none overflow-visible disabled:opacity-40 hover:bg-transparent hover:text-foreground active:text-foreground focus-visible:text-foreground focus-visible:rounded-[6px]",
      },
      size: {
        default: "h-10 px-5 has-[svg]:px-3 text-base [&>*:not(svg)]:px-1 [&_svg:not([class*='size-'])]:size-6 [&_svg]:mx-2.5",
        sm: "h-8 px-5 has-[svg]:px-3 text-sm [&>*:not(svg)]:px-1 [&_svg:not([class*='size-'])]:size-6 [&_svg]:mx-2.5",
        lg: "h-12 px-5 has-[svg]:px-3 text-lg [&>*:not(svg)]:px-1 [&_svg:not([class*='size-'])]:size-6 [&_svg]:mx-2.5",
        icon: "size-10 [&_svg:not([class*='size-'])]:size-6",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-4 [&_svg]:mx-0",
      },
    },
    compoundVariants: [
      {
        variant: "link",
        className: "h-auto px-0 leading-[16px] [&>*:not(svg)]:px-0",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

/** Primary button component with multiple variants (default, destructive, outline, secondary, ghost, link) and sizes. */
function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
