"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SmCloseLineIcon, SmArrowOutwardLineIcon } from "@/components/icons";

// ─── Data ────────────────────────────────────────────────────

interface FontAsset {
  name: string;
  role: string;
  cssVar: string;
  fontFamily: string;
  description: string;
  history: string;
  googleFontsUrl: string;
  weights: { name: string; value: number }[];
  usage: string[];
}

const FONTS: FontAsset[] = [
  {
    name: "Outfit",
    role: "Heading / Display",
    cssVar: "--font-outfit",
    fontFamily: "var(--font-outfit), ui-sans-serif, system-ui, sans-serif",
    description:
      "Fonte primária para títulos, headlines e elementos de destaque. Geométrica, moderna, com personalidade forte.",
    history:
      "Outfit foi criada por Rodrigo Fuenzalida e lançada em 2021 pela On Brand Investments. Desenhada como uma fonte geométrica sans-serif com formas limpas e proporções generosas, Outfit nasceu para funcionar em contextos de branding onde a tipografia precisa carregar identidade sem sacrificar legibilidade. Suas formas circulares e terminações abertas dão a ela um caráter contemporâneo que equilibra seriedade e acessibilidade; exatamente o tom que a Overlens busca em seus títulos e headlines.",
    googleFontsUrl: "https://fonts.google.com/specimen/Outfit",
    weights: [
      { name: "Light", value: 300 },
      { name: "Regular", value: 400 },
      { name: "Medium", value: 500 },
      { name: "SemiBold", value: 600 },
      { name: "Bold", value: 700 },
    ],
    usage: [
      "Títulos de página (H1)",
      "Headlines de campanhas",
      "Navegação principal",
      "Botões de destaque",
      "Banners",
    ],
  },
  {
    name: "Inter",
    role: "Body / UI",
    cssVar: "--font-inter",
    fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
    description:
      "Fonte secundária para corpo de texto, interfaces e leitura contínua. Otimizada para telas, alta legibilidade.",
    history:
      "Inter foi projetada por Rasmus Andersson a partir de 2016, inicialmente sob o nome Inter UI. Nasceu de uma necessidade prática: criar uma fonte que fosse genuinamente otimizada para interfaces digitais, com altura-x elevada, formas distinguíveis e kerning ajustado pixel a pixel. Desde então, tornou-se uma das fontes mais usadas em produtos digitais no mundo. Para a Overlens, Inter representa o compromisso com clareza e funcionalidade; a ideia de que o design de interface é invisível quando funciona bem.",
    googleFontsUrl: "https://fonts.google.com/specimen/Inter",
    weights: [
      { name: "Regular", value: 400 },
      { name: "Medium", value: 500 },
      { name: "SemiBold", value: 600 },
      { name: "Bold", value: 700 },
    ],
    usage: [
      "Parágrafos e corpo de texto",
      "Labels e descrições",
      "Menus e navegação secundária",
      "Formulários",
      "Tabelas",
    ],
  },
  {
    name: "JetBrains Mono",
    role: "Code / Monospace",
    cssVar: "--font-jetbrains-mono",
    fontFamily: "var(--font-jetbrains-mono), ui-monospace, monospace",
    description:
      "Fonte monospace para blocos de código, valores técnicos e elementos que exigem alinhamento fixo.",
    history:
      "JetBrains Mono foi lançada em 2020 pela JetBrains, a empresa por trás de ferramentas como IntelliJ e WebStorm. Foi projetada especificamente para reduzir a fadiga visual durante longas sessões de programação, com altura-x aumentada, ligaduras funcionais e formas que minimizam ambiguidade entre caracteres semelhantes (como 0/O, 1/l/I). Para a Overlens, ela representa o lado técnico da criação; a precisão e o rigor que sustentam o trabalho criativo por baixo da superfície.",
    googleFontsUrl: "https://fonts.google.com/specimen/JetBrains+Mono",
    weights: [
      { name: "Regular", value: 400 },
      { name: "Medium", value: 500 },
      { name: "Bold", value: 700 },
    ],
    usage: [
      "Blocos de código",
      "Valores CSS e tokens",
      "Import statements",
      "Terminais e CLIs",
    ],
  },
];

