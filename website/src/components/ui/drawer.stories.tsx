import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
  DrawerMenuGroup,
  DrawerMenuLabel,
  DrawerMenuItem,
  DrawerMenuSeparator,
} from "./drawer";
import { Button } from "./button";
import {
  MdHomeSolidIcon,
  MdPlaySolidIcon,
  MdFavoriteSolidIcon,
  MdLibrarySolidIcon,
  MdDocSolidIcon,
  MdCrownSolidIcon,
} from "@/components/icons";

const meta = {
  title: "Core Components/Drawer",
  tags: ["autodocs"],
  component: Drawer,
  argTypes: {
    open: {
      control: "boolean",
      description: "Estado controlado de abertura do drawer",
    },
    direction: {
      control: "select",
      options: ["top", "bottom", "left", "right"],
      description: "Direção de abertura do drawer",
    },
    onOpenChange: {
      control: false,
      description: "Callback disparado ao abrir/fechar o drawer",
    },
  },
  parameters: {
    docs: {
      description: {
        component: [
          "Swipeable drawer panel powered by Vaul, slides from any direction (top, bottom, left, right). Includes a menu variant with sidebar-style navigation items.",
          "",
          "## Anatomy - Default",
          "",
          "```tsx",
          "<Drawer direction=\"bottom\">",
          "  <DrawerTrigger />",
          "  <DrawerContent>",
          "    <DrawerHeader>",
          "      <DrawerTitle />",
          "      <DrawerDescription />",
          "    </DrawerHeader>",
          "    {/* content */}",
          "    <DrawerFooter>",
          "      <DrawerClose />",
          "    </DrawerFooter>",
          "  </DrawerContent>",
          "</Drawer>",
          "```",
          "",
          "## Anatomy - Menu",
          "",
          "```tsx",
          "<Drawer>",
          "  <DrawerTrigger />",
          "  <DrawerContent>",
          "    <DrawerMenuGroup>",
          "      <DrawerMenuItem isActive>",
          "        <Icon />",
          "        <span>Label</span>",
          "      </DrawerMenuItem>",
          "      <DrawerMenuSeparator />",
          "      <DrawerMenuItem>",
          "        <Icon />",
          "        <span>Label</span>",
          "      </DrawerMenuItem>",
          "    </DrawerMenuGroup>",
          "  </DrawerContent>",
          "</Drawer>",
          "```",
          "",
          "## Sub-components",
          "",
          "| Sub-component | Description |",
          "|---------------|-------------|",
          "| `Drawer` | Root provider wrapping `DrawerPrimitive.Root` from Vaul |",
          "| `DrawerTrigger` | Element that opens the drawer |",
          "| `DrawerPortal` | Renders drawer content outside the DOM hierarchy |",
          "| `DrawerOverlay` | Semi-transparent backdrop with `bg-black/70 backdrop-blur-sm` and fade animations |",
          "| `DrawerContent` | Direction-aware panel (`bg-[var(--surface-950)]`) with rounded corners, no borders, `pb-6` padding. Drag handle shown for bottom/top directions |",
          "| `DrawerHeader` | Flex column container; text centers for top/bottom directions |",
          "| `DrawerFooter` | Action button area styled as `flex-row gap-2` |",
          "| `DrawerTitle` | Accessible title via `DrawerPrimitive.Title`, styled `text-foreground font-semibold` |",
          "| `DrawerDescription` | Accessible description, styled `text-muted-foreground text-sm` |",
          "| `DrawerClose` | Button that closes the drawer |",
          "| `DrawerMenuGroup` | Flex column container for menu items with `gap-1 px-2` |",
          "| `DrawerMenuLabel` | Uppercase muted label for a group of menu items |",
          "| `DrawerMenuItem` | Sidebar-style button - `isActive` highlights with `bg-[var(--surface-900)]`, `variant=\"destructive\"` for danger actions. Icons use `size-6 opacity-50` with full opacity on hover/active |",
          "| `DrawerMenuSeparator` | Horizontal `bg-border` divider between menu sections |",
          "",
          "## Key details",
          "",
          "- Bottom drawers show a drag handle (`bg-[var(--surface-700)]`, 100px wide) with `mb-5` spacing to content",
          "- Top drawers show the drag handle at the bottom of the panel",
          "- No borders on any direction - clean borderless panels",
          "- Left/right drawers are constrained to `sm:max-w-sm` width",
          "- Top/bottom drawers are constrained to `max-h-[80vh]`",
          "- Menu items follow `SidebarMenuButton` styling: `gap-2`, `rounded-md`, `p-2`, `text-[var(--surface-500)]`",
          "- Uses `group/drawer-content` for nested direction-aware styling",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Drawer {...args}>
      <DrawerTrigger asChild>
        <Button variant="outline">Abrir gaveta</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Meta diária</DrawerTitle>
          <DrawerDescription>Defina sua meta de atividade diária.</DrawerDescription>
        </DrawerHeader>
        <div className="px-5 py-4">
          <p className="text-sm text-muted-foreground pl-1">Arraste a alça para ajustar sua meta.</p>
        </div>
        <DrawerFooter>
          <Button>Enviar</Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", {
      name: "Abrir gaveta",
      hidden: true,
    });
    await expect(trigger).toBeInTheDocument();

    await userEvent.click(trigger);

    const dialog = await within(document.body).findByRole("dialog");
    await expect(dialog).toHaveAttribute("data-state", "open");
    await expect(within(dialog).getByText("Meta diária")).toBeInTheDocument();
  },
};

export const WithContent: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Abrir gaveta</Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="w-full">
          <DrawerHeader>
            <DrawerTitle>Configurações</DrawerTitle>
            <DrawerDescription>Gerencie as configurações do seu aplicativo.</DrawerDescription>
          </DrawerHeader>
          <div className="space-y-4 px-5 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Notificações</span>
              <span className="text-sm text-muted-foreground">Ativadas</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Tema</span>
              <span className="text-sm text-muted-foreground">Sistema</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Idioma</span>
              <span className="text-sm text-muted-foreground">Português</span>
            </div>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Fechar</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  ),
};

