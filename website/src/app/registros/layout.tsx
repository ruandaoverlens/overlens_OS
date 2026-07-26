import { notFound } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Topbar, TopbarBreadcrumb, TopbarActions } from "@/components/ui/topbar";
import { DocTopbarLabel } from "@/components/doc-breadcrumb";
import { AppSwitcher } from "@/components/app-switcher";
import { AppNotifications } from "@/components/app-notifications";
import { RegistrosSidebar } from "@/components/registros-sidebar";
import { createClient } from "@/lib/supabase/server";
import { isOverlensEmail } from "@/lib/route-access";

export default async function RegistrosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Defense-in-depth: reverifica no server (além do middleware) que o usuário
  // é da equipe interna (@overlens.com.br). Para não-autorizados o módulo
  // responde como se não existisse (404).
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isOverlensEmail(user.email)) notFound();

  // Conversas do assistente (do próprio usuário) para a sidebar.
  const { data: conversasData } = await supabase
    .from("registro_assistente_conversas")
    .select("id, titulo")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(50);
  const conversas = (conversasData ?? []).map((c) => ({
    id: c.id as string,
    title: c.titulo as string,
  }));

  return (
    <SidebarProvider>
      <RegistrosSidebar conversas={conversas} />
      <SidebarInset>
        <Topbar>
          <TopbarBreadcrumb>
            <DocTopbarLabel label="Registros" basePath="/registros" />
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
