import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Topbar, TopbarBreadcrumb, TopbarActions } from "@/components/ui/topbar";
import { SystemSidebar, type NavSection } from "@/components/doc-sidebar";
import { getChatConversations } from "@/lib/chat-conversations";
import { AppSwitcher } from "@/components/app-switcher";
import { AppNotifications } from "@/components/app-notifications";

// As "tabs" do painel viram páginas na coluna lateral. "Perguntas" é o
// índice (basePath); as demais são seções-folha que renderizam como links.
const ADMIN_NAV: NavSection[] = [
  {
    slug: "membros",
    title: "Membros",
    segments: ["membros"],
    files: [{ slug: "membros", title: "Membros", segments: ["membros"] }],
    children: [],
  },
  {
    slug: "temas",
    title: "Temas & Feedback",
    segments: ["temas"],
    files: [{ slug: "temas", title: "Temas & Feedback", segments: ["temas"] }],
    children: [],
  },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const conversations = await getChatConversations();

  return (
    <SidebarProvider>
      <SystemSidebar
        sections={ADMIN_NAV}
        basePath="/admin/insights"
        title="Painel Admin"
        subtitle="Insights de IA"
        indexLabel="Perguntas"
        conversations={conversations}
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
