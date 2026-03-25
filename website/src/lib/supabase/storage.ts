/** Map asset type slugs to subfolder names inside Storage */
export const ASSET_TYPE_FOLDERS: Record<string, string> = {
  "banco-de-imagens": "Imagens",
  "banco-de-videos": "Footages",
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

export function sanitizeFilename(name: string): string {
  return name
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
