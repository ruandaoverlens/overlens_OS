"use client";

import { useEffect, useRef, useState } from "react";

const TYPE_MS = 55;
const ERASE_MS = 25;
/** Quanto tempo a frase inteira fica parada antes de ser apagada. */
const HOLD_MS = 2600;
/** Respiro entre apagar uma frase e começar a próxima. */
const PAUSE_MS = 500;

/** Ordem aleatória sem repetir enquanto a volta não termina. */
function shuffle<T>(items: T[]): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** De quantas em quantas frases o título da página volta a aparecer. */
const ANCHOR_EVERY = 3;

/** Título da página + frases sorteadas, com o título voltando a cada 3. */
function buildCycle(anchor: string, phrases: string[]): string[] {
  const out: string[] = [];
  shuffle(phrases).forEach((phrase, i) => {
    if (i % ANCHOR_EVERY === 0) out.push(anchor);
    out.push(phrase);
  });
  return out.length > 0 ? out : [anchor];
}

/**
 * Título que digita e apaga: abre com o título da página, segue pelas frases em
 * ordem sorteada e volta ao título a cada três delas.
 *
 * O título é o que o servidor renderiza e o que fica parado quando a animação
 * não pode rodar; é também o texto lido por leitores de tela, no lugar do texto
 * em movimento.
 */
export function TypewriterHeading({
  anchor,
  phrases,
  className,
}: {
  /** Título da página: abre o ciclo e reaparece a cada três frases. */
  anchor: string;
  phrases: string[];
  className?: string;
}) {
  const [typed, setTyped] = useState(anchor);
  // Só anima no cliente: no servidor (e com movimento reduzido) o título fica
  // parado na primeira frase, que já é a versão completa.
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (phrases.length === 0) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    setAnimating(true);
  }, [phrases.length]);

  // O ciclo lê as frases por referência: como a lista costuma ser montada
  // inline pelo chamador, depender dela no efeito o reiniciaria a cada letra.
  const phrasesRef = useRef(phrases);
  phrasesRef.current = phrases;
  const anchorRef = useRef(anchor);
  anchorRef.current = anchor;
  const phrasesKey = phrases.join("|");

  useEffect(() => {
    if (!animating) return;

    const all = phrasesRef.current;
    // A tela já mostra o título (posição 0 do ciclo), então a animação começa
    // apagando-o para digitar a primeira frase sorteada.
    let cycle = buildCycle(anchorRef.current, all);
    let cancelled = false;
    let handle: ReturnType<typeof setTimeout>;
    let index = 0;
    let length = cycle[0].length;
    let erasing = true;

    const step = () => {
      if (cancelled) return;
      const phrase = cycle[index];

      if (erasing) {
        if (length > 0) {
          length -= 1;
          setTyped(phrase.slice(0, length));
          handle = setTimeout(step, ERASE_MS);
          return;
        }
        erasing = false;
        index += 1;
        if (index >= cycle.length) {
          // Nova volta, nova ordem das frases.
          cycle = buildCycle(anchorRef.current, all);
          index = 0;
        }
        handle = setTimeout(step, PAUSE_MS);
        return;
      }

      if (length < phrase.length) {
        length += 1;
        setTyped(phrase.slice(0, length));
        handle = setTimeout(step, TYPE_MS);
        return;
      }

      erasing = true;
      handle = setTimeout(step, HOLD_MS);
    };

    handle = setTimeout(step, HOLD_MS);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [animating, anchor, phrasesKey]);

  return (
    <h1 className={className}>
      {/* O texto animado muda caractere a caractere; um leitor de tela que o
          seguisse leria letra por letra. Ele fica escondido e o título real
          aparece uma vez, silencioso na tela. */}
      <span aria-hidden="true">{typed}</span>
      {animating && (
        <span
          aria-hidden="true"
          className="ml-0.5 inline-block w-[0.06em] translate-y-[0.08em] self-stretch bg-current align-baseline motion-safe:animate-[caret-blink_1.1s_steps(1)_infinite]"
          style={{ height: "0.9em" }}
        />
      )}
      <span className="sr-only">{anchor}</span>
    </h1>
  );
}
