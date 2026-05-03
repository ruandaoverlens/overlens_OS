import {
  getAllDocsFlat,
  getAllEstudioFlat,
  getAllGrowthFlat,
  getAllPacoteFlat,
  type DocFile,
} from "@/lib/docs";
import type { DocIndexEntry } from "./types";

let _cache: DocIndexEntry[] | null = null;

function fileToEntry(
  file: DocFile,
  system: DocIndexEntry["system"],
): DocIndexEntry | null {
  if (!file.frontmatter || !file.frontmatter.summary) return null;
  return {
    id: file.segments.join("/"),
    title: file.frontmatter.title ?? file.title,
    summary: file.frontmatter.summary,
    topics: file.frontmatter.topics ?? [],
    keywords: file.frontmatter.keywords ?? [],
    priority: file.frontmatter.priority ?? "medium",
    ai_when_to_use: file.frontmatter.ai_when_to_use ?? "",
    segments: file.segments,
    system,
  };
}

/** Build (and cache) a flat index of all indexable docs across systems. */
export function getDocsIndex(): DocIndexEntry[] {
  if (_cache) return _cache;
  const all: DocIndexEntry[] = [];

  for (const f of getAllDocsFlat()) {
    const e = fileToEntry(f, "brand_system");
    if (e) all.push(e);
  }
  for (const f of getAllEstudioFlat()) {
    const e = fileToEntry(f, "estudio_criativo");
    if (e) all.push(e);
  }
  for (const f of getAllGrowthFlat()) {
    const e = fileToEntry(f, "growth_system");
    if (e) all.push(e);
  }
  for (const f of getAllPacoteFlat()) {
    const e = fileToEntry(f, "pacote_cultural");
    if (e) all.push(e);
  }
  // Nota: getAllPlaybook*Flat() NÃO é chamado aqui — os playbooks já vivem dentro
  // de estudio_criativo/03 e estudio_criativo/04, e getAllEstudioFlat() varre
  // a árvore completa via scanContentDir, então adicioná-los duplicaria entradas.

  _cache = all;
  return all;
}

/**
 * Loads the FULL content (markdown body, sem frontmatter) of docs given their ids.
 * Lookup faz busca linear pelo segments.join("/") nos getAllFlat() de todos os sistemas.
 */
export function loadDocsByIds(
  ids: string[],
): Array<{ id: string; title: string; segments: string[]; content: string }> {
  if (ids.length === 0) return [];
  const wanted = new Set(ids);
  const out: Array<{ id: string; title: string; segments: string[]; content: string }> = [];

  const all: DocFile[] = [
    ...getAllDocsFlat(),
    ...getAllEstudioFlat(),
    ...getAllGrowthFlat(),
    ...getAllPacoteFlat(),
  ];
  for (const f of all) {
    const id = f.segments.join("/");
    if (wanted.has(id)) {
      out.push({
        id,
        title: f.frontmatter?.title ?? f.title,
        segments: f.segments,
        content: f.content,
      });
    }
  }
  return out;
}
