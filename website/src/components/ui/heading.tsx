import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/** Heading block - uppercase Outfit title with an optional Inter description beneath. */
function Heading({
  className,
  children,
  ...props
}: React.ComponentProps<"header">) {
  return (
    <header
      data-slot="heading"
      className={cn("flex flex-col gap-1 pb-2", className)}
      {...props}
    >
      {children}
    </header>
  )
}

const headingTitleVariants = cva(
  "font-heading font-normal uppercase tracking-wide text-foreground",
  {
    variants: {
      size: {
        /** Rótulo pequeno acima de um bloco (muted). `uppercase`/`tracking-wide` vêm da base. */
        eyebrow: "text-caption text-muted-foreground font-medium",
        /** Título de bloco pequeno. */
        sm: "text-lg",
        /** Rótulo de card denso (CardTitle size="sm"). */
        label: "text-sm font-medium",
        /* `default` e o H1 de ~17 paginas via PageHeader. Usa o token `--text-h1`
           (22px), que existe justamente para o titulo de pagina nao ser escrito
           com o nome "h3". Hierarquia: sm 18 -> default 22 -> lg 28 -> xl 40. */
        default: "text-h1",
        lg: "text-h2 font-light",
        xl: "text-display font-light",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

/** Uppercase heading rendered in Outfit (font-heading). `as` controla o nível semântico (h1|h2|h3, padrão h2). */
function HeadingTitle({
  className,
  size,
  as: Comp = "h2",
  ...props
}: React.ComponentProps<"h2"> &
  VariantProps<typeof headingTitleVariants> & {
    as?: "h1" | "h2" | "h3"
  }) {
  return (
    <Comp
      data-slot="heading-title"
      className={cn(headingTitleVariants({ size }), className)}
      {...props}
    />
  )
}

const headingDescriptionVariants = cva(
  "font-body text-surface-500",
  {
    variants: {
      size: {
        /** Linha de apoio curta (legenda). */
        sm: "text-caption",
        /** Subtítulo de página/bloco — prosa corrida (15px). */
        default: "text-body",
        /** Subtítulo de destaque (19px). */
        lg: "text-lead",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

/** Optional description beneath the title - Inter, surface-500. */
function HeadingDescription({
  className,
  size,
  ...props
}: React.ComponentProps<"p"> &
  VariantProps<typeof headingDescriptionVariants>) {
  return (
    <p
      data-slot="heading-description"
      className={cn(headingDescriptionVariants({ size }), className)}
      {...props}
    />
  )
}

export {
  Heading,
  HeadingTitle,
  HeadingDescription,
  headingTitleVariants,
  headingDescriptionVariants,
}
