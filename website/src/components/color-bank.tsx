"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/empty-state";
import { SmCloseLineIcon, SmContrastLineIcon, SmInfoLineIcon } from "@/components/icons";
import { useFavorites } from "@/lib/favorites";
import { FavoriteButton } from "@/components/favorite-button";
import { notify } from "@/lib/notifications";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useLightboxItem } from "@/components/asset-page-shell";
import { normalizeText, matchesNormalized } from "@/lib/normalize-text";
import { HeadingTitle, headingTitleVariants } from "@/components/ui/heading";

// ─── Types ───────────────────────────────────────────────────

interface BrandColor {
  name: string;
  oklch: string;
  cssVar: string;
  family: string;
  description: string;
  cmyk: string;
  pantone: string;
  group: "primary" | "secondary" | "tertiary";
}

// ─── Color Data ──────────────────────────────────────────────

export const COLORS: BrandColor[] = [
  { name: "Atmos", oklch: "oklch(0.779 0.08 212.201)", cssVar: "--brand-atmos", family: "Azul Gelo", description: "Clareza, racionalidade, profundidade analítica", cmyk: "44 / 8 / 0 / 16", pantone: "551 C", group: "primary" },
  { name: "Kobold", oklch: "oklch(0.477 0.116 243.133)", cssVar: "--brand-kobold", family: "Azul Profundo", description: "Mistério, conhecimento oculto, profundidade", cmyk: "68 / 38 / 0 / 37", pantone: "7685 C", group: "secondary" },
  { name: "Midori", oklch: "oklch(0.585 0.145 144.414)", cssVar: "--brand-midori", family: "Verde", description: "Natureza, estabilidade, equilíbrio", cmyk: "60 / 0 / 57 / 43", pantone: "7740 C", group: "secondary" },
  { name: "Sahara", oklch: "oklch(0.751 0.103 73.232)", cssVar: "--brand-sahara", family: "Âmbar", description: "Faísca, energia, atenção pontual", cmyk: "0 / 23 / 55 / 16", pantone: "7407 C", group: "secondary" },
  { name: "Boreal", oklch: "oklch(0.462 0.126 352.763)", cssVar: "--brand-boreal", family: "Bordô", description: "Seriedade, ética, alerta intenso", cmyk: "0 / 62 / 18 / 46", pantone: "7649 C", group: "secondary" },
  { name: "Bleu", oklch: "oklch(0.622 0.066 217.111)", cssVar: "--brand-bleu", family: "Azul Médio", description: "Equilíbrio entre razão e sensibilidade", cmyk: "36 / 9 / 0 / 32", pantone: "5503 C", group: "tertiary" },
  { name: "Cotta", oklch: "oklch(0.42 0.133 24.432)", cssVar: "--brand-cotta", family: "Vermelho Escuro", description: "Gravidade, profundidade, alerta ético", cmyk: "0 / 65 / 73 / 46", pantone: "7622 C", group: "tertiary" },
  { name: "Antar", oklch: "oklch(0.893 0.04 216.4)", cssVar: "--brand-antar", family: "Azul Claro", description: "Leveza, abertura, respiro visual", cmyk: "14 / 3 / 0 / 13", pantone: "5523 C", group: "tertiary" },
  { name: "Azzay", oklch: "oklch(0.605 0.042 130.689)", cssVar: "--brand-azzay", family: "Sage", description: "Sutileza, maturidade, equilíbrio discreto", cmyk: "13 / 0 / 26 / 43", pantone: "5773 C", group: "tertiary" },
  { name: "Cloro", oklch: "oklch(0.911 0.098 112.581)", cssVar: "--brand-cloro", family: "Amarelo Claro", description: "Luminosidade, clareza, energia sutil", cmyk: "0 / 5 / 60 / 10", pantone: "611 C", group: "tertiary" },
  { name: "Arena", oklch: "oklch(0.944 0.065 94.953)", cssVar: "--brand-arena", family: "Creme", description: "Base neutra, contenção, respiro", cmyk: "0 / 7 / 31 / 4", pantone: "7402 C", group: "tertiary" },
  { name: "Carota", oklch: "oklch(0.722 0.161 37.732)", cssVar: "--brand-carota", family: "Laranja", description: "Impulso criativo, ação, calor expressivo", cmyk: "0 / 50 / 65 / 3", pantone: "1645 C", group: "tertiary" },
  { name: "Nubia", oklch: "oklch(0.902 0.123 92.922)", cssVar: "--brand-nubia", family: "Amarelo Dourado", description: "Riqueza, capital simbólico, valor", cmyk: "0 / 12 / 51 / 2", pantone: "127 C", group: "tertiary" },
  { name: "Calla", oklch: "oklch(0.863 0.057 6.005)", cssVar: "--brand-calla", family: "Malva", description: "Delicadeza, sensibilidade, nuance", cmyk: "0 / 20 / 16 / 4", pantone: "691 C", group: "tertiary" },
  { name: "Khewra", oklch: "oklch(0.646 0.154 24.222)", cssVar: "--brand-khewra", family: "Rosa Intenso", description: "Erro, falha, ação destrutiva, urgência", cmyk: "0 / 55 / 57 / 14", pantone: "7418 C", group: "tertiary" },
];

