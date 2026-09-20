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
        <Button variant="secondary" size="sm" asChild>
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
        <Button variant="secondary" size="sm" asChild>
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
