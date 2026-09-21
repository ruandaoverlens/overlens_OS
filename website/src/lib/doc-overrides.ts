import { createAdminClient } from "@/lib/supabase/admin";
import type { DocFile } from "@/lib/docs";
import type { NavSection } from "@/components/doc-sidebar";

/**
 * Sobrescritas de conteúdo salvas no banco (`public.doc_pages`).
 *
 * O markdown em `website/content` continua sendo a base de cada página; quando
 * um admin edita o texto pela interface, o resultado vai para o banco e passa
 * a vencer o arquivo. Apagar a linha restaura o original.
 *
 * A chave é (system, path): `system` é o slug do system ("docs", "estudio"...)
 * e `path` são os segmentos da página unidos por "/".
 */

export interface DocOverride {
  content: string;
  /** Título sobrescrito; `null` mantém o título derivado do arquivo. */
  title: string | null;
  updatedAt: string;
  updatedBy: string | null;
}

export function docPathKey(segments: string[]): string {
  return segments.join("/");
}

export async function getDocOverride(
  system: string,
  segments: string[],
): Promise<DocOverride | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("doc_pages")
    .select("content, title, updated_at, updated_by")
    .eq("system", system)
    .eq("path", docPathKey(segments))
    .maybeSingle();

  if (error) {
    console.error("[doc-overrides] read failed:", error.message);
    return null;
  }
  if (!data) return null;
  return {
    content: data.content as string,
    title: ((data.title as string | null) ?? null) || null,
    updatedAt: data.updated_at as string,
    updatedBy: (data.updated_by as string | null) ?? null,
  };
}

/**
 * Títulos sobrescritos de um system inteiro, indexados por `path`. Uma consulta
 * só, porque quem precisa disso é a navegação: a sidebar monta a árvore de
 * todas as páginas de uma vez.
 */
export async function getDocTitleOverrides(
  system: string,
): Promise<Map<string, string>> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("doc_pages")
    .select("path, title")
    .eq("system", system)
    .not("title", "is", null);

  if (error) {
    console.error("[doc-overrides] title read failed:", error.message);
    return new Map();
  }
  return new Map(
    (data ?? [])
      .filter((row) => typeof row.title === "string" && row.title.trim())
      .map((row) => [row.path as string, (row.title as string).trim()]),
  );
}

/** Conteúdo efetivo da página: sobrescrita do banco, ou o arquivo. */
export async function resolveDocContent(
  system: string,
  file: DocFile,
): Promise<{ content: string; override: DocOverride | null }> {
  const override = await getDocOverride(system, file.segments);
  return { content: override?.content ?? file.content, override };
}

/** Título efetivo de uma página: sobrescrita do banco, ou o do arquivo. */
export function resolveDocTitle(file: DocFile, override: DocOverride | null): string {
  return override?.title ?? file.title;
}

/**
 * Reescreve os títulos da navegação com as sobrescritas do banco, para a
 * sidebar mostrar o mesmo nome que a página. Seções mantêm o título da pasta —
 * só páginas são renomeáveis.
 */
export function applyNavTitleOverrides(
  nav: NavSection[],
  titles: Map<string, string>,
): NavSection[] {
  if (titles.size === 0) return nav;
  return nav.map((section) => {
    const files = section.files.map((file) => {
      const title = titles.get(docPathKey(file.segments));
      return title ? { ...file, title } : file;
    });
    // Seção com um único arquivo é exibida pela sidebar com o título da pasta;
    // renomear a página precisa aparecer ali também.
    const onlyFile =
      files.length === 1 && section.children.length === 0 ? files[0] : null;
    const sectionTitle =
      onlyFile && titles.has(docPathKey(onlyFile.segments))
        ? onlyFile.title
        : section.title;
    return {
      ...section,
      title: sectionTitle,
      files,
      children: applyNavTitleOverrides(section.children, titles),
    };
  });
}