// ─── Tags ────────────────────────────────────────────────────

export function getAllColorTags(): string[] {
  return ["primary", "secondary", "tertiary"];
}

/** `needle` já vem de `normalizeText` — normalizar por item seria trabalho repetido. */
function matchesFilters(color: BrandColor, needle: string, activeTags?: Set<string>): boolean {
  if (activeTags && activeTags.size > 0 && !activeTags.has(color.group)) return false;
  const q = needle;
  if (!q) return true;
  return (
    matchesNormalized(color.name, q) ||
    matchesNormalized(color.family, q) ||
    matchesNormalized(color.description, q) ||
    matchesNormalized(color.group, q)
  );
}

// ─── OKLCh to HEX (via canvas) ──────────────────────────────

function oklchToHex(oklchValue: string): string {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";
    ctx.fillStyle = oklchValue;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`.toUpperCase();
  } catch {
    return "";
  }
}

// ─── Copy Button Row ─────────────────────────────────────────

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [value]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`Copiar ${label}: ${value}`}
      className="flex items-center justify-between w-full px-4 py-3 rounded-lg bg-surface-950 hover:bg-surface-900 transition-colors text-left outline-none focus-visible:ring-2 focus-visible:ring-foreground"
    >
      <span className={headingTitleVariants({ size: "eyebrow" })}>
        {label}
      </span>
      <span className="text-sm text-foreground font-mono" aria-live="polite">
        {copied ? "Copiado!" : value}
      </span>
    </button>
  );
}

// ─── Color Detail Modal ──────────────────────────────────────

export function ColorDetail({
  color,
  onClose,
}: {
  color: BrandColor;
  onClose: () => void;
}) {
  const hex = useMemo(() => oklchToHex(color.oklch), [color.oklch]);

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        showCloseButton={false}
        className="max-w-none sm:max-w-none max-h-none w-screen h-svh rounded-none p-0 bg-background border-0 flex flex-col gap-0 overflow-hidden"
      >
        <DialogTitle className="sr-only">{color.name}</DialogTitle>
        <DialogDescription className="sr-only">
          Detalhes da cor {color.family}: clique em um valor para copiá-lo. Use Esc para fechar.
        </DialogDescription>

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 shrink-0">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-surface-200 truncate">{color.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{color.family}</p>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Fechar"
                  onClick={onClose}
                  className="text-surface-500 hover:text-foreground hover:bg-accent"
                >
                  <SmCloseLineIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Fechar (Esc)</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto scrollbar-thin px-6 pb-10">
          {/* Large swatch */}
          <div
            className="h-48 w-full max-w-md rounded-2xl mx-auto mb-8"
            style={{ backgroundColor: color.oklch }}
            role="img"
            aria-label={`Amostra da cor ${color.name}`}
          />

          {/* Info grid */}
          <div className="max-w-md mx-auto flex flex-col gap-2">
            <CopyRow label="Nome" value={color.name} />
            <CopyRow label="Família" value={color.family} />
            <div className="px-4 py-3 rounded-lg bg-surface-950">
              <HeadingTitle as="h3" size="eyebrow" className="block text-surface-400">
                Descrição
              </HeadingTitle>
              <p className="text-sm text-foreground mt-3 leading-relaxed">
                {color.description}
              </p>
            </div>
            {hex && <CopyRow label="HEX" value={hex} />}
            <CopyRow label="OKLCh" value={color.oklch} />
            <CopyRow label="CSS Variable" value={`var(${color.cssVar})`} />
            <CopyRow label="CMYK" value={color.cmyk} />
            <CopyRow label="Pantone" value={color.pantone} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Luminance helper ────────────────────────────────────────

/** Preto/branco LITERAIS: o texto fica sobre a própria amostra de cor, que é
 *  invariante. A escolha depende da luminosidade da cor, não do tema. */
function getTextColor(oklch: string): string {
  // Extract lightness from oklch(L C H) — first number is 0-1
  const match = oklch.match(/oklch\(([\d.]+)/);
  if (!match) return "black";
  const lightness = parseFloat(match[1]);
  return lightness > 0.65 ? "black" : "white";
}

// ─── Color Card ──────────────────────────────────────────────

function ColorCard({
  color,
  onOpenDetail,
  isFavorite,
  onToggleFavorite,
}: {
  color: BrandColor;
  onOpenDetail: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  const textColor = getTextColor(color.oklch);
  const onDark = textColor === "white";

  const handleCopyHex = async () => {
    const hex = oklchToHex(color.oklch);
    if (!hex) {
      notify.error("Não foi possível calcular o HEX");
      return;
    }
    try {
      await navigator.clipboard.writeText(hex);
      notify.success("HEX copiado", { description: `${color.name} · ${hex}` });
    } catch (err) {
      notify.fromError(err, "Não foi possível copiar");
    }
  };

  return (
    <div className="group relative h-32 rounded-xl overflow-hidden hover:scale-[1.03] transition-all">
      <button
        type="button"
        onClick={handleCopyHex}
        aria-label={`Copiar HEX de ${color.name}`}
        className="w-full h-full flex flex-col justify-end p-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-inset"
        style={{ backgroundColor: color.oklch, color: textColor }}
      >
        <span className="text-sm font-medium">{color.name}</span>
      </button>
      {/* Ações: irmãs do botão principal. */}
      {/* Overlay invisível não captura toque: no touch fica sempre visível. */}
      <div className="absolute top-2 right-2 z-10 flex items-center gap-2.5 opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto focus-visible:opacity-100 pointer-coarse:opacity-100 pointer-coarse:pointer-events-auto">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Detalhes de ${color.name}`}
          onClick={onOpenDetail}
          // Literais: o botão flutua sobre a amostra de cor, que não muda com
          // o tema — quem define o contraste aqui é a cor, não o fundo do app.
          className={
            onDark
              ? "rounded-full bg-absolute-black/50 text-absolute-white/70 hover:bg-absolute-black/70 hover:text-absolute-white"
              : "rounded-full bg-absolute-white/60 text-absolute-black/70 hover:bg-absolute-white/80 hover:text-absolute-black"
          }
        >
          <SmInfoLineIcon className="size-4" />
        </Button>
        <FavoriteButton isFavorite={isFavorite} onClick={() => onToggleFavorite()} />
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────

