import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
  MenubarLabel,
  MenubarGroup,
} from "./menubar";

const meta = {
  title: "Core Components/Menubar",
  tags: ["autodocs"],
  component: Menubar,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: [
          "Horizontal menu bar with dropdown menus, built on Radix `Menubar` primitives. Replicates desktop application menu patterns with keyboard navigation.",
          "",
          "## Anatomy",
          "",
          "```tsx",
          "<Menubar>",
          "  <MenubarMenu>",
          "    <MenubarTrigger>Arquivo</MenubarTrigger>",
          "    <MenubarContent>",
          "      <MenubarLabel>Seção</MenubarLabel>",
          "      <MenubarGroup>",
          "        <MenubarItem>Novo <MenubarShortcut>Ctrl+N</MenubarShortcut></MenubarItem>",
          "      </MenubarGroup>",
          "      <MenubarSeparator />",
          "      <MenubarCheckboxItem checked>Mostrar Toolbar</MenubarCheckboxItem>",
          "      <MenubarRadioGroup value=\"100\">",
          "        <MenubarRadioItem value=\"100\">100%</MenubarRadioItem>",
          "      </MenubarRadioGroup>",
          "      <MenubarSub>",
          "        <MenubarSubTrigger>Compartilhar</MenubarSubTrigger>",
          "        <MenubarSubContent>",
          "          <MenubarItem>E-mail</MenubarItem>",
          "        </MenubarSubContent>",
          "      </MenubarSub>",
          "      <MenubarItem variant=\"destructive\">Excluir</MenubarItem>",
          "    </MenubarContent>",
          "  </MenubarMenu>",
          "</Menubar>",
          "```",
          "",
          "## Sub-components",
          "",
          "| Sub-component | Description |",
          "|---------------|-------------|",
          "| `Menubar` | Root container with `h-9`, `rounded-lg`, `bg-background`. Uses `data-slot=\"menubar\"`. |",
          "| `MenubarMenu` | Individual menu scope wrapping a trigger and content. |",
          "| `MenubarTrigger` | Button that opens the dropdown. Styled with `rounded-sm px-2 py-1 text-sm font-medium`. Shows `bg-accent` on focus and open state. |",
          "| `MenubarContent` | Dropdown panel rendered in a portal. Uses `rounded-xl`, `min-w-[12rem]`, and entrance/exit animations. |",
          "| `MenubarItem` | Selectable item with `rounded-lg`. Supports `variant=\"destructive\"` (red text, red bg on focus) and `inset` (left padding `pl-8`). |",
          "| `MenubarCheckboxItem` | Item with a `SmCheckLineIcon` indicator. |",
          "| `MenubarRadioGroup` / `MenubarRadioItem` | Radio selection group with `SmCicleSolidIcon` indicator. |",
          "| `MenubarLabel` | Non-interactive group label with `font-heading uppercase tracking-wide text-xs`. |",
          "| `MenubarSeparator` | Horizontal divider (`h-px bg-border`). |",
          "| `MenubarShortcut` | Keyboard shortcut hint aligned right with `font-mono text-xs uppercase tracking-widest`. |",
          "| `MenubarSub` / `MenubarSubTrigger` / `MenubarSubContent` | Nested sub-menu with `SmArrowForwardIosLineIcon` chevron. Sub-content uses `min-w-[8rem]`. |",
          "| `MenubarGroup` / `MenubarPortal` | Grouping and portal utilities. |",
          "",
          "## Key details",
          "",
          "- Content panels use `dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]` for dark mode depth",
          "- Items have `cursor-default` and `select-none` to match native menu behavior",
          "- Keyboard navigation (arrow keys, Escape, Enter) is handled by Radix primitives",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    children: {
      control: false,
      description: "MenubarMenu items composing the menu bar",
    },
    className: {
      control: "text",
      description: "Additional CSS classes for the menubar root",
    },
    onValueChange: {
      control: false,
      description: "Callback fired when the active menu value changes",
    },
  },
} satisfies Meta<typeof Menubar>;

export default meta;
type Story = StoryObj<typeof meta>;

