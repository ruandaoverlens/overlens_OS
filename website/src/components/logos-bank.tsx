"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HeadingTitle } from "@/components/ui/heading";
import { EmptyState } from "@/components/empty-state";
import {
  SmAsteriskLineIcon,
  SmCloseLineIcon,
  SmDownloadLineIcon,
  SmVisibilitySolidIcon,
  SmVisibilityOffSolidIcon,
} from "@/components/icons";
import { useFavorites } from "@/lib/favorites";
import { FavoriteButton } from "@/components/favorite-button";
import { useAuth, canDelete } from "@/lib/auth";
import { useHiddenAssets } from "@/lib/hidden-assets";
import { notify } from "@/lib/notifications";
import { useLightboxItem } from "@/components/asset-page-shell";
import { normalizeText, matchesNormalized } from "@/lib/normalize-text";

// ─── Data ────────────────────────────────────────────────────

type LogoType = "Símbolo" | "Logotipo" | "Sub-marca";

interface LogoAsset {
  name: string;
  type: LogoType;
  darkSrc: string;
  lightSrc: string;
}

export const LOGO_TYPES: LogoType[] = ["Símbolo", "Logotipo", "Sub-marca"];

export const LOGOS: LogoAsset[] = [
  {
    name: "Overlens Symbol",
    type: "Símbolo",
    darkSrc: "/brand/symbol-dark.svg",
    lightSrc: "/brand/symbol-light.svg",
  },
  {
    name: "Overlens Logo",
    type: "Logotipo",
    darkSrc: "/brand/logo-dark.svg",
    lightSrc: "/brand/logo-light.svg",
  },
  {
    name: "Atlas",
    type: "Sub-marca",
    darkSrc: "/brand/atlas-dark.svg",
    lightSrc: "/brand/atlas-light.svg",
  },
  {
    name: "Protocolo",
    type: "Sub-marca",
    darkSrc: "/brand/protocolo-dark.svg",
    lightSrc: "/brand/protocolo-light.svg",
  },
  {
    name: "Vanguarda",
    type: "Sub-marca",
    darkSrc: "/brand/vanguarda-dark.svg",
    lightSrc: "/brand/vanguarda-light.svg",
  },
];

/** `needle` já vem de `normalizeText` — normalizar por item seria trabalho repetido. */
function matchesFilters(asset: LogoAsset, needle: string, activeTags?: Set<string>): boolean {
  if (activeTags && activeTags.size > 0 && !activeTags.has(asset.type)) return false;
  const q = needle;
  if (!q) return true;
  return matchesNormalized(asset.name, q) || matchesNormalized(asset.type, q);
}

// ─── Logo Card ───────────────────────────────────────────────

// Overlay invisível não pode capturar toque: sem hover (touch) ele fica sempre
// visível e clicável; com hover só ganha pointer-events quando aparece.
const OVERLAY_CLASS =
  "absolute top-2 right-2 z-10 flex items-center gap-1.5 opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto focus-visible:opacity-100 pointer-coarse:opacity-100 pointer-coarse:pointer-events-auto";
// Sobre a miniatura do logo: pílula escura literal, legível nos dois temas.
const ICON_BTN_CLASS = "rounded-full bg-absolute-black/50 text-absolute-white/70 hover:bg-absolute-black/70 hover:text-absolute-white";

