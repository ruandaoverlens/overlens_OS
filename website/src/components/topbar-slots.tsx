"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

/*
 * A topbar vive no layout (server) e as ações de página vivem no conteúdo.
 * Em vez de passar props por toda a árvore, o layout monta os alvos abaixo e
 * quem está no conteúdo entrega o conteúdo por portal.
 */

const PAGE_ACTIONS_ID = "topbar-page-actions";
const SECONDARY_TOPBAR_ID = "secondary-topbar";

/** Elemento alvo, resolvido só depois de montar (o portal precisa do DOM). */
function usePortalTarget(id: string): HTMLElement | null {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setTarget(document.getElementById(id));
  }, [id]);
  return target;
}

/** Alvo das ações da página, à esquerda dos ícones fixos da topbar. */
export function TopbarPageActionsSlot({ className }: { className?: string }) {
  return (
    <div
      id={PAGE_ACTIONS_ID}
      data-slot="topbar-page-actions"
      className={cn("flex items-center gap-1 pr-1", className)}
    />
  );
}

/** Envia ações (favoritar, editar…) para dentro da topbar. */
export function TopbarPageActions({ children }: { children: ReactNode }) {
  const target = usePortalTarget(PAGE_ACTIONS_ID);
  if (!target) return null;
  return createPortal(children, target);
}

/**
 * Empilha a topbar e a segunda barra sob um único fundo. Cada barra tinha o
 * seu próprio `backdrop-blur`, e dois blurs vizinhos amostram trechos
 * diferentes do conteúdo: a emenda entre elas aparecia como uma linha. Com um
 * fundo só, as duas ficam idênticas e a emenda some.
 */
export function TopbarStack({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      data-slot="topbar-stack"
      className={cn(
        "sticky top-0 z-30 w-full",
        "bg-surface-black md:bg-background/70 md:backdrop-blur-xl",
        "md:shadow-[inset_3rem_0_2rem_-1rem_var(--surface-black)]",
        // As barras internas entram sem fundo, posição nem blur próprios.
        "[&>[data-slot=topbar]]:static [&>[data-slot=topbar]]:bg-transparent [&>[data-slot=topbar]]:shadow-none [&>[data-slot=topbar]]:backdrop-blur-none",
        "[&>[data-slot=secondary-topbar]]:static [&>[data-slot=secondary-topbar]]:bg-transparent [&>[data-slot=secondary-topbar]]:backdrop-blur-none",
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Alvo da segunda barra, logo abaixo da topbar e em toda a largura útil.
 * Fica sem altura enquanto ninguém preenche (`:empty`).
 */
export function SecondaryTopbarSlot({ className }: { className?: string }) {
  return (
    <div
      id={SECONDARY_TOPBAR_ID}
      data-slot="secondary-topbar"
      className={cn(
        "sticky top-12 z-20 w-full bg-background/70 backdrop-blur-xl [&:empty]:hidden",
        className,
      )}
    />
  );
}

/** Envia uma barra (ex.: toolbar do editor) para a segunda topbar. */
export function SecondaryTopbar({ children }: { children: ReactNode }) {
  const target = usePortalTarget(SECONDARY_TOPBAR_ID);
  if (!target) return null;
  return createPortal(children, target);
}