function MenubarDemo() {
  const [showToolbar, setShowToolbar] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const [zoom, setZoom] = useState("100");

  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>Arquivo</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            Nova aba <MenubarShortcut>Ctrl+T</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Nova janela <MenubarShortcut>Ctrl+N</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>Compartilhar</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>Link por e-mail</MenubarItem>
              <MenubarItem>Mensagens</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem>
            Imprimir <MenubarShortcut>Ctrl+P</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Editar</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            Desfazer <MenubarShortcut>Ctrl+Z</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Refazer <MenubarShortcut>Ctrl+Y</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            Recortar <MenubarShortcut>Ctrl+X</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Copiar <MenubarShortcut>Ctrl+C</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Colar <MenubarShortcut>Ctrl+V</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Exibir</MenubarTrigger>
        <MenubarContent>
          <MenubarCheckboxItem checked={showToolbar} onCheckedChange={setShowToolbar}>
            Mostrar barra de ferramentas
          </MenubarCheckboxItem>
          <MenubarCheckboxItem checked={showSidebar} onCheckedChange={setShowSidebar}>
            Mostrar barra lateral
          </MenubarCheckboxItem>
          <MenubarSeparator />
          <MenubarRadioGroup value={zoom} onValueChange={setZoom}>
            <MenubarRadioItem value="75">75%</MenubarRadioItem>
            <MenubarRadioItem value="100">100%</MenubarRadioItem>
            <MenubarRadioItem value="150">150%</MenubarRadioItem>
          </MenubarRadioGroup>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}

export const Default: Story = {
  render: () => <MenubarDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify menubar triggers render
    const fileTrigger = canvas.getByRole("menuitem", { name: "Arquivo" });
    await expect(fileTrigger).toBeInTheDocument();

    const editTrigger = canvas.getByRole("menuitem", { name: "Editar" });
    await expect(editTrigger).toBeInTheDocument();

    // Click the first menu trigger to open it
    await userEvent.click(fileTrigger);

    // Menu items render in a portal on document.body
    const body = within(document.body);
    await expect(await body.findByText("Nova aba")).toBeInTheDocument();
    await expect(body.getByText("Imprimir")).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");
  },
};

export const Simple: Story = {
  render: () => (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>Arquivo</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Novo</MenubarItem>
          <MenubarItem>Abrir</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Salvar <MenubarShortcut>Ctrl+S</MenubarShortcut></MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Editar</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Desfazer <MenubarShortcut>Ctrl+Z</MenubarShortcut></MenubarItem>
          <MenubarItem>Refazer <MenubarShortcut>Ctrl+Y</MenubarShortcut></MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const fileTrigger = canvas.getByRole("menuitem", { name: "Arquivo" });
    await userEvent.click(fileTrigger);

    const body = within(document.body);
    await expect(await body.findByText("Novo")).toBeInTheDocument();
    await expect(body.getByText("Abrir")).toBeInTheDocument();
    await expect(body.getByText("Salvar")).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");
  },
};

export const Destructive: Story = {
  render: () => (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>Arquivo</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Novo projeto</MenubarItem>
          <MenubarItem>Duplicar</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Exportar</MenubarItem>
          <MenubarSeparator />
          <MenubarItem variant="destructive">Excluir projeto</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Conta</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Perfil</MenubarItem>
          <MenubarItem>Configurações</MenubarItem>
          <MenubarSeparator />
          <MenubarItem variant="destructive">Encerrar conta</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const fileTrigger = canvas.getByRole("menuitem", { name: "Arquivo" });
    await userEvent.click(fileTrigger);

    const body = within(document.body);
    await expect(await body.findByText("Novo projeto")).toBeInTheDocument();

    const deleteItem = body.getByText("Excluir projeto").closest("[data-slot='menubar-item']");
    await expect(deleteItem).toHaveAttribute("data-variant", "destructive");

    await userEvent.keyboard("{Escape}");
  },
};

