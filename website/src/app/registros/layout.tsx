import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Topbar, TopbarBreadcrumb, TopbarActions } from "@/components/ui/topbar";
import { DocTopbarLabel, DocTopbarUpLink } from "@/components/doc-breadcrumb";
import { AppSwitcher } from "@/components/app-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { AppNotifications } from "@/components/app-notifications";
import { CommandPaletteIconButton } from "@/components/command-palette";
import { RegistrosSidebar } from "@/components/registros-sidebar";
import { AccessRestricted } from "@/app/_shared/access-restricted";
import { createClient } from "@/lib/supabase/server";
import { isOverlensEmail } from "@/lib/route-access";
import { getSystemConfig } from "@/lib/system-configs";
import { getChatConversations } from "@/lib/chat-conversations";
import { getSystemsPagesIndex } from "@/lib/palette-index";
import { REGISTROS_LABELS } from "@/lib/registros-nav";

export const metadata: Metadata = {
  title: "Registros",
};

export default async function RegistrosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Defense-in-depth: reverifica no server (além do middleware) que o usuário
  // é da equipe interna (@overlens.com.br).
  const [supabase, cookieStore] = await Promise.all([createClient(), cookies()]);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/registros");
  if (!isOverlensEmail(user.email)) return <AccessRestricted label="Registros" />;

  const lastSystem = cookieStore.get("overlens_last_system")?.value;
  const config = getSystemConfig(lastSystem);

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
    <SidebarProvider defaultOpen>
      <RegistrosSidebar
        conversas={conversas}
        backHref={config.basePath}
        backLabel={config.title}
        palette={{
          sections: config.getNav(),
          basePath: config.basePath,
          title: config.title,
          allSections: getSystemsPagesIndex(),
          conversations: getChatConversations(),
        }}
      />
      <SidebarInset id="main-content">
        <Topbar>
          <DocTopbarUpLink label="Registros" basePath="/registros" labels={REGISTROS_LABELS} />
          <TopbarBreadcrumb>
            <DocTopbarLabel label="Registros" basePath="/registros" labels={REGISTROS_LABELS} />
          </TopbarBreadcrumb>
          <TopbarActions>
            {/* Só aparece no mobile: aqui a sidebar recolhe em modo "icon" e
                mantém o próprio botão de busca visível no desktop. */}
            <CommandPaletteIconButton sidebarCollapsesToIcon />
            <AppNotifications />
            <ThemeToggle />
            <AppSwitcher />
          </TopbarActions>
        </Topbar>
        <div className="flex-1 overflow-auto">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
