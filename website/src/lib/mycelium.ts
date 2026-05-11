import type { MyceliumType } from "@/lib/mycelium-types";

export interface MyceliumCategory {
  slug: string;
  title: string;
  /** Maps to a value of MyceliumType (artigo, video, etc). Absent for nav entries (feed, favoritos, visao-geral). */
  type?: MyceliumType;
  emptyMessage: string;
  group: "nav" | "category";
}

export const myceliumCategories: MyceliumCategory[] = [
  // Navigation group
  {
    slug: "feed",
    title: "Feed",
    emptyMessage: "Nenhuma referência adicionada ainda.",
    group: "nav",
  },
  {
    slug: "favoritos",
    title: "Favoritos",
    emptyMessage: "Você ainda não favoritou nenhuma referência.",
    group: "nav",
  },
  // Reference categories (8)
  {
    slug: "artigos",
    title: "Artigos",
    type: "artigo",
    emptyMessage: "Nenhum artigo adicionado.",
    group: "category",
  },
  {
    slug: "videos",
    title: "Vídeos",
    type: "video",
    emptyMessage: "Nenhum vídeo adicionado.",
    group: "category",
  },
  {
    slug: "imagens",
    title: "Imagens",
    type: "imagem",
    emptyMessage: "Nenhuma imagem adicionada.",
    group: "category",
  },
  {
    slug: "audios",
    title: "Áudios",
    type: "audio",
    emptyMessage: "Nenhum áudio adicionado.",
    group: "category",
  },
  {
    slug: "pdfs",
    title: "PDFs",
    type: "pdf",
    emptyMessage: "Nenhum PDF adicionado.",
    group: "category",
  },
  {
    slug: "skills",
    title: "Skills",
    type: "skill",
    emptyMessage: "Nenhuma skill adicionada.",
    group: "category",
  },
  {
    slug: "posts",
    title: "Posts sociais",
    type: "post",
    emptyMessage: "Nenhum post social adicionado.",
    group: "category",
  },
  {
    slug: "sites",
    title: "Sites e ferramentas",
    type: "site",
    emptyMessage: "Nenhum site adicionado.",
    group: "category",
  },
];

export function getMyceliumCategory(slug: string): MyceliumCategory | undefined {
  return myceliumCategories.find((c) => c.slug === slug);
}

export function getMyceliumCategoryByType(
  type: string
): MyceliumCategory | undefined {
  return myceliumCategories.find((c) => c.type === type);
}

export function getAllMyceliumSlugs(): string[] {
  return myceliumCategories.map((c) => c.slug);
}
