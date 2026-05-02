import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Topbar, TopbarBreadcrumb, TopbarActions } from "@/components/ui/topbar";
import { DocTopbarLabel } from "@/components/doc-breadcrumb";
import { MagnySidebar } from "@/components/magny/magny-sidebar";
import { AppSwitcher } from "@/components/app-switcher";

export default function MagnyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <MagnySidebar />
      <SidebarInset>
        <Topbar>
          <TopbarBreadcrumb>
            <DocTopbarLabel label="Magny" basePath="/magny" />
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
