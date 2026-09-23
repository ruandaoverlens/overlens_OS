"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DADO_GRADES, normalizeDadoGrade } from "@/lib/dado";

/**
 * Ponto de qualidade do dado, renderizado a partir de `<dado q="A" />` no
 * markdown. A letra carrega o significado sozinha (não é cor apenas), e o
 * tooltip explica qualidade e origem.
 *
 * `fonte` acrescenta um segundo ponto, marcado com "F": a afirmação tem origem
 * declarada. Quando a fonte é uma URL, o ponto vira link.
 */
export function DadoBadge({
  q,
  fonte,
  nota,
}: {
  q?: string;
  fonte?: string;
  nota?: string;
}) {
  const grade = normalizeDadoGrade(q);
  // Uma afirmação pode ter fonte declarada sem carregar classificação de
  // certeza: ali aparece só o ponto F.
  if (!grade && !fonte) return null;
  const info = grade ? DADO_GRADES[grade] : null;
  const isLink = typeof fonte === "string" && /^https?:\/\//i.test(fonte);

  return (
    <span className="ms-1.5 -my-1 inline-flex -translate-y-[0.35em] items-center gap-1 align-baseline">
      {grade && info && (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={`Qualidade do dado: ${grade}, ${info.label}. ${info.meaning}`}
            className={`inline-flex size-[2.1em] shrink-0 cursor-help items-center justify-center rounded-full font-body text-[0.9em] font-semibold leading-none transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${info.dotClass}`}
          >
            {grade}
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-64 flex-col items-start gap-0.5 text-left">
          <span className="font-semibold">
            {grade} · {info.label}
          </span>
          <span className="font-normal opacity-80">{info.meaning}</span>
          {nota && <span className="font-normal opacity-80">{nota}</span>}
          {fonte && <span className="font-normal opacity-80">Origem: {fonte}</span>}
        </TooltipContent>
      </Tooltip>
      )}

      {fonte && (
        <Tooltip>
          <TooltipTrigger asChild>
            {isLink ? (
              <a
                href={fonte}
                target="_blank"
                rel="noreferrer"
                aria-label={`Fonte: ${fonte}`}
                className="inline-flex size-[2.1em] shrink-0 items-center justify-center rounded-full bg-muted font-body text-[0.9em] font-semibold leading-none text-muted-foreground no-underline transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                F
              </a>
            ) : (
              <button
                type="button"
                aria-label={`Fonte: ${fonte}`}
                className="inline-flex size-[2.1em] shrink-0 cursor-help items-center justify-center rounded-full bg-muted font-body text-[0.9em] font-semibold leading-none text-muted-foreground transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                F
              </button>
            )}
          </TooltipTrigger>
          <TooltipContent className="max-w-64 flex-col items-start gap-0.5 text-left">
            <span className="font-semibold">Fonte</span>
            <span className="font-normal opacity-80">{fonte}</span>
          </TooltipContent>
        </Tooltip>
      )}
    </span>
  );
}
