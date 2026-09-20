/**
 * Normalização de texto para busca em pt-BR.
 *
 * Remove acentos (decomposição NFD + corte da faixa de diacríticos) e baixa a
 * caixa, para que "video" encontre "vídeo", "icone" encontre "ícone" e
 * "simbolo" encontre "Símbolo".
 *
 * ```ts
 * const needle = normalizeText(search) // normalize o termo uma vez
 * items.filter((i) => matchesNormalized(i.title, needle))
 * ```
 */
export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
}

/**
 * Verdadeiro quando `haystack` contém `needle`, ignorando acento e caixa.
 *
 * `needle` deve vir de `normalizeText` (normalizar o termo a cada item seria
 * trabalho repetido); um termo vazio casa com tudo.
 */
export function matchesNormalized(haystack: string, needle: string): boolean {
  if (!needle) return true
  return normalizeText(haystack).includes(needle)
}