export const Groups: Story = {
  render: () => (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>Arquivo</MenubarTrigger>
        <MenubarContent>
          <MenubarLabel>Documentos</MenubarLabel>
          <MenubarGroup>
            <MenubarItem>Novo documento</MenubarItem>
            <MenubarItem>Abrir documento</MenubarItem>
          </MenubarGroup>
          <MenubarSeparator />
          <MenubarLabel>Exportar</MenubarLabel>
          <MenubarGroup>
            <MenubarItem>Exportar como PDF</MenubarItem>
            <MenubarItem>Exportar como PNG</MenubarItem>
          </MenubarGroup>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Editar</MenubarTrigger>
        <MenubarContent>
          <MenubarLabel>Área de transferência</MenubarLabel>
          <MenubarGroup>
            <MenubarItem>Recortar <MenubarShortcut>Ctrl+X</MenubarShortcut></MenubarItem>
            <MenubarItem>Copiar <MenubarShortcut>Ctrl+C</MenubarShortcut></MenubarItem>
            <MenubarItem>Colar <MenubarShortcut>Ctrl+V</MenubarShortcut></MenubarItem>
          </MenubarGroup>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const fileTrigger = canvas.getByRole("menuitem", { name: "Arquivo" });
    await userEvent.click(fileTrigger);

    const body = within(document.body);

    // Verify labels rendered
    await expect(await body.findByText("Documentos")).toBeInTheDocument();
    await expect(body.getByText("Exportar")).toBeInTheDocument();

    // Verify grouped items
    await expect(body.getByText("Novo documento")).toBeInTheDocument();
    await expect(body.getByText("Abrir documento")).toBeInTheDocument();
    await expect(body.getByText("Exportar como PDF")).toBeInTheDocument();
    await expect(body.getByText("Exportar como PNG")).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");

    // Open Edit menu to verify second label/group
    const editTrigger = canvas.getByRole("menuitem", { name: "Editar" });
    await userEvent.click(editTrigger);

    await expect(await body.findByText("Área de transferência")).toBeInTheDocument();
    await expect(body.getByText("Recortar")).toBeInTheDocument();
    await expect(body.getByText("Copiar")).toBeInTheDocument();
    await expect(body.getByText("Colar")).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");
  },
};

export const SubMenu: Story = {
  render: () => <MenubarDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const fileTrigger = canvas.getByRole("menuitem", { name: "Arquivo" });
    await userEvent.click(fileTrigger);

    const body = within(document.body);
    await expect(await body.findByText("Nova aba")).toBeInTheDocument();

    // Hover over submenu trigger
    const shareTrigger = body.getByText("Compartilhar");
    await expect(shareTrigger).toBeInTheDocument();
    await userEvent.hover(shareTrigger);

    // Verify sub-content appears
    await expect(await body.findByText("Link por e-mail")).toBeInTheDocument();
    await expect(body.getByText("Mensagens")).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");
  },
};

export const CheckboxRadio: Story = {
  render: () => <MenubarDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const viewTrigger = canvas.getByRole("menuitem", { name: "Exibir" });
    await userEvent.click(viewTrigger);

    const body = within(document.body);
    const menu = await body.findByRole("menu");

    // Verify checkbox items
    const toolbarItem = within(menu).getByRole("menuitemcheckbox", { name: /Mostrar barra de ferramentas/ });
    await expect(toolbarItem).toHaveAttribute("aria-checked", "true");

    const sidebarItem = within(menu).getByRole("menuitemcheckbox", { name: /Mostrar barra lateral/ });
    await expect(sidebarItem).toHaveAttribute("aria-checked", "false");

    // Verify radio items
    const radio100 = within(menu).getByRole("menuitemradio", { name: /100%/ });
    await expect(radio100).toHaveAttribute("aria-checked", "true");

    const radio75 = within(menu).getByRole("menuitemradio", { name: /75%/ });
    await expect(radio75).toHaveAttribute("aria-checked", "false");

    // Toggle sidebar checkbox
    await userEvent.click(sidebarItem);

    // Re-open to verify toggle
    await userEvent.click(viewTrigger);
    const reopenedMenu = await body.findByRole("menu");
    const toggledSidebar = within(reopenedMenu).getByRole("menuitemcheckbox", { name: /Mostrar barra lateral/ });
    await expect(toggledSidebar).toHaveAttribute("aria-checked", "true");

    await userEvent.keyboard("{Escape}");
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-6 w-full">
      {/* Completo com checkboxes e radio */}
      <MenubarDemo />

      {/* Simples */}
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>Arquivo</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Novo</MenubarItem>
            <MenubarItem>Abrir</MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Salvar <MenubarShortcut>Ctrl+S</MenubarShortcut></MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Editar</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Desfazer <MenubarShortcut>Ctrl+Z</MenubarShortcut></MenubarItem>
            <MenubarItem>Refazer <MenubarShortcut>Ctrl+Y</MenubarShortcut></MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      {/* Com item destrutivo */}
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>Arquivo</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Novo projeto</MenubarItem>
            <MenubarItem>Duplicar</MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Exportar</MenubarItem>
            <MenubarSeparator />
            <MenubarItem variant="destructive">Excluir projeto</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Conta</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Perfil</MenubarItem>
            <MenubarItem>Configurações</MenubarItem>
            <MenubarSeparator />
            <MenubarItem variant="destructive">Encerrar conta</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </div>
  ),
};
