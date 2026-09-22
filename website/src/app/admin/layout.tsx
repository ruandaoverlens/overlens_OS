import type { Metadata } from "next";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Topbar, TopbarBreadcrumb, TopbarActions } from "@/components/ui/topbar";
import { SystemSidebar } from "@/components/doc-sidebar";
import { DocTopbarLabel, DocTopbarUpLink } from "@/components/doc-breadcrumb";
import { getChatConversations } from "@/lib/chat-conversations";
import { AppSwitcher } from "@/components/app-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { AppNotifications } from "@/components/app-notifications";
import { CommandPaletteIconButton } from "@/components/command-palette";
import { AccessRestricted } from "@/app/_shared/access-restricted";
import { getSystemConfig } from "@/lib/system-configs";
import { getSystemsPagesIndex } from "@/lib/palette-index";
import { createClient } from "@/lib/supabase/server";
import { isStaffOrAdmin } from "@/lib/route-access";

export const metadata: Metadata = {
  title: "Admin",
};

const ADMIN_LABELS: Record<string, string> = {
  insights: "Insights de IA",
  conversas: "Conversas",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Defense-in-depth: reverifica role de admin no server, além do middleware.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/insights");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || !isStaffOrAdmin(profile.role)) {
    return <AccessRestricted label="A área administrativa" />;
  }

  const config = getSystemConfig("docs");
  const nav = config.getNav();
  // Promise não awaitada — resolve no Suspense da sidebar.
  // Garante renderização dinâmica (conversas são por usuário) sem bloquear o shell.
  await connection();
  const conversations = getChatConversations();

  return (
    <SidebarProvider defaultOpen>
      <SystemSidebar
        sections={nav}
        basePath={config.basePath}
        title={config.title}
        subtitle={config.subtitle}
        separatorAfterIndex={config.separatorAfterIndex}
        footerLinks={config.footerLinks}
        conversations={conversations}
        adminLinks={config.adminLinks}
        allSections={getSystemsPagesIndex()}
      />
      <SidebarInset id="main-content">
        <Topbar>
          <DocTopbarUpLink label="Admin" basePath="/admin/insights" labels={ADMIN_LABELS} />
          <TopbarBreadcrumb>
            <DocTopbarLabel label="Admin" basePath="/admin/insights" labels={ADMIN_LABELS} />
          </TopbarBreadcrumb>
          <TopbarActions>
            {/* Só aparece quando a sidebar não mostra a própria busca:
                drawer no mobile, recolhida abaixo de 1180px. */}
            <CommandPaletteIconButton />
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