export function ColorBank({
  search = "",
  activeTags,
  onClearFilters,
  onCountChange,
}: {
  search?: string;
  activeTags?: Set<string>;
  onClearFilters?: () => void;
  /** Quantidade de cores visíveis após os filtros (para o contador do shell). */
  onCountChange?: (count: number) => void;
} = {}) {
  // A cor aberta vive na URL (?item=<nome>) para ser compartilhável.
  const [selectedId, openItem, closeItem] = useLightboxItem();
  const { isFavorite, toggleFavorite } = useFavorites();

  const selectedColor = useMemo(
    () => COLORS.find((c) => c.name === selectedId) ?? null,
    [selectedId],
  );

  // Nome inexistente na paleta: limpa a chave da URL.
  useEffect(() => {
    if (selectedId && !selectedColor) closeItem();
  }, [selectedId, selectedColor, closeItem]);

  const visibleColors = useMemo(() => {
    // Busca insensível a acento: "ambar" encontra "Âmbar".
    const needle = normalizeText(search);
    return COLORS.filter((c) => matchesFilters(c, needle, activeTags));
  }, [search, activeTags]);
  const hasFilters = search.trim().length > 0 || (activeTags?.size ?? 0) > 0;

  useEffect(() => {
    onCountChange?.(visibleColors.length);
  }, [visibleColors.length, onCountChange]);

  return (
    <>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {visibleColors.map((color) => (
          <ColorCard
            key={color.name}
            color={color}
            onOpenDetail={() => openItem(color.name)}
            isFavorite={isFavorite(color.name)}
            onToggleFavorite={() => toggleFavorite({ id: color.name, type: "color", title: color.name, subtitle: color.family, thumbnail: color.oklch })}
          />
        ))}
      </div>

      {visibleColors.length === 0 && (
        <EmptyState
          variant={hasFilters ? "filtered" : "empty"}
          icon={<SmContrastLineIcon className="size-6" />}
          title="Nenhuma cor encontrada"
          description={hasFilters ? "Nenhum resultado para a busca ou o grupo selecionado." : "A paleta oficial ainda não foi publicada neste banco."}
          onClear={onClearFilters}
          className="border-none py-16"
        />
      )}

      {selectedColor && (
        <ColorDetail
          color={selectedColor}
          onClose={closeItem}
        />
      )}
    </>
  );
}
