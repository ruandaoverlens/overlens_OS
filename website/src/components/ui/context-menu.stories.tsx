import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
} from "./context-menu";

const meta = {
  title: "Core Components/ContextMenu",
  tags: ["autodocs"],
  component: ContextMenu,
  argTypes: {
    onOpenChange: {
      control: false,
      description: "Callback disparado ao abrir/fechar o menu de contexto",
    },
  },
  parameters: {
    docs: {
      description: {
        component: [
          "Menu de contexto acionado por clique-direito, construido sobre primitivas Radix `ContextMenu`. Suporta sub-menus aninhados, itens checkbox, grupos radio, atalhos de teclado e variantes destrutivas.",
          "",
          "## Anatomia",
          "",
          "```tsx",
          "<ContextMenu>",
          "  <ContextMenuTrigger>Area de clique-direito</ContextMenuTrigger>",
          "  <ContextMenuContent>",
          "    <ContextMenuLabel>Grupo</ContextMenuLabel>",
          "    <ContextMenuGroup>",
          "      <ContextMenuItem>",
          "        Acao <ContextMenuShortcut>Ctrl+A</ContextMenuShortcut>",
          "      </ContextMenuItem>",
          "      <ContextMenuCheckboxItem checked>Alternar</ContextMenuCheckboxItem>",
          "    </ContextMenuGroup>",
          "    <ContextMenuSeparator />",
          "    <ContextMenuRadioGroup value=\"opt\">",
          "      <ContextMenuRadioItem value=\"opt\">Opcao</ContextMenuRadioItem>",
          "    </ContextMenuRadioGroup>",
          "    <ContextMenuSub>",
          "      <ContextMenuSubTrigger>Mais</ContextMenuSubTrigger>",
          "      <ContextMenuSubContent>",
          "        <ContextMenuItem>Sub-item</ContextMenuItem>",
          "      </ContextMenuSubContent>",
          "    </ContextMenuSub>",
          "  </ContextMenuContent>",
          "</ContextMenu>",
          "```",
          "",
          "## Sub-componentes",
          "",
          "| Sub-componente | Descricao |",
          "|---------------|-------------|",
          "| `ContextMenu` | Provedor raiz que encapsula `Radix ContextMenu.Root` |",
          "| `ContextMenuTrigger` | Area que ativa o menu ao clicar com botao direito |",
          "| `ContextMenuContent` | Painel flutuante renderizado via `Portal`. Usa `rounded-xl`, `bg-popover` e animacao de entrada/saida |",
          "| `ContextMenuItem` | Item selecionavel. Aceita `variant` (`\"default\"` ou `\"destructive\"`) e `inset` (adiciona `pl-8`) |",
          "| `ContextMenuCheckboxItem` | Item com indicador `SmCheckLineIcon` para alternancia booleana |",
          "| `ContextMenuRadioGroup` | Container para itens radio mutuamente exclusivos |",
          "| `ContextMenuRadioItem` | Item radio com indicador de ponto `SmCicleSolidIcon` |",
          "| `ContextMenuLabel` | Cabecalho nao-interativo em `font-heading`, `uppercase`, `tracking-wide`, `text-xs` |",
          "| `ContextMenuSeparator` | Divisor horizontal (`h-px bg-border`) |",
          "| `ContextMenuShortcut` | Dica de atalho alinhada a direita em `font-mono`, `text-xs`, `tracking-widest` |",
          "| `ContextMenuGroup` | Agrupa itens relacionados |",
          "| `ContextMenuSub` | Container para sub-menu aninhado |",
          "| `ContextMenuSubTrigger` | Item que abre um sub-menu, com chevron `SmArrowForwardIosLineIcon` |",
          "| `ContextMenuSubContent` | Painel de conteudo do sub-menu aninhado |",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof ContextMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
        Clique-direito aqui
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem>
          Voltar <ContextMenuShortcut>Ctrl+[</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          Avancar <ContextMenuShortcut>Ctrl+]</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          Recarregar <ContextMenuShortcut>Ctrl+R</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>Salvar como...</ContextMenuItem>
        <ContextMenuItem>Imprimir</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByText("Clique-direito aqui");
    await userEvent.pointer({ keys: "[MouseRight]", target: trigger });

    const menu = await within(document.body).findByRole("menu");
    await expect(menu).toBeInTheDocument();
    await expect(menu).toHaveAttribute("data-slot", "context-menu-content");

    const items = within(menu).getAllByRole("menuitem");
    await expect(items.length).toBe(5);

    const shortcuts = menu.querySelectorAll('[data-slot="context-menu-shortcut"]');
    await expect(shortcuts.length).toBe(3);

    const separator = menu.querySelector('[data-slot="context-menu-separator"]');
    await expect(separator).toBeInTheDocument();

    // Close menu
    await userEvent.keyboard("{Escape}");
  },
};

export const WithSubMenu: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
        Clique-direito para sub-menu
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem>Recortar</ContextMenuItem>
        <ContextMenuItem>Copiar</ContextMenuItem>
        <ContextMenuItem>Colar</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuSub>
          <ContextMenuSubTrigger>Mais Ferramentas</ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem>Salvar Pagina Como...</ContextMenuItem>
            <ContextMenuItem>Ver Codigo-Fonte</ContextMenuItem>
            <ContextMenuItem>Inspecionar</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
      </ContextMenuContent>
    </ContextMenu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByText("Clique-direito para sub-menu");
    await userEvent.pointer({ keys: "[MouseRight]", target: trigger });

    const menu = await within(document.body).findByRole("menu");
    await expect(menu).toBeInTheDocument();

    const subTrigger = within(menu).getByText("Mais Ferramentas");
    await expect(subTrigger).toBeInTheDocument();
    await expect(subTrigger.closest('[data-slot="context-menu-sub-trigger"]')).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");
  },
};

function CheckboxItemsDemo() {
  const [toolbar, setToolbar] = React.useState(true);
  const [sidebar, setSidebar] = React.useState(false);
  const [statusBar, setStatusBar] = React.useState(true);
  const [zoom, setZoom] = React.useState("100");

  return (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
        Clique-direito para checkboxes
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuLabel>Visualizacao</ContextMenuLabel>
        <ContextMenuCheckboxItem checked={toolbar} onCheckedChange={setToolbar}>Exibir Barra de Ferramentas</ContextMenuCheckboxItem>
        <ContextMenuCheckboxItem checked={sidebar} onCheckedChange={setSidebar}>Exibir Barra Lateral</ContextMenuCheckboxItem>
        <ContextMenuCheckboxItem checked={statusBar} onCheckedChange={setStatusBar}>Exibir Barra de Status</ContextMenuCheckboxItem>
        <ContextMenuSeparator />
        <ContextMenuLabel>Zoom</ContextMenuLabel>
        <ContextMenuRadioGroup value={zoom} onValueChange={setZoom}>
          <ContextMenuRadioItem value="75">75%</ContextMenuRadioItem>
          <ContextMenuRadioItem value="100">100%</ContextMenuRadioItem>
          <ContextMenuRadioItem value="125">125%</ContextMenuRadioItem>
        </ContextMenuRadioGroup>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export const WithCheckboxItems: Story = {
  render: () => <CheckboxItemsDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByText("Clique-direito para checkboxes");
    await userEvent.pointer({ keys: "[MouseRight]", target: trigger });

    const menu = await within(document.body).findByRole("menu");
    await expect(menu).toBeInTheDocument();

    // Verify labels
    const labels = menu.querySelectorAll('[data-slot="context-menu-label"]');
    await expect(labels.length).toBe(2);

    // Verify checkbox items
    const checkboxItems = within(menu).getAllByRole("menuitemcheckbox");
    await expect(checkboxItems.length).toBe(3);

    // Verify radio items
    const radioItems = within(menu).getAllByRole("menuitemradio");
    await expect(radioItems.length).toBe(3);

    await userEvent.keyboard("{Escape}");
  },
};

export const WithGroups: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
        Clique-direito para grupos
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuLabel>Navegacao</ContextMenuLabel>
        <ContextMenuGroup>
          <ContextMenuItem>
            Voltar <ContextMenuShortcut>Ctrl+[</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem>
            Avancar <ContextMenuShortcut>Ctrl+]</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuLabel>Acoes</ContextMenuLabel>
        <ContextMenuGroup>
          <ContextMenuItem>Salvar como...</ContextMenuItem>
          <ContextMenuItem>Imprimir</ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByText("Clique-direito para grupos");
    await userEvent.pointer({ keys: "[MouseRight]", target: trigger });

    const menu = await within(document.body).findByRole("menu");
    const groups = menu.querySelectorAll('[data-slot="context-menu-group"]');
    await expect(groups.length).toBe(2);

    const labels = menu.querySelectorAll('[data-slot="context-menu-label"]');
    await expect(labels.length).toBe(2);
    await expect(labels[0]).toHaveTextContent("Navegacao");
    await expect(labels[1]).toHaveTextContent("Acoes");

    await userEvent.keyboard("{Escape}");
  },
};

