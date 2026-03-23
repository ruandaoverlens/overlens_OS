import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Topbar, TopbarBreadcrumb, TopbarActions } from "@/components/ui/topbar";
import { SystemSidebar, type NavSection } from "@/components/doc-sidebar";
import { DocTopbarLabel } from "@/components/doc-breadcrumb";
import { getSections, type DocSection } from "@/lib/docs";
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

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nav = toNav(getSections());

  return (
    <SidebarProvider>
      <SystemSidebar
        sections={nav}
        basePath="/docs"
        title="Brand System"
        subtitle="Brand System"
        separatorAfterIndex={1}
        footerLinks={[
          { title: "Pacote Cultural", href: "/pacote" },
        ]}
      />
      <SidebarInset>
        <Topbar>
          <TopbarBreadcrumb>
            <DocTopbarLabel label="Brand System" basePath="/docs" />
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
