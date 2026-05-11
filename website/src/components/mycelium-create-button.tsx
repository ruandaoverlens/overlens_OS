"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth, canDelete } from "@/lib/auth";
import { MyceliumPostForm } from "./mycelium-post-form";

/**
 * Botão "Adicionar" para abrir o sheet de criação de referência no Mycelium.
 *
 * Visível apenas para staff/admin (mesmo nível que `canDelete`). Quando o post é
 * criado, dispara um `CustomEvent('mycelium:refresh')` no window para que as
 * páginas de listagem (feed, categoria, favoritos) possam refazer o fetch.
 */
export function MyceliumCreateButton({ className }: { className?: string }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user || !canDelete(user.role)) return null;

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
