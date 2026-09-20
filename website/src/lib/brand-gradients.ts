/**
 * Gradientes de marca construídos a partir dos tokens `--brand-*` (globals.css).
 * Reproduzem a paleta clara do PageBanner: cor cheia → tom médio → tom pastel,
 * via `color-mix` com branco. Como usam `var()`, seguem qualquer ajuste de token.
 */

const BRAND_ORDER = [
  "atmos",
  "sahara",
  "midori",
  "boreal",
  "kobold",
  "carota",
  "bleu",
  "cloro",
  "khewra",
  "calla",
  "azzay",
  "nubia",
] as const

function tint(name: string, pct: number): string {
  return `color-mix(in oklab, var(--brand-${name}) ${pct}%, white)`
}

export const BRAND_GRADIENTS: string[] = BRAND_ORDER.map(
  (name) =>
    `linear-gradient(135deg, var(--brand-${name}) 0%, ${tint(name, 60)} 50%, ${tint(name, 25)} 100%)`
)

function hashSeed(seed: string | number): number {
  if (typeof seed === "number") return Math.abs(Math.trunc(seed))
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

/** Gradiente determinístico para um seed (string ou número). */
export function getGradient(seed: string | number): string {
  return BRAND_GRADIENTS[hashSeed(seed) % BRAND_GRADIENTS.length]
}
