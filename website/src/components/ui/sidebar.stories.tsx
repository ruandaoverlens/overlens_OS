import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import {
  SmHomeSolidIcon,
  SmChatSolidIcon,
  SmCalendarSolidIcon,
  SmPlaySolidIcon,
  SmLibrarySolidIcon,
  MdDownloadSolidIcon,
  SmCrownSolidIcon,
  SmSettingsLineIcon,
  SmLogoutLineIcon,
  SmArrowUpwardLineIcon,
  SmHelpLineIcon,
  SmArrowOutwardLineIcon,
  SmDocSolidIcon,
  SmInfoSolidIcon,
  SmBugLineIcon,
  SmAdd2LineIcon,
  SmFolderSolidIcon,
  SmMoreLineIcon,
  SmArrowForwardIosLineIcon,
  SmArrowForwardIosLine1Icon,
} from "@/components/icons";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarProvider,
  SidebarHeader,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  SidebarSearch,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarGroupAction,
  SidebarMenuAction,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarSeparator,
  SidebarRail,
} from "./sidebar";
import { CommandGroup, CommandItem } from "./command";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "./dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "./avatar";
import { Badge } from "./badge";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "./collapsible";
import { TopbarStreak, TopbarFractals, TopbarRankPosition } from "./topbar";
import { Users } from "lucide-react";

const demoMobileHeader = <><TopbarStreak count={7} className="inline-flex" /><TopbarRankPosition position={12} className="inline-flex" /><TopbarFractals count={1469} className="inline-flex" /></>;

const meta = {
  title: "Core Components/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <SidebarProvider>
        <Story />
      </SidebarProvider>
    ),
  ],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: [
          "Sidebar colapsável com fallback responsivo para mobile (Drawer). Apenas lado esquerdo. Suporta variantes sidebar, floating e inset, com modos de colapso offcanvas, icon e none. No mobile, use SidebarMobileTrigger para exibir o botão hamburger.",
          "",
          "## Regras de layout",
          "",
          "- **SidebarHeader**: usa `pt-1 pb-2 pl-2 pr-0` - top reduzido para ajuste óptico do logo/icon. No modo colapsado (`icon`), `pt-2` restaura alinhamento vertical do ícone.",
          "- **Header inner div**: use `pl-2 pr-0` (não `px-2`) no container flex do logo + trigger",
          "- **SidebarTrigger offcanvas**: posicionado `fixed top-3 left-3 z-40` quando collapsed - fica acima do Topbar (`z-[5]`)",
          "- **Sidebar gap offcanvas collapsed**: mantém `w-10` para acomodar o trigger sem sobrepor o conteúdo",
          "- **SidebarSearch command**: abre a `top-[180px]` com fundo sólido `bg-[var(--surface-950)]`",
          "",
          "## Collapse mode (icon)",
          "",
          "When `collapsible=\"icon\"`, the sidebar shrinks to an icon-only strip (`--sidebar-width-icon: 3rem`). `SidebarMenuButton` auto-hides `<span>` text and centers icons via `group-data-[collapsible=icon]` selectors. `SidebarMenuBadge` auto-hides in icon mode. `SidebarSearch` shows only the search icon.",
          "",
          "## Header in icon mode",
          "",
          "Logo text hides and the trigger centers - apply `group-data-[collapsible=icon]:hidden` on the logo element and `group-data-[collapsible=icon]:justify-center` on its container.",
          "",
          "## Footer in icon mode",
          "",
          "User info text hides and the avatar centers - apply `group-data-[collapsible=icon]:hidden` on the text div.",
          "",
          "## Mobile trigger (hamburger)",
          "",
          "Positioned `fixed top-3 left-3 z-50 md:hidden`. Color `text-muted-foreground` - matches topbar action icons. Opens a `Drawer` (bottom sheet) with `SidebarContent` only (no header/footer/logo).",
          "",
          "## Menu items",
          "",
          "Always include icons from `@/components/icons`. Use `SidebarMenuButton` with `isActive` for current page.",
          "",
          "## Badge styling",
          "",
          "`font-mono text-[11px] text-[var(--surface-500)] opacity-50`.",
          "",
          "## Footer",
          "",
          "User dropdown with avatar + name + subscription tier. Dropdown opens `side=\"top\" align=\"start\" sideOffset={8}`. First item: user profile with avatar + name + @username. Separator between profile, actions, and logout.",
          "",
          "## Sub menus (nested collapsible)",
          "",
          "Use `Collapsible` + `CollapsibleTrigger` + `CollapsibleContent` inside `SidebarMenuItem` for multi-level navigation. Chevron icon rotates via `[[data-state=closed]_&]:-rotate-90`. Nest levels with `pl-4` on each `CollapsibleContent` wrapper.",
          "",
          "## External links",
          "",
          "Use `SmArrowOutwardLineIcon` with `!size-5` to override `SidebarMenuButton`'s default `[&>svg]:size-6`. Separate external links from main menu with a custom divider (`div.h-px.bg-white/10`) inside a `SidebarMenuItem`.",
          "",
          "## Logo",
          "",
          "`font-heading text-[24px] font-medium uppercase tracking-wide`.",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["sidebar", "floating", "inset"],
      description: "Estilo visual do sidebar",
      table: { category: "Aparência", defaultValue: { summary: "sidebar" } },
    },
    collapsible: {
      control: "select",
      options: ["offcanvas", "icon", "none"],
      description: "Modo de colapso do sidebar",
      table: { category: "Comportamento", defaultValue: { summary: "offcanvas" } },
    },
    // @ts-expect-error - custom args not on Sidebar props
    search: {
      control: "boolean",
      description: "Exibe barra de busca no topo do menu",
      table: { category: "Comportamento", defaultValue: { summary: "true" } },
    },
    // @ts-expect-error - custom args not on Sidebar props
    itemsAlign: {
      control: "select",
      options: ["top", "center", "bottom"],
      description: "Alinhamento vertical dos itens do menu",
      table: { category: "Aparência", defaultValue: { summary: "center" } },
    },
  },
  // @ts-expect-error - custom args
  args: { variant: "sidebar", collapsible: "offcanvas", search: true, itemsAlign: "center" },
} satisfies Meta<typeof Sidebar>;

