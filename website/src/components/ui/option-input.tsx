"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/* -------------------------------------------------------------------------------------------------
 * OptionInput
 * -----------------------------------------------------------------------------------------------*/

const optionInputVariants = cva(
  [
    "group/option relative flex w-full items-center overflow-clip cursor-pointer select-none",
    "bg-accent/50 dark:bg-input/30",
    "border-2 border-transparent",
    "transition-[background-color,border-color]",
    "hover:bg-accent dark:hover:bg-input/50",
    "focus-visible:border-input focus-visible:bg-transparent dark:focus-visible:bg-transparent outline-none",
    "disabled:pointer-events-none disabled:opacity-50",
    "data-[selected]:border-foreground/90",
  ],
  {
    variants: {
      size: {
        lg: "h-20 gap-3.5 rounded-xl pl-[18px] pr-6",
        md: "h-16 gap-4 rounded-xl pl-4 pr-6",
        sm: "h-12 gap-3 rounded-xl pl-2.5 pr-6",
        xs: "h-10 gap-2 rounded-lg pl-2.5 pr-3",
        xxs: "h-8 gap-2 rounded-md px-2",
      },
    },
    defaultVariants: {
      size: "sm",
    },
  }
)

const optionBadgeVariants = cva(
  [
    "flex shrink-0 items-center justify-center font-mono font-medium text-base leading-4 text-center",
    "transition-[background-color,color]",
  ],
  {
    variants: {
      size: {
        lg: "h-12 min-w-[52px] px-3.5 rounded-md",
        md: "h-9 min-w-[36px] p-2 rounded-[4px]",
        sm: "h-8 min-w-[36px] p-2 rounded-[4px]",
        xs: "h-6 min-w-[36px] p-2 rounded-[4px]",
        xxs: "h-5 min-w-[36px] p-2 rounded-[4px]",
      },
    },
    defaultVariants: {
      size: "sm",
    },
  }
)

type OptionInputProps = Omit<React.ComponentProps<"button">, "value"> &
  VariantProps<typeof optionInputVariants> & {
    option: string
    selected?: boolean
    value?: string
  }

/** Selectable option button with a leading badge label. Used for quiz-style or multiple-choice inputs. */
function OptionInput({
  className,
  size = "sm",
  option,
  selected = false,
  disabled = false,
  children,
  ...props
}: OptionInputProps) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      data-slot="option-input"
      data-selected={selected || undefined}
      data-size={size}
      disabled={disabled}
      className={cn(optionInputVariants({ size }), className)}
      {...props}
    >
      <span
        data-slot="option-input-badge"
        className={cn(
          optionBadgeVariants({ size }),
          selected
            ? "bg-foreground/90 text-background"
            : "bg-foreground/10 text-foreground/90"
        )}
      >
        {option}
      </span>
      <span
        data-slot="option-input-label"
        className="font-body font-medium text-base leading-4 text-foreground/80"
      >
        {children}
      </span>
    </button>
  )
}

/* -------------------------------------------------------------------------------------------------
 * OptionGroup
 * -----------------------------------------------------------------------------------------------*/

type OptionGroupProps = React.ComponentProps<"div"> & {
  value?: string | string[]
  onValueChange?: (value: string) => void
  multiple?: boolean
}

/** Container that manages selection state for a group of OptionInput buttons. Supports single and multi-select. */
function OptionGroup({
  className,
  children,
  value,
  onValueChange,
  multiple = false,
  ...props
}: OptionGroupProps) {
  const selectedSet = React.useMemo(() => {
    if (!value) return new Set<string>()
    return new Set(Array.isArray(value) ? value : [value])
  }, [value])

  return (
    <div
      role="listbox"
      aria-multiselectable={multiple || undefined}
      data-slot="option-group"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement<OptionInputProps>(child)) return child
        const childValue = child.props.value ?? child.props.option
        return React.cloneElement(child, {
          selected: selectedSet.has(childValue),
          onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
            child.props.onClick?.(e)
            if (childValue) onValueChange?.(childValue)
          },
        })
      })}
    </div>
  )
}

export { OptionInput, OptionGroup, optionInputVariants, optionBadgeVariants }
