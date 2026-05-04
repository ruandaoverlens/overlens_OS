// Shared utility for flattening doc/nav section trees into the flat list
// the prompt-area's "Citar Seção" picker consumes. Both DocSection (server-side
// docs with content) and NavSection (serializable nav for client) share the
// minimal structural shape this helper relies on.

export type CitableSection = {
  title: string;
  segments: string[];
  groupTitle: string;
};

type SectionLike = {
  title: string;
  files: ReadonlyArray<{ title: string; segments: string[] }>;
  children: ReadonlyArray<SectionLike>;
};

export function flattenForCitation(
  sections: ReadonlyArray<SectionLike>,
): CitableSection[] {
  const result: CitableSection[] = [];
  function walk(s: SectionLike, groupTitle: string) {
    for (const file of s.files) {
      result.push({ title: file.title, segments: file.segments, groupTitle });
    }
    for (const child of s.children) {
      walk(child, groupTitle);
    }
  }
  for (const top of sections) {
    walk(top, top.title);
  }
  return result;
}