type CustomArgs = {
  search?: boolean;
  itemsAlign?: "top" | "center" | "bottom";
};

function getAlignClass(itemsAlign: CustomArgs["itemsAlign"] = "center") {
  return itemsAlign === "top" ? "justify-start" : itemsAlign === "bottom" ? "justify-end" : "items-center justify-center";
}

export default meta;
type Story = StoryObj<typeof meta>;

const items = [
  { title: "Principal", icon: SmHomeSolidIcon, active: true },
  { title: "Lives", icon: SmCalendarSolidIcon },
  { title: "Trilhas", icon: SmPlaySolidIcon },
  { title: "Biblioteca", icon: SmLibrarySolidIcon },
  { title: "Materiais", icon: MdDownloadSolidIcon },
  { title: "Missões", icon: SmCrownSolidIcon, badge: "EM BREVE", disabled: true },
];

/**
 * Subscription tiers metadata:
 * - "Básico" - free / no subscription
 * - "Overpass" - standard paid subscription
 * - "Blackpass" - premium tier
 * - "Vanguarda" - top tier
 */
const user = {
  name: "Ruan Braz",
  username: "ruanbraz",
  avatar: "",
  initials: "RB",
  subscription: "Overpass" as "Básico" | "Overpass" | "Blackpass" | "Vanguarda",
};

const dropdownItemClass = "h-10 rounded-lg text-[var(--surface-400)] hover:text-[var(--surface-200)] [&_svg:not([class*='text-'])]:text-[var(--surface-400)] [&_svg:not([class*='size-'])]:size-5";

