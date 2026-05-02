import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Topbar, TopbarBreadcrumb, TopbarActions } from "@/components/ui/topbar";
import { SystemSidebar, type NavSection } from "@/components/doc-sidebar";
import { DocTopbarLabel } from "@/components/doc-breadcrumb";
import { getGrowthSections, type DocSection } from "@/lib/docs";
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

export default function GrowthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nav = toNav(getGrowthSections());

  return (
    <SidebarProvider>
      <SystemSidebar
        sections={nav}
        basePath="/growth"
        title="Growth System"
        subtitle="Crescimento & Métricas"
      />
      <SidebarInset>
        <Topbar>
          <TopbarBreadcrumb>
            <DocTopbarLabel label="Growth System" basePath="/growth" />
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
