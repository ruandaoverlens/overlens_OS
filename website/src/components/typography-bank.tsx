"use client";

import { useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/empty-state";
import { SmCloseLineIcon, SmDocLineIcon, SmDownloadLineIcon, SmClipsLineIcon } from "@/components/icons";
import { notify } from "@/lib/notifications";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useLightboxItem } from "@/components/asset-page-shell";
import { normalizeText, matchesNormalized } from "@/lib/normalize-text";
import { HeadingTitle } from "@/components/ui/heading";

// ─── Data ────────────────────────────────────────────────────

interface FontFile {
  label: string;
  href: string;
}

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
  /** Arquivos para download (quando hospedados). */
  files?: FontFile[];
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

/** `needle` já vem de `normalizeText` — normalizar por item seria trabalho repetido. */
function matchesSearch(asset: FontAsset, needle: string): boolean {
  const q = needle;
  if (!q) return true;
  return (
    matchesNormalized(asset.name, q) ||
    matchesNormalized(asset.role, q) ||
    matchesNormalized(asset.description, q) ||
    asset.usage.some((u) => matchesNormalized(u, q))
  );
}

function cssSnippet(asset: FontAsset): string {
  return `font-family: var(${asset.cssVar});`;
}

async function copyCss(asset: FontAsset) {
  try {
    await navigator.clipboard.writeText(cssSnippet(asset));
    notify.success("CSS copiado", { description: cssSnippet(asset) });
  } catch (err) {
    notify.fromError(err, "Não foi possível copiar");
  }
}

// ─── Font Card ──────────────────────────────────────────────

