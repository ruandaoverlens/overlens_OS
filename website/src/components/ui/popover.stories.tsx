import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverTitle, PopoverDescription } from "./popover";
import { Button } from "./button";
import { InputGroup, InputGroupInput } from "./input-group";
import { Label } from "./label";
import { Switch } from "./switch";

const meta = {
  title: "Base Components/Popover",
  tags: ["autodocs"],
  component: Popover,
  argTypes: {
    open: {
      control: "boolean",
      description: "Estado controlado de abertura do popover",
    },
    defaultOpen: {
      control: "boolean",
      description: "Estado inicial de abertura (não controlado)",
    },
    onOpenChange: {
      control: false,
      description: "Callback disparado ao abrir/fechar o popover",
    },
  },
  parameters: {
    docs: {
      description: {
        component: [
          "Floating content panel anchored to a trigger element, built on Radix UI Popover primitive. Supports configurable alignment, side offset, and custom anchor points.",
          "",
          "## Anatomy",
          "",
          "```tsx",
          "<Popover>",
          "  <PopoverTrigger asChild>",
          "    <Button>Open</Button>",
          "  </PopoverTrigger>",
          "  <PopoverContent>",
          "    <PopoverHeader>",
          "      <PopoverTitle>Title</PopoverTitle>",
          "      <PopoverDescription>Description</PopoverDescription>",
          "    </PopoverHeader>",
          "    {/* content */}",
          "  </PopoverContent>",
          "</Popover>",
          "```",
          "",
          "## Sub-components",
          "",
          "| Sub-component | Description |",
          "|---------------|-------------|",
          "| `Popover` | Root component wrapping `Popover.Root` (`data-slot=\"popover\"`). Manages open/close state. |",
          "| `PopoverTrigger` | Trigger element wrapping `Popover.Trigger` (`data-slot=\"popover-trigger\"`). |",
          "| `PopoverContent` | Floating panel rendered via `Popover.Portal`. Default `align=\"center\"`, `sideOffset={4}`. Width is `w-72`. Uses zoom/fade/slide animations based on `data-[side]` and `data-[state]`. Shadow uses `dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]`. |",
          "| `PopoverAnchor` | Custom anchor point for positioning (`data-slot=\"popover-anchor\"`). |",
          "| `PopoverHeader` | Flex column container for title and description (`data-slot=\"popover-header\"`). |",
          "| `PopoverTitle` | `<div>` with `font-medium` styling (`data-slot=\"popover-title\"`). |",
          "| `PopoverDescription` | `<p>` with `text-muted-foreground` styling (`data-slot=\"popover-description\"`). |",
          "",
          "## Key details",
          "",
          "- Content alignment and side can be customized via Radix `align`, `side`, and `sideOffset` props.",
          "- Animations are directional: `slide-in-from-top`, `slide-in-from-bottom`, `slide-in-from-left`, `slide-in-from-right` based on `data-[side]`.",
          "- Transform origin follows `--radix-popover-content-transform-origin` CSS variable.",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Popover {...args}>
      <PopoverTrigger asChild>
        <Button variant="outline">Abrir Popover</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Dimensões</h4>
            <p className="text-sm text-muted-foreground">Defina as dimensões da camada.</p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Abrir Popover" });
    await expect(trigger).toBeInTheDocument();

    await userEvent.click(trigger);

    const body = within(document.body);
    await expect(await body.findByText("Dimensões")).toBeInTheDocument();
    await expect(body.getByText("Defina as dimensões da camada.")).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");
  },
};

export const WithForm: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Atualizar dimensões</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Dimensões</h4>
            <p className="text-sm text-muted-foreground">Defina as dimensões da camada.</p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="width">Largura</Label>
              <InputGroup size="xs" className="col-span-2"><InputGroupInput id="width" placeholder="ex: 100%" /></InputGroup>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="height">Altura</Label>
              <InputGroup size="xs" className="col-span-2"><InputGroupInput id="height" placeholder="ex: 25px" /></InputGroup>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Atualizar dimensões" });

    await userEvent.click(trigger);

    const body = within(document.body);
    await expect(await body.findByText("Dimensões")).toBeInTheDocument();

    const widthInput = body.getByLabelText("Largura");
    const heightInput = body.getByLabelText("Altura");

    await expect(widthInput).toHaveValue("");
    await expect(heightInput).toHaveValue("");

    await userEvent.type(widthInput, "100%");
    await expect(widthInput).toHaveValue("100%");

    await userEvent.keyboard("{Escape}");
  },
};

export const WithHeaderAndActions: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Gerenciar notificações</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <PopoverHeader>
          <PopoverTitle>Notificações</PopoverTitle>
          <PopoverDescription>Escolha quais notificações deseja receber.</PopoverDescription>
        </PopoverHeader>
        <div className="mt-4 grid gap-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="marketing-emails" className="pl-0 text-sm font-normal">E-mails de marketing</Label>
            <Switch id="marketing-emails" />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="product-updates" className="pl-0 text-sm font-normal">Atualizações do produto</Label>
            <Switch id="product-updates" defaultChecked />
          </div>
        </div>
        <div className="mt-6 flex justify-start gap-2">
          <Button size="sm">Salvar</Button>
          <Button variant="tertiary" size="sm">Cancelar</Button>
        </div>
      </PopoverContent>
    </Popover>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Gerenciar notificações" });

    await userEvent.click(trigger);

    const body = within(document.body);
    await expect(await body.findByText("Notificações")).toBeInTheDocument();
    await expect(body.getByText("Escolha quais notificações deseja receber.")).toBeInTheDocument();
    await expect(body.getByText("E-mails de marketing")).toBeInTheDocument();
    await expect(body.getByRole("switch", { name: /e-mails de marketing/i })).toBeInTheDocument();
    await expect(body.getByRole("switch", { name: /atualizações do produto/i })).toBeInTheDocument();
    await expect(body.getByText("Salvar")).toBeInTheDocument();
    await expect(body.getByText("Cancelar")).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");
  },
};

export const TopSide: Story = {
  render: () => (
    <div className="flex items-end h-64">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Abrir acima</Button>
        </PopoverTrigger>
        <PopoverContent side="top" className="w-64">
          <PopoverHeader>
            <PopoverTitle>Informação</PopoverTitle>
            <PopoverDescription>Este popover abre acima do botão.</PopoverDescription>
          </PopoverHeader>
        </PopoverContent>
      </Popover>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Padrão</Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Dimensões</h4>
              <p className="text-sm text-muted-foreground">Defina as dimensões da camada.</p>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Com formulário</Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Dimensões</h4>
              <p className="text-sm text-muted-foreground">Defina as dimensões da camada.</p>
            </div>
            <div className="grid gap-2">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="gallery-width">Largura</Label>
                <InputGroup size="xs" className="col-span-2"><InputGroupInput id="gallery-width" placeholder="ex: 100%" /></InputGroup>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="gallery-height">Altura</Label>
                <InputGroup size="xs" className="col-span-2"><InputGroupInput id="gallery-height" placeholder="ex: 25px" /></InputGroup>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  ),
};
