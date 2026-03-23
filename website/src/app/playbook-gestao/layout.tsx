import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Topbar, TopbarBreadcrumb, TopbarActions } from "@/components/ui/topbar";
import { SystemSidebar, type NavSection } from "@/components/doc-sidebar";
import { DocTopbarLabel } from "@/components/doc-breadcrumb";
import { getPlaybookGestaoSections, type DocSection } from "@/lib/docs";
import { AppSwitcher } from "@/components/app-switcher";
import { TopbarProfile } from "@/components/topbar-profile";

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

export default function PlaybookGestaoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nav = toNav(getPlaybookGestaoSections());

  return (
    <SidebarProvider>
      <SystemSidebar
        sections={nav}
        basePath="/playbook-gestao"
        title="Playbook de Gestão"
        subtitle="Gestão Comercial"
        backHref="/growth"
        backLabel="Growth System"
      />
      <SidebarInset>
        <Topbar>
          <TopbarBreadcrumb>
            <DocTopbarLabel label="Playbook de Gestão" basePath="/playbook-gestao" />
          </TopbarBreadcrumb>
          <TopbarActions>
            <TopbarProfile />
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
