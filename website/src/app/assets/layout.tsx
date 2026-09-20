import type { Metadata } from "next";
import { cookies } from "next/headers";
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Topbar, TopbarBreadcrumb, TopbarActions } from "@/components/ui/topbar";
import { DocTopbarLabel, DocTopbarUpLink } from "@/components/doc-breadcrumb";
import { AppSwitcher } from "@/components/app-switcher";
import { AppNotifications } from "@/components/app-notifications";
import { CommandPaletteIconButton } from "@/components/command-palette";
import { AssetsSidebar } from "@/components/assets-sidebar";
import { assetCategories } from "@/lib/assets";
import { getSystemConfig } from "@/lib/system-configs";
import { getChatConversations } from "@/lib/chat-conversations";
import { getSystemsPagesIndex } from "@/lib/palette-index";

export const metadata: Metadata = {
  title: "Assets da Marca",
};

/** slug → título oficial (com acentos) para o breadcrumb. */
const ASSET_LABELS: Record<string, string> = Object.fromEntries(
  assetCategories.map((c) => [c.slug, c.title]),
);

export default async function AssetsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // "Voltar" contextual: o último system visitado (cookie do SystemTracker).
  const cookieStore = await cookies();
  const lastSystem = cookieStore.get("overlens_last_system")?.value;
  // `sidebar_state`: quem recolhe a sidebar continua com ela recolhida no
  // próximo carregamento (o cookie é escrito pelo `SidebarProvider`).
  const sidebarOpen = cookieStore.get("sidebar_state")?.value !== "false";
  const config = getSystemConfig(lastSystem);

  return (
    <SidebarProvider defaultOpen={sidebarOpen}>
      <AssetsSidebar
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
          <DocTopbarUpLink label="Assets da Marca" basePath="/assets" labels={ASSET_LABELS} />
          <TopbarBreadcrumb>
            <DocTopbarLabel label="Assets da Marca" basePath="/assets" labels={ASSET_LABELS} />
          </TopbarBreadcrumb>
          <TopbarActions>
            {/* Só aparece no mobile: aqui a sidebar recolhe em modo "icon" e
                mantém o próprio botão de busca visível no desktop. */}
            <CommandPaletteIconButton sidebarCollapsesToIcon />
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
