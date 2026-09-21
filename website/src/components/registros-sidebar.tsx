"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { ConversationItem } from "@/components/chat/conversation-item";
import {
  SmHomeSolidIcon,
  SmRegisteredLineIcon,
  SmDocLineIcon,
  SmAlertLineIcon,
  SmGraphicEqLineIcon,
  SmSearchLineIcon,
  SmChatLineIcon,
  SmArrowBackLineIcon,
  SmVerifiedLineIcon,
  SmLanguageLineIcon,
} from "@/components/icons";
import { SidebarProfile } from "@/components/sidebar-profile";
import { REGISTROS_NAV_ITEMS } from "@/lib/registros-nav";
import {
  CommandPalette,
  CommandPaletteButton,
  CommandPaletteProvider,
  NewConversationButton,
  type PaletteSource,
} from "@/components/command-palette";

const ICONS: Record<string, React.ReactNode> = {
  "/registros": <SmHomeSolidIcon />,
  "/registros/busca": <SmSearchLineIcon />,
  "/registros/assistente": <SmChatLineIcon />,
  "/registros/marcas": <SmRegisteredLineIcon />,
  "/registros/dominios": <SmLanguageLineIcon />,
  "/registros/registrar": <SmVerifiedLineIcon />,
  "/registros/documentos": <SmDocLineIcon />,
  "/registros/alertas": <SmAlertLineIcon />,
  "/registros/radar": <SmGraphicEqLineIcon />,
};

type RegistrosNavItem = (typeof REGISTROS_NAV_ITEMS)[number];

export interface RegistrosConversaLink {
  id: string;
  title: string;
}

export function RegistrosSidebar({
  conversas = [],
  backHref = "/docs",
  backLabel = "Brand System",
  palette,
}: {
  conversas?: RegistrosConversaLink[];
  /** Destino do link "voltar" no topo da sidebar. */
  backHref?: string;
  backLabel?: string;
  /** Páginas indexadas pela command palette (último system + demais). */
  palette?: PaletteSource;
}) {
  const pathname = usePathname() ?? "/registros";
  const activeConversaId = pathname.startsWith("/registros/assistente/")
    ? pathname.split("/")[3]
    : undefined;

  const isActive = (item: RegistrosNavItem) =>
    item.exact
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(item.href + "/");

  const { isMobile, setOpenMobile } = useSidebar();
  // No mobile a Sidebar é um drawer: fecha ao concluir uma navegação, para
  // que clicar num link não custe um toque extra. Só o pathname dispara —
  // acordeões e alternância de abas (query string) não fecham o drawer.
  React.useEffect(() => {
    if (isMobile) setOpenMobile(false);
  }, [pathname, isMobile, setOpenMobile]);

  return (
    <CommandPaletteProvider>
      <CommandPalette
        sections={palette?.sections}
        basePath={palette?.basePath ?? backHref}
        title={palette?.title ?? backLabel}
        allSections={palette?.allSections}
        conversations={palette?.conversations}
      />
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex h-12 items-center justify-between pb-0.5 pl-4 pr-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:pl-0">
            <Link
              href="/registros"
              className="flex items-center gap-2 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-foreground group-data-[collapsible=icon]:hidden"
            >
              <SmRegisteredLineIcon className="size-5 text-surface-500" aria-hidden="true" />
              <span className="text-sm font-medium text-surface-300">
                Registros
              </span>
            </Link>
            <SidebarTrigger />
          </div>
        </SidebarHeader>
        <SidebarContent>
          {/* "Voltar ao system" abre o bloco de navegação do drawer no mobile
              e da sidebar no desktop. */}
          <SidebarMenu className="p-2 pt-4">
            <SidebarMenuItem className="flex items-center gap-1">
              <SidebarMenuButton asChild size="sm">
                <Link href={backHref}>
                  <SmArrowBackLineIcon aria-hidden="true" />
                  <span>{backLabel}</span>
                </Link>
              </SidebarMenuButton>
              {/* "Nova conversa" fica nesta linha, não junto da busca. */}
              <NewConversationButton className="group-data-[collapsible=icon]:hidden" />
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarSeparator />
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem className="mb-1.5">
                  <CommandPaletteButton />
                </SidebarMenuItem>
                {REGISTROS_NAV_ITEMS.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton isActive={isActive(item)} size="sm" asChild>
                      <Link href={item.href}>
                        {ICONS[item.href]}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          {conversas.length > 0 && (
            <SidebarGroup>
              <SidebarGroupLabel>Conversas</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {conversas.map((c) => (
                    <ConversationItem
                      key={c.id}
                      id={c.id}
                      title={c.title}
                      isActive={activeConversaId === c.id}
                      hrefBase="/registros/assistente"
                      apiBase="/api/registros/assistente/conversas"
                      homeHref="/registros/assistente"
                    />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>
        <SidebarFooter>
          <SidebarProfile />
        </SidebarFooter>
      </Sidebar>
    </CommandPaletteProvider>
  );
}