export const Left: Story = {
  render: () => (
    <Drawer direction="left">
      <DrawerTrigger asChild>
        <Button variant="outline">Abrir à esquerda</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Navegação</DrawerTitle>
          <DrawerDescription>Menu lateral esquerdo do aplicativo.</DrawerDescription>
        </DrawerHeader>
        <div className="space-y-2 px-5 py-4">
          <p className="text-sm">Principal</p>
          <p className="text-sm">Configurações</p>
          <p className="text-sm">Perfil</p>
          <p className="text-sm">Ajuda</p>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Fechar</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", {
      name: "Abrir à esquerda",
      hidden: true,
    });

    await userEvent.click(trigger);

    const dialog = await within(document.body).findByRole("dialog");
    await expect(dialog).toHaveAttribute("data-state", "open");
    await expect(within(dialog).getByText("Navegação")).toBeInTheDocument();
    await expect(within(dialog).getByText("Principal")).toBeInTheDocument();
    await expect(within(dialog).getByText("Configurações")).toBeInTheDocument();
  },
};

export const Top: Story = {
  render: () => (
    <div className="flex justify-center">
    <Drawer direction="top">
      <DrawerTrigger asChild>
        <Button variant="outline">Abrir do topo</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Notificações</DrawerTitle>
          <DrawerDescription>Suas notificações recentes.</DrawerDescription>
        </DrawerHeader>
        <div className="space-y-3 px-5 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Nova mensagem de João</span>
            <span className="text-xs text-muted-foreground">2 min</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Tarefa concluída</span>
            <span className="text-xs text-muted-foreground">15 min</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Atualização do sistema</span>
            <span className="text-xs text-muted-foreground">1 h</span>
          </div>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Fechar</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
    </div>
  ),
};

