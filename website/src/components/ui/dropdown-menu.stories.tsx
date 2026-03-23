import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "./dropdown-menu";
import { Button } from "./button";

const meta = {
  title: "Core Components/DropdownMenu",
  tags: ["autodocs"],
  component: DropdownMenu,
  argTypes: {
    open: {
      control: "boolean",
      description: "Estado controlado de abertura do menu",
    },
    defaultOpen: {
      control: "boolean",
      description: "Estado inicial de abertura (não controlado)",
    },
    onOpenChange: {
      control: false,
      description: "Callback disparado ao abrir/fechar o menu",
    },
  },
  parameters: {
    docs: {
      description: {
        component: [
          "Popover menu triggered by a button click with full keyboard navigation. Built on Radix UI DropdownMenu primitive.",
          "",
          "## Anatomy",
          "",
          "```tsx",
          "<DropdownMenu>",
          "  <DropdownMenuTrigger />",
          "  <DropdownMenuContent>",
          "    <DropdownMenuLabel />",
          "    <DropdownMenuGroup>",
          "      <DropdownMenuItem />",
          "      <DropdownMenuCheckboxItem />",
          "    </DropdownMenuGroup>",
          "    <DropdownMenuSeparator />",
          "    <DropdownMenuRadioGroup>",
          "      <DropdownMenuRadioItem />",
          "    </DropdownMenuRadioGroup>",
          "    <DropdownMenuSub>",
          "      <DropdownMenuSubTrigger />",
          "      <DropdownMenuSubContent />",
          "    </DropdownMenuSub>",
          "  </DropdownMenuContent>",
          "</DropdownMenu>",
          "```",
          "",
          "## Sub-components",
          "",
          "| Sub-component | Description |",
          "|---------------|-------------|",
          "| `DropdownMenu` | Root provider wrapping `DropdownMenuPrimitive.Root` |",
          "| `DropdownMenuTrigger` | Element that toggles the menu open state |",
          "| `DropdownMenuPortal` | Renders menu content outside the DOM hierarchy |",
          "| `DropdownMenuContent` | Floating container (`bg-popover`, `rounded-xl`) with zoom/fade/slide animations. Default `sideOffset={4}` |",
          "| `DropdownMenuGroup` | Groups related menu items |",
          "| `DropdownMenuItem` | Selectable item. Accepts `variant` (`\"default\"` \\| `\"destructive\"`) and `inset` boolean for left padding |",
          "| `DropdownMenuCheckboxItem` | Item with a checkbox indicator using `SmCheckLineIcon` |",
          "| `DropdownMenuRadioGroup` | Container for mutually exclusive radio items |",
          "| `DropdownMenuRadioItem` | Item with a radio dot indicator using `SmCicleSolidIcon` |",
          "| `DropdownMenuLabel` | Non-interactive label styled `text-muted-foreground uppercase tracking-wide text-xs`. Accepts `inset` |",
          "| `DropdownMenuSeparator` | Visual divider (`bg-border`, 1px height) |",
          "| `DropdownMenuShortcut` | Keyboard shortcut hint styled `ml-auto text-xs font-mono uppercase` |",
          "| `DropdownMenuSub` | Container for nested sub-menus |",
          "| `DropdownMenuSubTrigger` | Opens a sub-menu, shows `SmArrowForwardIosLineIcon` arrow. Accepts `inset` |",
          "| `DropdownMenuSubContent` | Content panel for nested sub-menus |",
          "",
          "## Key details",
          "",
          "- Destructive items use `data-[variant=destructive]:text-destructive` for visual distinction",
          "- All items use `data-inset` attribute for consistent left padding when icons are absent",
          "- Content uses `--radix-dropdown-menu-content-transform-origin` for origin-aware animations",
          "- Max height constrained by `--radix-dropdown-menu-content-available-height` with overflow scroll",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <DropdownMenu {...args}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Open Menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            Profile <DropdownMenuShortcut>Ctrl+P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Billing <DropdownMenuShortcut>Ctrl+B</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Settings <DropdownMenuShortcut>Ctrl+S</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          Logout <DropdownMenuShortcut>Ctrl+Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Open Menu" });
    await expect(trigger).toBeInTheDocument();

    await userEvent.click(trigger);

    const menu = await within(document.body).findByRole("menu");
    await expect(menu).toBeInTheDocument();
    await expect(within(menu).getByRole("menuitem", { name: /Profile/ })).toBeInTheDocument();
    await expect(within(menu).getByRole("menuitem", { name: /Settings/ })).toBeInTheDocument();
    await expect(within(menu).getByRole("menuitem", { name: /Logout/ })).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");
  },
};

function CheckboxDemo() {
  const [statusBar, setStatusBar] = React.useState(true);
  const [activity, setActivity] = React.useState(false);
  const [panel, setPanel] = React.useState(true);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Display Options</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuCheckboxItem checked={statusBar} onCheckedChange={setStatusBar}>Status Bar</DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={activity} onCheckedChange={setActivity}>Activity Bar</DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={panel} onCheckedChange={setPanel}>Panel</DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const WithCheckboxes: Story = {
  render: () => <CheckboxDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Display Options" });

    await userEvent.click(trigger);

    const menu = await within(document.body).findByRole("menu");
    await expect(menu).toBeInTheDocument();

    const activityItem = within(menu).getByRole("menuitemcheckbox", { name: /Activity Bar/ });
    await expect(activityItem).toHaveAttribute("aria-checked", "false");

    await userEvent.click(activityItem);

    // Re-open menu to verify toggled state
    await userEvent.click(trigger);
    const reopenedMenu = await within(document.body).findByRole("menu");
    const toggledItem = within(reopenedMenu).getByRole("menuitemcheckbox", { name: /Activity Bar/ });
    await expect(toggledItem).toHaveAttribute("aria-checked", "true");

    await userEvent.keyboard("{Escape}");
  },
};

function RadioDemo() {
  const [theme, setTheme] = React.useState("dark");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Select Theme</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
          <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const WithRadioItems: Story = {
  render: () => <RadioDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Select Theme" });

    await userEvent.click(trigger);

    const body = within(document.body);
    const menu = await body.findByRole("menu");
    await expect(menu).toBeInTheDocument();

    // Verify radio items
    const darkItem = within(menu).getByRole("menuitemradio", { name: /Dark/ });
    await expect(darkItem).toHaveAttribute("aria-checked", "true");

    const lightItem = within(menu).getByRole("menuitemradio", { name: /Light/ });
    await expect(lightItem).toHaveAttribute("aria-checked", "false");

    // Click to change selection
    await userEvent.click(lightItem);

    // Re-open menu to verify changed state
    await userEvent.click(trigger);
    const reopenedMenu = await within(document.body).findByRole("menu");
    const updatedLight = within(reopenedMenu).getByRole("menuitemradio", { name: /Light/ });
    await expect(updatedLight).toHaveAttribute("aria-checked", "true");

    const updatedDark = within(reopenedMenu).getByRole("menuitemradio", { name: /Dark/ });
    await expect(updatedDark).toHaveAttribute("aria-checked", "false");

    await userEvent.keyboard("{Escape}");
  },
};

export const WithSubMenu: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Opcoes</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuItem>Nova Aba</DropdownMenuItem>
        <DropdownMenuItem>Nova Janela</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Mais Ferramentas</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>Salvar Pagina Como...</DropdownMenuItem>
            <DropdownMenuItem>Ferramentas do Desenvolvedor</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Configuracoes</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Opcoes" });

    await userEvent.click(trigger);

    const body = within(document.body);
    const menu = await body.findByRole("menu");
    await expect(menu).toBeInTheDocument();

    await expect(within(menu).getByRole("menuitem", { name: /Nova Aba/ })).toBeInTheDocument();
    await expect(within(menu).getByRole("menuitem", { name: /Nova Janela/ })).toBeInTheDocument();

    // Hover no sub-trigger para abrir sub-menu
    const subTrigger = within(menu).getByText("Mais Ferramentas");
    await expect(subTrigger).toBeInTheDocument();
    await userEvent.hover(subTrigger);

    await expect(await body.findByText("Salvar Pagina Como...")).toBeInTheDocument();
    await expect(body.getByText("Ferramentas do Desenvolvedor")).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Default</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem>
              Profile <DropdownMenuShortcut>Ctrl+P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              Billing <DropdownMenuShortcut>Ctrl+B</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              Settings <DropdownMenuShortcut>Ctrl+S</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">
            Logout <DropdownMenuShortcut>Ctrl+Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CheckboxDemo />

      <RadioDemo />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Com sub-menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuItem>Nova Aba</DropdownMenuItem>
          <DropdownMenuItem>Nova Janela</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Mais Ferramentas</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Salvar Pagina Como...</DropdownMenuItem>
              <DropdownMenuItem>Ferramentas do Desenvolvedor</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Configuracoes</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ),
};
