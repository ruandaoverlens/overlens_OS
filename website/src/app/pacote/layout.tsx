import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Topbar, TopbarBreadcrumb, TopbarActions } from "@/components/ui/topbar";
import { SystemSidebar, type NavSection } from "@/components/doc-sidebar";
import { DocTopbarLabel } from "@/components/doc-breadcrumb";
import { getPacoteSections, type DocSection } from "@/lib/docs";
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

export default function PacoteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nav = toNav(getPacoteSections());

  return (
    <SidebarProvider>
      <SystemSidebar
        sections={nav}
        basePath="/pacote"
        title="Pacote Cultural"
        subtitle="Referências & Inspirações"
        footerLinks={[
          { title: "Brand System", href: "/docs" },
        ]}
      />
      <SidebarInset>
        <Topbar>
          <TopbarBreadcrumb>
            <DocTopbarLabel label="Pacote Cultural" basePath="/pacote" />
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
