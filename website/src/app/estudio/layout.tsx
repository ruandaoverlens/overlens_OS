import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Topbar, TopbarBreadcrumb, TopbarActions } from "@/components/ui/topbar";
import { SystemSidebar, type NavSection } from "@/components/doc-sidebar";
import { DocTopbarLabel } from "@/components/doc-breadcrumb";
import { getEstudioSections, type DocSection } from "@/lib/docs";
import { AppSwitcher } from "@/components/app-switcher";

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

/** Flatten sections: promote each file inside a section to its own top-level entry. */
function flattenSection(section: NavSection): NavSection[] {
  return section.files.map((f) => ({
    slug: f.slug,
    title: f.title,
    segments: section.segments,
    files: [f],
    children: [],
  }));
}

export default function EstudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const all = getEstudioSections();
  const excludeTitles = ["Playbook de Conteúdo", "Playbook de Edição de Vídeos"];
  const flattenTitles = ["Estúdio Criativo"];
  const sections = all.filter((s) => !excludeTitles.includes(s.title));
  const nav = sections.flatMap((s) => {
    const n = toNav([s])[0];
    return flattenTitles.includes(s.title) ? flattenSection(n) : [n];
  });

  return (
    <SidebarProvider>
      <SystemSidebar
        sections={nav}
        basePath="/estudio"
        title="Content System"
        subtitle="Playbooks & Conteúdo"
        footerLinks={[
          { title: "Playbook de Conteúdo", href: "/playbook-conteudo" },
          { title: "Playbook de Edição de Vídeos", href: "/playbook-videos" },
        ]}
      />
      <SidebarInset>
        <Topbar>
          <TopbarBreadcrumb>
            <DocTopbarLabel label="Content System" basePath="/estudio" />
          </TopbarBreadcrumb>
          <TopbarActions>
            <AppSwitcher />
          </TopbarActions>
        </Topbar>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
