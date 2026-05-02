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
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  FileText,
  Workflow,
  Rss,
  ClipboardCheck,
} from "lucide-react";
import { SidebarProfile } from "@/components/sidebar-profile";

// ─── Navigation items ──────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/magny", icon: <LayoutDashboard className="size-4" /> },
  { label: "Relatórios", href: "/magny/reports", icon: <FileText className="size-4" /> },
  { label: "Pipeline", href: "/magny/pipeline", icon: <Workflow className="size-4" /> },
  { label: "Fontes", href: "/magny/sources", icon: <Rss className="size-4" /> },
  { label: "Revisão", href: "/magny/review", icon: <ClipboardCheck className="size-4" /> },
];

// ─── Sidebar component ────────────────────────────────────

export function MagnySidebar() {
  const pathname = usePathname();

  function isActive(href: string): boolean {
    if (href === "/magny") return pathname === "/magny";
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex h-12 items-center justify-between pb-[2px] pl-4 pr-0">
          <Link href="/magny">
            <span className="font-heading text-[28px] font-medium uppercase tracking-[-1px] text-foreground">
              Magny
            </span>
          </Link>
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      <SidebarContent className="justify-center">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton isActive={isActive(item.href)} size="sm" asChild>
                    <Link href={item.href}>
                      {item.icon}
                      <span>{item.label}</span>
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
