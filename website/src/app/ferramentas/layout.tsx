import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Topbar, TopbarBreadcrumb, TopbarActions } from "@/components/ui/topbar";
import { DocTopbarLabel } from "@/components/doc-breadcrumb";
import { AppSwitcher } from "@/components/app-switcher";

export default function FerramentasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={false}>
      <SidebarInset>
        <Topbar>
          <TopbarBreadcrumb>
            <DocTopbarLabel label="Botões Mágicos" basePath="/ferramentas" />
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