export const Right: Story = {
  render: () => (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button variant="outline">Abrir à direita</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Detalhes</DrawerTitle>
          <DrawerDescription>Informações detalhadas do item selecionado.</DrawerDescription>
        </DrawerHeader>
        <div className="space-y-4 px-5 py-4">
          <div>
            <p className="text-xs text-muted-foreground">Nome</p>
            <p className="text-sm">Projeto Alpha</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <p className="text-sm">Em andamento</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Responsável</p>
            <p className="text-sm">Ana Silva</p>
          </div>
        </div>
        <DrawerFooter>
          <Button>Salvar</Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

export const Menu: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Abrir menu</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerMenuGroup>
          <DrawerMenuItem isActive>
            <MdHomeSolidIcon />
            <span>Principal</span>
          </DrawerMenuItem>
          <DrawerMenuItem>
            <MdPlaySolidIcon />
            <span>Lives</span>
          </DrawerMenuItem>
          <DrawerMenuItem>
            <MdFavoriteSolidIcon />
            <span>Trilhas</span>
          </DrawerMenuItem>
          <DrawerMenuItem>
            <MdLibrarySolidIcon />
            <span>Biblioteca</span>
          </DrawerMenuItem>
          <DrawerMenuItem>
            <MdDocSolidIcon />
            <span>Materiais</span>
          </DrawerMenuItem>
          <DrawerMenuItem>
            <MdCrownSolidIcon />
            <span>Missões</span>
          </DrawerMenuItem>
        </DrawerMenuGroup>
      </DrawerContent>
    </Drawer>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", {
      name: "Abrir menu",
      hidden: true,
    });

    await userEvent.click(trigger);

    const dialog = await within(document.body).findByRole("dialog");
    await expect(dialog).toHaveAttribute("data-state", "open");
    await expect(within(dialog).getByText("Principal")).toBeInTheDocument();
    await expect(within(dialog).getByText("Missões")).toBeInTheDocument();
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="outline">Inferior (padrão)</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Meta diária</DrawerTitle>
            <DrawerDescription>Defina sua meta de atividade diária.</DrawerDescription>
          </DrawerHeader>
          <div className="px-5 py-4">
            <p className="text-sm text-muted-foreground pl-1">Arraste a alça para ajustar sua meta.</p>
          </div>
          <DrawerFooter>
            <Button>Enviar</Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Drawer direction="left">
        <DrawerTrigger asChild>
          <Button variant="outline">Esquerda</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Navegação</DrawerTitle>
            <DrawerDescription>Menu lateral esquerdo do aplicativo.</DrawerDescription>
          </DrawerHeader>
          <div className="space-y-2 px-5 py-4">
            <p className="text-sm">Principal</p>
            <p className="text-sm">Configurações</p>
            <p className="text-sm">Perfil</p>
            <p className="text-sm">Ajuda</p>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Fechar</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Drawer direction="top">
        <DrawerTrigger asChild>
          <Button variant="outline">Superior</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Notificações</DrawerTitle>
            <DrawerDescription>Suas notificações recentes.</DrawerDescription>
          </DrawerHeader>
          <div className="space-y-3 px-5 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Nova mensagem de João</span>
              <span className="text-xs text-muted-foreground">2 min</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Tarefa concluída</span>
              <span className="text-xs text-muted-foreground">15 min</span>
            </div>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Fechar</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Drawer direction="right">
        <DrawerTrigger asChild>
          <Button variant="outline">Direita</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Detalhes</DrawerTitle>
            <DrawerDescription>Informações detalhadas do item selecionado.</DrawerDescription>
          </DrawerHeader>
          <div className="space-y-4 px-5 py-4">
            <div>
              <p className="text-xs text-muted-foreground">Nome</p>
              <p className="text-sm">Projeto Alpha</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="text-sm">Em andamento</p>
            </div>
          </div>
          <DrawerFooter>
            <Button>Salvar</Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  ),
};
