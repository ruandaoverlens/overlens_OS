import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Topbar, TopbarBreadcrumb, TopbarActions } from "@/components/ui/topbar";
import { SystemSidebar, type NavSection } from "@/components/doc-sidebar";
import { DocTopbarLabel } from "@/components/doc-breadcrumb";
import { getGrowthSections, type DocSection } from "@/lib/docs";
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

export default function GrowthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const all = getGrowthSections();
  const sections = all.filter((s) => s.title !== "Playbooks");
  const nav = toNav(sections);

  return (
    <SidebarProvider>
      <SystemSidebar
        sections={nav}
        basePath="/growth"
        title="Growth System"
        subtitle="Crescimento & Métricas"
        footerLinks={[
          { title: "Operação de Vendas", href: "/playbook-operacao" },
          { title: "Gestão de Vendas", href: "/playbook-gestao" },
        ]}
      />
      <SidebarInset>
        <Topbar>
          <TopbarBreadcrumb>
            <DocTopbarLabel label="Growth System" basePath="/growth" />
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
