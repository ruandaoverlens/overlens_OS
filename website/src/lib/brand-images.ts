/**
 * Imagens do Brand System são referenciadas no markdown por um caminho curto
 * (`/brand/images/<arquivo>`) e servidas pelo bucket público do Supabase. A
 * conversão vive aqui porque acontece nas duas pontas: na leitura
 * (markdown-renderer) e na edição (doc-editor), que precisa exibir a imagem no
 * Tiptap sem gravar a URL absoluta de volta no markdown.
 */
const BRAND_IMAGE_PREFIX = "/brand/images/";
const STORAGE_FOLDER = "/storage/v1/object/public/asset-previews/Imagens/";

function storageBase(): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}${STORAGE_FOLDER}`;
}

/** `/brand/images/x.png` → URL pública do storage. Outros valores passam intactos. */
export function resolveBrandImageSrc(src: string): string {
  if (!src.startsWith(BRAND_IMAGE_PREFIX)) return src;
  return `${storageBase()}${src.slice(BRAND_IMAGE_PREFIX.length)}`;
}

/** Inverso de `resolveBrandImageSrc`, para o markdown voltar ao caminho curto. */
export function toBrandImagePath(src: string): string {
  const base = storageBase();
  if (!src.startsWith(base)) return src;
  return `${BRAND_IMAGE_PREFIX}${src.slice(base.length)}`;
}
