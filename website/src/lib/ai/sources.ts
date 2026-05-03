import { getDocsIndex } from "./docs-index";
import type { DocIndexEntry } from "./types";

export type ResolvedSource = {
  id: string;
  title: string;
  href: string;
};

const SYSTEM_BASE: Record<DocIndexEntry["system"], string> = {
  brand_system: "/docs",
  estudio_criativo: "/estudio",
  growth_system: "/growth",
  pacote_cultural: "/pacote",
};

function buildHref(entry: DocIndexEntry): string {
  return `${SYSTEM_BASE[entry.system]}/${entry.segments.join("/")}`;
}

/** Map a list of doc ids (segments.join("/")) to display-ready sources. */
export function resolveSources(ids: string[] | null | undefined): ResolvedSource[] {
  if (!ids || ids.length === 0) return [];
  const index = getDocsIndex();
  const byId = new Map(index.map((e) => [e.id, e]));
  const out: ResolvedSource[] = [];
  for (const id of ids) {
    const entry = byId.get(id);
    if (!entry) continue;
    out.push({ id, title: entry.title, href: buildHref(entry) });
  }
  return out;
}

/** Resolve a single cited section title from its segments. */
export function resolveCitedTitle(
  segments: string[] | null | undefined,
): string | null {
  if (!segments || segments.length === 0) return null;
  const id = segments.join("/");
  const index = getDocsIndex();
  const entry = index.find((e) => e.id === id);
  return entry?.title ?? null;
}
