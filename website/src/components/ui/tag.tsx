import * as React from "react"
import { SmCloseLineIcon } from "@/components/icons"

import { cn } from "@/lib/utils"

/**
 * Compact label chip with optional dismiss button. Useful for filters, categories, or multi-select values.
 *
 * Com `onDismiss`, o botão de remover amplia o alvo de toque 6px além da própria
 * caixa. Listas de `Tag` devem usar `gap-3` (12px) — com `gap-1`/`gap-1.5` os
 * alvos de chips vizinhos se sobrepõem e o clique vai para o chip errado.
 */
function Tag({
  className,
  small = false,
  disabled = false,
  onDismiss,
  children,
  ...props
}: Omit<React.ComponentProps<"span">, "disabled"> & {
    small?: boolean
    disabled?: boolean
    onDismiss?: () => void
  }) {
  return (
    <span
      data-slot="tag"
      data-disabled={disabled || undefined}
      aria-disabled={disabled || undefined}
      className={cn(
        // `overflow-visible`: o botão de remover amplia o alvo de toque com um
        // pseudo-elemento que ultrapassa a caixa do chip — `overflow-clip` o cortaria.
        "inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-sm font-mono uppercase overflow-visible transition-all leading-4 outline-none bg-surface-200/10 text-surface-300 hover:bg-white/20 active:bg-white/30 focus-visible:ring-2 focus-visible:ring-surface-200 cursor-default [&:hover]:cursor-pointer data-[disabled]:pointer-events-none data-[disabled]:opacity-20",
        small ? "px-2 py-0.5 text-xs font-normal" : "px-2 py-1 text-sm font-normal",
        className
      )}
      {...props}
    >
      {children}
      {onDismiss && (
        <button
          type="button"
          aria-label="Remover"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation()
            onDismiss()
          }}
          // 16px visuais + 6px de sangria por lado = alvo de 28px. A sangria é
          // deliberadamente pequena: acima de 6px o alvo ultrapassa metade do
          // `gap-3` recomendado e passa a roubar o clique do chip vizinho (e, no
          // wrap, das linhas de cima/baixo). Quem precisa de mais área deve
          // aumentar o `gap` do container, não a sangria.
          className="inline-flex items-center justify-center size-4 shrink-0 rounded-sm opacity-70 hover:opacity-100 transition-opacity disabled:pointer-events-none outline-none focus-visible:ring-2 focus-visible:ring-foreground relative z-0 hover:z-10 focus-visible:z-10 after:absolute after:-inset-1.5 after:content-['']"
        >
          <SmCloseLineIcon className="size-4 stroke-current stroke-1" />
        </button>
      )}
    </span>
  )
}

export { Tag }
