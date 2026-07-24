"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  SmHomeSolidIcon,
  SmRegisteredLineIcon,
  SmDocLineIcon,
  SmAlertLineIcon,
  SmGraphicEqLineIcon,
  SmChatLineIcon,
  SmArrowBackLineIcon,
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
  { href: "/registros/marcas", title: "Marcas", icon: <SmRegisteredLineIcon /> },
  { href: "/registros/documentos", title: "Documentos", icon: <SmDocLineIcon /> },
  { href: "/registros/alertas", title: "Alertas", icon: <SmAlertLineIcon /> },
  { href: "/registros/radar", title: "Radar", icon: <SmGraphicEqLineIcon /> },
  { href: "/registros/assistente", title: "Assistente", icon: <SmChatLineIcon /> },
];

export function RegistrosSidebar() {
  const pathname = usePathname() ?? "/registros";

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
              Ativos Registrados
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
      </SidebarContent>
      <SidebarFooter>
        <SidebarProfile />
      </SidebarFooter>
    </Sidebar>
  );
}