export const WithDestructiveItem: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
        Clique-direito para destrutivo
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem>Editar</ContextMenuItem>
        <ContextMenuItem>Duplicar</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive">Excluir</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByText("Clique-direito para destrutivo");
    await userEvent.pointer({ keys: "[MouseRight]", target: trigger });

    const menu = await within(document.body).findByRole("menu");
    const destructiveItem = within(menu).getByText("Excluir").closest('[data-slot="context-menu-item"]');
    await expect(destructiveItem).toHaveAttribute("data-variant", "destructive");

    await userEvent.keyboard("{Escape}");
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-4">
      <ContextMenu>
        <ContextMenuTrigger className="flex h-[120px] w-[220px] items-center justify-center rounded-md border border-dashed text-sm">
          Default
        </ContextMenuTrigger>
        <ContextMenuContent className="w-64">
          <ContextMenuItem>
            Voltar <ContextMenuShortcut>Ctrl+[</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem>
            Avancar <ContextMenuShortcut>Ctrl+]</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem>
            Recarregar <ContextMenuShortcut>Ctrl+R</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem>Salvar como...</ContextMenuItem>
          <ContextMenuItem>Imprimir</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <ContextMenu>
        <ContextMenuTrigger className="flex h-[120px] w-[220px] items-center justify-center rounded-md border border-dashed text-sm">
          Com sub-menu
        </ContextMenuTrigger>
        <ContextMenuContent className="w-64">
          <ContextMenuItem>Recortar</ContextMenuItem>
          <ContextMenuItem>Copiar</ContextMenuItem>
          <ContextMenuItem>Colar</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuSub>
            <ContextMenuSubTrigger>Mais Ferramentas</ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              <ContextMenuItem>Salvar Pagina Como...</ContextMenuItem>
              <ContextMenuItem>Ver Codigo-Fonte</ContextMenuItem>
              <ContextMenuItem>Inspecionar</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        </ContextMenuContent>
      </ContextMenu>

      <CheckboxItemsDemo />
    </div>
  ),
};
