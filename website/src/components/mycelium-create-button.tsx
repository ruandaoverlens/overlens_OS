"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth, canDelete } from "@/lib/auth";
import { useUrlState } from "@/lib/use-url-state";
import { MyceliumPostForm } from "./mycelium-post-form";

// A mesma página pode montar dois botões (header + empty state). Só o primeiro
// consome o `?novo=1`, senão dois formulários abririam ao mesmo tempo.
let novoClaimed = false;

function claimNovo(): boolean {
  if (novoClaimed) return false;
  novoClaimed = true;
  return true;
}

function releaseNovo(): void {
  novoClaimed = false;
}

/**
 * Botão "Adicionar" para abrir o sheet de criação de referência no Mycelium.
 *
 * Visível apenas para staff/admin (mesmo nível que `canDelete`). Quando o post é
 * criado, dispara um `CustomEvent('mycelium:refresh')` no window para que as
 * páginas de listagem (feed, categoria, favoritos) possam refazer o fetch.
 *
 * Aceita o deep link `?novo=1` (usado pela command palette em "Nova
 * referência"): abre o formulário e limpa a query, para que um reload ou um
 * link compartilhado não reabra o formulário sem contexto.
 */
export function MyceliumCreateButton({ className }: { className?: string }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [novo, setNovo] = useUrlState<string | null>("novo", null);

  const allowed = !!user && canDelete(user.role);

  // Deep link `?novo=1`: abre o formulário e limpa a query — um reload ou um
  // link colado adiante não deve reabrir o formulário sem contexto.
  useEffect(() => {
    if (!allowed || novo !== "1") return;
    if (claimNovo()) {
      // A URL é a fonte externa aqui: abrir é justamente sincronizar o
      // formulário com ela. Roda uma vez por deep link, não em cascata.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(true);
      setNovo(null);
    }
    return releaseNovo;
  }, [allowed, novo, setNovo]);

  if (!allowed) return null;

  return (
    <>
      <Button
        size="sm"
        onClick={() => setOpen(true)}
        className={className}
        aria-label="Adicionar referência"
      >
        Adicionar
      </Button>
      <MyceliumPostForm
        open={open}
        onOpenChange={setOpen}
        onCreated={() => {
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("mycelium:refresh"));
          }
        }}
      />
    </>
  );
}