function LogoCard({
  asset,
  onClick,
  isFavorite,
  onToggleFavorite,
  showHideButton,
  isHidden,
  onToggleHide,
}: {
  asset: LogoAsset;
  onClick: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  showHideButton?: boolean;
  isHidden?: boolean;
  onToggleHide?: () => void;
}) {
  return (
    <div className="group relative rounded-xl border border-border/40 bg-accent/20 overflow-hidden hover:bg-accent/40 hover:border-border/60 transition-all">
      <button
        type="button"
        onClick={onClick}
        aria-label={`Abrir ${asset.name}`}
        className="block w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-foreground rounded-xl"
      >
        <div className="flex items-center justify-center bg-surface-950 p-8 aspect-4/3 relative">
          {/* As duas versões existem no disco: a troca é por CSS (nada de
              `useTheme()` aqui). `lightSrc` é o logo BRANCO — vai no tema
              escuro; `darkSrc` é o PRETO — vai no tema claro. */}
          <Image
            src={asset.darkSrc}
            alt={asset.name}
            width={200}
            height={100}
            unoptimized
            className="object-contain w-auto h-auto max-w-[40%] max-h-[40%] dark:hidden"
          />
          <Image
            src={asset.lightSrc}
            alt=""
            aria-hidden="true"
            width={200}
            height={100}
            unoptimized
            className="object-contain w-auto h-auto max-w-[40%] max-h-[40%] hidden dark:block"
          />
        </div>
        <div className="px-3 py-2.5">
          <p className="text-sm font-medium text-foreground truncate">{asset.name}</p>
          <p className="text-xs text-surface-500 mt-0.5">{asset.type}</p>
        </div>
      </button>
      {/* Ações: irmão absoluto do botão principal. */}
      <div className={OVERLAY_CLASS}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              asChild
              variant="ghost"
              size="icon-sm"
              className={ICON_BTN_CLASS}
            >
              <a href={asset.lightSrc} download aria-label={`Baixar ${asset.name} (light)`}>
                <SmDownloadLineIcon className="size-4" />
              </a>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">Baixar versão light</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              asChild
              variant="ghost"
              size="icon-sm"
              className={ICON_BTN_CLASS}
            >
              <a href={asset.darkSrc} download aria-label={`Baixar ${asset.name} (dark)`}>
                <SmDownloadLineIcon className="size-4" />
              </a>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">Baixar versão dark</TooltipContent>
        </Tooltip>
        {showHideButton && onToggleHide && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={isHidden ? "Desocultar logo" : "Ocultar logo"}
                aria-pressed={!!isHidden}
                onClick={onToggleHide}
                className={ICON_BTN_CLASS}
              >
                {isHidden ? <SmVisibilityOffSolidIcon className="size-4" /> : <SmVisibilitySolidIcon className="size-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">{isHidden ? "Desocultar logo" : "Ocultar logo"}</TooltipContent>
          </Tooltip>
        )}
        <FavoriteButton isFavorite={isFavorite} onClick={() => onToggleFavorite()} />
      </div>
    </div>
  );
}

// ─── Fullscreen Modal ────────────────────────────────────────

