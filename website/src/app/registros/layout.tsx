import { notFound } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Topbar, TopbarBreadcrumb, TopbarActions } from "@/components/ui/topbar";
import { DocTopbarLabel } from "@/components/doc-breadcrumb";
import { AppSwitcher } from "@/components/app-switcher";
import { AppNotifications } from "@/components/app-notifications";
import { RegistrosSidebar } from "@/components/registros-sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function RegistrosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Defense-in-depth: reverifica role de admin no server (além do middleware).
  // Para não-autorizados o módulo responde como se não existisse (404).
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || profile.role !== "admin") notFound();

  return (
    <SidebarProvider>
      <RegistrosSidebar />
      <SidebarInset>
        <Topbar>
          <TopbarBreadcrumb>
            <DocTopbarLabel label="Ativos Registrados" basePath="/registros" />
          </TopbarBreadcrumb>
          <TopbarActions>
            <AppNotifications />
            <AppSwitcher />
          </TopbarActions>
        </Topbar>
        <div className="flex-1 overflow-auto">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
