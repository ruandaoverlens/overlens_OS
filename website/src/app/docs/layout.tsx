import type { Metadata } from "next";
import { cookies } from "next/headers";
import { connection } from "next/server";
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Topbar, TopbarBreadcrumb, TopbarActions } from "@/components/ui/topbar";
import { SystemSidebar } from "@/components/doc-sidebar";
import { DocTopbarLabel, DocTopbarUpLink } from "@/components/doc-breadcrumb";
import { getChatConversations } from "@/lib/chat-conversations";
import { AppSwitcher } from "@/components/app-switcher";
import { AppNotifications } from "@/components/app-notifications";
import { CommandPaletteIconButton } from "@/components/command-palette";
import { SystemTracker } from "@/components/system-tracker";
import { getSystemConfig } from "@/lib/system-configs";
import { getSystemsPagesIndex, getSectionFirstDocHrefs } from "@/lib/palette-index";

export const metadata: Metadata = {
  title: getSystemConfig("docs").title,
};

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = getSystemConfig("docs");
  const nav = config.getNav();
  // Promise não awaitada: o shell renderiza já; a lista de conversas
  // resolve dentro de um Suspense na sidebar.
  // Garante renderização dinâmica (conversas são por usuário) sem bloquear o shell.
  await connection();
  // `sidebar_state`: quem recolhe a sidebar continua com ela recolhida no
  // próximo carregamento (o cookie é escrito pelo `SidebarProvider`).
  const cookieStore = await cookies();
  const sidebarOpen = cookieStore.get("sidebar_state")?.value !== "false";
  const conversations = getChatConversations();

  return (
    <SidebarProvider defaultOpen={sidebarOpen}>
      <SystemTracker slug={config.slug} />
      <SystemSidebar
        sections={nav}
        basePath={config.basePath}
        title={config.title}
        subtitle={config.subtitle}
        separatorAfterIndex={config.separatorAfterIndex}
        footerLinks={config.footerLinks}
        backHref={config.backHref}
        backLabel={config.backLabel}
        conversations={conversations}
        adminLinks={config.adminLinks}
        allSections={getSystemsPagesIndex()}
      />
      <SidebarInset id="main-content">
        <Topbar>
          <DocTopbarUpLink
            label={config.title}
            basePath={config.basePath}
            sectionHrefs={getSectionFirstDocHrefs(nav, config.basePath)}
          />
          <TopbarBreadcrumb>
            <DocTopbarLabel
              label={config.title}
              basePath={config.basePath}
              sectionHrefs={getSectionFirstDocHrefs(nav, config.basePath)}
            />
          </TopbarBreadcrumb>
          <TopbarActions>
            {/* Só aparece quando a sidebar não mostra a própria busca:
                drawer no mobile, recolhida abaixo de 1180px. */}
            <CommandPaletteIconButton />
            <AppNotifications />
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
