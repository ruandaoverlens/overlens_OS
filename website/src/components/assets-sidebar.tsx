"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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
  SmFavoriteLineIcon,
  SmFolderLineIcon,
  SmDocLineIcon,
  SmAsteriskLineIcon,
  SmContrastLineIcon,
  SmAppsLineIcon,
  SmCognitionLineIcon,
  SmInvoiceLineIcon,
  SmGraphicEqLineIcon,
  SmImageLineIcon,
  SmPlaySolidIcon,
  SmOpenFolderLineIcon,
  SmArrowBackLineIcon,
} from "@/components/icons";
import { assetCategories } from "@/lib/assets";
import { SidebarProfile } from "@/components/sidebar-profile";

const iconMap: Record<string, React.ReactNode> = {
  "visao-geral": <SmHomeSolidIcon />,
  "favoritos": <SmFavoriteLineIcon />,
  "simbolos-e-logotipos": <SmAsteriskLineIcon />,
  "ativos-de-cor": <SmContrastLineIcon />,
  "ativos-de-tipografia": <SmDocLineIcon />,
  "biblioteca-de-icones": <SmAppsLineIcon />,
  "grafismos-e-patterns": <SmCognitionLineIcon />,
  "templates-e-layouts": <SmInvoiceLineIcon />,
  "sons-e-audios": <SmGraphicEqLineIcon />,
  "banco-de-imagens": <SmImageLineIcon />,
  "banco-de-videos": <SmPlaySolidIcon />,
  "objetos-3d": <SmCognitionLineIcon />,
};

export function AssetsSidebar() {
  const params = useParams();
  const currentSlug = (params?.slug as string) ?? "visao-geral";

  const navItems = assetCategories.filter((c) => c.group === "nav");
  const categoryItems = assetCategories.filter((c) => c.group === "category");

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex h-12 items-center justify-between pb-[2px] pl-4 pr-0">
          <Link href="/assets" className="flex items-center gap-2">
            <SmOpenFolderLineIcon className="size-5 text-[var(--surface-500)]" />
            <span className="text-sm font-medium text-[var(--surface-300)]">
              Assets da Marca
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
                <SidebarMenuItem key={item.slug}>
                  <SidebarMenuButton
                    isActive={currentSlug === item.slug}
                    size="sm"
                    asChild
                  >
                    <Link href={`/assets/${item.slug}`}>
                      {iconMap[item.slug]}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarSeparator className="my-2" />
              {categoryItems.map((item) => (
                <SidebarMenuItem key={item.slug}>
                  <SidebarMenuButton
                    isActive={currentSlug === item.slug}
                    size="sm"
                    asChild
                  >
                    <Link href={`/assets/${item.slug}`}>
                      {iconMap[item.slug]}
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
