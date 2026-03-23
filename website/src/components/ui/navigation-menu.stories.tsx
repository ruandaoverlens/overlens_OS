import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, within } from "storybook/test";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuIndicator,
  navigationMenuTriggerStyle,
} from "./navigation-menu";
import {
  SmAsteriskLineIcon,
  SmPlaySolidIcon,
  SmCloudSolidIcon,
  SmLockSolidIcon,
  SmFolderSolidIcon,
  SmToolSolidIcon,
  SmBookmarkSolidIcon,
  SmChatSolidIcon,
  SmDocSolidIcon,
} from "@/components/icons";

const meta = {
  title: "Core Components/NavigationMenu",
  tags: ["autodocs"],
  component: NavigationMenu,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: [
          "Horizontal navigation menu with dropdown content panels for site navigation, built on Radix UI NavigationMenu primitive.",
          "",
          "## Anatomy",
          "",
          "```tsx",
          "<NavigationMenu>",
          "  <NavigationMenuList>",
          "    <NavigationMenuItem>",
          "      <NavigationMenuTrigger>Label</NavigationMenuTrigger>",
          "      <NavigationMenuContent>...</NavigationMenuContent>",
          "    </NavigationMenuItem>",
          "    <NavigationMenuItem>",
          "      <NavigationMenuLink className={navigationMenuTriggerStyle()}>Link</NavigationMenuLink>",
          "    </NavigationMenuItem>",
          "    <NavigationMenuIndicator />",
          "  </NavigationMenuList>",
          "</NavigationMenu>",
          "```",
          "",
          "## Sub-components",
          "",
          "| Sub-component | Description |",
          "|---------------|-------------|",
          "| `NavigationMenu` | Root wrapper around `NavigationMenu.Root`. Accepts `viewport` prop (default `true`) to toggle the animated viewport container. Uses `data-slot=\"navigation-menu\"` and `data-viewport`. |",
          "| `NavigationMenuList` | Horizontal flex list (`data-slot=\"navigation-menu-list\"`). |",
          "| `NavigationMenuItem` | Individual item wrapper (`data-slot=\"navigation-menu-item\"`). |",
          "| `NavigationMenuTrigger` | Button that toggles a content panel. Renders a `SmArrowDownIosLineIcon` chevron that rotates 180deg on open via `group-data-[state=open]:rotate-180`. |",
          "| `NavigationMenuContent` | Dropdown content panel with slide/fade animations using `data-[motion^=from-]` and `data-[motion^=to-]` attributes. Supports viewport-less mode via `group-data-[viewport=false]` styles. |",
          "| `NavigationMenuLink` | Anchor link inside a content panel (`data-slot=\"navigation-menu-link\"`). |",
          "| `NavigationMenuViewport` | Animated viewport container sized by `--radix-navigation-menu-viewport-height/width` CSS variables. |",
          "| `NavigationMenuIndicator` | Arrow indicator that follows the active trigger (`data-[state=visible]`/`data-[state=hidden]`). |",
          "| `navigationMenuTriggerStyle` | CVA style function for applying trigger styling to plain links. |",
          "",
          "## Key details",
          "",
          "- Set `viewport={false}` on `NavigationMenu` to render content inline without the shared viewport container.",
          "- Content animations differ based on viewport mode: slide-from-left/right with viewport, zoom/fade without.",
          "- Trigger chevron icon uses `SmArrowDownIosLineIcon` from the icon system.",
          "- Menu items have zero gap (`gap-0`) for a tight, compact layout.",
          "",
          "## Content patterns",
          "",
          "| Pattern | Description |",
          "|---------|-------------|",
          "| Simple links | Plain `NavigationMenuLink` items with `navigationMenuTriggerStyle()` |",
          "| Expandable content | `NavigationMenuTrigger` + `NavigationMenuContent` with text links |",
          "| Card grid | Icon-left cards (`NavCardItem`) in a 2-column grid |",
          "| Featured card | Gradient hero card (`NavFeaturedCard`) alongside icon cards |",
          "| With indicator | `NavigationMenuIndicator` arrow following the active trigger |",
        ].join("\n"),
      },
    },
  },
  args: {
    onValueChange: fn(),
  },
  argTypes: {
    onValueChange: {
      control: false,
      description: "Callback fired when the active menu value changes",
    },
    viewport: {
      control: "boolean",
      description: "Whether to render the animated viewport container",
      table: { defaultValue: { summary: "true" } },
    },
    children: {
      control: false,
      description: "NavigationMenuList and other navigation menu elements",
    },
    className: {
      control: "text",
      description: "Additional CSS classes for the navigation menu root",
    },
  },
} satisfies Meta<typeof NavigationMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <NavigationMenu {...args}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
            Início
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
            Sobre
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
            Contato
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify all navigation links render
    const inicioLink = canvas.getByText("Início");
    await expect(inicioLink).toBeInTheDocument();

    const sobreLink = canvas.getByText("Sobre");
    await expect(sobreLink).toBeInTheDocument();

    const contatoLink = canvas.getByText("Contato");
    await expect(contatoLink).toBeInTheDocument();

    // Verify links have proper href
    await expect(inicioLink.closest("a")).toHaveAttribute("href", "#");
    await expect(sobreLink.closest("a")).toHaveAttribute("href", "#");
  },
};


