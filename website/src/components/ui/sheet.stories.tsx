import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "./sheet";
import { Button } from "./button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./input-group";
import { Label } from "./label";
import { SmProfileLineIcon } from "@/components/icons";

const meta = {
  title: "Core Components/Sheet",
  tags: ["autodocs"],
  component: Sheet,
  argTypes: {
    open: {
      control: "boolean",
      description: "Estado controlado de abertura do sheet",
    },
    defaultOpen: {
      control: "boolean",
      description: "Estado inicial de abertura (não controlado)",
    },
    onOpenChange: {
      control: false,
      description: "Callback disparado ao abrir/fechar o sheet",
    },
  },
  parameters: {
    docs: {
      description: {
        component: [
          "Slide-over panel that overlays page content from any edge, built on Radix Dialog primitive.",
          "",
          "## Anatomy",
          "",
          "```tsx",
          "<Sheet>",
          "  <SheetTrigger />",
          "  <SheetContent side=\"right\">",
          "    <SheetHeader>",
          "      <SheetTitle />",
          "      <SheetDescription />",
          "    </SheetHeader>",
          "    {/* content */}",
          "    <SheetFooter>",
          "      <SheetClose />",
          "    </SheetFooter>",
          "  </SheetContent>",
          "</Sheet>",
          "```",
          "",
          "## Sub-components",
          "",
          "| Sub-component | Description |",
          "|---------------|-------------|",
          "| `Sheet` | Root provider wrapping `Dialog.Root`. Uses `data-slot=\"sheet\"`. |",
          "| `SheetTrigger` | Element that opens the sheet. Uses `data-slot=\"sheet-trigger\"`. |",
          "| `SheetClose` | Element that closes the sheet. Uses `data-slot=\"sheet-close\"`. |",
          "| `SheetContent` | Panel that slides in from a specified `side` (`\"top\"` \\| `\"right\"` \\| `\"bottom\"` \\| `\"left\"`, default `\"right\"`). Accepts `showCloseButton` (default `true`). Uses `data-slot=\"sheet-content\"`. |",
          "| `SheetOverlay` | Semi-transparent backdrop with `bg-black/70 backdrop-blur-sm`. Uses `data-slot=\"sheet-overlay\"`. |",
          "| `SheetHeader` | Flex column container for title and description. Uses `data-slot=\"sheet-header\"`. |",
          "| `SheetFooter` | Footer area for action buttons. Uses `data-slot=\"sheet-footer\"`. |",
          "| `SheetTitle` | Accessible title via `Dialog.Title`. Uses `data-slot=\"sheet-title\"`. |",
          "| `SheetDescription` | Accessible description via `Dialog.Description`. Uses `data-slot=\"sheet-description\"`. |",
          "",
          "## Key details",
          "",
          "- Content slides in with directional `slide-in-from-*` / `slide-out-to-*` animations; open duration is 500ms, close is 300ms.",
          "- Left/right panels default to `w-3/4 sm:max-w-sm`; top/bottom panels use `h-auto`.",
          "- Background uses `bg-card` with `dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]`.",
          "- Close button renders `SmCloseLineIcon` in the top-right corner with `focus-visible:ring-2` styling.",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Sheet {...args}>
      <SheetTrigger asChild>
        <Button variant="outline">Abrir Painel</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Editar Perfil</SheetTitle>
          <SheetDescription>Faça alterações no seu perfil aqui.</SheetDescription>
        </SheetHeader>
        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="name">Nome</Label>
            <InputGroup>
              <InputGroupAddon align="inline-start"><SmProfileLineIcon /></InputGroupAddon>
              <InputGroupInput id="name" defaultValue="John Doe" />
            </InputGroup>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="username">Nome de usuário</Label>
            <InputGroup>
              <InputGroupAddon align="inline-start"><SmProfileLineIcon /></InputGroupAddon>
              <InputGroupInput id="username" defaultValue="@johndoe" />
            </InputGroup>
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button>Salvar alterações</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", {
      name: "Abrir Painel",
      hidden: true,
    });
    await expect(trigger).toBeInTheDocument();

    await userEvent.click(trigger);

    const dialog = await within(document.body).findByRole("dialog");
    await expect(dialog).toHaveAttribute("data-state", "open");
    await expect(within(dialog).getByText("Editar Perfil")).toBeInTheDocument();

    const closeButton = within(dialog).getByRole("button", { name: "Fechar" });
    await userEvent.click(closeButton);

    await expect(
      canvas.getByRole("button", { name: "Abrir Painel", hidden: true })
    ).toBeInTheDocument();
  },
};

export const Left: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Abrir Esquerda</Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Navegação</SheetTitle>
          <SheetDescription>Navegue pelo aplicativo.</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", {
      name: "Abrir Esquerda",
      hidden: true,
    });

    await userEvent.click(trigger);

    const body = within(document.body);
    const dialog = await body.findByRole("dialog");
    await expect(dialog).toHaveAttribute("data-state", "open");
    await expect(within(dialog).getByText("Navegação")).toBeInTheDocument();
    await expect(within(dialog).getByText("Navegue pelo aplicativo.")).toBeInTheDocument();
  },
};

export const Top: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Abrir Topo</Button>
      </SheetTrigger>
      <SheetContent side="top">
        <SheetHeader>
          <SheetTitle>Notificação</SheetTitle>
          <SheetDescription>Você tem novas atualizações disponíveis.</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
};

export const Bottom: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Abrir Inferior</Button>
      </SheetTrigger>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>Ações</SheetTitle>
          <SheetDescription>Escolha uma ação para executar.</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
};

export const AllSides: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      {(
        [
          { side: "right", label: "Direita" },
          { side: "left", label: "Esquerda" },
          { side: "top", label: "Topo" },
          { side: "bottom", label: "Inferior" },
        ] as const
      ).map(({ side, label }) => (
        <Sheet key={side}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              {label}
            </Button>
          </SheetTrigger>
          <SheetContent side={side}>
            <SheetHeader>
              <SheetTitle>Painel {label}</SheetTitle>
              <SheetDescription>
                Sheet aberto pelo lado: {side}.
              </SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  ),
};
