"use client";

import { useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { useFavorites } from "@/lib/favorites";
import { FavoriteButton } from "@/components/favorite-button";
import { useAuth, canEditDocs } from "@/lib/auth";
import { useMounted } from "@/lib/use-mounted";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { DocSkeleton } from "@/components/skeletons";
import { notify } from "@/lib/notifications/toast";
import { SmEditSolidIcon, SmHistoryLineIcon } from "@/components/icons";

// O editor (Tiptap + ProseMirror) só entra no bundle de quem clica em Editar.
const DocEditor = dynamic(
  () => import("@/components/doc-editor").then((m) => m.DocEditor),
  {
    ssr: false,
    loading: () => <DocSkeleton />,
  },
);

/**
 * Envolve a página renderizada no servidor com o modo de edição do admin.
 * Em leitura, mostra `children` (o MarkdownRenderer). Em edição, troca pelo
 * editor com o markdown bruto; ao salvar, grava no banco e recarrega a rota.
 */
export function DocPageView({
  system,
  path,
  title,
  markdown,
  hasOverride,
  children,
}: {
  system: string;
  path: string;
  /** Título do doc, usado no favorito. */
  title?: string;
  markdown: string;
  hasOverride: boolean;
  children: ReactNode;
}) {
  const { user } = useAuth();
  const hasMounted = useMounted();
  const router = useRouter();
  const pathname = usePathname();
  const { isFavorite, toggleFavorite } = useFavorites();
  const favoriteId = `${system}:${path}`;
  const favoriteTitle = title?.trim() || path.split("/").pop() || path;
  const confirm = useConfirm();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const allowed = hasMounted && !!user && canEditDocs(user.role);

  const save = async (content: string) => {
    setSaving(true);
    try {
      const res = await fetch("/api/docs/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system, path, content }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Erro ao salvar a página");
      notify.success("Página salva");
      setEditing(false);
      router.refresh();
    } catch (err) {
      notify.fromError(err, "Erro ao salvar a página");
      // Propaga para o editor: sem isso ele limparia o estado "sujo" e o texto
      // não salvo ficaria preso na aba, sem botão de salvar nem aviso de saída.
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const restore = async () => {
    const ok = await confirm({
      title: "Restaurar o texto original?",
      description: "A versão editada sai do ar e o arquivo original volta a ser exibido.",
      confirmLabel: "Restaurar",
      cancelLabel: "Cancelar",
      destructive: true,
    });
    if (!ok) return;
    setRestoring(true);
    try {
      const res = await fetch("/api/docs/save", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system, path }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Erro ao restaurar a página");
      notify.success("Texto original restaurado");
      router.refresh();
    } catch (err) {
      notify.fromError(err, "Erro ao restaurar a página");
    } finally {
      setRestoring(false);
    }
  };

  if (editing) {
    return (
      <DocEditor
        initialMarkdown={markdown}
        saving={saving}
        onSave={save}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-end gap-2">
        {hasMounted && (
          <FavoriteButton
            isFavorite={isFavorite(favoriteId)}
            onClick={() =>
              toggleFavorite({
                id: favoriteId,
                type: "doc",
                title: favoriteTitle,
                subtitle: system,
                href: pathname,
              })
            }
          />
        )}
        {allowed && hasOverride && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={restore}
              loading={restoring}
              loadingText="Restaurando…"
            >
              <SmHistoryLineIcon className="size-4" />
              Restaurar original
            </Button>
          )}
        {allowed && (
          <Button type="button" size="sm" variant="secondary" onClick={() => setEditing(true)}>
            <SmEditSolidIcon className="size-4" />
            Editar página
          </Button>
        )}
      </div>
      {children}
    </>
  );
}
