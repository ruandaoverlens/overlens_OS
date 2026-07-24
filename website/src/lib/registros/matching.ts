// Matching determinístico de marcas para o Radar RPI.
//
// Sem dependências externas: normalização, distância de edição (Levenshtein),
// um algoritmo fonético simplificado para português brasileiro (estilo
// Metaphone-BR) e a função de avaliação de similaridade que combina os três.
//
// O objetivo é levantar CANDIDATOS auditáveis e baratos — a decisão final é
// sempre humana (e a triagem de risco é feita por IA numa etapa posterior).

export type TipoMatch = "exato" | "fonetico" | "edicao";

export interface ResultadoSimilaridade {
  tipoMatch: TipoMatch;
  /** 0..1 — quanto maior, mais forte o indício de colidência. */
  score: number;
}

// Sufixos societários/genéricos removidos ao normalizar titulares.
const SUFIXOS_GENERICOS = [
  "LTDA",
  "EPP",
  "EIRELI",
  "ME",
  "MEI",
  "SA",
  "S A",
  "S/A",
  "CIA",
  "COMPANHIA",
  "INC",
  "LLC",
  "CORP",
  "GROUP",
  "GRUPO",
  "HOLDING",
];

/**
 * Uppercase, remove acentos (NFD), colapsa pontuação e espaços.
 * Quando `removerSufixos` é true (uso em titulares), tira sufixos societários
 * genéricos do fim do nome (LTDA, ME, S/A, ...).
 */
export function normalizar(nome: string, removerSufixos = false): string {
  if (!nome) return "";
  let s = nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove diacriticos
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, " ") // pontuação -> espaço
    .replace(/\s+/g, " ")
    .trim();

  if (removerSufixos && s) {
    let mudou = true;
    while (mudou) {
      mudou = false;
      for (const suf of SUFIXOS_GENERICOS) {
        if (s === suf) continue;
        if (s.endsWith(" " + suf)) {
          s = s.slice(0, -(suf.length + 1)).trim();
          mudou = true;
        }
      }
    }
  }

  return s;
}

/**
 * Distância de edição de Levenshtein, iterativa, O(n·m) tempo e O(m) espaço.
 */
export function distanciaEdicao(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let anterior = new Array<number>(b.length + 1);
  let atual = new Array<number>(b.length + 1);

  for (let j = 0; j <= b.length; j++) anterior[j] = j;

  for (let i = 1; i <= a.length; i++) {
    atual[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const custo = a[i - 1] === b[j - 1] ? 0 : 1;
      atual[j] = Math.min(
        anterior[j] + 1, // deleção
        atual[j - 1] + 1, // inserção
        anterior[j - 1] + custo, // substituição
      );
    }
    [anterior, atual] = [atual, anterior];
  }

  return anterior[b.length];
}

/**
 * Algoritmo fonético simplificado para português brasileiro (estilo
 * Metaphone-BR). É uma APROXIMAÇÃO — não segue um padrão formal publicado;
 * aplica as substituições clássicas de som para agrupar grafias que soam igual
 * ("OVERLENS"/"OVERLENZ", "CIDADE"/"SIDADE"). Suficiente para levantar
 * candidatos; falsos positivos são filtrados na triagem humana/IA.
 *
 * Passos (na ordem):
 *  - normaliza (uppercase, sem acento, só A-Z)
 *  - dígrafos: PH->F, LH->1, NH->3, CH->X, RR->R, SS->S, SC->S, QU->K, GU->G
 *  - C(e,i)->S, Ç->S, C(a,o,u)->K, C final/outro->K
 *  - G(e,i)->J
 *  - X->X (som "ch")
 *  - W->V, Y->I, Z->S, H mudo removido
 *  - colapsa consoantes duplicadas
 *  - remove vogais átonas exceto a inicial
 */
