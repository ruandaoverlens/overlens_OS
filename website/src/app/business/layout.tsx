import type { Metadata } from "next";
import { connection } from "next/server";
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Topbar, TopbarBreadcrumb, TopbarActions } from "@/components/ui/topbar";
import { TopbarPageActionsSlot, SecondaryTopbarSlot, TopbarStack } from "@/components/topbar-slots";
import { SystemSidebar } from "@/components/doc-sidebar";
import { DocTopbarLabel, DocTopbarUpLink } from "@/components/doc-breadcrumb";
import { getChatConversations } from "@/lib/chat-conversations";
import { AppSwitcher } from "@/components/app-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { AppNotifications } from "@/components/app-notifications";
import { CommandPaletteIconButton } from "@/components/command-palette";
import { SystemTracker } from "@/components/system-tracker";
import { getSystemConfig } from "@/lib/system-configs";
import { applyNavTitleOverrides, getDocTitleOverrides } from "@/lib/doc-overrides";
import { getSystemsPagesIndex, getSectionFirstDocHrefs } from "@/lib/palette-index";

export const metadata: Metadata = {
  title: getSystemConfig("business").title,
};

export default async function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = getSystemConfig("business");
  // Títulos renomeados pela interface vencem os do arquivo, aqui e na página.
  const nav = applyNavTitleOverrides(
    config.getNav(),
    await getDocTitleOverrides(config.slug),
  );
  // Promise não awaitada: o shell renderiza já; a lista de conversas
  // resolve dentro de um Suspense na sidebar.
  // Garante renderização dinâmica (conversas são por usuário) sem bloquear o shell.
  await connection();
  const conversations = getChatConversations();

  return (
    <SidebarProvider defaultOpen>
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
        <TopbarStack>
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
              <TopbarPageActionsSlot />
              {/* Só aparece quando a sidebar não mostra a própria busca:
                  drawer no mobile, recolhida abaixo de 1180px. */}
              <CommandPaletteIconButton />
              <AppNotifications />
              <ThemeToggle />
              <AppSwitcher />
            </TopbarActions>
          </Topbar>
          <SecondaryTopbarSlot />
        </TopbarStack>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
