import {
  getSections,
  getEstudioSections,
  getGrowthSections,
  getPacoteSections,
  getPlaybookConteudoSections,
  getPlaybookVideosSections,
  type DocSection,
} from "@/lib/docs";
import type { NavSection, SidebarLink } from "@/components/doc-sidebar";

export type SystemSlug =
  | "docs"
  | "estudio"
  | "growth"
  | "pacote"
  | "playbook-conteudo"
  | "playbook-videos";

const SYSTEM_SLUGS = new Set<string>([
  "docs",
  "estudio",
  "growth",
  "pacote",
  "playbook-conteudo",
  "playbook-videos",
]);

export function isSystemSlug(value: string | undefined): value is SystemSlug {
  return !!value && SYSTEM_SLUGS.has(value);
}

export type SystemConfig = {
  slug: SystemSlug;
  basePath: string;
  title: string;
  subtitle: string;
  getNav: () => NavSection[];
  separatorAfterIndex?: number;
  footerLinks?: SidebarLink[];
  backHref?: string;
  backLabel?: string;
  /** Links extras exibidos no topo do menu apenas para admins. */
  adminLinks?: SidebarLink[];
};

function toNav(sections: DocSection[]): NavSection[] {
  return sections.map((s) => ({
    slug: s.slug,
    title: s.title,
    segments: s.segments,
    files: s.files.map((f) => ({
      slug: f.slug,
      title: f.title,
      segments: f.segments,
    })),
    children: toNav(s.children),
  }));
}

function flattenSection(section: NavSection): NavSection[] {
  return section.files.map((f) => ({
    slug: f.slug,
    title: f.title,
    segments: section.segments,
    files: [f],
    children: [],
  }));
}

function getEstudioNav(): NavSection[] {
  const all = getEstudioSections();
  const excludeTitles = ["Playbook de Conteúdo", "Playbook de Edição de Vídeos"];
  const flattenTitles = ["Estúdio Criativo"];
  const sections = all.filter((s) => !excludeTitles.includes(s.title));
  return sections.flatMap((s) => {
    const n = toNav([s])[0];
    return flattenTitles.includes(s.title) ? flattenSection(n) : [n];
  });
}

const SYSTEMS: Record<SystemSlug, SystemConfig> = {
  docs: {
    slug: "docs",
    basePath: "/docs",
    title: "Brand System",
    subtitle: "Brand System",
    getNav: () => toNav(getSections()),
    separatorAfterIndex: 1,
    footerLinks: [{ title: "Pacote Cultural", href: "/pacote" }],
    adminLinks: [{ title: "Insights", href: "/admin/insights" }],
  },
  estudio: {
    slug: "estudio",
    basePath: "/estudio",
    title: "Content System",
    subtitle: "Playbooks & Conteúdo",
    getNav: getEstudioNav,
    footerLinks: [
      { title: "Playbook de Conteúdo", href: "/playbook-conteudo" },
      { title: "Playbook de Edição de Vídeos", href: "/playbook-videos" },
    ],
  },
  growth: {
    slug: "growth",
    basePath: "/growth",
    title: "Growth System",
    subtitle: "Crescimento & Métricas",
    getNav: () => toNav(getGrowthSections()),
  },
  pacote: {
    slug: "pacote",
    basePath: "/pacote",
    title: "Pacote Cultural",
    subtitle: "Referências & Inspirações",
    getNav: () => toNav(getPacoteSections()),
    footerLinks: [{ title: "Brand System", href: "/docs" }],
  },
  "playbook-conteudo": {
    slug: "playbook-conteudo",
    basePath: "/playbook-conteudo",
    title: "Playbook de Conteúdo",
    subtitle: "Produção de Conteúdo",
    getNav: () => toNav(getPlaybookConteudoSections()),
    backHref: "/estudio",
    backLabel: "Content System",
  },
  "playbook-videos": {
    slug: "playbook-videos",
    basePath: "/playbook-videos",
    title: "Playbook de Edição",
    subtitle: "Edição de Vídeos",
    getNav: () => toNav(getPlaybookVideosSections()),
    backHref: "/estudio",
    backLabel: "Content System",
  },
};

export function getSystemConfig(slug: string | undefined): SystemConfig {
  if (isSystemSlug(slug)) return SYSTEMS[slug];
  return SYSTEMS.docs;
}
