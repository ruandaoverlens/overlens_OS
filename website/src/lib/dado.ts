/**
 * Classificação de certeza da base de conhecimento.
 *
 * Toda afirmação estratégica carrega uma letra que diz o quanto ela é verdade
 * hoje. No markdown a marcação é inline: `<dado q="A" />`, opcionalmente com
 * `fonte` (de onde veio) e `nota` (uma linha de contexto). A letra substitui o
 * texto antigo ("**DEFINIDO.**"), e a explicação vive no tooltip.
 *
 * A ordem A → E é confiabilidade como verdade atual, não importância.
 */

export type DadoGrade = "A" | "B" | "C" | "D" | "E";

export interface DadoGradeInfo {
  /** Rótulo histórico, ainda usado em conversa e nas regras. */
  label: string;
  /** O que a letra significa, em uma frase. */
  meaning: string;
  /** Classes do ponto: tinta de fundo e borda na cor de marca. */
  dotClass: string;
}

export const DADO_GRADES: Record<DadoGrade, DadoGradeInfo> = {
  A: {
    label: "DEFINIDO",
    meaning: "Decisão tomada e atualmente válida.",
    dotClass: "border-brand-midori/70 bg-brand-midori/20",
  },
  B: {
    label: "EM VALIDAÇÃO",
    meaning: "Direção em teste, com evidência parcial.",
    dotClass: "border-brand-sahara/70 bg-brand-sahara/20",
  },
  C: {
    label: "HIPÓTESE",
    meaning: "Possibilidade ainda não validada.",
    dotClass: "border-brand-atmos/70 bg-brand-atmos/20",
  },
  D: {
    label: "HISTÓRICO",
    meaning: "Já foi verdadeiro; não representa a direção atual.",
    dotClass: "border-surface-400/70 bg-surface-400/20",
  },
  E: {
    label: "PENDENTE",
    meaning: "Precisa existir e ainda não existe.",
    dotClass: "border-brand-cotta/70 bg-brand-cotta/25",
  },
};

export const DADO_GRADE_ORDER: DadoGrade[] = ["A", "B", "C", "D", "E"];

export function isDadoGrade(value: unknown): value is DadoGrade {
  return typeof value === "string" && value.toUpperCase() in DADO_GRADES;
}

export function normalizeDadoGrade(value: unknown): DadoGrade | null {
  if (typeof value !== "string") return null;
  const upper = value.trim().toUpperCase();
  return isDadoGrade(upper) ? (upper as DadoGrade) : null;
}

const DADO_TAG_RE = /<dado\b([^>]*?)\/?>(?:<\/dado>)?/gi;
const ATTR_RE = /(\w+)\s*=\s*"([^"]*)"/g;

function readAttrs(raw: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  let match: RegExpExecArray | null;
  ATTR_RE.lastIndex = 0;
  while ((match = ATTR_RE.exec(raw)) !== null) {
    attrs[match[1].toLowerCase()] = match[2];
  }
  return attrs;
}

/**
 * Devolve a letra ao formato textual antes de o markdown virar contexto de IA
 * ou texto de busca: um modelo lê melhor `[DEFINIDO]` do que uma tag HTML.
 */
export function expandDadoTags(markdown: string): string {
  return markdown.replace(DADO_TAG_RE, (_match, rawAttrs: string) => {
    const attrs = readAttrs(rawAttrs);
    const grade = normalizeDadoGrade(attrs.q);
    const parts: string[] = [];
    if (grade) parts.push(DADO_GRADES[grade].label);
    if (attrs.nota) parts.push(attrs.nota);
    if (attrs.fonte) parts.push(`fonte: ${attrs.fonte}`);
    if (parts.length === 0) return "";
    return `[${parts.join(" · ")}]`;
  });
}

/** Remove as tags sem deixar rastro (preview, resumo, texto de busca). */
export function stripDadoTags(markdown: string): string {
  return markdown.replace(DADO_TAG_RE, "").replace(/ {2,}/g, " ");
}

/**
 * `<dado q="A" />` é auto-fechada no markdown, mas `dado` não é um elemento
 * vazio conhecido do HTML: o parser do rehype-raw ignora a barra e passa a
 * tratar o resto do parágrafo como filho da tag, engolindo o texto. Fechar a
 * tag explicitamente antes do parse devolve o texto ao lugar.
 */
export function normalizeDadoTags(markdown: string): string {
  return markdown.replace(
    /<dado\b([^>]*?)\s*\/?>(?:\s*<\/dado>)?/gi,
    (_match, rawAttrs: string) => {
      const attrs = rawAttrs.trim();
      return `<dado${attrs ? ` ${attrs}` : ""}></dado>`;
    },
  );
}