export function fonetico(nome: string): string {
  let s = normalizar(nome).replace(/[^A-Z]/g, "");
  if (!s) return "";

  // Dígrafos e combinações (antes das regras de letra única).
  s = s
    .replace(/PH/g, "F")
    .replace(/LH/g, "1")
    .replace(/NH/g, "3")
    .replace(/CH/g, "X")
    .replace(/SH/g, "X")
    .replace(/RR/g, "R")
    .replace(/SS/g, "S")
    .replace(/SC/g, "S")
    .replace(/SÇ/g, "S")
    .replace(/XC/g, "S")
    .replace(/QU/g, "K")
    .replace(/GU([EI])/g, "G$1");

  // C dependente de vogal seguinte.
  s = s
    .replace(/C([EI])/g, "S$1")
    .replace(/Ç/g, "S")
    .replace(/C/g, "K");

  // G brando antes de E/I.
  s = s.replace(/G([EI])/g, "J$1");

  // Letras equivalentes.
  s = s
    .replace(/W/g, "V")
    .replace(/Y/g, "I")
    .replace(/Z/g, "S")
    .replace(/K/g, "K")
    .replace(/H/g, ""); // H mudo restante

  // Restaura marcadores de dígrafo para letras.
  s = s.replace(/1/g, "L").replace(/3/g, "N");

  // Colapsa consoantes duplicadas consecutivas.
  s = s.replace(/([BCDFGJKLMNPQRSTVX])\1+/g, "$1");

  if (s.length <= 2) return s;

  // Remove vogais átonas do MEIO da palavra; preserva a primeira e a última
  // letra (a terminação — vogal ou consoante — distingue pares como
  // "NEXIALIST" vs "NEXIALISTA", que caem então na distância de edição).
  const primeira = s[0];
  const ultima = s[s.length - 1];
  const meio = s.slice(1, -1).replace(/[AEIOU]/g, "");

  return (primeira + meio + ultima).replace(/\s+/g, "");
}

/**
 * Avalia a similaridade entre o nome de uma publicação (candidato da RPI) e uma
 * marca nossa. Retorna o tipo de match mais forte encontrado e um score 0..1,
 * ou `null` quando não há indício relevante.
 *
 * Regras:
 *  - normalizado igual                       -> 'exato'  (1.0)
 *  - nossa marca contida como palavra         -> 'fonetico' (>= 0.85)
 *  - fonético igual                           -> 'fonetico' (0.9)
 *  - distância de edição normalizada >= 0.75  -> 'edicao'  (score = valor)
 */
export function avaliarSimilaridade(
  candidato: string,
  nossaMarca: string,
): ResultadoSimilaridade | null {
  const c = normalizar(candidato);
  const n = normalizar(nossaMarca);
  if (!c || !n) return null;

  // 1) Igualdade exata pós-normalização (ignorando espaços: "OVER LENS" =
  //    "OVERLENS").
  const cSemEsp = c.replace(/ /g, "");
  const nSemEsp = n.replace(/ /g, "");
  if (c === n || cSemEsp === nSemEsp) {
    return { tipoMatch: "exato", score: 1 };
  }

  // 2) Contenção como palavra inteira (nossa marca dentro do nome candidato).
  //    Ex.: "OVERLENS DESIGN" contém "OVERLENS".
  const palavras = c.split(" ");
  if (n.split(" ").length === 1 && palavras.includes(n)) {
    return { tipoMatch: "fonetico", score: 0.85 };
  }
  // Contenção sem espaço (juntou palavras): "OVERLENSBR" contém "OVERLENS".
  if (n.length >= 4 && c.replace(/ /g, "").includes(n.replace(/ /g, ""))) {
    return { tipoMatch: "fonetico", score: 0.85 };
  }

  // 3) Igualdade fonética.
  const fc = fonetico(candidato);
  const fn = fonetico(nossaMarca);
  if (fc && fn && fc === fn) {
    return { tipoMatch: "fonetico", score: 0.9 };
  }

  // 4) Distância de edição normalizada.
  const semEspacoC = c.replace(/ /g, "");
  const semEspacoN = n.replace(/ /g, "");
  const dist = distanciaEdicao(semEspacoC, semEspacoN);
  const maxLen = Math.max(semEspacoC.length, semEspacoN.length);
  if (maxLen > 0) {
    const sim = 1 - dist / maxLen;
    if (sim >= 0.75) {
      return { tipoMatch: "edicao", score: Number(sim.toFixed(3)) };
    }
  }

  return null;
}
