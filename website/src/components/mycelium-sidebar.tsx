"use client";

import React from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
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
  useSidebar,
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
  SmArrowBackLineIcon,
} from "@/components/icons";
import { myceliumCategories } from "@/lib/mycelium";
import { SidebarProfile } from "@/components/sidebar-profile";
import {
  CommandPalette,
  CommandPaletteButton,
  CommandPaletteProvider,
  NewConversationButton,
  type PaletteSource,
} from "@/components/command-palette";

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

export function MyceliumSidebar({
  backHref = "/docs",
  backLabel = "Brand System",
  palette,
}: {
  /** Destino do link "voltar" — o último system visitado (cookie). */
  backHref?: string;
  backLabel?: string;
  /** Páginas indexadas pela command palette (último system + demais). */
  palette?: PaletteSource;
}) {
  const params = useParams();
  const currentSlug = (params?.slug as string) ?? "feed";

  const { isMobile, setOpenMobile } = useSidebar();
  // No mobile a Sidebar é um drawer: fecha ao concluir uma navegação, para
  // que clicar num link não custe um toque extra. Só o pathname dispara —
  // acordeões e alternância de abas (query string) não fecham o drawer.
  const drawerPathname = usePathname();
  React.useEffect(() => {
    if (isMobile) setOpenMobile(false);
  }, [drawerPathname, isMobile, setOpenMobile]);

  const navItems = myceliumCategories.filter((c) => c.group === "nav");
  const categoryItems = myceliumCategories.filter((c) => c.group === "category");

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
              href="/mycelium"
              className="flex items-center gap-2 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-foreground group-data-[collapsible=icon]:hidden"
            >
              <SmGitForkLineIcon className="size-6 text-surface-500" aria-hidden="true" />
              <span className="text-sm font-medium text-surface-300">
                Mycelium
              </span>
            </Link>
            <SidebarTrigger />
          </div>
        </SidebarHeader>
        <SidebarContent>
          {/* "Voltar ao system" abre o bloco de navegação do drawer no mobile
              e da sidebar no desktop. */}
          <SidebarMenu className="p-2 pt-4">
            <SidebarMenuItem>
              <SidebarMenuButton asChild size="sm">
                <Link href={backHref}>
                  <SmArrowBackLineIcon aria-hidden="true" />
                  <span>{backLabel}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarSeparator />
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem className="mb-1.5">
                  <div className="flex items-center gap-1">
                    <CommandPaletteButton className="flex-1" />
                    <NewConversationButton />
                  </div>
                </SidebarMenuItem>
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
    </CommandPaletteProvider>
  );
}
