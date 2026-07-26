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

interface RegistrosNavItem {
  href: string;
  title: string;
  icon: React.ReactNode;
  /** true = ativo apenas no match exato; false = ativo em qualquer subrota. */
  exact?: boolean;
}

const navItems: RegistrosNavItem[] = [
  { href: "/registros", title: "Visão Geral", icon: <SmHomeSolidIcon />, exact: true },
  { href: "/registros/busca", title: "Busca", icon: <SmSearchLineIcon /> },
  { href: "/registros/assistente", title: "Assistente", icon: <SmChatLineIcon /> },
  { href: "/registros/marcas", title: "Marcas", icon: <SmRegisteredLineIcon /> },
  { href: "/registros/dominios", title: "Domínios", icon: <SmLanguageLineIcon /> },
  { href: "/registros/registrar", title: "Processos", icon: <SmVerifiedLineIcon /> },
  { href: "/registros/documentos", title: "Documentos", icon: <SmDocLineIcon /> },
  { href: "/registros/alertas", title: "Alertas", icon: <SmAlertLineIcon /> },
  { href: "/registros/radar", title: "Radar", icon: <SmGraphicEqLineIcon /> },
];

export interface RegistrosConversaLink {
  id: string;
  title: string;
}

export function RegistrosSidebar({
  conversas = [],
}: {
  conversas?: RegistrosConversaLink[];
}) {
  const pathname = usePathname() ?? "/registros";
  const activeConversaId = pathname.startsWith("/registros/assistente/")
    ? pathname.split("/")[3]
    : undefined;

  const isActive = (item: RegistrosNavItem) =>
    item.exact
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(item.href + "/");

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex h-12 items-center justify-between pb-[2px] pl-4 pr-0">
          <Link href="/registros" className="flex items-center gap-2">
            <SmRegisteredLineIcon className="size-5 text-[var(--surface-500)]" />
            <span className="text-sm font-medium text-[var(--surface-300)]">
              Registros
            </span>
          </Link>
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      <div className="h-2" />
      <SidebarMenu className="p-2">
        <SidebarMenuItem>
          <SidebarMenuButton asChild size="sm">
            <Link href="/docs">
              <SmArrowBackLineIcon />
              <span>Brand System</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton isActive={isActive(item)} size="sm" asChild>
                    <Link href={item.href}>
                      {item.icon}
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
  );
}
