import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Topbar, TopbarBreadcrumb, TopbarActions } from "@/components/ui/topbar";
import { SystemSidebar } from "@/components/doc-sidebar";
import { DocTopbarLabel } from "@/components/doc-breadcrumb";
import { getChatConversations } from "@/lib/chat-conversations";
import { AppSwitcher } from "@/components/app-switcher";
import { SystemTracker } from "@/components/system-tracker";
import { getSystemConfig } from "@/lib/system-configs";

export default async function PlaybookVideosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = getSystemConfig("playbook-videos");
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
        backHref={config.backHref}
        backLabel={config.backLabel}
        conversations={conversations}
      />
      <SidebarInset>
        <Topbar>
          <TopbarBreadcrumb>
            <DocTopbarLabel label={config.title} basePath={config.basePath} />
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
