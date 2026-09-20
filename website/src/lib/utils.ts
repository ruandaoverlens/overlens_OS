import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

/**
 * `twMerge` só conhece a escala padrão do Tailwind. Os tokens semânticos do
 * design system (`text-display`, `rounded-card`, …) caem no grupo errado — por
 * exemplo `text-h2` é lido como *cor* de texto e entra em conflito com
 * `text-foreground`, fazendo um dos dois ser descartado em runtime.
 *
 * Registrar os tokens aqui mantém o merge correto: tamanho de fonte compete só
 * com tamanho de fonte, raio com raio, e cor com cor.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        { text: ["display", "h1", "h2", "h3", "lead", "body", "caption"] },
      ],
      rounded: [
        { rounded: ["card", "card-inner", "prompt", "field", "field-sm"] },
      ],
      shadow: [{ shadow: ["popover"] }],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
