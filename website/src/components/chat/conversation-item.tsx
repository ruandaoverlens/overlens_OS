"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  SmDeleteLineIcon,
  SmEditSolidIcon,
  SmMoreSolidIcon,
} from "@/components/icons";
import { notify } from "@/lib/notifications/toast";
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field";

type ConversationItemProps = {
  id: string;
  title: string;
  isActive?: boolean;
  /** Base do link da conversa (default: chat do Brand System). */
  hrefBase?: string;
  /** Base da API de renomear/excluir (default: chat do Brand System). */
  apiBase?: string;
  /** Rota para onde ir ao excluir a conversa ativa. */
  homeHref?: string;
};

function capitalizeFirst(s: string): string {
  if (!s) return s;
  return s.charAt(0).toLocaleUpperCase("pt-BR") + s.slice(1);
}

export function ConversationItem({
  id,
  title,
  isActive,
  hrefBase = "/chat",
  apiBase = "/api/chat/conversations",
  homeHref = "/chat",
}: ConversationItemProps) {
  const router = useRouter();
  const titleInputId = React.useId();
  const displayTitle = capitalizeFirst(title);
  const [renameOpen, setRenameOpen] = React.useState(false);
  const confirm = useConfirm();
  const [newTitle, setNewTitle] = React.useState(displayTitle);
  const [busy, setBusy] = React.useState(false);
  const [titleError, setTitleError] = React.useState<string | null>(null);
  const titleInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (renameOpen) {
      setNewTitle(displayTitle);
      setTitleError(null);
    }
  }, [renameOpen, displayTitle]);

  const titleChanged =
    capitalizeFirst(newTitle.trim()) !== displayTitle.trim();

  /** Fechar com o título alterado pede confirmação antes de descartar. */
  async function closeRename() {
    if (busy) return;
    if (titleChanged) {
      const ok = await confirm({
        title: "Descartar as alterações?",
        description: "O novo título desta conversa não será salvo.",
        confirmLabel: "Descartar",
        cancelLabel: "Continuar editando",
        destructive: true,
      });
      if (!ok) return;
    }
    setRenameOpen(false);
  }

  async function handleRename(e?: React.FormEvent) {
    e?.preventDefault();
    if (busy) return;
    const trimmed = capitalizeFirst(newTitle.trim());
    // Submit fica sempre habilitado: campo vazio vira erro visível, não botão morto.
    if (!trimmed) {
      setTitleError("Informe um título para a conversa.");
      titleInputRef.current?.focus();
      return;
    }
    // Compara com o mesmo valor que o campo exibe: comparar com o título cru
    // dispararia um PATCH só para capitalizar, sem o usuário ter editado nada.
    if (trimmed === displayTitle.trim()) {
      setRenameOpen(false);
      return;
    }
    setTitleError(null);
    setBusy(true);
    try {
      const res = await fetch(`${apiBase}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmed }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Falha ao renomear");
      }
      setRenameOpen(false);
      notify.success("Conversa renomeada");
      router.refresh();
    } catch (err) {
      notify.fromError(err, "Não foi possível renomear a conversa");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (busy) return;
    const ok = await confirm({
      title: "Excluir esta conversa?",
      description: "Esta ação é permanente. Todas as mensagens serão excluídas.",
      confirmLabel: "Excluir",
      cancelLabel: "Cancelar",
      destructive: true,
    });
    if (!ok) return;
    setBusy(true);
    try {
      const res = await fetch(`${apiBase}/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Falha ao excluir");
      }
      notify.success("Conversa excluída");
      // If the user was on this conversation, send them home
      if (isActive) {
        router.push(homeHref);
      } else {
        router.refresh();
      }
    } catch (err) {
      notify.fromError(err, "Não foi possível excluir a conversa");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton
          isActive={isActive}
          size="sm"
          asChild
          className="group-hover/menu-item:bg-sidebar-accent group-hover/menu-item:text-sidebar-accent-foreground group-has-data-[state=open]/menu-item:bg-sidebar-accent group-has-data-[state=open]/menu-item:text-sidebar-accent-foreground"
        >
          <Link href={`${hrefBase}/${id}`} className="truncate">
            <span className="truncate">{displayTitle || "Sem título"}</span>
          </Link>
        </SidebarMenuButton>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuAction
              showOnHover
              aria-label="Ações da conversa"
              className="!top-1/2 !-translate-y-1/2 hover:bg-transparent [&_svg]:!size-[22px]"
            >
              <SmMoreSolidIcon />
            </SidebarMenuAction>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="right"
            align="center"
            sideOffset={8}
            className="min-w-[160px] pb-2"
          >
            <DropdownMenuItem onSelect={() => setRenameOpen(true)}>
              <SmEditSolidIcon />
              Renomear
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              disabled={busy}
              onSelect={() => void handleDelete()}
            >
              <SmDeleteLineIcon />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>

      <Dialog
        open={renameOpen}
        onOpenChange={(open) => {
          if (open) {
            setRenameOpen(true);
            return;
          }
          // Enquanto salva, o diálogo não fecha; ao fechar com edição pendente,
          // pede confirmação antes de descartar.
          void closeRename();
        }}
      >
        <DialogContent
          className="sm:max-w-md"
          /* Enquanto salva, Esc e clique no overlay não descartam o diálogo. */
          onEscapeKeyDown={(e) => { if (busy) e.preventDefault(); }}
          onPointerDownOutside={(e) => { if (busy) e.preventDefault(); }}
          onInteractOutside={(e) => { if (busy) e.preventDefault(); }}
        >
          <DialogHeader>
            <DialogTitle>Renomear conversa</DialogTitle>
            <DialogDescription className="sr-only">
              Digite o novo título e confirme para renomear a conversa.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRename} className="space-y-4">
            <Label htmlFor={titleInputId} className="sr-only">
              Título da conversa
            </Label>
            <Input
              id={titleInputId}
              ref={titleInputRef}
              autoFocus
              disabled={busy}
              value={newTitle}
              onChange={(e) => { setNewTitle(e.target.value); setTitleError(null); }}
              placeholder="Título da conversa"
              maxLength={120}
              aria-invalid={titleError ? true : undefined}
              aria-describedby={titleError ? `${titleInputId}-error` : undefined}
            />
            {titleError && (
              <FieldError id={`${titleInputId}-error`} className="text-xs">
                {titleError}
              </FieldError>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => void closeRename()}
                disabled={busy}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                loading={busy}
                loadingText="Salvando…"
              >
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </>
  );
}
