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
import { AppNotifications } from "@/components/app-notifications";
import { SystemSidebar } from "@/components/doc-sidebar";
import { ChatBreadcrumb } from "@/components/chat/chat-breadcrumb";
import { CitableSectionsProvider } from "@/components/chat/citable-sections-provider";
import { getChatConversations } from "@/lib/chat-conversations";
import { getSystemConfig } from "@/lib/system-configs";
import { flattenForCitation } from "@/lib/citable-sections";

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();

  const cookieStore = await cookies();
  const lastSystem = cookieStore.get("overlens_last_system")?.value;
  const config = getSystemConfig(lastSystem);

  const conversations = await getChatConversations();
  const nav = config.getNav();
  const citableSections = flattenForCitation(nav);

  return (
    <SidebarProvider className="h-[calc(100svh-var(--now-playing-h,0px))] overflow-hidden">
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
      />
      <SidebarInset className="h-[calc(100svh-var(--now-playing-h,0px))] overflow-hidden">
        <Topbar>
          <TopbarBreadcrumb>
            <ChatBreadcrumb conversations={conversations} />
          </TopbarBreadcrumb>
          <TopbarCenter>
            <span className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground/80">Beta:</span>{" "}
              Modelo Gemma — pode apresentar erros e lentidão.
            </span>
          </TopbarCenter>
          <TopbarActions>
            <AppNotifications />
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
