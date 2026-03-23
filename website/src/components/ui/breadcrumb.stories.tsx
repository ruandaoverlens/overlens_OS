import React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { Slash } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "./breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

type BreadcrumbStoryArgs = React.ComponentProps<typeof Breadcrumb> & {
  collapsible?: boolean
}

const meta: Meta<BreadcrumbStoryArgs> = {
  title: "Core Components/Breadcrumb",
  tags: ["autodocs"],
  component: Breadcrumb,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Navigation breadcrumb trail showing the current page hierarchy.",
          "",
          "### Collapsible behavior (`collapsible`)",
          "When `BreadcrumbList` receives the `collapsible` prop, the breadcrumb adapts per breakpoint:",
          "",
          "| Breakpoint | Visible | Popover content |",
          "|---|---|---|",
          "| **Mobile** (`< md`) | `… > Current Page` | All items (current page disabled) |",
          "| **Desktop** (`≥ md`) | `First > … > Current Page` | Intermediate items only |",
          "",
          "Tapping the ellipsis (`…`) opens a popover; click outside or press Escape to close.",
          "",
          "### Anatomy",
          "- `Breadcrumb` - `<nav>` wrapper with `aria-label=\"breadcrumb\"`",
          "- `BreadcrumbList` - `<ol>` container. Accepts `collapsible?: boolean`",
          "- `BreadcrumbItem` - `<li>` for each step",
          "- `BreadcrumbLink` - clickable link (`text-foreground`)",
          "- `BreadcrumbPage` - current page, non-interactive (`--surface-500`)",
          "- `BreadcrumbSeparator` - arrow icon between items",
          "- `BreadcrumbEllipsis` - static ellipsis indicator (filtered from popover automatically)",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    children: {
      control: false,
      description: "BreadcrumbList and its child items",
    },
    collapsible: {
      control: "boolean",
      description: "Collapse to ellipsis on mobile; tap to expand",
    },
  },
  args: {},
};

export default meta;
type Story = StoryObj<BreadcrumbStoryArgs>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: "Standard breadcrumb with three levels. `collapsible` is on - resize to mobile to see the collapse behavior.",
      },
    },
  },
  args: {
    collapsible: true,
  },
  render: ({ collapsible }) => (
    <Breadcrumb>
      <BreadcrumbList collapsible={collapsible}>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Início</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/components">Componentes</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const nav = canvas.getByRole("navigation", { name: "breadcrumb" });
    await expect(nav).toBeInTheDocument();

    // Collapsible mode: mobile shows ellipsis + current page only;
    // desktop shows first link + ellipsis + current page.
    // At least 1 link (the current page span with role="link") is always visible.
    const links = canvas.getAllByRole("link");
    await expect(links.length).toBeGreaterThanOrEqual(1);

    const currentPage = canvas.getByRole("link", { name: "Breadcrumb" });
    await expect(currentPage).toBeInTheDocument();
    await expect(currentPage.getAttribute("aria-current")).toBe("page");
  },
};

export const Collapsible: Story = {
  args: {
    collapsible: true,
  },
  render: ({ collapsible }) => (
    <Breadcrumb>
      <BreadcrumbList collapsible={collapsible}>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Início</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/products">Produtos</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/products/electronics">Eletrônicos</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/products/electronics/phones">Celulares</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>iPhone 16 Pro</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
  parameters: {
    docs: {
      description: {
        story: "Long breadcrumb trail with 5 levels. On mobile, shows `… > Current Page` - popover lists all items. On desktop, shows `First > … > Current Page` - popover lists only intermediate items.",
      },
    },
  },
};

export const WithEllipsis: Story = {
  parameters: {
    docs: {
      description: {
        story: "Breadcrumb with a static ellipsis in the middle. On mobile, the ellipsis item is automatically filtered from the popover to avoid duplication with the collapse trigger.",
      },
    },
  },
  args: {
    collapsible: true,
  },
  render: ({ collapsible }) => (
    <Breadcrumb>
      <BreadcrumbList collapsible={collapsible}>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Início</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1">
              <BreadcrumbEllipsis />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem>Produtos</DropdownMenuItem>
              <DropdownMenuItem>Eletrônicos</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/components">Componentes</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Atual</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
};

export const CustomSeparator: Story = {
  parameters: {
    docs: {
      description: {
        story: "Breadcrumb using a custom slash separator instead of the default arrow. The mobile popover ignores separators and shows only navigable items.",
      },
    },
  },
  args: {
    collapsible: true,
  },
  render: ({ collapsible }) => (
    <Breadcrumb>
      <BreadcrumbList collapsible={collapsible}>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Início</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <Slash />
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbLink href="/components">Componentes</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <Slash />
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
};

export const AllVariants: Story = {
  parameters: {
    layout: "fullscreen" as const,
    docs: {
      description: {
        story: "All breadcrumb variants side by side: default, with ellipsis, and custom separator.",
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-8 w-full p-4">
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Padrão</h3>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Início</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/components">Componentes</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Com elipse</h3>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Início</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1">
                  <BreadcrumbEllipsis />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem>Produtos</DropdownMenuItem>
                  <DropdownMenuItem>Eletrônicos</DropdownMenuItem>
                  <DropdownMenuItem>Celulares</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/components">Componentes</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Atual</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Separador personalizado</h3>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Início</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <Slash />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink href="/components">Componentes</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <Slash />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  ),
};