function FontCard({
  asset,
  onClick,
}: {
  asset: FontAsset;
  onClick: () => void;
}) {
  return (
    <div className="group relative rounded-xl border border-border/40 bg-accent/20 hover:bg-accent/40 hover:border-border/60 transition-all">
      <button
        type="button"
        onClick={onClick}
        aria-label={`Abrir ${asset.name}`}
        className="block w-full rounded-xl p-6 cursor-pointer text-left outline-none focus-visible:ring-2 focus-visible:ring-foreground"
      >
        <p
          className="text-5xl leading-none text-foreground"
          style={{ fontFamily: asset.fontFamily }}
          aria-hidden="true"
        >
          Aa
        </p>
        <p className="mt-4 text-sm text-surface-500 leading-relaxed line-clamp-2">
          {asset.history.slice(0, 120)}…
        </p>
        <div className="mt-4 border-t border-border pt-3">
          <p className="text-sm font-medium text-foreground">{asset.name}</p>
          <p className="text-xs text-surface-500 mt-0.5">{asset.role}</p>
        </div>
      </button>
      {/* Ação: irmã do botão principal (nunca botão dentro de botão). */}
      {/* Overlay invisível não captura toque: no touch fica sempre visível. */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto focus-visible:opacity-100 pointer-coarse:opacity-100 pointer-coarse:pointer-events-auto">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label={`Copiar CSS de ${asset.name}`}
          onClick={() => void copyCss(asset)}
          className="rounded-full bg-surface-900 text-surface-300 hover:bg-surface-800 hover:text-foreground"
        >
          <SmClipsLineIcon className="size-4" />
          <span>Copiar CSS</span>
        </Button>
      </div>
    </div>
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
  const handleCopyCss = () => void copyCss(asset);

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        showCloseButton={false}
        className="max-w-none sm:max-w-none max-h-none w-screen h-svh rounded-none p-0 bg-background border-0 flex flex-col gap-0 overflow-hidden"
      >
        <DialogTitle className="sr-only">{asset.name}</DialogTitle>
        <DialogDescription className="sr-only">
          Ficha da fonte {asset.role}: história, pesos, variável CSS e diretrizes de uso. Use Esc para fechar.
        </DialogDescription>

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 shrink-0 bg-background/90 backdrop-blur-sm">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-surface-200 truncate">
              {asset.name}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{asset.role}</p>
          </div>
          <div className="flex items-center gap-2 ml-4">
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="max-w-3xl mx-auto px-6 py-10 space-y-10">
            {/* Large specimen */}
            <div>
              <p
                className="text-5xl leading-none text-foreground"
                style={{ fontFamily: asset.fontFamily }}
              >
                {asset.name}
              </p>
            </div>

            {/* History */}
            <section className="space-y-3">
              <HeadingTitle as="h2" size="eyebrow">História</HeadingTitle>
              <p className="text-sm text-surface-300 leading-relaxed">
                {asset.history}
              </p>
            </section>

            {/* Weights */}
            <section className="space-y-3">
              <HeadingTitle as="h2" size="eyebrow">Pesos disponíveis</HeadingTitle>
              <div className="space-y-4">
                {asset.weights.map((w) => (
                  <div
                    key={w.value}
                    className="flex items-baseline gap-4 border-b border-border pb-3"
                  >
                    <span className="text-xs text-muted-foreground w-24 shrink-0 font-mono">
                      {w.value} {w.name}
                    </span>
                    <p
                      className="text-base text-foreground truncate"
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
              <HeadingTitle as="h2" size="eyebrow">Papel no sistema</HeadingTitle>
              <p className="text-sm text-surface-300 leading-relaxed text-balance">
                {asset.description}
              </p>
            </section>

            {/* CSS Variable */}
            <section className="space-y-3">
              <HeadingTitle as="h2" size="eyebrow">Variável CSS</HeadingTitle>
              <div className="flex items-center gap-2">
                <code className="flex-1 block text-sm text-foreground bg-surface-950 rounded-lg px-4 py-3 font-mono">
                  {cssSnippet(asset)}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyCss}
                  aria-label={`Copiar CSS de ${asset.name}`}
                >
                  <span>Copiar CSS</span>
                </Button>
              </div>
            </section>

            {/* Usage */}
            <section className="space-y-3">
              <HeadingTitle as="h2" size="eyebrow">Diretrizes de uso</HeadingTitle>
              <ul className="space-y-1.5">
                {asset.usage.map((item) => (
                  <li
                    key={item}
                    className="text-sm text-surface-300 flex items-start gap-2"
                  >
                    <span className="text-muted-foreground mt-1 shrink-0" aria-hidden="true">--</span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            {/* Downloads */}
            {asset.files && asset.files.length > 0 && (
              <section className="space-y-3">
                <HeadingTitle as="h2" size="eyebrow">Arquivos</HeadingTitle>
                <div className="flex flex-wrap gap-2">
                  {asset.files.map((file) => (
                    <Button key={file.href} variant="secondary" size="sm" asChild>
                      <a href={file.href} download aria-label={`Baixar ${asset.name} (${file.label})`}>
                        <SmDownloadLineIcon />
                        <span>{file.label}</span>
                      </a>
                    </Button>
                  ))}
                </div>
              </section>
            )}

            {/* Google Fonts link */}
            <Button variant="default" size="sm" asChild>
              <a href={asset.googleFontsUrl} target="_blank" rel="noopener noreferrer">
                Google Fonts
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ──────────────────────────────────────────

export function TypographyBank({
  search = "",
  onClearFilters,
  onCountChange,
}: {
  search?: string;
  onClearFilters?: () => void;
  /** Quantidade de fontes visíveis após a busca (para o contador do shell). */
  onCountChange?: (count: number) => void;
} = {}) {
  // A fonte aberta vive na URL (?item=<nome>) para ser compartilhável.
  const [selectedId, openItem, closeItem] = useLightboxItem();

  const selected = useMemo(
    () => FONTS.find((f) => f.name === selectedId) ?? null,
    [selectedId],
  );

  // Nome inexistente na lista: limpa a chave da URL.
  useEffect(() => {
    if (selectedId && !selected) closeItem();
  }, [selectedId, selected, closeItem]);

  const visibleFonts = useMemo(() => {
    // Busca insensível a acento: "codigo" encontra "código".
    const needle = normalizeText(search);
    return FONTS.filter((f) => matchesSearch(f, needle));
  }, [search]);
  const hasFilters = search.trim().length > 0;

  useEffect(() => {
    onCountChange?.(visibleFonts.length);
  }, [visibleFonts.length, onCountChange]);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleFonts.map((asset) => (
          <FontCard
            key={asset.name}
            asset={asset}
            onClick={() => openItem(asset.name)}
          />
        ))}
      </div>

      {visibleFonts.length === 0 && (
        <EmptyState
          variant={hasFilters ? "filtered" : "empty"}
          icon={<SmDocLineIcon className="size-6" />}
          title="Nenhuma fonte encontrada"
          description={hasFilters ? "Nenhum resultado para a busca." : "As fontes do sistema ainda não foram publicadas neste banco."}
          onClear={onClearFilters}
          className="border-none py-16"
        />
      )}

      {selected && (
        <FontModal asset={selected} onClose={closeItem} />
      )}
    </div>
  );
}
