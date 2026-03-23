"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

/** Container for a set of mutually exclusive radio options. */
function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-3", className)}
      {...props}
    />
  )
}

const radioItemVariants = cva(
  [
    "peer shrink-0 aspect-square rounded-full border-2 transition-all outline-none",
    /* Default border */
    "border-foreground",
    /* Hover - border goes to primary (white in dark) */
    "hover:border-primary",
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
        default: "size-6",
        sm: "size-5",
        lg: "size-8",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

const dotSizeMap: Record<string, string> = {
  default: "size-4",
  sm: "size-3",
  lg: "size-5",
}

/** Individual radio option within a RadioGroup. Supports multiple sizes. */
function RadioGroupItem({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item> &
  VariantProps<typeof radioItemVariants>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(radioItemVariants({ size, className }))}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="flex items-center justify-center"
      >
        <span
          className={cn(
            "rounded-full bg-foreground",
            dotSizeMap[size ?? "default"]
          )}
        />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem, radioItemVariants }
