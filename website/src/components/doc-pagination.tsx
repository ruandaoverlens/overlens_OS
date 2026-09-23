"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import {
  SmArrowBackIosNewLineIcon,
  SmArrowForwardIosLineIcon,
} from "@/components/icons";
import { isTypingTarget } from "@/lib/is-typing-target";

interface PaginationItem {
  title: string;
  segments: string[];
}

// ─── Presença da paginação ───────────────────────────────
// A command palette (montada na sidebar, irmã da página) precisa saber se "["
// e "]" realmente navegam aqui: a rota pode ser de documento e ainda assim não
// ter anterior nem próxima. Store mínimo em vez de contexto porque os dois
// componentes estão em ramos diferentes da árvore.

let paginationCount = 0;
const paginationListeners = new Set<() => void>();

function setPaginationCount(next: number): void {
  if (paginationCount === next) return;
  paginationCount = next;
  paginationListeners.forEach((l) => l());
}

function subscribePagination(onChange: () => void): () => void {
  paginationListeners.add(onChange);
  return () => {
    paginationListeners.delete(onChange);
  };
}

const getPaginationSnapshot = () => paginationCount > 0;
const getPaginationServerSnapshot = () => false;

/** `true` só quando há uma `DocPagination` montada com destino real. */
export function useHasDocPagination(): boolean {
  return React.useSyncExternalStore(
    subscribePagination,
    getPaginationSnapshot,
    getPaginationServerSnapshot,
  );
}

export function DocPagination({
  prev,
  next,
  basePath = "/docs",
}: {
  prev: PaginationItem | null;
  next: PaginationItem | null;
  basePath?: string;
}) {
  const router = useRouter();
  const prevHref = prev ? `${basePath}/${prev.segments.join("/")}` : null;
  const nextHref = next ? `${basePath}/${next.segments.join("/")}` : null;

  // Anuncia (ou não) os atalhos "[" / "]" na lista da command palette.
  const hasNavigation = !!(prevHref || nextHref);
  React.useEffect(() => {
    if (!hasNavigation) return;
    setPaginationCount(paginationCount + 1);
    return () => setPaginationCount(paginationCount - 1);
  }, [hasNavigation]);

  // "[" / "]" navegam entre páginas (fora de campos de texto). Sem
  // modificador: Alt+← / Alt+→ é o Voltar/Avançar do navegador.
  React.useEffect(() => {
    if (!prevHref && !nextHref) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.altKey || e.metaKey || e.ctrlKey || e.shiftKey) return;
      if (isTypingTarget(e.target)) return;
      if (e.key === "[" && prevHref) {
        e.preventDefault();
        router.push(prevHref);
      } else if (e.key === "]" && nextHref) {
        e.preventDefault();
        router.push(nextHref);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [prevHref, nextHref, router]);

  if (!prev && !next) return null;

  return (
    <nav
      aria-label="Navegação entre páginas"
      className="mt-12 flex items-center justify-between gap-4 border-t border-border pt-6"
    >
      {prev && prevHref ? (
        // Ajuste óptico. O chevron tem 7px de vazio do lado que aponta e 8px
        // do outro dentro do próprio viewBox, então recuo igual no CSS sai
        // desigual na tela. As margens negativas cancelam esse vazio e fazem a
        // *tinta* do ícone se comportar como a borda da caixa; daí o
        // espaçamento passa a ser medido pelo que se vê:
        //   borda 14 · seta 8 · rótulo 8 · atalho 12 · borda
        // A seta fica 2px mais longe da borda que o atalho de propósito: traço
        // fino pede mais ar que um chip com fundo para parecerem iguais.
        <Button
          variant="secondary"
          size="sm"
          asChild
          className="gap-2 has-[svg]:ps-[14px] has-[svg]:pe-3 [&>*:not(svg)]:px-0 [&>svg+*:not(svg)]:pr-0 [&>*:not(svg):has(+svg)]:pl-0 [&_svg]:-ms-[7px] [&_svg]:-me-[8px]"
        >
          <Link
            href={prevHref}
            rel="prev"
            aria-keyshortcuts="BracketLeft"
            aria-label={`Página anterior: ${prev.title} (atalho: [)`}
            title="Página anterior ([)"
          >
            <SmArrowBackIosNewLineIcon />
            <span className="hidden truncate sm:inline">{prev.title}</span>
            <span className="sm:hidden">Voltar</span>
            <KbdGroup aria-hidden="true" className="hidden md:inline-flex">
              <Kbd>[</Kbd>
            </KbdGroup>
          </Link>
        </Button>
      ) : (
        <div />
      )}
      {next && nextHref ? (
        // Espelho do botão anterior. O chevron que aponta para a direita tem o
        // vazio invertido (8px à esquerda, 7px à direita), então as margens
        // negativas também trocam de lado.
        <Button
          variant="secondary"
          size="sm"
          asChild
          className="gap-2 has-[svg]:ps-3 has-[svg]:pe-[14px] [&>*:not(svg)]:px-0 [&>svg+*:not(svg)]:pr-0 [&>*:not(svg):has(+svg)]:pl-0 [&_svg]:-ms-[8px] [&_svg]:-me-[7px]"
        >
          <Link
            href={nextHref}
            rel="next"
            aria-keyshortcuts="BracketRight"
            aria-label={`Próxima página: ${next.title} (atalho: ])`}
            title="Próxima página (])"
          >
            <KbdGroup aria-hidden="true" className="hidden md:inline-flex">
              <Kbd>]</Kbd>
            </KbdGroup>
            <span className="hidden truncate sm:inline">{next.title}</span>
            <span className="sm:hidden">Avançar</span>
            <SmArrowForwardIosLineIcon />
          </Link>
        </Button>
      ) : (
        <div />
      )}
    </nav>
  );
}
