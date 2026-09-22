import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground bg-input/30 border-2 border-field-border w-full min-w-0 py-0 font-normal font-body shadow-none transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium hover:bg-input/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-foreground/70 focus-visible:bg-transparent aria-invalid:border-destructive aria-invalid:focus-visible:border-destructive autofill:shadow-[inset_0_0_0_1000px_var(--input-autofill)] autofill:[-webkit-text-fill-color:var(--color-foreground)]",
  {
    variants: {
      size: {
        lg: "h-20 rounded-field px-4 text-base",
        md: "h-16 rounded-field px-4 text-base",
        default: "h-12 rounded-field px-4 text-base",
        sm: "h-10 rounded-field-sm px-3 text-sm",
        xs: "h-8 pointer-coarse:h-10 rounded-md px-2 text-sm",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

/**
 * Text input field with multiple size variants and consistent focus/hover styling.
 *
 * `size="xs"` tem 32px de altura: fica abaixo do alvo mínimo de 40px, então é um
 * tamanho **de desktop** (tabelas densas, barras de filtro, toolbars). Em ponteiros
 * grossos (`pointer-coarse:`, ou seja, dedo/caneta) ele sobe sozinho para 40px.
 * Não force `h-8` por className em telas de toque.
 */
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
