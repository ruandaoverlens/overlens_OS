import { notFound } from "next/navigation";
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Topbar, TopbarBreadcrumb, TopbarActions } from "@/components/ui/topbar";
import { SystemSidebar } from "@/components/doc-sidebar";
import { getChatConversations } from "@/lib/chat-conversations";
import { AppSwitcher } from "@/components/app-switcher";
import { AppNotifications } from "@/components/app-notifications";
import { getSystemConfig } from "@/lib/system-configs";
import { createClient } from "@/lib/supabase/server";

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
  if (!user) notFound();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || profile.role !== "admin") notFound();

  const config = getSystemConfig("docs");
  const nav = config.getNav();
  const conversations = await getChatConversations();

  return (
    <SidebarProvider>
      <SystemSidebar
        sections={nav}
        basePath={config.basePath}
        title={config.title}
        subtitle={config.subtitle}
        separatorAfterIndex={config.separatorAfterIndex}
        footerLinks={config.footerLinks}
        conversations={conversations}
        adminLinks={config.adminLinks}
      />
      <SidebarInset>
        <Topbar>
          <TopbarBreadcrumb />
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