// ─── Font Card ──────────────────────────────────────────────

function FontCard({
  asset,
  onClick,
}: {
  asset: FontAsset;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl border border-border/40 bg-accent/20 p-6 cursor-pointer hover:bg-accent/40 hover:border-border/60 transition-all text-left w-full"
    >
      <p
        className="text-[48px] leading-none text-white"
        style={{ fontFamily: asset.fontFamily }}
      >
        Aa
      </p>
      <p className="mt-4 text-sm text-white/50 leading-relaxed line-clamp-2">
        {asset.history.slice(0, 120)}...
      </p>
      <div className="mt-4 border-t border-white/10 pt-3">
        <p className="text-sm font-medium text-white">{asset.name}</p>
        <p className="text-xs text-white/50 mt-0.5">{asset.role}</p>
      </div>
    </button>
  );
}

// ─── Fullscreen Modal ────────────────────────────────────────

function FontModal({
  asset,
  onClose,
}: {
  asset: FontAsset;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-y-auto animate-in fade-in duration-200">
      {/* Top bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-black/90 backdrop-blur-sm">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white/80 truncate">
            {asset.name}
          </p>
          <p className="text-xs text-white/40 mt-0.5">{asset.role}</p>
        </div>
        <div className="flex items-center gap-2 ml-4">
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

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-10">
        {/* Large specimen */}
        <div>
          <p
            className="text-[48px] leading-none text-white"
            style={{ fontFamily: asset.fontFamily }}
          >
            {asset.name}
          </p>
        </div>

        {/* History */}
        <section className="space-y-3">
          <p className="text-xs text-white/40 uppercase tracking-wider">
            História
          </p>
          <p className="text-sm text-white/70 leading-relaxed">
            {asset.history}
          </p>
        </section>

        {/* Weights */}
        <section className="space-y-3">
          <p className="text-xs text-white/40 uppercase tracking-wider">
            Pesos disponíveis
          </p>
          <div className="space-y-4">
            {asset.weights.map((w) => (
              <div
                key={w.value}
                className="flex items-baseline gap-4 border-b border-white/5 pb-3"
              >
                <span className="text-xs text-white/40 w-24 shrink-0 font-mono">
                  {w.value} {w.name}
                </span>
                <p
                  className="text-base text-white truncate"
                  style={{
                    fontFamily: asset.fontFamily,
                    fontWeight: w.value,
                  }}
                >
                  The quick brown fox jumps over the lazy dog
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Description */}
        <section className="space-y-3">
          <p className="text-xs text-white/40 uppercase tracking-wider">
            Papel no sistema
          </p>
          <p className="text-sm text-white/70 leading-relaxed text-balance">
            {asset.description}
          </p>
        </section>

        {/* CSS Variable */}
        <section className="space-y-3">
          <p className="text-xs text-white/40 uppercase tracking-wider">
            Variável CSS
          </p>
          <code className="block text-sm text-white bg-white/5 rounded-lg px-4 py-3 font-mono">
            font-family: var({asset.cssVar});
          </code>
        </section>

        {/* Usage */}
        <section className="space-y-3">
          <p className="text-xs text-white/40 uppercase tracking-wider">
            Diretrizes de uso
          </p>
          <ul className="space-y-1.5">
            {asset.usage.map((item) => (
              <li
                key={item}
                className="text-sm text-white/70 flex items-start gap-2"
              >
                <span className="text-white/30 mt-1 shrink-0">--</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Google Fonts link */}
        <Button variant="default" size="sm" className="bg-[var(--surface-200)] text-background hover:bg-[var(--surface-300)]" asChild>
          <a href={asset.googleFontsUrl} target="_blank" rel="noopener noreferrer">
            Google Fonts
          </a>
        </Button>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────

export function TypographyBank() {
  const [selected, setSelected] = useState<FontAsset | null>(null);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {FONTS.map((asset) => (
          <FontCard
            key={asset.name}
            asset={asset}
            onClick={() => setSelected(asset)}
          />
        ))}
      </div>

      {selected && (
        <FontModal asset={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
