import { cn } from "@/lib/utils"

/** Placeholder pulsante para conteúdo em carregamento. Oculto de leitores de tela. */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
