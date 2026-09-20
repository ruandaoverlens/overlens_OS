import * as React from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { SmArrowBackLineIcon } from "@/components/icons"
import {
  Heading,
  HeadingDescription,
  HeadingTitle,
} from "@/components/ui/heading"

export interface PageHeaderProps {
  title: string
  description?: string
  /** Botões/ações alinhados à direita do título. */
  actions?: React.ReactNode
  /** Quando presente, renderiza um link "voltar" acima do título. */
  backHref?: string
  backLabel?: string
  /** Nível semântico do título. Padrão h1. */
  as?: "h1" | "h2"
  size?: "default" | "xl"
  className?: string
}

/**
 * Cabeçalho de página: link de voltar opcional, título (H1 por padrão, em
 * Outfit uppercase), descrição e área de ações.
 */
function PageHeader({
  title,
  description,
  actions,
  backHref,
  backLabel = "Voltar",
  as = "h1",
  size = "default",
  className,
}: PageHeaderProps) {
  return (
    <Heading
      data-slot="page-header"
      className={cn("gap-2 pb-4", className)}
    >
      {backHref && (
        <Link
          href={backHref}
          className="-ml-1.5 inline-flex min-h-10 w-fit items-center gap-1 rounded-md px-1.5 py-2 text-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-foreground [&>svg]:size-5"
        >
          <SmArrowBackLineIcon aria-hidden="true" />
          <span>{backLabel}</span>
        </Link>
      )}
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="flex min-w-0 flex-col gap-1">
          <HeadingTitle
            as={as}
            size={size}
            className="text-balance"
          >
            {title}
          </HeadingTitle>
          {description && (
            <HeadingDescription className="text-pretty">
              {description}
            </HeadingDescription>
          )}
        </div>
        {actions && (
          <div
            data-slot="page-header-actions"
            className="flex shrink-0 flex-wrap items-center gap-2"
          >
            {actions}
          </div>
        )}
      </div>
    </Heading>
  )
}

export { PageHeader }