export const WithIndicator: Story = {
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Produtos</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-1 p-1 md:grid-cols-2">
              <li>
                <NavigationMenuLink asChild>
                  <a className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground" href="#">
                    <div className="text-sm font-medium leading-none">Analytics</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      Métricas e dashboards em tempo real.
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <a className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground" href="#">
                    <div className="text-sm font-medium leading-none">Automação</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      Fluxos automatizados para sua equipe.
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Recursos</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[300px] gap-1 p-1">
              <li>
                <NavigationMenuLink asChild>
                  <a className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground" href="#">
                    <div className="text-sm font-medium leading-none">Blog</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      Artigos e tutoriais da nossa equipe.
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <a className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground" href="#">
                    <div className="text-sm font-medium leading-none">Comunidade</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      Conecte-se com outros desenvolvedores.
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
            Preços
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuIndicator />
      </NavigationMenuList>
    </NavigationMenu>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify triggers render
    const produtosTrigger = canvas.getByText("Produtos");
    await expect(produtosTrigger).toBeInTheDocument();

    const recursosTrigger = canvas.getByText("Recursos");
    await expect(recursosTrigger).toBeInTheDocument();

    await expect(canvas.getByText("Preços")).toBeInTheDocument();
  },
};


/** Reusable card item for dropdown grid layouts. */
function NavCardItem({
  icon: Icon,
  title,
  description,
  href = "#",
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  href?: string;
}) {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          className="group flex gap-3 select-none rounded-xl p-3 leading-none no-underline outline-none transition-colors hover:bg-accent/50"
          href={href}
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--surface-800)] transition-colors group-hover:bg-[var(--surface-200)]">
            <Icon className="size-5 text-[var(--surface-400)] transition-colors group-hover:text-black" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-sm font-medium leading-none">{title}</div>
            <p className="text-sm leading-snug text-muted-foreground line-clamp-2">
              {description}
            </p>
          </div>
        </a>
      </NavigationMenuLink>
    </li>
  );
}

/** Parse hex to [r,g,b]. */
function hexToRgb(hex: string): [number, number, number] | null {
  const h = hex.replace("#", "");
  if (h.length === 3) return [parseInt(h[0]+h[0],16), parseInt(h[1]+h[1],16), parseInt(h[2]+h[2],16)];
  if (h.length === 6) return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
  return null;
}

