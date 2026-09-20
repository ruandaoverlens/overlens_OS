import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  /** Ação customizada renderizada dentro de EmptyContent. */
  action?: React.ReactNode
  /** `error` mostra "Tentar novamente" (onRetry); `filtered` mostra "Limpar filtros" (onClear). */
  variant?: "empty" | "error" | "filtered"
  onRetry?: () => void
  onClear?: () => void
  /** `sm` para uso dentro de cards/drawers: padding menor, ícone menor, título text-sm. */
  size?: "default" | "sm"
  className?: string
}

/**
 * Estado vazio padronizado sobre `ui/empty`. Cobre lista vazia, erro de carregamento
 * e filtro sem resultados com as ações correspondentes.
 */
function EmptyState({
  icon,
  title,
  description,
  action,
  variant = "empty",
  onRetry,
  onClear,
  size = "default",
  className,
}: EmptyStateProps) {
  const hasContent =
    action !== undefined ||
    (variant === "error" && onRetry) ||
    (variant === "filtered" && onClear)
  const isSm = size === "sm"

  return (
    <Empty
      data-variant={variant}
      data-size={size}
      role={variant === "error" ? "alert" : undefined}
      className={cn(isSm && "gap-4 p-4 md:p-6", className)}
    >
      <EmptyHeader className={cn(isSm && "gap-1")}>
        {icon && (
          <EmptyMedia
            contained
            className={cn(
              variant === "error" && "text-destructive",
              isSm && "mb-1 size-10 [&_svg:not([class*='size-'])]:size-6"
            )}
          >
            {icon}
          </EmptyMedia>
        )}
        <EmptyTitle className={cn(isSm && "text-sm")}>{title}</EmptyTitle>
        {description && (
          <EmptyDescription className={cn(isSm && "text-xs/relaxed")}>
            {description}
          </EmptyDescription>
        )}
      </EmptyHeader>
      {hasContent && (
        <EmptyContent className={cn(isSm && "gap-2")}>
          {variant === "error" && onRetry && (
            <Button type="button" variant="outline" size="sm" onClick={onRetry}>
              Tentar novamente
            </Button>
          )}
          {variant === "filtered" && onClear && (
            <Button type="button" variant="outline" size="sm" onClick={onClear}>
              Limpar filtros
            </Button>
          )}
          {action}
        </EmptyContent>
      )}
    </Empty>
  )
}

export { EmptyState }
