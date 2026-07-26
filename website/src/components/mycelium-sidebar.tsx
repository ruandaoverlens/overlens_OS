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
  SmDocLineIcon,
  SmAppsLineIcon,
  SmCognitionLineIcon,
  SmInvoiceLineIcon,
  SmGraphicEqLineIcon,
  SmImageLineIcon,
  SmPlaySolidIcon,
  SmChatLineIcon,
  SmLanguageLineIcon,
  SmGitForkLineIcon,
} from "@/components/icons";
import { myceliumCategories } from "@/lib/mycelium";
import { SidebarProfile } from "@/components/sidebar-profile";

const iconMap: Record<string, React.ReactNode> = {
  "feed": <SmHomeSolidIcon />,
  "favoritos": <SmFavoriteLineIcon />,
  "artigos": <SmDocLineIcon />,
  "videos": <SmPlaySolidIcon />,
  "imagens": <SmImageLineIcon />,
  "audios": <SmGraphicEqLineIcon />,
  "pdfs": <SmInvoiceLineIcon />,
  "skills": <SmCognitionLineIcon />,
  "posts": <SmChatLineIcon />,
  "sites": <SmLanguageLineIcon />,
};

// Fallback for slugs without a mapped icon
const fallbackIcon = <SmAppsLineIcon />;

export function MyceliumSidebar() {
  const params = useParams();
  const currentSlug = (params?.slug as string) ?? "feed";

  const navItems = myceliumCategories.filter((c) => c.group === "nav");
  const categoryItems = myceliumCategories.filter((c) => c.group === "category");

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex h-12 items-center justify-between pb-[2px] pl-4 pr-0">
          <Link href="/mycelium" className="flex items-center gap-2">
            <SmGitForkLineIcon className="size-6 text-[var(--surface-500)]" />
            <span className="text-sm font-medium text-[var(--surface-300)]">
              Mycelium
            </span>
          </Link>
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      <div className="h-2" />
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
                    <Link href={`/mycelium/${item.slug}`}>
                      {iconMap[item.slug] ?? fallbackIcon}
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
                    <Link href={`/mycelium/${item.slug}`}>
                      {iconMap[item.slug] ?? fallbackIcon}
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