/** Average luminance of hex colors in a gradient string. */
function isLightGradient(value: string): boolean {
  const colors = value.match(/#(?:[0-9a-fA-F]{3}){1,2}/g) ?? [];
  if (colors.length === 0) return false;
  const avg = colors.reduce((sum, hex) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return sum;
    const [rs, gs, bs] = rgb.map(c => c / 255).map(c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
    return sum + 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }, 0) / colors.length;
  return avg > 0.4;
}

/** Highlighted featured card for the left column of a mega-menu. */
function NavFeaturedCard({
  gradient,
  title,
  description,
  href = "#",
}: {
  gradient: string;
  title: string;
  description: string;
  href?: string;
}) {
  const isLight = isLightGradient(gradient);
  const textColor = isLight ? "text-black" : "text-white";
  const descColor = isLight ? "text-black/60" : "text-white/70";

  return (
    <li className="row-span-full">
      <NavigationMenuLink asChild>
        <a
          className="relative flex h-full w-full select-none flex-col justify-end overflow-hidden rounded-xl p-5 no-underline outline-none transition-all hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[var(--surface-200)]"
          href={href}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 animate-[banner-gradient_8s_ease_infinite] [background-size:300%_300%]"
            style={{ backgroundImage: gradient }}
          />
          <div className={`relative z-[1] mt-4 text-base font-medium leading-tight ${textColor}`}>
            {title}
          </div>
          <p className={`relative z-[1] mt-1 text-sm font-medium leading-snug ${descColor}`}>
            {description}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
}

export const WithCardGrid: Story = {
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Produtos</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[540px] grid-cols-2 gap-1 p-2">
              <NavCardItem
                icon={SmAsteriskLineIcon}
                title="Analytics"
                description="Métricas e dashboards em tempo real para acompanhar performance."
              />
              <NavCardItem
                icon={SmPlaySolidIcon}
                title="Automação"
                description="Fluxos automatizados que economizam horas da sua equipe."
              />
              <NavCardItem
                icon={SmCloudSolidIcon}
                title="Cloud"
                description="Infraestrutura escalável com deploy em um clique."
              />
              <NavCardItem
                icon={SmLockSolidIcon}
                title="Segurança"
                description="Proteção end-to-end com criptografia e compliance."
              />
              <NavCardItem
                icon={SmFolderSolidIcon}
                title="Integrações"
                description="Conecte com 200+ ferramentas que sua equipe já usa."
              />
              <NavCardItem
                icon={SmToolSolidIcon}
                title="Configurações"
                description="Controle granular sobre cada aspecto da plataforma."
              />
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Recursos</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] grid-cols-1 gap-1 p-2">
              <NavCardItem
                icon={SmDocSolidIcon}
                title="Documentação"
                description="Guias completos, referências de API e exemplos de código."
              />
              <NavCardItem
                icon={SmBookmarkSolidIcon}
                title="Tutoriais"
                description="Passo a passo para implementar funcionalidades comuns."
              />
              <NavCardItem
                icon={SmChatSolidIcon}
                title="Comunidade"
                description="Fórum, Discord e eventos para conectar com outros devs."
              />
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
            Preços
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Produtos")).toBeInTheDocument();
    await expect(canvas.getByText("Recursos")).toBeInTheDocument();
    await expect(canvas.getByText("Preços")).toBeInTheDocument();
  },
};

