import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-0 whitespace-nowrap rounded-full font-medium overflow-hidden transition-all disabled:pointer-events-none disabled:opacity-20 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-6 [&>svg+*:not(svg)]:pl-0 [&>svg+*:not(svg)]:pr-4 [&>*:not(svg):has(+svg)]:pr-0 [&>*:not(svg):has(+svg)]:pl-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-foreground aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-surface-200 text-background font-heading uppercase tracking-wide hover:bg-white",
        destructive:
          "bg-destructive text-white font-heading uppercase tracking-wide hover:bg-destructive/90 focus-visible:ring-destructive/40",
        inverted:
          "bg-black text-white font-heading uppercase tracking-wide hover:bg-black/80",
        outline:
          "border-2 border-foreground/25 bg-transparent text-foreground font-heading uppercase tracking-wide hover:border-foreground/50",
        "inverted-outline":
          "border-2 border-black/25 bg-transparent text-black font-heading uppercase tracking-wide hover:border-black/50",
        secondary:
          "bg-accent/50 text-secondary-foreground font-body hover:bg-accent",
        ghost:
          "text-foreground/80 font-body hover:bg-accent/50 hover:text-accent-foreground",
        link: "bg-transparent text-foreground/70 font-medium underline underline-offset-4 rounded-none overflow-visible disabled:opacity-40 hover:bg-transparent hover:text-foreground active:text-foreground focus-visible:text-foreground focus-visible:rounded-md",
      },
      size: {
        default: "h-10 px-5 has-[svg]:px-3 text-base [&>*:not(svg)]:px-1 [&_svg:not([class*='size-'])]:size-6 [&_svg]:mx-2.5",
        // 36px visual + 2px de folga por lado = 40px de alvo.
        sm: "h-9 px-5 has-[svg]:px-3 overflow-visible relative z-0 hover:z-10 focus-within:z-10 after:absolute after:-inset-0.5 after:content-[''] text-sm [&>*:not(svg)]:px-1 [&_svg:not([class*='size-'])]:size-6 [&_svg]:mx-2.5",
        lg: "h-12 px-5 has-[svg]:px-3 text-lg [&>*:not(svg)]:px-1 [&_svg:not([class*='size-'])]:size-6 [&_svg]:mx-2.5",
        // 40px — alvo de toque completo.
        icon: "size-10 [&_svg:not([class*='size-'])]:size-6",
        // 32px visual, hit-area 40px via pseudo-elemento (4px por lado).
        "icon-sm":
          "size-8 overflow-visible relative z-0 hover:z-10 focus-within:z-10 after:absolute after:-inset-1 after:content-[''] [&_svg:not([class*='size-'])]:size-5 [&_svg]:mx-0",
        // 24px visual, hit-area 32px via pseudo-elemento (4px por lado).
        // Ver aviso no JSDoc do Button sobre uso em pares adjacentes.
        "icon-xs":
          "size-6 overflow-visible relative z-0 hover:z-10 focus-within:z-10 after:absolute after:-inset-1 after:content-[''] [&_svg:not([class*='size-'])]:size-4 [&_svg]:mx-0",
      },
    },
    compoundVariants: [
      {
        variant: "link",
        className: "h-auto px-0 leading-4 [&>*:not(svg)]:px-0",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

/**
 * Primary button component with multiple variants (default, destructive, outline, secondary, ghost, link) and sizes.
 * `loading` desabilita o botão, marca `aria-busy` e mostra um spinner antes do texto
 * (`loadingText` substitui o conteúdo enquanto carrega). Em tamanhos `icon*` só o
 * spinner é renderizado. Ignorado com `asChild`.
 *
 * Alvos de toque: `icon` já tem 40px reais; `sm`, `icon-sm` e `icon-xs` ampliam o
 * alvo com um pseudo-elemento `after` que ultrapassa a caixa visual
 * (2px, 4px e 4px por lado, respectivamente). Como o alvo invade o espaço vizinho,
 * **não use `icon-xs` em pares/listas de botões com `gap` menor que `gap-2`**:
 * abaixo de 8px os alvos se sobrepõem e o botão seguinte no DOM rouba o clique do
 * anterior. Para barras de ação densas prefira `icon-sm` com `gap-2` ou `icon`.
 * O `hover:z-10` / `focus-within:z-10` garante que o botão sob o cursor ou com foco
 * fique por cima quando ainda houver sobreposição.
 */
function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  loading = false,
  loadingText,
  disabled,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    loading?: boolean
    loadingText?: string
  }) {
  const Comp = asChild ? Slot.Root : "button"
  // Slot exige filho único: com asChild não injetamos o spinner.
  const showLoading = loading && !asChild
  const isIconSize = typeof size === "string" && size.startsWith("icon")

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      data-loading={showLoading || undefined}
      aria-busy={showLoading || undefined}
      disabled={disabled || showLoading}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {showLoading ? (
        isIconSize ? (
          <Spinner className="size-4 shrink-0" aria-hidden="true" role="presentation" />
        ) : (
          <>
            <Spinner className="size-4 mr-2 shrink-0" aria-hidden="true" role="presentation" />
            {loadingText ?? children}
          </>
        )
      ) : (
        children
      )}
    </Comp>
  )
}

export { Button, buttonVariants }