function SidebarUserFooter() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex w-full items-center gap-3 rounded-md pl-3 pr-4 py-3 text-left transition-colors outline-hidden hover:bg-sidebar-accent group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0">
          <Avatar size="default">
            {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
            <AvatarFallback>{user.initials}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-normal text-sidebar-foreground">{user.name}</span>
            <span className="truncate text-xs text-[var(--surface-500)]">{user.subscription}</span>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-56">
        <DropdownMenuItem className={`${dropdownItemClass} mb-2 h-12 gap-2 pl-1.5`}>
          <Avatar size="default">
            {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
            <AvatarFallback>{user.initials}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-normal text-sidebar-foreground">{user.name}</span>
            <span className="truncate text-xs text-[var(--surface-500)]">@{user.username}</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className={dropdownItemClass}>
          <SmArrowUpwardLineIcon />
          <span>Upgrade do plano</span>
        </DropdownMenuItem>
        <DropdownMenuItem className={dropdownItemClass}>
          <Users className="size-5" />
          <span>Comunidade</span>
        </DropdownMenuItem>
        <DropdownMenuItem className={dropdownItemClass}>
          <SmSettingsLineIcon />
          <span>Configurações</span>
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className={dropdownItemClass}>
            <SmHelpLineIcon />
            <span>Ajuda</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent sideOffset={8} alignOffset={-124} className="min-w-[200px]">
            <DropdownMenuItem className={`${dropdownItemClass} group/ext justify-between`}>
              <span className="flex items-center gap-2"><SmHelpLineIcon className="size-5" />Central de ajuda</span>
              <SmArrowOutwardLineIcon className="size-4 opacity-0 group-hover/ext:opacity-100 transition-opacity" />
            </DropdownMenuItem>
            <DropdownMenuItem className={`${dropdownItemClass} group/ext justify-between`}>
              <span className="flex items-center gap-2"><SmDocSolidIcon className="size-5" />Termos e Política</span>
              <SmArrowOutwardLineIcon className="size-4 opacity-0 group-hover/ext:opacity-100 transition-opacity" />
            </DropdownMenuItem>
            <DropdownMenuItem className={dropdownItemClass}>
              <SmInfoSolidIcon />
              <span>Atalhos do Teclado</span>
            </DropdownMenuItem>
            <DropdownMenuItem className={dropdownItemClass}>
              <SmBugLineIcon />
              <span>Informar Bug</span>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem className={dropdownItemClass}>
          <SmLogoutLineIcon />
          <span>Desconectar</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Helper: wraps content in a flex container that makes the sidebar position relative for story rendering. */
const sidebarFrame = "[&_[data-slot=sidebar-container]]:relative [&_[data-slot=sidebar-container]]:h-full";

export const Default: Story = {
  render: (args) => {
    const { search = true, itemsAlign = "center", ...sidebarArgs } = args as typeof args & CustomArgs;

    return (
      <div className={`flex min-h-[400px] ${sidebarFrame}`}>
        <Sidebar {...sidebarArgs} mobileHeader={demoMobileHeader}>
          <SidebarHeader>
            <div className="flex items-center justify-between pl-2 pr-0">
              <span className="font-heading text-[24px] font-medium uppercase tracking-wide text-sidebar-foreground">
                Overlens®
              </span>
              <SidebarTrigger />
            </div>
          </SidebarHeader>
          <SidebarContent className={`flex flex-1 ${getAlignClass(itemsAlign)}`}>
            <SidebarMenu className="px-2">
              {search && (
                <SidebarMenuItem className="mb-5">
                  <SidebarSearch>
                    <CommandGroup heading="Páginas">
                      {items.map((item) => (
                        <CommandItem key={item.title}>
                          <item.icon />
                          <span>{item.title}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </SidebarSearch>
                </SidebarMenuItem>
              )}
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton isActive={item.active} disabled={item.disabled}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                  {item.badge && (
                    <SidebarMenuBadge className="pt-px font-mono text-[11px] text-[var(--surface-500)] opacity-50">
                      {item.badge}
                    </SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarUserFooter />
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-12 items-center gap-2 px-4" />
        </SidebarInset>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Sidebar inicia expandido - menu items visiveis
    const principal = canvas.getByRole("button", { name: /principal/i });
    await expect(principal).toBeVisible();

    // Clica no trigger para colapsar (usa o trigger visível dentro do header)
    const trigger = canvasElement.querySelector<HTMLButtonElement>("[data-sidebar='trigger']:not([data-slot='sidebar-offcanvas-trigger'])");
    await expect(trigger).toBeTruthy();
    await userEvent.click(trigger!);

    // Sidebar colapsa - wrapper transita para collapsed
    const wrapper = canvasElement.querySelector("[data-slot='sidebar'][data-state]");
    await expect(wrapper).toHaveAttribute("data-state", "collapsed");

    // Clica novamente para expandir
    await userEvent.click(trigger!);
    await expect(wrapper).toHaveAttribute("data-state", "expanded");
  },
};

export const CollapsedWithIcon: Story = {
  decorators: [
    (Story) => (
      <SidebarProvider defaultOpen={false}>
        <Story />
      </SidebarProvider>
    ),
  ],
  render: (args) => {
    const { search = true, itemsAlign = "center", ...sidebarArgs } = args as typeof args & CustomArgs;

    return (
      <div className={`flex min-h-[400px] ${sidebarFrame}`}>
        <Sidebar {...sidebarArgs} collapsible="icon" mobileHeader={demoMobileHeader}>
          <SidebarHeader className="group-data-[collapsible=icon]:items-center">
            <div className="flex items-center justify-between pl-2 pr-0">
              <span className="font-heading text-[24px] font-medium uppercase tracking-wide text-sidebar-foreground group-data-[collapsible=icon]:hidden">
                Overlens®
              </span>
              <SidebarTrigger />
            </div>
          </SidebarHeader>
          <SidebarContent className={`flex flex-1 ${getAlignClass(itemsAlign)}`}>
            <SidebarMenu className="px-2">
              {search && (
                <SidebarMenuItem className="mb-5">
                  <SidebarSearch>
                    <CommandGroup heading="Páginas">
                      {items.map((item) => (
                        <CommandItem key={item.title}>
                          <item.icon />
                          <span>{item.title}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </SidebarSearch>
                </SidebarMenuItem>
              )}
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton isActive={item.active} tooltip={item.title}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="group-data-[collapsible=icon]:items-center">
            <SidebarUserFooter />
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-12 items-center gap-2 px-4" />
        </SidebarInset>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    // Verify collapsed state renders
    const wrapper = canvasElement.querySelector("[data-slot='sidebar'][data-state]");
    await expect(wrapper).toHaveAttribute("data-state", "collapsed");
    await expect(wrapper).toHaveAttribute("data-collapsible", "icon");

    // Toggle to expand
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /toggle sidebar/i });
    await userEvent.click(trigger);
    await expect(wrapper).toHaveAttribute("data-state", "expanded");

    // Toggle back to collapsed
    await userEvent.click(trigger);
    await expect(wrapper).toHaveAttribute("data-state", "collapsed");
  },
};

export const Floating: Story = {
  render: (args) => {
    const { search = true, itemsAlign = "center", ...sidebarArgs } = args as typeof args & CustomArgs;

    return (
      <div className={`flex min-h-[400px] ${sidebarFrame}`}>
        <Sidebar {...sidebarArgs} variant="floating" collapsible="icon" mobileHeader={demoMobileHeader}>
          <SidebarHeader className="group-data-[collapsible=icon]:items-center">
            <div className="flex items-center justify-between pl-2 pr-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
              <span className="font-heading text-[24px] font-medium uppercase tracking-wide text-sidebar-foreground group-data-[collapsible=icon]:hidden">
                Overlens®
              </span>
              <SidebarTrigger />
            </div>
          </SidebarHeader>
          <SidebarContent className={`flex flex-1 ${getAlignClass(itemsAlign)}`}>
            <SidebarMenu className="px-2">
              {search && (
                <SidebarMenuItem className="mb-5">
                  <SidebarSearch>
                    <CommandGroup heading="Páginas">
                      {items.map((item) => (
                        <CommandItem key={item.title}>
                          <item.icon />
                          <span>{item.title}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </SidebarSearch>
                </SidebarMenuItem>
              )}
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton isActive={item.active} disabled={item.disabled} tooltip={item.title}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="group-data-[collapsible=icon]:items-center">
            <SidebarUserFooter />
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-12 items-center gap-2 px-4" />
        </SidebarInset>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const wrapper = canvasElement.querySelector("[data-slot='sidebar'][data-state]");
    await expect(wrapper).toHaveAttribute("data-variant", "floating");
    await expect(wrapper).toHaveAttribute("data-state", "expanded");

    // Toggle to collapsed - maintains icon mode
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /toggle sidebar/i });
    await userEvent.click(trigger);
    await expect(wrapper).toHaveAttribute("data-state", "collapsed");
    await expect(wrapper).toHaveAttribute("data-collapsible", "icon");

    // Toggle back
    await userEvent.click(trigger);
    await expect(wrapper).toHaveAttribute("data-state", "expanded");
  },
};

/** Sidebar with collapsible="none" - no collapse behavior, always expanded. */
export const NonCollapsible: Story = {
  render: (args) => {
    const { search = true, itemsAlign = "center", ...sidebarArgs } = args as typeof args & CustomArgs;

    return (
      <div className={`flex min-h-[400px] ${sidebarFrame}`}>
        <Sidebar {...sidebarArgs} collapsible="none" mobileHeader={demoMobileHeader}>
          <SidebarHeader>
            <div className="px-2">
              <span className="font-heading text-[24px] font-medium uppercase tracking-wide text-sidebar-foreground">
                Overlens®
              </span>
            </div>
          </SidebarHeader>
          <SidebarContent className={`flex flex-1 ${getAlignClass(itemsAlign)}`}>
            <SidebarMenu className="px-2">
              {search && (
                <SidebarMenuItem className="mb-5">
                  <SidebarSearch>
                    <CommandGroup heading="Páginas">
                      {items.slice(0, 3).map((item) => (
                        <CommandItem key={item.title}>
                          <item.icon />
                          <span>{item.title}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </SidebarSearch>
                </SidebarMenuItem>
              )}
              {items.slice(0, 3).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton isActive={item.active}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarUserFooter />
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 p-4" />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    // collapsible="none" renders a plain div without data-state
    const sidebar = canvasElement.querySelector("[data-slot='sidebar']");
    await expect(sidebar).toBeInTheDocument();
    // Should NOT have data-state attribute since it's not collapsible
    await expect(sidebar).not.toHaveAttribute("data-state");
  },
};

/** Sidebar with variant="inset" - content area indented with rounded corners. */
export const InsetVariant: Story = {
  render: (args) => {
    const { search = true, itemsAlign = "center", ...sidebarArgs } = args as typeof args & CustomArgs;

    return (
      <div className={`flex min-h-[400px] ${sidebarFrame}`}>
        <Sidebar {...sidebarArgs} variant="inset" mobileHeader={demoMobileHeader}>
          <SidebarHeader>
            <div className="flex items-center justify-between pl-2 pr-0">
              <span className="font-heading text-[24px] font-medium uppercase tracking-wide text-sidebar-foreground">
                Overlens®
              </span>
              <SidebarTrigger />
            </div>
          </SidebarHeader>
          <SidebarContent className={`flex flex-1 ${getAlignClass(itemsAlign)}`}>
            <SidebarMenu className="px-2">
              {search && (
                <SidebarMenuItem className="mb-5">
                  <SidebarSearch>
                    <CommandGroup heading="Páginas">
                      {items.slice(0, 4).map((item) => (
                        <CommandItem key={item.title}>
                          <item.icon />
                          <span>{item.title}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </SidebarSearch>
                </SidebarMenuItem>
              )}
              {items.slice(0, 4).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton isActive={item.active}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarUserFooter />
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-12 items-center gap-2 px-4" />
        </SidebarInset>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const wrapper = canvasElement.querySelector("[data-slot='sidebar'][data-state]");
    await expect(wrapper).toHaveAttribute("data-variant", "inset");
    await expect(wrapper).toHaveAttribute("data-state", "expanded");
  },
};

/** Exercises SidebarGroup, SidebarGroupLabel, SidebarGroupContent, and SidebarGroupAction. */
export const WithGroups: Story = {
  render: (args) => {
    const { search = true, itemsAlign = "center", ...sidebarArgs } = args as typeof args & CustomArgs;

    return (
    <div className={`flex min-h-[500px] ${sidebarFrame}`}>
      <Sidebar {...sidebarArgs} mobileHeader={demoMobileHeader}>
        <SidebarHeader>
          <div className="flex items-center justify-between pl-2 pr-0">
            <span className="font-heading text-[24px] font-medium uppercase tracking-wide text-sidebar-foreground">
              Overlens®
            </span>
            <SidebarTrigger />
          </div>
        </SidebarHeader>
        <SidebarContent className={`${getAlignClass(itemsAlign)}`}>
          {search && (
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarSearch>
                      <CommandGroup heading="Páginas">
                        {items.map((item) => (
                          <CommandItem key={item.title}>
                            <item.icon />
                            <span>{item.title}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </SidebarSearch>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
          <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarGroupAction aria-label="Adicionar item">
              <SmAdd2LineIcon className="size-5" />
            </SidebarGroupAction>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.slice(0, 3).map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton isActive={item.active}>
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarSeparator />
          <SidebarGroup>
            <SidebarGroupLabel>Configurações</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <SmSettingsLineIcon />
                    <span>Preferências</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarUserFooter />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-12 items-center gap-2 px-4" />
      </SidebarInset>
    </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Group labels render
    const menuLabel = canvasElement.querySelector("[data-slot='sidebar-group-label']");
    await expect(menuLabel).toBeInTheDocument();
    await expect(menuLabel).toHaveTextContent("Menu");

    // Group action button renders
    const groupAction = canvas.getByRole("button", { name: /adicionar item/i });
    await expect(groupAction).toBeInTheDocument();

    // Group content renders
    const groupContent = canvasElement.querySelector("[data-slot='sidebar-group-content']");
    await expect(groupContent).toBeInTheDocument();

    // Separator renders
    const separator = canvasElement.querySelector("[data-slot='sidebar-separator']");
    await expect(separator).toBeInTheDocument();

    // Second group label
    const allLabels = canvasElement.querySelectorAll("[data-slot='sidebar-group-label']");
    await expect(allLabels.length).toBe(2);
    await expect(allLabels[1]).toHaveTextContent("Configurações");

    // Click group action
    await userEvent.click(groupAction);
  },
};

/** Exercises SidebarMenuAction with showOnHover. */
export const WithMenuActions: Story = {
  render: (args) => {
    const { search = true, itemsAlign = "center", ...sidebarArgs } = args as typeof args & CustomArgs;

    return (
    <div className={`flex min-h-[400px] ${sidebarFrame}`}>
      <Sidebar {...sidebarArgs} mobileHeader={demoMobileHeader}>
        <SidebarHeader>
          <div className="flex items-center justify-between pl-2 pr-0">
            <span className="font-heading text-[24px] font-medium uppercase tracking-wide text-sidebar-foreground">
              Overlens®
            </span>
            <SidebarTrigger />
          </div>
        </SidebarHeader>
        <SidebarContent className={`${getAlignClass(itemsAlign)}`}>
          <SidebarMenu className="px-2">
            <SidebarMenuItem>
              <SidebarMenuButton isActive>
                <SmFolderSolidIcon />
                <span>Projetos</span>
              </SidebarMenuButton>
              <SidebarMenuAction aria-label="Mais opções">
                <SmMoreLineIcon className="size-5" />
              </SidebarMenuAction>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <SmDocSolidIcon />
                <span>Documentos</span>
              </SidebarMenuButton>
              <SidebarMenuAction showOnHover aria-label="Opções documento">
                <SmMoreLineIcon className="size-5" />
              </SidebarMenuAction>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <SmCalendarSolidIcon />
                <span>Agenda</span>
              </SidebarMenuButton>
              <SidebarMenuBadge>
                <Badge variant="secondary" className="font-mono text-[11px] px-1.5 py-0 h-5 min-w-5">3</Badge>
              </SidebarMenuBadge>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarUserFooter />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-12 items-center gap-2 px-4" />
      </SidebarInset>
    </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Menu action button renders (always visible one)
    const moreBtn = canvas.getByRole("button", { name: /mais opções/i });
    await expect(moreBtn).toBeInTheDocument();
    await expect(moreBtn).toHaveAttribute("data-sidebar", "menu-action");

    // showOnHover action also renders
    const docAction = canvas.getByRole("button", { name: /opções documento/i });
    await expect(docAction).toBeInTheDocument();

    // Badge renders
    const badge = canvasElement.querySelector("[data-slot='sidebar-menu-badge']");
    await expect(badge).toBeInTheDocument();
    await expect(badge).toHaveTextContent("3");

    // Click the always-visible action
    await userEvent.click(moreBtn);
  },
};

/** Exercises collapsible parent/child menu items with chevron indicators and nested levels. */
export const WithSubMenus: Story = {
  render: (args) => {
    const { search = true, itemsAlign = "center", ...sidebarArgs } = args as typeof args & CustomArgs;

    const chevronDown = "ml-auto size-4 shrink-0 opacity-50 transition-transform duration-200 [[data-state=closed]_&]:-rotate-90";
    const chevronRight = "ml-auto size-4 shrink-0 opacity-50";
    const linkIcon = "ml-auto size-4 shrink-0 opacity-50";

    return (
    <div className={`flex min-h-[400px] ${sidebarFrame}`}>
      <Sidebar {...sidebarArgs} mobileHeader={demoMobileHeader}>
        <SidebarHeader>
          <div className="flex items-center justify-between pl-2 pr-0">
            <span className="font-heading text-[24px] font-medium uppercase tracking-wide text-sidebar-foreground">
              Overlens®
            </span>
            <SidebarTrigger />
          </div>
        </SidebarHeader>
        <SidebarContent className={`${getAlignClass(itemsAlign)}`}>
          <SidebarMenu className="gap-1 px-2">
            {/* Leaf - no children */}
            <SidebarMenuItem>
              <SidebarMenuButton size="sm" isActive className="pr-3">
                <span>Introdução</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* L1 - open, has L2 children */}
            <Collapsible defaultOpen className="w-full">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton size="sm" className="pr-3">
                    <span>Mercado e Público</span>
                    <SmArrowForwardIosLine1Icon className={chevronDown} />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="flex flex-col gap-1 pt-1 pl-4">
                    {/* L2 - has L3 children, starts open */}
                    <Collapsible defaultOpen className="w-full">
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton size="sm" className="pr-3">
                          <span>Mercado</span>
                          <SmArrowForwardIosLine1Icon className={chevronDown} />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="flex flex-col gap-1 pt-1 pl-4">
                          {/* L3 - terminal leaves, no chevron */}
                          <SidebarMenuButton size="sm" className="pr-3">
                            <span>Mercado</span>
                          </SidebarMenuButton>
                          <SidebarMenuButton size="sm" className="pr-3">
                            <span>Segmento</span>
                          </SidebarMenuButton>
                          <SidebarMenuButton size="sm" className="pr-3">
                            <span>TAM SAM SOM</span>
                          </SidebarMenuButton>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    {/* L2 - leaves, no chevron */}
                    <SidebarMenuButton size="sm" className="pr-3">
                      <span>Público</span>
                    </SidebarMenuButton>
                    <SidebarMenuButton size="sm" className="pr-3">
                      <span>Personas</span>
                    </SidebarMenuButton>
                    <SidebarMenuButton size="sm" className="pr-3">
                      <span>Benchmarking</span>
                    </SidebarMenuButton>
                  </div>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>

            {/* L1 - leaves, no chevron */}
            <SidebarMenuItem>
              <SidebarMenuButton size="sm" className="pr-3">
                <span>Ofertas</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton size="sm" className="pr-3">
                <span>Estratégia</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton size="sm" className="pr-3">
                <span>Produtos</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          {/* External links section */}
          <SidebarMenu className="px-2">
            <SidebarMenuItem>
              <div className="my-2 mx-3 h-px bg-white/10" aria-hidden="true" />
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton size="sm" className="pr-3">
                <span>Playbook de Operação</span>
                <SmArrowOutwardLineIcon className="ml-auto !size-5 shrink-0" />
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton size="sm" className="pr-3">
                <span>Playbook de Gestão</span>
                <SmArrowOutwardLineIcon className="ml-auto !size-5 shrink-0" />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarUserFooter />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-12 items-center gap-2 px-4" />
      </SidebarInset>
    </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // L1 "Mercado e Público" starts open, L2 "Mercado" starts open with L3 children
    await expect(canvas.getByText("Segmento")).toBeInTheDocument();
    await expect(canvas.getByText("TAM SAM SOM")).toBeInTheDocument();

    // Collapse L2 "Mercado"
    await userEvent.click(canvas.getAllByText("Mercado")[0]);

    // External links section visible
    await expect(canvas.getByText("Playbook de Operação")).toBeInTheDocument();
  },
};

/** Exercises SidebarMenuButton with outline variant and different sizes. */
export const MenuButtonVariants: Story = {
  render: (args) => {
    const { itemsAlign = "center", ...sidebarArgs } = args as typeof args & CustomArgs;

    return (
    <div className={`flex min-h-[400px] ${sidebarFrame}`}>
      <Sidebar {...sidebarArgs} mobileHeader={demoMobileHeader}>
        <SidebarHeader>
          <div className="flex items-center justify-between pl-2 pr-0">
            <span className="font-heading text-[24px] font-medium uppercase tracking-wide text-sidebar-foreground">
              Overlens®
            </span>
            <SidebarTrigger />
          </div>
        </SidebarHeader>
        <SidebarContent className={`${getAlignClass(itemsAlign)}`}>
          <SidebarGroup>
            <SidebarGroupLabel>Tamanhos e Variantes</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton size="sm" data-testid="btn-sm">
                    <SmHomeSolidIcon />
                    <span>Pequeno (sm)</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton size="default" data-testid="btn-default">
                    <SmChatSolidIcon />
                    <span>Padrão (default)</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton size="lg" data-testid="btn-lg">
                    <SmCalendarSolidIcon />
                    <span>Grande (lg)</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton outlined data-testid="btn-outline">
                    <SmSettingsLineIcon />
                    <span>Outline</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive data-testid="btn-active">
                    <SmPlaySolidIcon />
                    <span>Ativo</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarUserFooter />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-12 items-center gap-2 px-4" />
      </SidebarInset>
    </div>
    );
  },
  play: async ({ canvasElement }) => {
    // Size sm
    const btnSm = canvasElement.querySelector("[data-testid='btn-sm']");
    await expect(btnSm).toBeInTheDocument();
    await expect(btnSm).toHaveAttribute("data-size", "sm");

    // Size default
    const btnDefault = canvasElement.querySelector("[data-testid='btn-default']");
    await expect(btnDefault).toBeInTheDocument();
    await expect(btnDefault).toHaveAttribute("data-size", "default");

    // Size lg
    const btnLg = canvasElement.querySelector("[data-testid='btn-lg']");
    await expect(btnLg).toBeInTheDocument();
    await expect(btnLg).toHaveAttribute("data-size", "lg");

    // Outline variant
    const btnOutline = canvasElement.querySelector("[data-testid='btn-outline']");
    await expect(btnOutline).toBeInTheDocument();

    // Active state
    const btnActive = canvasElement.querySelector("[data-testid='btn-active']");
    await expect(btnActive).toHaveAttribute("data-active", "true");

    // Click each to exercise interaction
    await userEvent.click(btnSm!);
    await userEvent.click(btnOutline!);
    await userEvent.click(btnLg!);
  },
};


/** Exercises SidebarGroupLabel with asChild. */
export const GroupLabelAsChild: Story = {
  render: (args) => {
    const { itemsAlign = "center", ...sidebarArgs } = args as typeof args & CustomArgs;

    return (
    <div className={`flex min-h-[400px] ${sidebarFrame}`}>
      <Sidebar {...sidebarArgs} mobileHeader={demoMobileHeader}>
        <SidebarHeader>
          <div className="flex items-center justify-between pl-2 pr-0">
            <span className="font-heading text-[24px] font-medium uppercase tracking-wide text-sidebar-foreground">
              Overlens®
            </span>
            <SidebarTrigger />
          </div>
        </SidebarHeader>
        <SidebarContent className={`${getAlignClass(itemsAlign)}`}>
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <a href="#navegação">Navegação</a>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive>
                    <SmHomeSolidIcon />
                    <span>Principal</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Ferramentas</SidebarGroupLabel>
            <SidebarGroupAction aria-label="Adicionar ferramenta">
              <SmAdd2LineIcon className="size-5" />
            </SidebarGroupAction>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <SmSettingsLineIcon />
                    <span>Configurações</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarUserFooter />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-12 items-center gap-2 px-4" />
      </SidebarInset>
    </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // asChild label renders as <a> tag
    const labelLink = canvas.getByRole("link", { name: /navegação/i });
    await expect(labelLink).toBeInTheDocument();
    await expect(labelLink).toHaveAttribute("data-slot", "sidebar-group-label");

    // Group action renders as button
    const actionBtn = canvas.getByRole("button", { name: /adicionar ferramenta/i });
    await expect(actionBtn).toBeInTheDocument();
    await expect(actionBtn).toHaveAttribute("data-slot", "sidebar-group-action");
  },
};

/** Full sidebar with all sub-components exercised together. */
export const AllVariants: Story = {
  parameters: { layout: "fullscreen" as const },
  decorators: [],
  render: () => (
    <div className="flex flex-col gap-8 w-full">
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3 px-4 pt-4">Padrão (expandido)</h3>
        <SidebarProvider>
          <div className={`flex min-h-[400px] ${sidebarFrame}`}>
            <Sidebar mobileHeader={demoMobileHeader}>
              <SidebarHeader>
                <div className="flex items-center justify-between pl-2 pr-0">
                  <span className="font-heading text-[24px] font-medium uppercase tracking-wide text-sidebar-foreground">
                    Overlens®
                  </span>
                  <SidebarTrigger />
                </div>
              </SidebarHeader>
              <SidebarContent className="flex flex-1 items-center justify-center">
                <SidebarMenu className="px-2">
                  {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton isActive={item.active} disabled={item.disabled}>
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                      {item.badge && (
                        <SidebarMenuBadge className="pt-px font-mono text-[11px] text-[var(--surface-500)] opacity-50">
                          {item.badge}
                        </SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarContent>
              <SidebarFooter>
                <SidebarUserFooter />
              </SidebarFooter>
            </Sidebar>
            <SidebarInset>
              <header className="flex h-12 items-center gap-2 px-4" />
            </SidebarInset>
          </div>
        </SidebarProvider>
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3 px-4">Colapsado (icon mode)</h3>
        <SidebarProvider defaultOpen={false}>
          <div className={`flex min-h-[400px] ${sidebarFrame}`}>
            <Sidebar collapsible="icon" mobileHeader={demoMobileHeader}>
              <SidebarHeader className="group-data-[collapsible=icon]:items-center">
                <div className="flex items-center justify-between pl-2 pr-0">
                  <span className="font-heading text-[24px] font-medium uppercase tracking-wide text-sidebar-foreground group-data-[collapsible=icon]:hidden">
                    Overlens®
                  </span>
                  <SidebarTrigger />
                </div>
              </SidebarHeader>
              <SidebarContent className="flex flex-1 items-center justify-center">
                <SidebarMenu className="px-2">
                  {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton isActive={item.active} tooltip={item.title}>
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarContent>
              <SidebarFooter className="group-data-[collapsible=icon]:items-center">
                <SidebarUserFooter />
              </SidebarFooter>
            </Sidebar>
            <SidebarInset>
              <header className="flex h-12 items-center gap-2 px-4" />
            </SidebarInset>
          </div>
        </SidebarProvider>
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3 px-4">Flutuante</h3>
        <SidebarProvider>
          <div className={`flex min-h-[400px] ${sidebarFrame}`}>
            <Sidebar variant="floating" mobileHeader={demoMobileHeader}>
              <SidebarHeader>
                <div className="flex items-center justify-between pl-2 pr-0">
                  <span className="font-heading text-[24px] font-medium uppercase tracking-wide text-sidebar-foreground">
                    Overlens®
                  </span>
                  <SidebarTrigger />
                </div>
              </SidebarHeader>
              <SidebarContent className="flex flex-1 items-center justify-center">
                <SidebarMenu className="px-2">
                  {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton isActive={item.active} disabled={item.disabled}>
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarContent>
              <SidebarFooter>
                <SidebarUserFooter />
              </SidebarFooter>
            </Sidebar>
            <SidebarInset>
              <header className="flex h-12 items-center gap-2 px-4" />
            </SidebarInset>
          </div>
        </SidebarProvider>
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3 px-4">Com busca</h3>
        <SidebarProvider>
          <div className={`flex min-h-[400px] ${sidebarFrame}`}>
            <Sidebar mobileHeader={demoMobileHeader}>
              <SidebarHeader>
                <div className="flex items-center justify-between pl-2 pr-0">
                  <span className="font-heading text-[24px] font-medium uppercase tracking-wide text-sidebar-foreground">
                    Overlens®
                  </span>
                  <SidebarTrigger />
                </div>
              </SidebarHeader>
              <SidebarContent>
                <SidebarMenu className="px-2">
                  <SidebarMenuItem>
                    <SidebarSearch>
                      <CommandGroup heading="Páginas">
                        {items.map((item) => (
                          <CommandItem key={item.title}>
                            <item.icon />
                            <span>{item.title}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </SidebarSearch>
                  </SidebarMenuItem>
                  {items.slice(0, 3).map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton isActive={item.active}>
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarContent>
              <SidebarFooter>
                <SidebarUserFooter />
              </SidebarFooter>
            </Sidebar>
            <SidebarInset>
              <header className="flex h-12 items-center gap-2 px-4" />
            </SidebarInset>
          </div>
        </SidebarProvider>
      </div>
    </div>
  ),
};

