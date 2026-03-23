import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import {
  Dialog,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./dialog";
import { Button } from "./button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./input-group";
import { Label } from "./label";
import { SmProfileLineIcon, SmMailSolidIcon } from "@/components/icons";

const meta = {
  title: "Core Components/Dialog",
  tags: ["autodocs"],
  component: Dialog,
  argTypes: {
    open: {
      control: "boolean",
      description: "Estado controlado de abertura do diálogo",
    },
    defaultOpen: {
      control: "boolean",
      description: "Estado inicial de abertura (não controlado)",
    },
    onOpenChange: {
      control: false,
      description: "Callback disparado ao abrir/fechar o diálogo",
    },
  },
  parameters: {
    docs: {
      description: {
        component: [
          "Modal dialog that overlays content and requires user interaction. Built on Radix UI Dialog primitive.",
          "",
          "## Anatomy",
          "",
          "```tsx",
          "<Dialog>",
          "  <DialogTrigger />",
          "  <DialogContent>",
          "    <DialogHeader>",
          "      <DialogTitle />",
          "      <DialogDescription />",
          "    </DialogHeader>",
          "    {/* content */}",
          "    <DialogFooter />",
          "  </DialogContent>",
          "</Dialog>",
          "```",
          "",
          "## Sub-components",
          "",
          "| Sub-component | Description |",
          "|---------------|-------------|",
          "| `Dialog` | Root provider wrapping `DialogPrimitive.Root` with `data-slot=\"dialog\"` |",
          "| `DialogTrigger` | Button or element that opens the dialog |",
          "| `DialogPortal` | Renders dialog content outside the DOM hierarchy |",
          "| `DialogOverlay` | Semi-transparent backdrop with `bg-black/70 backdrop-blur-sm` and fade animations |",
          "| `DialogContent` | Centered panel (`bg-card`, `max-w-lg`, `rounded-xl`) with zoom/fade transitions. Accepts `showCloseButton` (default `true`) |",
          "| `DialogHeader` | Flex column container for title and description |",
          "| `DialogFooter` | Action button area. Accepts `showCloseButton` (default `false`) to render a close button |",
          "| `DialogTitle` | Accessible title via `DialogPrimitive.Title`, styled `text-lg font-semibold` |",
          "| `DialogDescription` | Accessible description via `DialogPrimitive.Description`, styled `text-muted-foreground text-sm` |",
          "| `DialogClose` | Button that closes the dialog |",
          "",
          "## Key details",
          "",
          "- Uses `SmCloseLineIcon` for the built-in close button in `DialogContent`",
          "- Close button has `focus-visible:ring-2 focus-visible:ring-foreground` for keyboard accessibility",
          "- Overlay and content use `fill-mode-both` for smooth open/close animations",
          "- Content is fixed-positioned at `top-[50%] left-[50%]` with translate centering",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger asChild>
        <Button variant="outline">Abrir diálogo</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Título do diálogo</DialogTitle>
          <DialogDescription>
            Esta é a descrição do diálogo. Ela fornece contexto para o conteúdo.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground pl-1">O conteúdo do diálogo vai aqui.</p>
        </div>
        <DialogFooter>
          <Button>Confirmar</Button>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", {
      name: "Abrir diálogo",
      hidden: true,
    });
    await expect(trigger).toBeInTheDocument();

    await userEvent.click(trigger);

    const dialog = await within(document.body).findByRole("dialog");
    await expect(dialog).toHaveAttribute("data-state", "open");
    await expect(within(dialog).getByText("Título do diálogo")).toBeInTheDocument();

    const closeButton = within(dialog).getByRole("button", { name: "Fechar" });
    await userEvent.click(closeButton);

    await expect(
      canvas.getByRole("button", { name: "Abrir diálogo", hidden: true })
    ).toBeVisible();
  },
};

export const WithForm: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Editar perfil</Button>
      </DialogTrigger>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Editar perfil</DialogTitle>
          <DialogDescription>
            Faça alterações no seu perfil aqui.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-1.5">
            <Label htmlFor="name">Nome</Label>
            <InputGroup>
              <InputGroupAddon align="inline-start"><SmProfileLineIcon /></InputGroupAddon>
              <InputGroupInput id="name" defaultValue="João Silva" />
            </InputGroup>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="email">E-mail</Label>
            <InputGroup>
              <InputGroupAddon align="inline-start"><SmMailSolidIcon /></InputGroupAddon>
              <InputGroupInput id="email" type="email" defaultValue="john@example.com" />
            </InputGroup>
          </div>
        </div>
        <DialogFooter showCloseButton>
          <Button>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", {
      name: "Editar perfil",
      hidden: true,
    });
    await userEvent.click(trigger);

    const dialog = await within(document.body).findByRole("dialog");
    await expect(dialog).toHaveAttribute("data-state", "open");

    const nameInput = within(dialog).getByLabelText("Nome");
    await expect(nameInput).toHaveValue("João Silva");

    const emailInput = within(dialog).getByLabelText("E-mail");
    await expect(emailInput).toHaveValue("john@example.com");

    const saveButton = within(dialog).getByRole("button", { name: "Salvar" });
    await expect(saveButton).toBeInTheDocument();
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Padrão</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Título do diálogo</DialogTitle>
            <DialogDescription>
              Esta é a descrição do diálogo. Ela fornece contexto para o conteúdo.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground pl-1">O conteúdo do diálogo vai aqui.</p>
          </div>
          <DialogFooter>
            <Button>Confirmar</Button>
            <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Com formulário</Button>
        </DialogTrigger>
        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Editar perfil</DialogTitle>
            <DialogDescription>
              Faça alterações no seu perfil aqui.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-1.5">
              <Label htmlFor="gallery-name">Nome</Label>
              <InputGroup>
                <InputGroupAddon align="inline-start"><SmProfileLineIcon /></InputGroupAddon>
                <InputGroupInput id="gallery-name" defaultValue="João Silva" />
              </InputGroup>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="gallery-email">E-mail</Label>
              <InputGroup>
                <InputGroupAddon align="inline-start"><SmMailSolidIcon /></InputGroupAddon>
                <InputGroupInput id="gallery-email" type="email" defaultValue="john@example.com" />
              </InputGroup>
            </div>
          </div>
          <DialogFooter showCloseButton>
            <Button>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  ),
};
