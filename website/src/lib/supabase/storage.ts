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
  return `${subfolder}/${filename}`;
}

export function sanitizeFilename(name: string): string {
  return name
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
