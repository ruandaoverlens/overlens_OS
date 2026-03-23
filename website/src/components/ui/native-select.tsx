import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { SmArrowDownIosLineIcon } from "@/components/icons"

import { cn } from "@/lib/utils"

const nativeSelectVariants = cva(
  "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground bg-accent/50 dark:bg-input/30 border-2 border-transparent w-full appearance-none py-0 font-normal font-body shadow-none transition-all outline-none hover:bg-accent dark:hover:bg-input/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-input focus-visible:bg-transparent dark:focus-visible:bg-transparent aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:ring-2 aria-invalid:ring-destructive",
  {
    variants: {
      size: {
        lg: "h-20 rounded-[12px] px-4 pr-10 text-base",
        md: "h-16 rounded-[12px] px-4 pr-10 text-base",
        default: "h-12 rounded-[12px] px-4 pr-10 text-base",
        sm: "h-10 rounded-[8px] px-4 pr-10 text-sm",
        xs: "h-8 rounded-[6px] px-4 pr-10 text-sm",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

const nativeSelectIconVariants = cva(
  "text-muted-foreground pointer-events-none absolute top-1/2 -translate-y-1/2 opacity-50 select-none",
  {
    variants: {
      size: {
        lg: "right-3.5 size-6",
        md: "right-3.5 size-6",
        default: "right-3.5 size-6",
        sm: "right-3.5 size-6",
        xs: "right-3.5 size-6",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

/** Browser-native select dropdown with custom styling and size variants. */
function NativeSelect({
  className,
  size,
  ...props
}: Omit<React.ComponentProps<"select">, "size"> &
  VariantProps<typeof nativeSelectVariants>) {
  return (
    <div
      className="group/native-select relative w-full has-[select:disabled]:opacity-50"
      data-slot="native-select-wrapper"
    >
      <select
        data-slot="native-select"
        data-size={size ?? "default"}
        className={cn(nativeSelectVariants({ size }), className)}
        {...props}
      />
      <SmArrowDownIosLineIcon
        className={nativeSelectIconVariants({ size })}
        aria-hidden="true"
        data-slot="native-select-icon"
      />
    </div>
  )
}

/** Individual option within a NativeSelect. */
function NativeSelectOption({ ...props }: React.ComponentProps<"option">) {
  return (
    <option
      data-slot="native-select-option"
      className={cn("text-black bg-white", props.className)}
      {...props}
    />
  )
}

/** Option group label for organizing NativeSelect options. */
function NativeSelectOptGroup({
  className,
  ...props
}: React.ComponentProps<"optgroup">) {
  return (
    <optgroup
      data-slot="native-select-optgroup"
      className={cn("text-black bg-white font-medium", className)}
      {...props}
    />
  )
}

export { NativeSelect, nativeSelectVariants, NativeSelectOptGroup, NativeSelectOption }
