"use client";

import * as React from "react";
import Link from "next/link";
import { useSelectedLayoutSegments } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SmArrowBackIosNewLineIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

/**
 * Transforma um segmento de URL (slug) num rótulo legível:
 * decodifica, remove prefixos numéricos ("01 - ", "01-", "01_") e troca
 * hífens/underscores por espaço, capitalizando a primeira letra.
 */
export function humanizeSegment(segment: string): string {
  let text = segment;
  try {
    text = decodeURIComponent(segment);
  } catch {
    // slug já legível — segue com o valor cru
  }
  text = text
    .replace(/^\d+\s*[-_.]?\s*/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return segment;
  return text.charAt(0).toLocaleUpperCase("pt-BR") + text.slice(1);
}

/** Segmentos internos do App Router que não representam rotas. */
function isInternalSegment(segment: string): boolean {
  return segment.startsWith("(") || segment.startsWith("__") || segment === "children";
}

/**
 * Breadcrumb do topbar: raiz = nome do system (link para `basePath`), depois
 * cada segmento da rota humanizado; o último é a página atual. No índice do
 * system mostra só o rótulo.
 */
export function DocTopbarLabel({
  label,
  basePath = "/",
  labels,
  sectionHrefs,
}: {
  label: string;
  basePath?: string;
  /** Mapa segmento → título oficial (preserva acentos); fallback: humanize. */
  labels?: Record<string, string>;
  /**
   * Mapa caminho da seção → href do primeiro doc dela
   * (`getSectionFirstDocHrefs`). Onde houver entrada, o segmento intermediário
   * vira link; sem entrada, continua como texto (sem link morto).
   */
  sectionHrefs?: Record<string, string>;
}) {
  const layoutSegments = useSelectedLayoutSegments();

  const segments = React.useMemo(
    () =>
      layoutSegments
        .filter((s) => !isInternalSegment(s))
        // Catch-all (`[...slug]`) pode chegar como "a/b/c" num único item.
        .flatMap((s) => s.split("/"))
        .filter(Boolean),
    [layoutSegments],
  );

  if (segments.length === 0) {
    return (
      <Breadcrumb aria-label="Navegação estrutural">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className="text-foreground font-medium" title={label}>
              {label}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  return (
    <Breadcrumb aria-label="Navegação estrutural">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href={basePath} className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-foreground">
              {label}
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {segments.map((segment, i) => {
          const isLast = i === segments.length - 1;
          const text = labels?.[segment] ?? humanizeSegment(segment);
          const key = segments.slice(0, i + 1).join("/");
          // Os segmentos da URL podem vir percent-encoded; o mapa de seções
          // usa os nomes decodificados (como no nav).
          let decodedKey = key;
          try {
            decodedKey = decodeURIComponent(key);
          } catch {
            // caminho já legível — segue com o valor cru
          }
          const sectionHref = isLast ? undefined : sectionHrefs?.[decodedKey];
          return (
            <React.Fragment key={key}>
              <BreadcrumbSeparator />
              <BreadcrumbItem className="min-w-0">
                {isLast ? (
                  <BreadcrumbPage className="truncate" title={text}>
                    {text}
                  </BreadcrumbPage>
                ) : sectionHref ? (
                  // A seção não tem rota própria: o link leva ao primeiro doc
                  // dela, que é o que a sidebar abre ao clicar na seção.
                  <BreadcrumbLink asChild>
                    <Link
                      href={sectionHref}
                      title={text}
                      className="truncate rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-foreground"
                    >
                      {text}
                    </Link>
                  </BreadcrumbLink>
                ) : (
                  // Sem primeiro doc conhecido — texto, para não criar link morto.
                  <span className="truncate text-muted-foreground" title={text}>
                    {text}
                  </span>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

/**
 * Afordância de "subir um nível" no mobile. O breadcrumb completo vive em
 * `TopbarBreadcrumb`, que é `hidden md:flex` — em tela pequena não sobrava
 * nenhuma forma de voltar à seção sem abrir o drawer. Este link compacto
 * mostra só o nível anterior e some a partir de `md`.
 *
 * Renderize como filho direto de `<Topbar>` (fora de `TopbarBreadcrumb`) e nos
 * mesmos layouts que montam `DocTopbarLabel` — os segmentos são os mesmos.
 */
export function DocTopbarUpLink({
  label,
  basePath = "/",
  labels,
  sectionHrefs,
  className,
}: {
  label: string;
  basePath?: string;
  /** Mapa segmento → título oficial (preserva acentos); fallback: humanize. */
  labels?: Record<string, string>;
  /** Mapa caminho da seção → href do primeiro doc dela. */
  sectionHrefs?: Record<string, string>;
  className?: string;
}) {
  const layoutSegments = useSelectedLayoutSegments();

  const segments = React.useMemo(
    () =>
      layoutSegments
        .filter((s) => !isInternalSegment(s))
        .flatMap((s) => s.split("/"))
        .filter(Boolean),
    [layoutSegments],
  );

  // No índice do system não há nível acima.
  if (segments.length === 0) return null;

  const parentSegments = segments.slice(0, -1);
  let href = basePath;
  let text = label;

  if (parentSegments.length > 0) {
    const key = parentSegments.join("/");
    let decodedKey = key;
    try {
      decodedKey = decodeURIComponent(key);
    } catch {
      // caminho já legível — segue com o valor cru
    }
    const sectionHref = sectionHrefs?.[decodedKey];
    if (sectionHref) {
      const last = parentSegments[parentSegments.length - 1];
      href = sectionHref;
      text = labels?.[last] ?? humanizeSegment(last);
    }
    // Sem href conhecido para a seção, o nível acima vira a raiz do system —
    // um link vivo vale mais que um rótulo morto.
  }

  return (
    <Link
      href={href}
      aria-label={`Voltar para ${text}`}
      className={cn(
        "ml-13 mr-auto flex min-w-0 items-center gap-1 rounded-sm pr-2 text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-foreground md:hidden",
        className,
      )}
    >
      <SmArrowBackIosNewLineIcon className="size-4 shrink-0" aria-hidden="true" />
      <span className="truncate">{text}</span>
    </Link>
  );
}
