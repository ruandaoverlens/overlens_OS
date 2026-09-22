import { cn } from "@/lib/utils"

/**
 * Placeholder pulsante para conteúdo em carregamento. Oculto de leitores de tela.
 *
 * O cinza vem de `surface-800`, não de `--muted`: no tema claro o muted
 * (#EDEDED) ficava a 1,17:1 do fundo branco — o esqueleto praticamente
 * desaparecia. `surface-800` dá o mesmo peso nos dois temas (#E0E0E0 no claro,
 * #303030 no escuro), que é o contraste que o esqueleto já tinha no escuro.
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-surface-800", className)}
      {...props}
    />
  )
}

export { Skeleton }
