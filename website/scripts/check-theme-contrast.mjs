#!/usr/bin/env node
/**
 * Verificador de contraste dos temas.
 *
 * Lê os tokens de `src/app/globals.css` (bloco `:root` = tema claro, bloco
 * `.dark` = tema escuro), resolve as referências `var()` e mede cada par
 * texto/fundo que a interface realmente usa, nos dois temas.
 *
 *   node scripts/check-theme-contrast.mjs
 *
 * Sai com código 1 se algum par ficar abaixo do alvo WCAG 2.2 AA. É um teste,
 * não um relatório: rode depois de mexer em qualquer token de cor.
 *
 * Alvos: 4,5:1 para texto normal · 3:1 para texto grande, bordas de controle,
 * ícones informativos e indicadores de foco (SC 1.4.3 e 1.4.11).
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const CSS = resolve(here, "../src/app/globals.css");

/* ── cor ─────────────────────────────────────────────────────────────── */

/** OKLCH → sRGB linear-encoded em [0,1], já com gamma sRGB aplicado. */
function oklchToSrgb(L, C, hDeg) {
  const h = (hDeg * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const lin = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  return lin.map((v) => {
    const c = Math.max(0, Math.min(1, v));
    return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
  });
}

/** `oklch(L C H)`, `oklch(L C H / A%)` ou `#RRGGBB` → `{ rgb, alpha }`. */
function parseColor(value) {
  const v = value.trim();
  if (v.startsWith("#")) {
    const h = v.slice(1);
    return { rgb: [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255), alpha: 1 };
  }
  const m = v.match(
    /oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+)(%?)\s*)?\)/,
  );
  if (!m) return null;
  const alpha = m[4] === undefined ? 1 : m[5] === "%" ? +m[4] / 100 : +m[4];
  return { rgb: oklchToSrgb(+m[1], +m[2], +m[3]), alpha };
}

/** Compõe `fg` (com alfa) sobre `bg` opaco, no espaço sRGB com gamma. */
function over(fg, bg) {
  return fg.rgb.map((c, i) => c * fg.alpha + bg.rgb[i] * (1 - fg.alpha));
}

