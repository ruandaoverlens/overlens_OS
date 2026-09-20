import * as React from "react"

import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

/** Wrapper acessível comum: anuncia "Carregando" e marca a região como ocupada. */
function LoadingRegion({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className={className}
      {...props}
    >
      <span className="sr-only">Carregando</span>
      {children}
    </div>
  )
}

const LIST_WIDTHS = ["w-full", "w-11/12", "w-4/5", "w-full", "w-3/4", "w-5/6"]

/** Grid responsivo de cards (imagem + duas linhas de texto). */
function MediaCardGridSkeleton({
  count = 8,
  className,
}: {
  count?: number
  className?: string
}) {
  return (
    <LoadingRegion
      className={cn(
        "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="aspect-4/3 w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </LoadingRegion>
  )
}

/** Lista de linhas de texto com larguras variadas. */
function ListSkeleton({
  rows = 6,
  className,
}: {
  rows?: number
  className?: string
}) {
  return (
    <LoadingRegion className={cn("flex flex-col gap-3", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-4", LIST_WIDTHS[i % LIST_WIDTHS.length])}
        />
      ))}
    </LoadingRegion>
  )
}

/** Documento: título + 8 linhas de parágrafo. */
function DocSkeleton() {
  return (
    <LoadingRegion className="flex flex-col gap-4">
      <Skeleton className="mb-4 h-10 w-2/3" />
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-4", LIST_WIDTHS[i % LIST_WIDTHS.length])}
        />
      ))}
    </LoadingRegion>
  )
}

/**
 * Linhas de tabela. Renderiza `<tr>`/`<td>` — use dentro de `<tbody>`.
 * O anúncio de carregamento vai na primeira célula (tabela não aceita div como filho).
 */
function TableRowsSkeleton({
  rows = 5,
  cols = 4,
}: {
  rows?: number
  cols?: number
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr
          key={r}
          role={r === 0 ? "status" : undefined}
          aria-busy="true"
          className="border-b border-border/50"
        >
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} className="px-3 py-3">
              {r === 0 && c === 0 && (
                <span className="sr-only">Carregando</span>
              )}
              <Skeleton
                className={cn("h-4", c === 0 ? "w-3/4" : "w-1/2")}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

export { MediaCardGridSkeleton, ListSkeleton, DocSkeleton, TableRowsSkeleton }