export function LogoModal({
  asset,
  onClose,
  onDelete,
  isHidden,
  onToggleHide,
}: {
  asset: LogoAsset;
  onClose: () => void;
  onDelete?: () => void;
  isHidden?: boolean;
  onToggleHide?: () => void;
}) {
  const { user } = useAuth();
  const isAdmin = user && canDelete(user.role);
  const confirm = useConfirm();
  const [deleting, setDeleting] = useState(false);
  const [hiding, setHiding] = useState(false);

  const handleDelete = async () => {
    const ok = await confirm({
      destructive: true,
      title: "Excluir este asset?",
      description: "Esta ação não pode ser desfeita.",
      confirmLabel: "Excluir",
    });
    if (!ok) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/assets/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storagePath: `Imagens/logos/${asset.name}`,
          previewPath: `Imagens/logos/${asset.name}`,
        }),
      });
      if (res.ok) {
        notify.success("Asset excluído");
        onDelete?.();
        onClose();
      } else {
        const data = await res.json().catch(() => ({}));
        notify.error("Falha ao excluir asset", { description: data.error });
      }
    } catch (err) {
      notify.fromError(err, "Falha ao excluir asset");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        showCloseButton={false}
        className="max-w-none sm:max-w-none max-h-none w-screen h-svh rounded-none p-0 bg-background border-0 flex flex-col gap-0 overflow-hidden"
      >
        <DialogTitle className="sr-only">{asset.name}</DialogTitle>
        <DialogDescription className="sr-only">
          {asset.type} nas variantes dark e light, com download em SVG. Use Esc para fechar.
        </DialogDescription>

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 shrink-0">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-surface-200 truncate">
              {asset.name}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{asset.type}</p>
          </div>
          <div className="flex items-center gap-2 ml-4">
            {isAdmin && onToggleHide && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-border text-surface-500 hover:bg-accent hover:border-foreground/40 hover:text-foreground"
                onClick={async () => {
                  setHiding(true);
                  try {
                    await onToggleHide();
                  } catch (err) {
                    notify.fromError(err, isHidden ? "Falha ao desocultar asset" : "Falha ao ocultar asset");
                  } finally {
                    setHiding(false);
                  }
                }}
                loading={hiding}
                loadingText={isHidden ? "Desocultando…" : "Ocultando…"}
                aria-pressed={!!isHidden}
              >
                <span>{isHidden ? "Desocultar" : "Ocultar"}</span>
              </Button>
            )}
            {isAdmin && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                loading={deleting}
                loadingText="Excluindo…"
              >
                Excluir
              </Button>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Fechar"
                  className="text-surface-500 hover:text-foreground hover:bg-accent"
                  onClick={onClose}
                >
                  <SmCloseLineIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Fechar (Esc)</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Preview area */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 min-h-0 overflow-auto scrollbar-thin">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
            {/* Dark variant */}
            <div className="flex flex-col items-center gap-3">
              <HeadingTitle as="h3" size="eyebrow">Dark</HeadingTitle>
              {/* Moldura LITERAL: a variante clara do logo só se lê sobre preto, nos dois temas. */}
              <div className="w-full aspect-4/3 bg-absolute-black border border-border rounded-lg flex items-center justify-center p-8">
                <Image
                  src={asset.lightSrc}
                  alt={`${asset.name} sobre fundo escuro`}
                  width={400}
                  height={300}
                  unoptimized
                  className="max-w-full max-h-full w-auto h-auto object-contain"
                />
              </div>
              <Button variant="secondary" size="sm" asChild>
                <a href={asset.darkSrc} download aria-label={`Baixar ${asset.name} (dark)`}>Download Dark</a>
              </Button>
            </div>

            {/* Light variant */}
            <div className="flex flex-col items-center gap-3">
              <HeadingTitle as="h3" size="eyebrow">Light</HeadingTitle>
              {/* Moldura LITERAL: a variante escura do logo só se lê sobre branco, nos dois temas. */}
              <div className="w-full aspect-4/3 bg-absolute-white border border-border rounded-lg flex items-center justify-center p-8">
                <Image
                  src={asset.darkSrc}
                  alt={`${asset.name} sobre fundo claro`}
                  width={400}
                  height={300}
                  unoptimized
                  className="max-w-full max-h-full w-auto h-auto object-contain"
                />
              </div>
              <Button variant="secondary" size="sm" asChild>
                <a href={asset.lightSrc} download aria-label={`Baixar ${asset.name} (light)`}>Download Light</a>
              </Button>
            </div>
          </div>

          {/* Info & Downloads */}
          <div className="mt-10 max-w-4xl w-full border-t border-border pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Info */}
              <div className="space-y-2">
                <HeadingTitle as="h3" size="eyebrow">Informações</HeadingTitle>
                <dl className="space-y-1.5 text-sm">
                  <div className="flex gap-2">
                    <dt className="text-surface-500">Nome:</dt>
                    <dd className="text-foreground">{asset.name}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-surface-500">Tipo:</dt>
                    <dd className="text-foreground">{asset.type}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-surface-500">Dark:</dt>
                    <dd className="text-foreground font-mono text-xs">
                      {asset.darkSrc}
                    </dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-surface-500">Light:</dt>
                    <dd className="text-foreground font-mono text-xs">
                      {asset.lightSrc}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ──────────────────────────────────────────

export function LogosBank({
  showHidden = false,
  search = "",
  activeTags,
  onClearFilters,
  onCountChange,
}: {
  showHidden?: boolean;
  search?: string;
  activeTags?: Set<string>;
  onClearFilters?: () => void;
  /** Quantidade de logos visíveis após os filtros (para o contador do shell). */
  onCountChange?: (count: number) => void;
} = {}) {
  const { user } = useAuth();
  const isAdmin = user && canDelete(user.role);
  // O logo aberto vive na URL (?item=<nome>) para ser compartilhável.
  const [selectedId, openItem, closeItem] = useLightboxItem();
  const [deleted, setDeleted] = useState<Set<string>>(new Set());
  const { isHidden, hide, unhide } = useHiddenAssets("logo");
  const { isFavorite, toggleFavorite } = useFavorites();

  const handleToggleHide = async (name: string) => {
    if (isHidden(name)) await unhide(name);
    else await hide(name);
  };

  const visibleLogos = useMemo(() => {
    // Busca insensível a acento: "simbolo" encontra "Símbolo".
    const needle = normalizeText(search);
    return LOGOS.filter((l) => {
      if (deleted.has(l.name)) return false;
      if (showHidden ? !isHidden(l.name) : isHidden(l.name)) return false;
      return matchesFilters(l, needle, activeTags);
    });
  }, [deleted, showHidden, isHidden, search, activeTags]);
  const hasFilters = search.trim().length > 0 || (activeTags?.size ?? 0) > 0;

  const selected = useMemo(
    () => LOGOS.find((l) => l.name === selectedId && !deleted.has(l.name)) ?? null,
    [selectedId, deleted],
  );

  // Item inexistente (ou já excluído) na lista: limpa a chave da URL.
  useEffect(() => {
    if (selectedId && !selected) closeItem();
  }, [selectedId, selected, closeItem]);

  useEffect(() => {
    onCountChange?.(visibleLogos.length);
  }, [visibleLogos.length, onCountChange]);

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {visibleLogos.map((asset) => (
          <LogoCard
            key={asset.name}
            asset={asset}
            onClick={() => openItem(asset.name)}
            isFavorite={isFavorite(asset.name)}
            onToggleFavorite={() => toggleFavorite({ id: asset.name, type: "logo", title: asset.name, subtitle: asset.type, thumbnail: asset.lightSrc })}
            showHideButton={!!isAdmin}
            isHidden={isHidden(asset.name)}
            onToggleHide={() => handleToggleHide(asset.name)}
          />
        ))}
      </div>

      {visibleLogos.length === 0 && (
        hasFilters ? (
          <EmptyState
            variant="filtered"
            icon={<SmAsteriskLineIcon className="size-6" />}
            title="Nenhum logo encontrado"
            description="Nenhum resultado para a busca ou o tipo selecionado."
            onClear={onClearFilters}
            className="border-none py-16"
          />
        ) : (
          <EmptyState
            icon={<SmAsteriskLineIcon className="size-6" />}
            title={showHidden ? "Nenhum asset oculto" : "Nenhum logo disponível"}
            description={
              showHidden
                ? "Logos ocultados aparecem aqui."
                : "Os símbolos e logotipos oficiais ainda não foram publicados neste banco."
            }
            action={
              <Button variant="outline" size="sm" asChild>
                <Link href="/assets/visao-geral">Ver categorias disponíveis</Link>
              </Button>
            }
            className="border-none py-16"
          />
        )
      )}

      {selected && (
        <LogoModal
          asset={selected}
          onClose={closeItem}
          onDelete={() => {
            setDeleted((prev) => new Set(prev).add(selected.name));
            closeItem();
          }}
          isHidden={isHidden(selected.name)}
          onToggleHide={() => handleToggleHide(selected.name)}
        />
      )}
    </div>
  );
}
