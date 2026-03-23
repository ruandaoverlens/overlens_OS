import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { SmCalendarSolidIcon } from "@/components/icons";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "./hover-card";
import { Avatar, AvatarImage, AvatarFallback } from "./avatar";
import { Button } from "./button";

const meta = {
  title: "Core Components/HoverCard",
  tags: ["autodocs"],
  component: HoverCard,
  argTypes: {
    open: {
      control: "boolean",
      description: "Estado controlado de abertura do hover card",
    },
    defaultOpen: {
      control: "boolean",
      description: "Estado inicial de abertura (não controlado)",
    },
    onOpenChange: {
      control: false,
      description: "Callback disparado ao abrir/fechar o hover card",
    },
  },
  parameters: {
    docs: {
      description: {
        component: [
          "Card that appears on hover to display supplementary content. Built on Radix UI HoverCard primitive.",
          "",
          "## Anatomy",
          "",
          "```tsx",
          "<HoverCard>",
          "  <HoverCardTrigger />",
          "  <HoverCardContent>",
          "    {/* supplementary content */}",
          "  </HoverCardContent>",
          "</HoverCard>",
          "```",
          "",
          "## Sub-components",
          "",
          "| Sub-component | Description |",
          "|---------------|-------------|",
          "| `HoverCard` | Root provider wrapping `HoverCardPrimitive.Root` with `data-slot=\"hover-card\"` |",
          "| `HoverCardTrigger` | Element that displays the hover card on mouse hover |",
          "| `HoverCardContent` | Floating content panel (`bg-popover`, `w-64`, `rounded-xl`, `p-4`) with zoom/fade/slide animations. Default `align=\"center\"` and `sideOffset={4}` |",
          "",
          "## Key details",
          "",
          "- Content uses `--radix-hover-card-content-transform-origin` for origin-aware animations",
          "- Renders through a `HoverCardPrimitive.Portal` for proper stacking",
          "- Direction-aware slide animations via `data-[side=*]` attributes",
          "- Content styled with `outline-hidden` to prevent focus outline on the panel itself",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof HoverCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">@nextjs</Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <p className="text-sm">
          O Framework React - criado e mantido pela @vercel.
        </p>
      </HoverCardContent>
    </HoverCard>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "@nextjs" });
    await expect(trigger).toBeInTheDocument();

    await userEvent.hover(trigger);

    const body = within(document.body);
    await expect(
      await body.findByText(/O Framework React/)
    ).toBeInTheDocument();
  },
};

export const WithAvatar: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">@nextjs</Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex justify-between space-x-4">
          <Avatar>
            <AvatarImage src="/avatar-default.png" />
            <AvatarFallback>RB</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">@nextjs</h4>
            <p className="text-sm">
              O Framework React - criado e mantido pela @vercel.
            </p>
            <div className="flex items-center pt-2">
              <SmCalendarSolidIcon className="-ml-1 mr-1.5 h-6 w-6 opacity-70" />
              <span className="text-xs text-muted-foreground">Entrou em dezembro de 2021</span>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "@nextjs" });

    await userEvent.hover(trigger);

    const body = within(document.body);
    await expect(await body.findByText("RB")).toBeInTheDocument();
    await expect(body.getByText(/criado e mantido pela @vercel/)).toBeInTheDocument();
    await expect(body.getByText("Entrou em dezembro de 2021")).toBeInTheDocument();
  },
};

export const RichContent: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">Repositório</Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-3">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">next.js</h4>
            <p className="text-sm text-muted-foreground">
              Framework fullstack React com renderização híbrida, otimizações automáticas e suporte a
              Server Components.
            </p>
          </div>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <span className="inline-block size-2 rounded-full bg-blue-500" />
              TypeScript
            </div>
            <span>128k estrelas</span>
            <span>MIT</span>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="h-7 text-xs">
              Clonar
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-xs">
              Ver código
            </Button>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Repositório" });

    await userEvent.hover(trigger);

    const body = within(document.body);
    await expect(await body.findByText("next.js")).toBeInTheDocument();
    await expect(body.getByText("TypeScript")).toBeInTheDocument();
    await expect(body.getByText("Ver código")).toBeInTheDocument();
    await expect(body.getByText("Clonar")).toBeInTheDocument();
  },
};

export const TopAlignment: Story = {
  render: () => (
    <div className="flex items-center justify-center h-64">
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="link">Passe o mouse</Button>
        </HoverCardTrigger>
        <HoverCardContent side="top" className="w-64">
          <p className="text-sm">
            Este hover card aparece acima do elemento gatilho.
          </p>
        </HoverCardContent>
      </HoverCard>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="link">@nextjs (simples)</Button>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <p className="text-sm">
            O Framework React - criado e mantido pela @vercel.
          </p>
        </HoverCardContent>
      </HoverCard>

      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="link">@nextjs (com avatar)</Button>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div className="flex justify-between space-x-4">
            <Avatar>
              <AvatarImage src="/avatar-default.png" />
              <AvatarFallback>RB</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">@nextjs</h4>
              <p className="text-sm">
                O Framework React - criado e mantido pela @vercel.
              </p>
              <div className="flex items-center pt-2">
                <SmCalendarSolidIcon className="mr-2 h-4 w-4 opacity-70" />
                <span className="text-xs text-muted-foreground">Entrou em dezembro de 2021</span>
              </div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  ),
};
