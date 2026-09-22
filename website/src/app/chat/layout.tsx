import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { requireAuth } from "@/lib/auth-guard";
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import {
  Topbar,
  TopbarBreadcrumb,
  TopbarCenter,
  TopbarActions,
} from "@/components/ui/topbar";
import { AppSwitcher } from "@/components/app-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { AppNotifications } from "@/components/app-notifications";
import { CommandPaletteIconButton } from "@/components/command-palette";
import { SystemSidebar } from "@/components/doc-sidebar";
import { ChatBreadcrumb } from "@/components/chat/chat-breadcrumb";
import { CitableSectionsProvider } from "@/components/chat/citable-sections-provider";
import { getChatConversations } from "@/lib/chat-conversations";
import { getSystemConfig } from "@/lib/system-configs";
import { flattenForCitation } from "@/lib/citable-sections";
import { getSystemsPagesIndex } from "@/lib/palette-index";
import type { ChatConversationLink } from "@/components/doc-sidebar";

export const metadata: Metadata = {
  title: "Conversas",
};

/** O breadcrumb precisa da lista resolvida — resolve em stream, sem travar o shell. */
async function ChatBreadcrumbLoader({
  conversations,
}: {
  conversations: Promise<ChatConversationLink[]>;
}) {
  return <ChatBreadcrumb conversations={await conversations} />;
}

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // A auth precisa preceder (redirect); cookie e conversas seguem em paralelo.
  const [, cookieStore] = await Promise.all([requireAuth(), cookies()]);
  const lastSystem = cookieStore.get("overlens_last_system")?.value;
  const config = getSystemConfig(lastSystem);

  // Promise não awaitada: a sidebar e o breadcrumb resolvem em Suspense.
  // Garante renderização dinâmica (conversas são por usuário) sem bloquear o shell.
  await connection();
  const conversations = getChatConversations();
  const nav = config.getNav();
  const citableSections = flattenForCitation(nav);

  return (
    <SidebarProvider defaultOpen className="h-[calc(100svh-var(--now-playing-h,0px))] overflow-hidden">
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
        defaultView="conversations"
        adminLinks={config.adminLinks}
        allSections={getSystemsPagesIndex()}
      />
      <SidebarInset id="main-content" className="h-[calc(100svh-var(--now-playing-h,0px))] overflow-hidden">
        <Topbar>
          <TopbarBreadcrumb>
            <Suspense fallback={<ChatBreadcrumb conversations={[]} />}>
              <ChatBreadcrumbLoader conversations={conversations} />
            </Suspense>
          </TopbarBreadcrumb>
          <TopbarCenter>
            <span className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground/80">Beta:</span>{" "}
              Modelo Gemma — pode apresentar erros e lentidão.
            </span>
          </TopbarCenter>
          <TopbarActions>
            {/* Só aparece quando a sidebar não mostra a própria busca:
                drawer no mobile, recolhida abaixo de 1180px. */}
            <CommandPaletteIconButton />
            <AppNotifications />
            <ThemeToggle />
            <AppSwitcher />
          </TopbarActions>
        </Topbar>
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <CitableSectionsProvider
            citableSections={citableSections}
            basePath={config.basePath}
          >
            {children}
          </CitableSectionsProvider>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
