import { cache } from "react";
import { flattenForCitation } from "@/lib/citable-sections";
import { getSystemConfig, type SystemSlug } from "@/lib/system-configs";
import type { SystemPagesIndex } from "@/components/command-palette";
import type { NavFile, NavSection } from "@/components/doc-sidebar";

const ALL_SYSTEM_SLUGS: SystemSlug[] = [
  "business",
  "docs",
  "estudio",
  "growth",
  "pacote",
  "playbook-conteudo",
  "playbook-videos",
];

/**
 * Índice de páginas de todos os systems para a command palette. O filtro de
 * acesso por role acontece no cliente (`canAccessSystem`), pois a palette
 * já conhece o usuário; aqui só se monta a lista. Memoizado por request.
 */
export const getSystemsPagesIndex = cache((): SystemPagesIndex[] =>
  ALL_SYSTEM_SLUGS.map((slug) => {
    const config = getSystemConfig(slug);
    return {
      system: slug,
      title: config.title,
      basePath: config.basePath,
      sections: flattenForCitation(config.getNav()),
    };
  }),
);

/** Primeiro arquivo de uma seção (descendo nas subseções, se preciso). */
function firstFileOf(section: NavSection): NavFile | null {
  if (section.files.length > 0) return section.files[0];
  for (const child of section.children) {
    const file = firstFileOf(child);
    if (file) return file;
  }
  return null;
}

/**
 * Mapa `caminho da seção` → href do primeiro doc dela, para o breadcrumb
 * transformar os segmentos intermediários em links em vez de texto morto.
 * Seções sem nenhum arquivo ficam de fora (nada para abrir).
 */
export function getSectionFirstDocHrefs(
  nav: NavSection[],
  basePath: string,
): Record<string, string> {
  const map: Record<string, string> = {};
  const walk = (sections: NavSection[]) => {
    for (const section of sections) {
      const key = section.segments.join("/");
      const file = firstFileOf(section);
      if (key && file && !(key in map)) {
        map[key] = `${basePath}/${file.segments.join("/")}`;
      }
      walk(section.children);
    }
  };
  walk(nav);
  return map;
}
