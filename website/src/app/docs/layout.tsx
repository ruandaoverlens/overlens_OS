import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Topbar, TopbarBreadcrumb, TopbarActions } from "@/components/ui/topbar";
import { SystemSidebar } from "@/components/doc-sidebar";
import { DocTopbarLabel } from "@/components/doc-breadcrumb";
import { getChatConversations } from "@/lib/chat-conversations";
import { AppSwitcher } from "@/components/app-switcher";
import { AppNotifications } from "@/components/app-notifications";
import { SystemTracker } from "@/components/system-tracker";
import { getSystemConfig } from "@/lib/system-configs";

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = getSystemConfig("docs");
  const nav = config.getNav();
  const conversations = await getChatConversations();

  return (
    <SidebarProvider>
      <SystemTracker slug={config.slug} />
      <SystemSidebar
        sections={nav}
        basePath={config.basePath}
        title={config.title}
        subtitle={config.subtitle}
        separatorAfterIndex={config.separatorAfterIndex}
        footerLinks={config.footerLinks}
        conversations={conversations}
      />
      <SidebarInset>
        <Topbar>
          <TopbarBreadcrumb>
            <DocTopbarLabel label={config.title} basePath={config.basePath} />
          </TopbarBreadcrumb>
          <TopbarActions>
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
