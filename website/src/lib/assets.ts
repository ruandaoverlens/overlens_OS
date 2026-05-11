export interface AssetCategory {
  slug: string;
  title: string;
  emptyMessage: string;
  group: "nav" | "category";
}

export const assetCategories: AssetCategory[] = [
  // Navigation group
  { slug: "visao-geral", title: "Visão geral", emptyMessage: "Nenhum ativo adicionado ainda. Explore as categorias ao lado para começar.", group: "nav" },
  { slug: "favoritos", title: "Favoritos", emptyMessage: "Você ainda não favoritou nenhum ativo. Marque ativos como favoritos para acessá-los rapidamente.", group: "nav" },
  // Asset categories
  { slug: "simbolos-e-logotipos", title: "Símbolos e logotipos", emptyMessage: "Nenhum símbolo ou logotipo disponível.", group: "category" },
  { slug: "ativos-de-cor", title: "Ativos de cor", emptyMessage: "Nenhuma paleta de cor disponível.", group: "category" },
  { slug: "ativos-de-tipografia", title: "Ativos de tipografia", emptyMessage: "Nenhum ativo tipográfico disponível.", group: "category" },
  { slug: "biblioteca-de-icones", title: "Biblioteca de ícones", emptyMessage: "Nenhum ícone disponível na biblioteca.", group: "category" },
  { slug: "grafismos-e-patterns", title: "Grafismos e patterns", emptyMessage: "Nenhum grafismo ou pattern disponível.", group: "category" },
  { slug: "templates-e-layouts", title: "Templates e layouts", emptyMessage: "Nenhum template ou layout disponível.", group: "category" },
  { slug: "sons-e-audios", title: "Sons e áudios", emptyMessage: "Nenhum ativo sonoro disponível.", group: "category" },
  { slug: "banco-de-imagens", title: "Banco de imagens", emptyMessage: "Nenhuma imagem disponível no banco.", group: "category" },
  { slug: "banco-de-videos", title: "Banco de vídeos", emptyMessage: "Nenhum vídeo disponível no banco.", group: "category" },
  { slug: "banco-de-anuncios", title: "Banco de anúncios", emptyMessage: "Nenhum anúncio adicionado ainda. Faça upload de imagens, vídeos ou carrosséis e registre métricas de performance.", group: "category" },
  { slug: "objetos-3d", title: "Objetos 3D", emptyMessage: "Nenhum objeto 3D disponível.", group: "category" },
];

export function getAssetCategory(slug: string): AssetCategory | undefined {
  return assetCategories.find((c) => c.slug === slug);
}

export function getAllAssetSlugs(): string[] {
  return assetCategories.map((c) => c.slug);
}