export const WithFeaturedCard: Story = {
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Plataforma</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[640px] grid-cols-[220px_1fr] gap-1 p-2">
              <NavFeaturedCard
                gradient="linear-gradient(90deg, #D3EEF4, #F1EEC8, #F3A46C)"
                title="Legacy™"
                description="Design system completo com tokens, componentes e documentação."
              />
              <div className="grid grid-cols-1 gap-1">
                <NavCardItem
                  icon={SmAsteriskLineIcon}
                  title="Analytics"
                  description="Métricas e dashboards em tempo real."
                />
                <NavCardItem
                  icon={SmPlaySolidIcon}
                  title="AI Studio"
                  description="Ferramentas de inteligência artificial integradas."
                />
                <NavCardItem
                  icon={SmCloudSolidIcon}
                  title="Deploy"
                  description="CI/CD automatizado com preview deployments."
                />
                <NavCardItem
                  icon={SmLockSolidIcon}
                  title="Auth"
                  description="Autenticação e autorização out-of-the-box."
                />
              </div>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Soluções</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[540px] grid-cols-3 gap-1 p-2">
              <NavCardItem
                icon={SmFolderSolidIcon}
                title="Startups"
                description="Stack completa para crescer rápido."
              />
              <NavCardItem
                icon={SmToolSolidIcon}
                title="Enterprise"
                description="Governança, SSO e SLA dedicado."
              />
              <NavCardItem
                icon={SmChatSolidIcon}
                title="Agências"
                description="Multi-tenant e white-label."
              />
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
            Docs
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Plataforma")).toBeInTheDocument();
    await expect(canvas.getByText("Soluções")).toBeInTheDocument();
    await expect(canvas.getByText("Docs")).toBeInTheDocument();
  },
};

export const AllVariants: Story = {
  parameters: { layout: "fullscreen" as const },
  render: () => (
    <div className="flex flex-col gap-8 w-full p-4">
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Padrão (links simples)</h3>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
                Início
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
                Sobre
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
                Contato
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Com conteúdo expandível</h3>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Primeiros Passos</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-1 p-1 w-[400px]">
                  <li>
                    <NavigationMenuLink asChild>
                      <a className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground" href="#">
                        <div className="text-sm font-medium leading-none">Introdução</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Componentes reutilizáveis construídos com Radix UI e Tailwind CSS.
                        </p>
                      </a>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <a className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground" href="#">
                        <div className="text-sm font-medium leading-none">Instalação</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Como instalar dependências e estruturar seu app.
                        </p>
                      </a>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
                Documentação
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Com card grid (ícone + texto)</h3>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Produtos</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[540px] grid-cols-2 gap-1 p-2">
                  <NavCardItem
                    icon={SmAsteriskLineIcon}
                    title="Analytics"
                    description="Métricas e dashboards em tempo real para acompanhar performance."
                  />
                  <NavCardItem
                    icon={SmPlaySolidIcon}
                    title="Automação"
                    description="Fluxos automatizados que economizam horas da sua equipe."
                  />
                  <NavCardItem
                    icon={SmCloudSolidIcon}
                    title="Cloud"
                    description="Infraestrutura escalável com deploy em um clique."
                  />
                  <NavCardItem
                    icon={SmLockSolidIcon}
                    title="Segurança"
                    description="Proteção end-to-end com criptografia e compliance."
                  />
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Com featured card (gradient)</h3>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Plataforma</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[640px] grid-cols-[220px_1fr] gap-1 p-2">
                  <NavFeaturedCard
                    gradient="linear-gradient(90deg, #D3EEF4, #F1EEC8, #F3A46C)"
                    title="Legacy™"
                    description="Design system completo com tokens, componentes e documentação."
                  />
                  <div className="grid grid-cols-1 gap-1">
                    <NavCardItem
                      icon={SmAsteriskLineIcon}
                      title="Analytics"
                      description="Métricas e dashboards em tempo real."
                    />
                    <NavCardItem
                      icon={SmPlaySolidIcon}
                      title="AI Studio"
                      description="Ferramentas de inteligência artificial integradas."
                    />
                    <NavCardItem
                      icon={SmCloudSolidIcon}
                      title="Deploy"
                      description="CI/CD automatizado com preview deployments."
                    />
                  </div>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Com indicator</h3>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Produtos</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-1 p-1 md:grid-cols-2">
                  <li>
                    <NavigationMenuLink asChild>
                      <a className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground" href="#">
                        <div className="text-sm font-medium leading-none">Analytics</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Métricas e dashboards em tempo real.
                        </p>
                      </a>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <a className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground" href="#">
                        <div className="text-sm font-medium leading-none">Automação</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Fluxos automatizados para sua equipe.
                        </p>
                      </a>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
                Preços
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuIndicator />
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  ),
};
