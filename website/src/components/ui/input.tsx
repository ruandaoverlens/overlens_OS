import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground bg-accent/50 dark:bg-input/30 border-2 border-transparent w-full min-w-0 py-0 font-normal font-body shadow-none transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium hover:bg-accent dark:hover:bg-input/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-input focus-visible:bg-transparent dark:focus-visible:bg-transparent aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:ring-2 aria-invalid:ring-destructive aria-invalid:focus-visible:ring-0 aria-invalid:focus-visible:ring-transparent autofill:shadow-[inset_0_0_0px_1000px_transparent] autofill:[-webkit-text-fill-color:var(--color-foreground)]",
  {
    variants: {
      size: {
        lg: "h-20 rounded-[12px] px-4 text-base",
        md: "h-16 rounded-[12px] px-4 text-base",
        default: "h-12 rounded-[12px] px-4 text-base",
        sm: "h-10 rounded-[8px] px-3 text-sm",
        xs: "h-8 rounded-[6px] px-2 text-sm",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

/** Text input field with multiple size variants and consistent focus/hover styling. */
function Input({
  className,
  type,
  size,
  ...props
}: Omit<React.ComponentProps<"input">, "size"> & VariantProps<typeof inputVariants>) {
  return (
    <input
      type={type}
      data-slot="input"
      data-size={size ?? "default"}
      className={cn(inputVariants({ size }), className)}
      {...props}
    />
  )
}

export { Input, inputVariants }
