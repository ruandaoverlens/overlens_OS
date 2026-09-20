import { createAdminClient } from "@/lib/supabase/admin";
import type { DocFile } from "@/lib/docs";

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
    .select("content, updated_at, updated_by")
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
    updatedAt: data.updated_at as string,
    updatedBy: (data.updated_by as string | null) ?? null,
  };
}

/** Conteúdo efetivo da página: sobrescrita do banco, ou o arquivo. */
export async function resolveDocContent(
  system: string,
  file: DocFile,
): Promise<{ content: string; override: DocOverride | null }> {
  const override = await getDocOverride(system, file.segments);
  return { content: override?.content ?? file.content, override };
}
