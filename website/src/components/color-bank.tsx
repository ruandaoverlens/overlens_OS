"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { SmCloseLineIcon } from "@/components/icons";
import { useFavorites } from "@/lib/favorites";
import { FavoriteButton } from "@/components/favorite-button";

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
      onClick={handleCopy}
      className="flex items-center justify-between w-full px-4 py-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] transition-colors text-left group"
    >
      <span className="text-xs text-[var(--surface-400)] uppercase tracking-wider">
        {label}
      </span>
      <span className="text-sm text-white font-mono">
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
  const [hex, setHex] = useState("");

  useEffect(() => {
    setHex(oklchToHex(color.oklch));
  }, [color.oklch]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white/80 truncate">{color.name}</p>
          <p className="text-xs text-white/40 mt-0.5">{color.family}</p>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white/60 hover:text-white hover:bg-white/10"
          >
            <SmCloseLineIcon />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-6 pb-10">
        {/* Large swatch */}
        <div
          className="h-48 w-full max-w-md rounded-2xl mx-auto mb-8"
          style={{ backgroundColor: color.oklch }}
        />

        {/* Info grid */}
        <div className="max-w-md mx-auto flex flex-col gap-2">
          <CopyRow label="Nome" value={color.name} />
          <CopyRow label="Família" value={color.family} />
          <div className="px-4 py-3 rounded-lg bg-white/[0.04]">
            <span className="text-xs text-[var(--surface-400)] uppercase tracking-wider block">
              Descrição
            </span>
            <p className="text-sm text-white mt-[12px] leading-relaxed">
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
    </div>
  );
}

// ─── Luminance helper ────────────────────────────────────────

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
  onClick,
  isFavorite,
  onToggleFavorite,
}: {
  color: BrandColor;
  onClick: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  const textColor = getTextColor(color.oklch);

  return (
    <div
      onClick={onClick}
      className="rounded-xl overflow-hidden cursor-pointer hover:scale-[1.03] transition-all h-32 flex flex-col justify-end p-3 relative group"
      style={{ backgroundColor: color.oklch, color: textColor }}
    >
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <FavoriteButton isFavorite={isFavorite} onClick={() => onToggleFavorite()} />
      </div>
      <span className="text-sm font-medium">{color.name}</span>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────

export function ColorBank() {
  const [selectedColor, setSelectedColor] = useState<BrandColor | null>(null);
  const { isFavorite, toggleFavorite } = useFavorites();

  return (
    <>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {COLORS.map((color) => (
          <ColorCard
            key={color.name}
            color={color}
            onClick={() => setSelectedColor(color)}
            isFavorite={isFavorite(color.name)}
            onToggleFavorite={() => toggleFavorite({ id: color.name, type: "color", title: color.name, subtitle: color.family, thumbnail: color.oklch })}
          />
        ))}
      </div>

      {selectedColor && (
        <ColorDetail
          color={selectedColor}
          onClose={() => setSelectedColor(null)}
        />
      )}
    </>
  );
}
