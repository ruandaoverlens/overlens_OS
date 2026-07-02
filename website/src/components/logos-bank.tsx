"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SmCloseLineIcon, SmVisibilitySolidIcon, SmVisibilityOffSolidIcon } from "@/components/icons";
import { useFavorites } from "@/lib/favorites";
import { FavoriteButton } from "@/components/favorite-button";
import { useAuth, canDelete } from "@/lib/auth";
import { useHiddenAssets } from "@/lib/hidden-assets";

// ─── Data ────────────────────────────────────────────────────

interface LogoAsset {
  name: string;
  type: "Símbolo" | "Logotipo" | "Sub-marca";
  darkSrc: string;
  lightSrc: string;
}

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

// ─── Logo Card ───────────────────────────────────────────────

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
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
      className="rounded-xl border border-border/40 bg-accent/20 overflow-hidden cursor-pointer hover:bg-accent/40 hover:border-border/60 transition-all text-left w-full group relative"
    >
      <div className="flex items-center justify-center bg-[var(--surface-950)] p-8 aspect-[4/3] relative">
        <img
          src={asset.lightSrc}
          alt={asset.name}
          className="object-contain"
          style={{ maxWidth: "40%", maxHeight: "40%" }}
        />
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
          {showHideButton && onToggleHide && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleHide(); }}
              className="size-8 rounded-full flex items-center justify-center bg-black/50 text-white/40 hover:text-white/70 hover:bg-black/70 transition-all"
            >
              {isHidden ? <SmVisibilityOffSolidIcon className="size-4" /> : <SmVisibilitySolidIcon className="size-4" />}
            </button>
          )}
          <FavoriteButton isFavorite={isFavorite} onClick={() => onToggleFavorite()} />
        </div>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-sm font-medium text-white truncate">{asset.name}</p>
        <p className="text-xs text-white/50 mt-0.5">{asset.type}</p>
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
  const [deleting, setDeleting] = useState(false);
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este asset?")) return;
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
        onDelete?.();
        onClose();
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao excluir");
      }
    } catch {
      alert("Erro ao excluir asset");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col animate-in fade-in duration-200">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white/80 truncate">
            {asset.name}
          </p>
          <p className="text-xs text-white/40 mt-0.5">{asset.type}</p>
        </div>
        <div className="flex items-center gap-2 ml-4">
          {isAdmin && onToggleHide && (
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 text-white/60 hover:bg-white/10 hover:border-white/40 hover:text-white"
              onClick={async () => {
                setHiding(true);
                await onToggleHide();
                setHiding(false);
              }}
              disabled={hiding}
            >
              <span>{hiding ? "..." : isHidden ? "Desocultar" : "Ocultar"}</span>
            </Button>
          )}
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 text-white/60 hover:bg-white/10 hover:border-white/40 hover:text-white"
              onClick={handleDelete}
              disabled={deleting}
            >
              <span>{deleting ? "Excluindo..." : "Excluir"}</span>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-white/60 hover:text-white hover:bg-white/10"
            onClick={onClose}
          >
            <SmCloseLineIcon />
          </Button>
        </div>
      </div>

      {/* Preview area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 min-h-0 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
          {/* Dark variant */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-xs text-white/50 uppercase tracking-wider">
              Dark
            </p>
            <div className="w-full aspect-[4/3] bg-black border border-white/10 rounded-lg flex items-center justify-center p-8">
              <img
                src={asset.lightSrc}
                alt={`${asset.name}; for dark bg`}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <Button variant="secondary" size="sm" asChild>
              <a href={asset.darkSrc} download>Download Dark</a>
            </Button>
          </div>

          {/* Light variant */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-xs text-white/50 uppercase tracking-wider">
              Light
            </p>
            <div className="w-full aspect-[4/3] bg-white border border-white/10 rounded-lg flex items-center justify-center p-8">
              <img
                src={asset.darkSrc}
                alt={`${asset.name}; for light bg`}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <Button variant="secondary" size="sm" asChild>
              <a href={asset.lightSrc} download>Download Light</a>
            </Button>
          </div>
        </div>

        {/* Info & Downloads */}
        <div className="mt-10 max-w-4xl w-full border-t border-white/10 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Info */}
            <div className="space-y-2">
              <p className="text-xs text-white/40 uppercase tracking-wider">
                Informações
              </p>
              <dl className="space-y-1.5 text-sm">
                <div className="flex gap-2">
                  <dt className="text-white/50">Nome:</dt>
                  <dd className="text-white">{asset.name}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-white/50">Tipo:</dt>
                  <dd className="text-white">{asset.type}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-white/50">Dark:</dt>
                  <dd className="text-white font-mono text-xs">
                    {asset.darkSrc}
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-white/50">Light:</dt>
                  <dd className="text-white font-mono text-xs">
                    {asset.lightSrc}
                  </dd>
                </div>
              </dl>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────

export function LogosBank({ showHidden = false }: { showHidden?: boolean } = {}) {
  const { user } = useAuth();
  const isAdmin = user && canDelete(user.role);
  const [selected, setSelected] = useState<LogoAsset | null>(null);
  const [deleted, setDeleted] = useState<Set<string>>(new Set());
  const { isHidden, hide, unhide } = useHiddenAssets("logo");
  const { isFavorite, toggleFavorite } = useFavorites();

  const handleToggleHide = async (name: string) => {
    if (isHidden(name)) await unhide(name);
    else await hide(name);
  };

  const visibleLogos = LOGOS.filter((l) => {
    if (deleted.has(l.name)) return false;
    return showHidden ? isHidden(l.name) : !isHidden(l.name);
  });

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {visibleLogos.map((asset) => (
          <LogoCard
            key={asset.name}
            asset={asset}
            onClick={() => setSelected(asset)}
            isFavorite={isFavorite(asset.name)}
            onToggleFavorite={() => toggleFavorite({ id: asset.name, type: "logo", title: asset.name, subtitle: asset.type, thumbnail: asset.lightSrc })}
            showHideButton={!!isAdmin}
            isHidden={isHidden(asset.name)}
            onToggleHide={() => handleToggleHide(asset.name)}
          />
        ))}
      </div>

      {visibleLogos.length === 0 && (
        <div className="flex items-center justify-center py-16">
          <p className="text-sm text-white/40">
            {showHidden ? "Nenhum asset oculto" : "Nenhum logo encontrado"}
          </p>
        </div>
      )}

      {selected && (
        <LogoModal
          asset={selected}
          onClose={() => setSelected(null)}
          onDelete={() => {
            setDeleted((prev) => new Set(prev).add(selected.name));
            setSelected(null);
          }}
          isHidden={isHidden(selected.name)}
          onToggleHide={() => handleToggleHide(selected.name)}
        />
      )}
    </div>
  );
}
