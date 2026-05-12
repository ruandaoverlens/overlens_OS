/** Map asset type slugs to subfolder names inside Storage */
export const ASSET_TYPE_FOLDERS: Record<string, string> = {
  "banco-de-imagens": "Imagens",
  "banco-de-videos": "Footages",
  "banco-de-anuncios": "Anuncios",
  "sons-e-audios": "Musicas",
  "simbolos-e-logotipos": "Imagens/logos",
  "ativos-de-cor": "Imagens/cores",
  "ativos-de-tipografia": "Imagens/tipografia",
  "biblioteca-de-icones": "Imagens/icones",
  "grafismos-e-patterns": "Imagens/grafismos",
  "templates-e-layouts": "Imagens/templates",
  "objetos-3d": "Objetos3D",
};

export function getStoragePath(assetType: string, filename: string): string {
  const subfolder = ASSET_TYPE_FOLDERS[assetType] ?? assetType;
  return `${subfolder}/${sanitizeStorageFilename(filename)}`;
}

/**
 * Sanitize a filename for Supabase Storage.
 * Supabase rejects brackets and certain special characters in object keys.
 */
export function sanitizeStorageFilename(name: string): string {
  return name
    .replace(/\[/g, "(")
    .replace(/\]/g, ")")
    .replace(/[#%{}|\\^~`]/g, "_")
    .replace(/\u00d7/g, "x")   // × → x
    .replace(/\u2194/g, "-")   // ↔ → -
    .replace(/&/g, "e")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")  // strip accent marks
    .replace(/[^\x20-\x7E]/g, "_");  // replace remaining non-ASCII
}

/**
 * Get the public URL for an asset preview from Supabase Storage.
 * Uses the `asset-previews` public bucket.
 */
export function getAssetPreviewUrl(folder: string, filename: string): string {
  const supabaseUrl = "https://lqymftfphjexutgtvjuh.supabase.co";
  const safeName = sanitizeStorageFilename(filename);
  return `${supabaseUrl}/storage/v1/object/public/asset-previews/${folder}/${encodeURIComponent(safeName)}`;
}

/**
 * Content Bank slugs — categories backed by `public.content_items` instead of
 * `public.asset_metadata`. These accept both file uploads and link references,
 * and store rich per-category metadata in a jsonb column.
 */
export const CONTENT_BANK_SLUGS = new Set<string>([
  "templates-e-layouts",
  "documentacao",
  "objetos-3d",
]);

export function isContentBankSlug(slug: string): boolean {
  return CONTENT_BANK_SLUGS.has(slug);
}

/** Map an asset slug (banco-de-imagens etc.) to the canonical asset_type used in DB tables. */
export function getAssetType(slug: string): "image" | "video" | "audio" | null {
  switch (slug) {
    case "banco-de-imagens":
    case "simbolos-e-logotipos":
    case "ativos-de-cor":
    case "ativos-de-tipografia":
    case "biblioteca-de-icones":
    case "grafismos-e-patterns":
    case "templates-e-layouts":
      return "image";
    case "banco-de-videos":
      return "video";
    case "sons-e-audios":
      return "audio";
    default:
      return null;
  }
}

export function sanitizeFilename(name: string): string {
  return name
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