function luminance(rgb) {
  const [r, g, b] = rgb.map((v) =>
    v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

function hex(rgb) {
  return (
    "#" +
    rgb.map((v) => Math.round(v * 255).toString(16).padStart(2, "0")).join("").toUpperCase()
  );
}

/* ── tokens ──────────────────────────────────────────────────────────── */

/** Extrai as declarações `--nome: valor;` de um bloco `seletor { … }`. */
function readBlock(css, selector) {
  const start = css.indexOf(`\n${selector} {`);
  if (start === -1) throw new Error(`bloco "${selector}" não encontrado`);
  const open = css.indexOf("{", start);
  const close = css.indexOf("\n}", open);
  const body = css.slice(open + 1, close);
  const tokens = {};
  for (const [, name, value] of body.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
    tokens[name] = value.replace(/\/\*[\s\S]*?\*\//g, "").trim();
  }
  return tokens;
}

/** Resolve `var(--x)` em cadeia até chegar a uma cor literal. */
function resolve_(tokens, name, seen = new Set()) {
  if (seen.has(name)) throw new Error(`ciclo em --${name}`);
  seen.add(name);
  const raw = tokens[name];
  if (raw === undefined) throw new Error(`--${name} não existe`);
  const ref = raw.match(/^var\(--([\w-]+)\)$/);
  if (ref) return resolve_(tokens, ref[1], seen);
  const color = parseColor(raw);
  if (!color) throw new Error(`--${name} não é uma cor medível: ${raw}`);
  return color;
}

/* ── pares a medir ───────────────────────────────────────────────────── */

/**
 * [texto, fundo, alvo, descrição, tema?]. O fundo precisa ser opaco.
 *
 * `tema` ("CLARO" ou "ESCURO") restringe o par a um tema. Serve para os casos
 * em que a cor do texto inverte junto com o fundo: o ponto de qualidade D usa
 * `bg-surface-400`, que é escuro no tema claro e claro no escuro, então a
 * letra troca de polaridade com `dark:`.
 */
const PAIRS = [
  ["foreground", "background", 4.5, "texto principal na página"],
  ["muted-foreground", "background", 4.5, "texto secundário na página"],
  ["muted-foreground", "card", 4.5, "texto secundário no card"],
  ["muted-foreground", "muted", 4.5, "texto secundário na superfície muted"],
  ["muted-foreground", "popover", 4.5, "texto secundário no popover"],
  ["card-foreground", "card", 4.5, "texto do card"],
  ["popover-foreground", "popover", 4.5, "texto do popover"],
  ["primary-foreground", "primary", 4.5, "texto do botão primário"],
  ["secondary-foreground", "secondary", 4.5, "texto do botão secundário"],
  ["accent-foreground", "accent", 4.5, "texto do item de menu em realce"],
  ["sidebar-foreground", "sidebar", 4.5, "texto da sidebar"],
  ["sidebar-accent-foreground", "sidebar-accent", 4.5, "item de sidebar em realce"],
  ["sidebar-primary-foreground", "sidebar-primary", 4.5, "item de sidebar ativo"],
  ["success-foreground", "success", 4.5, "texto sobre sucesso"],
  ["warning-foreground", "warning", 4.5, "texto sobre aviso"],
  ["info-foreground", "info", 4.5, "texto sobre informação"],
  ["destructive", "background", 4.5, "texto destrutivo na página"],
  ["destructive", "card", 4.5, "texto destrutivo no card"],
  ["destructive-emphasis", "accent", 4.5, "texto destrutivo em realce de menu"],
  ["success", "background", 4.5, "texto de sucesso na página"],
  ["warning", "background", 4.5, "texto de aviso na página"],
  ["info", "background", 4.5, "texto de informação na página"],
  ["brand-atmos-text", "background", 4.5, "marca Atmos como texto"],
  ["brand-sahara-text", "background", 4.5, "marca Sahara como texto"],
  // Texto da escala de superfície — os degraus que os componentes usam.
  ["surface-200", "background", 4.5, "text-surface-200 na página"],
  ["surface-300", "background", 4.5, "text-surface-300 na página"],
  ["surface-400", "background", 4.5, "text-surface-400 na página"],
  ["surface-500", "background", 4.5, "text-surface-500 na página"],
  ["surface-500", "surface-950", 4.5, "text-surface-500 sobre bg-surface-950"],
  ["surface-500", "surface-900", 4.5, "text-surface-500 sobre bg-surface-900"],
  ["surface-400", "surface-900", 4.5, "text-surface-400 sobre bg-surface-900"],
  // Não-texto (SC 1.4.11): foco, bordas de campo, séries de gráfico.
  ["ring", "background", 3, "anel de foco na página"],
  ["ring", "card", 3, "anel de foco no card"],
  ["sidebar-ring", "sidebar", 3, "anel de foco na sidebar"],
  ["field-border", "background", 3, "borda de campo na página"],
  ["field-border", "card", 3, "borda de campo no card"],
  ["field-border", "surface-950", 3, "borda de campo sobre bg-surface-950"],
  ["chart-1", "background", 3, "série 1 do gráfico"],
  ["chart-2", "background", 3, "série 2 do gráfico"],
  ["chart-3", "background", 3, "série 3 do gráfico"],
  ["chart-4", "background", 3, "série 4 do gráfico"],
  ["chart-5", "background", 3, "série 5 do gráfico"],
  // Ponto de qualidade do dado (DadoBadge): letra literal sobre cor de marca
  // chapada. A cor de marca não inverte com o tema, então a letra também não.
  ["absolute-black", "brand-midori", 4.5, "letra A sobre Midori"],
  ["absolute-black", "brand-sahara", 4.5, "letra B sobre Sahara"],
  ["absolute-black", "brand-atmos", 4.5, "letra C sobre Atmos"],
  ["absolute-white", "brand-cotta", 4.5, "letra E sobre Cotta"],
  ["absolute-white", "surface-400", 4.5, "letra D sobre surface-400", "CLARO"],
  ["absolute-black", "surface-400", 4.5, "letra D sobre surface-400", "ESCURO"],
  ["muted-foreground", "muted", 4.5, "letra F sobre o fundo muted"],
];

/* ── execução ────────────────────────────────────────────────────────── */

const css = readFileSync(CSS, "utf8");
const light = readBlock(css, ":root");
const dark = { ...light, ...readBlock(css, ".dark") };

let failures = 0;
let measured = 0;

for (const [label, tokens] of [
  ["CLARO", light],
  ["ESCURO", dark],
]) {
  console.log(`\n── tema ${label} ${"─".repeat(52 - label.length)}`);
  for (const [fgName, bgName, target, description, theme] of PAIRS) {
    if (theme && theme !== label) continue;
    const bg = resolve_(tokens, bgName);
    if (bg.alpha < 1) throw new Error(`--${bgName} é translúcido: não serve de fundo`);
    const fg = resolve_(tokens, fgName);
    const ratio = contrast(over(fg, bg), bg.rgb);
    const ok = ratio >= target;
    measured++;
    if (!ok) failures++;
    console.log(
      `${ok ? "  ok " : "FALHA"} ${ratio.toFixed(2).padStart(5)}:1 ` +
        `(min ${target})  ${hex(over(fg, bg))} sobre ${hex(bg.rgb)}  ${description}`,
    );
  }
}

console.log(
  failures === 0
    ? `\nTodos os ${measured} pares medidos passam nos dois temas.`
    : `\n${failures} par(es) abaixo do alvo.`,
);
process.exit(failures === 0 ? 0 : 1);
