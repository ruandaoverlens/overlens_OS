import type { Metadata } from "next";
import { connection } from "next/server";
import { cookies } from "next/headers";
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Topbar, TopbarBreadcrumb, TopbarActions } from "@/components/ui/topbar";
import { DocTopbarLabel, DocTopbarUpLink } from "@/components/doc-breadcrumb";
import { SystemSidebar } from "@/components/doc-sidebar";
import { AppSwitcher } from "@/components/app-switcher";
import { AppNotifications } from "@/components/app-notifications";
import { CommandPaletteIconButton } from "@/components/command-palette";
import { getSystemConfig } from "@/lib/system-configs";
import { getChatConversations } from "@/lib/chat-conversations";
import { getSystemsPagesIndex } from "@/lib/palette-index";

export const metadata: Metadata = {
  // O nome oficial do módulo — igual ao h1 da página e ao item do AppSwitcher.
  title: "Botões Mágicos",
};

/** segmento → título oficial (com acentos) para o breadcrumb. */
const FERRAMENTAS_LABELS: Record<string, string> = {
  "qr-code": "Gerador de QR Code",
  "otimizador-imagens": "Otimizador de Imagens",
  "conversor-cores": "Conversor de Cores",
  "conversor-formato": "Conversor de Formato",
  "otimizador-prompts": "Otimizador de Prompts",
  "calculadora-tempo": "Calculadora de Tempo",
};

export default async function FerramentasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Sidebar do último system visitado (como no chat): garante busca (Ctrl+K),
  // "voltar" ao system e "+" nova conversa também dentro das ferramentas.
  const cookieStore = await cookies();
  const lastSystem = cookieStore.get("overlens_last_system")?.value;
  // Mesma leitura dos demais layouts: o cookie é um só (path=/), então inverter a
  // semântica aqui faria a preferência de uma rota contradizer a das outras.
  const sidebarOpen = cookieStore.get("sidebar_state")?.value !== "false";
  const config = getSystemConfig(lastSystem);
  // Garante renderização dinâmica (conversas são por usuário) sem bloquear o shell.
  await connection();
  const conversations = getChatConversations();

  return (
    <SidebarProvider defaultOpen={sidebarOpen}>
      {/* Modo "icon" em vez de offcanvas: recolhida, a sidebar sumia inteira e
          levava junto a busca (Ctrl+K) e o "+" de nova conversa. */}
      <SystemSidebar
        collapsible="icon"
        sections={config.getNav()}
        basePath={config.basePath}
        title={config.title}
        subtitle={config.subtitle}
        separatorAfterIndex={config.separatorAfterIndex}
        footerLinks={config.footerLinks}
        backHref={config.basePath}
        backLabel={config.title}
        conversations={conversations}
        adminLinks={config.adminLinks}
        allSections={getSystemsPagesIndex()}
      />
      <SidebarInset id="main-content">
        <Topbar>
          <DocTopbarUpLink
            label="Botões Mágicos"
            basePath="/ferramentas"
            labels={FERRAMENTAS_LABELS}
          />
          <TopbarBreadcrumb>
            <DocTopbarLabel
              label="Botões Mágicos"
              basePath="/ferramentas"
              labels={FERRAMENTAS_LABELS}
            />
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
