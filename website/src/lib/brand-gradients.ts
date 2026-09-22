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

/**
 * Lightness OKLCH de cada token `--brand-*`, copiada de `globals.css`. Existe
 * porque o gradiente é montado com `var()` e `color-mix()`: a string não carrega
 * cor nenhuma, então nada consegue medir a luminância dela em runtime sem pedir
 * ao navegador. Ao mudar um token em `globals.css`, atualize o valor aqui.
 */
const BRAND_LIGHTNESS: Record<string, number> = {
  atmos: 0.779,
  kobold: 0.477,
  bleu: 0.622,
  midori: 0.585,
  sahara: 0.751,
  boreal: 0.462,
  cotta: 0.42,
  antar: 0.893,
  azzay: 0.605,
  cloro: 0.911,
  arena: 0.944,
  carota: 0.722,
  khewra: 0.646,
  nubia: 0.902,
  calla: 0.863,
}

/** Acima disto, um fundo pede texto escuro. */
const LIGHT_THRESHOLD = 0.6

/**
 * O `white` aqui é literal de propósito: a paleta `--brand-*` não segue o tema
 * e estes gradientes são claros nos dois — trocar por um token que inverte
 * escureceria o banner no tema escuro e quebraria o texto escuro por cima.
 */
function tint(name: string, pct: number): string {
  return `color-mix(in oklab, var(--brand-${name}) ${pct}%, white)`
}

export const BRAND_GRADIENTS: string[] = BRAND_ORDER.map(
  (name) =>
    `linear-gradient(135deg, var(--brand-${name}) 0%, ${tint(name, 60)} 50%, ${tint(name, 25)} 100%)`
)

/** Nome do token de marca dentro de um gradiente gerado aqui. */
function brandNameOf(gradient: string): string | null {
  return gradient.match(/var\(--brand-([a-z]+)\)/)?.[1] ?? null
}

/**
 * O gradiente inteiro é claro? Usa a média das três paradas — a cor cheia e as
 * duas misturas com branco. Como toda parada clareia, quase toda a marca cai
 * aqui: por isso o texto sobre o banner é escuro.
 */
export function isLightBrandGradient(gradient: string): boolean {
  const name = brandNameOf(gradient)
  const lightness = name ? BRAND_LIGHTNESS[name] : undefined
  if (lightness === undefined) return false
  // Paradas: L, 0.6L + 0.4, 0.25L + 0.75 (mistura com branco em oklab).
  return (lightness + (0.6 * lightness + 0.4) + (0.25 * lightness + 0.75)) / 3 > LIGHT_THRESHOLD
}

/**
 * A cor cheia do gradiente é clara? É o pior caso de contraste para algo
 * pequeno desenhado por cima (o glifo de um ícone), que a animação do
 * gradiente cedo ou tarde coloca sobre a parada de 0%.
 */
export function isLightBrandBase(gradient: string): boolean {
  const name = brandNameOf(gradient)
  const lightness = name ? BRAND_LIGHTNESS[name] : undefined
  if (lightness === undefined) return true
  return lightness > LIGHT_THRESHOLD
}

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
