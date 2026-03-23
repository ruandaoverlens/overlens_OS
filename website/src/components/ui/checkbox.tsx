"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { SmCheckLineIcon } from "@/components/icons"
import { Checkbox as CheckboxPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

const checkboxVariants = cva(
  [
    "peer shrink-0 border-2 overflow-clip transition-all outline-none",
    /* Unchecked border */
    "border-foreground",
    /* Checked fill + border */
    "data-[state=checked]:bg-foreground data-[state=checked]:border-foreground",
    /* Indeterminate - border only, no bg */
    "data-[state=indeterminate]:border-foreground",
    /* Hover - all states go to primary */
    "hover:border-primary",
    "data-[state=checked]:hover:bg-primary data-[state=checked]:hover:border-primary",
    /* Check icon color */
    "data-[state=checked]:text-background",
    "data-[state=indeterminate]:text-foreground",
    /* Focus ring */
    "focus-visible:ring-2 focus-visible:ring-primary",
    /* Disabled */
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-20",
    /* A11y */
    "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  ].join(" "),
  {
    variants: {
      size: {
        default: "size-6 rounded-[6px]",
        sm: "size-5 rounded-[6px]",
        lg: "size-8 rounded-lg",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

const checkIconSizeMap: Record<string, string> = {
  default: "size-4",
  sm: "size-3",
  lg: "size-5",
}

/** Checkbox form control with checked, unchecked, and indeterminate states. Supports multiple sizes. */
function Checkbox({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root> &
  VariantProps<typeof checkboxVariants>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(checkboxVariants({ size, className }))}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none"
      >
        <SmCheckLineIcon className={checkIconSizeMap[size ?? "default"]} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox, checkboxVariants }
