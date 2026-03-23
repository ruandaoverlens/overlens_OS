import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";

const meta = {
  title: "Base Components/Tabs",
  tags: ["autodocs"],
  component: Tabs,
  argTypes: {
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
    },
    onValueChange: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component: [
          "Tabbed navigation component built on Radix UI Tabs primitive, supporting horizontal and vertical orientations with default (pill) and line (underline) variants.",
          "",
          "## Anatomy",
          "",
          "```tsx",
          "<Tabs defaultValue=\"tab1\" orientation=\"horizontal\">",
          "  <TabsList underline={false}>",
          "    <TabsTrigger value=\"tab1\">Tab 1</TabsTrigger>",
          "    <TabsTrigger value=\"tab2\">Tab 2</TabsTrigger>",
          "  </TabsList>",
          "  <TabsContent value=\"tab1\">Content 1</TabsContent>",
          "  <TabsContent value=\"tab2\">Content 2</TabsContent>",
          "</Tabs>",
          "```",
          "",
          "## Sub-components",
          "",
          "| Sub-component | Description |",
          "|---------------|-------------|",
          "| `Tabs` | Root container wrapping `TabsPrimitive.Root`. Sets `data-orientation` and flex direction via `data-[orientation=horizontal]:flex-col`. |",
          "| `TabsList` | Trigger container. Accepts `underline` boolean to switch between default (pill) and line variant. Line variant uses `overflow-visible` with `pb-2` to accommodate the active underline. |",
          "| `TabsTrigger` | Tab button. Default active: `ring-2 ring-inset ring-surface-200`. Line active: white 2px `::after` bar (bottom for horizontal, right for vertical). |",
          "| `TabsContent` | Content panel. Renders when its matching trigger is active. |",
          "",
          "## Key details",
          "",
          "- Orientation: `horizontal` (default) or `vertical` via the `orientation` prop on `Tabs`",
          "- **Default variant**: pill-shaped triggers with `bg-accent/50`, active state `ring-2 ring-inset ring-surface-200`. Focus: `ring-[3px] ring-ring/50`",
          "- **Line variant**: transparent triggers, active tab shows a white 2px `::after` bar below (horizontal) or right (vertical). Focus: `outline-2 outline-[var(--surface-200)]` (no layout shift)",
          "- Line variant `TabsList` uses `overflow-visible` so focus outlines and the `::after` underline are not clipped",
          "- Disabled triggers get `opacity-50` and `pointer-events-none`",
          "- Uses `data-slot` attributes: `tabs`, `tabs-list`, `tabs-trigger`, `tabs-content`",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultValue: "account",
  },
  render: (args) => (
    <Tabs {...args} className="w-[400px]">
      <TabsList>
        <TabsTrigger value="account">Conta</TabsTrigger>
        <TabsTrigger value="password">Senha</TabsTrigger>
        <TabsTrigger value="settings">Configurações</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <p className="text-sm text-muted-foreground p-4">
          Gerencie as configurações e preferências da sua conta.
        </p>
      </TabsContent>
      <TabsContent value="password">
        <p className="text-sm text-muted-foreground p-4">
          Altere sua senha e configurações de segurança.
        </p>
      </TabsContent>
      <TabsContent value="settings">
        <p className="text-sm text-muted-foreground p-4">
          Configure as preferências do aplicativo.
        </p>
      </TabsContent>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const accountTab = await canvas.findByRole("tab", { name: "Conta" });
    const passwordTab = await canvas.findByRole("tab", { name: "Senha" });

    await expect(accountTab).toHaveAttribute("aria-selected", "true");
    await expect(passwordTab).toHaveAttribute("aria-selected", "false");

    await userEvent.click(passwordTab);

    await expect(passwordTab).toHaveAttribute("aria-selected", "true");
    await expect(accountTab).toHaveAttribute("aria-selected", "false");
  },
};

export const LineVariant: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-[400px]">
      <TabsList underline>
        <TabsTrigger value="overview">Visão Geral</TabsTrigger>
        <TabsTrigger value="analytics">Análises</TabsTrigger>
        <TabsTrigger value="reports">Relatórios</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <p className="text-sm text-muted-foreground p-4">
          Conteúdo da visão geral aqui.
        </p>
      </TabsContent>
      <TabsContent value="analytics">
        <p className="text-sm text-muted-foreground p-4">
          Conteúdo de análises aqui.
        </p>
      </TabsContent>
      <TabsContent value="reports">
        <p className="text-sm text-muted-foreground p-4">
          Conteúdo de relatórios aqui.
        </p>
      </TabsContent>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const overviewTab = await canvas.findByRole("tab", { name: "Visão Geral" });
    const analyticsTab = await canvas.findByRole("tab", { name: "Análises" });

    await expect(overviewTab).toHaveAttribute("aria-selected", "true");

    await userEvent.click(analyticsTab);

    await expect(analyticsTab).toHaveAttribute("aria-selected", "true");
    await expect(overviewTab).toHaveAttribute("aria-selected", "false");
    await expect(canvas.getByText("Conteúdo de análises aqui.")).toBeVisible();
  },
};

export const Vertical: Story = {
  render: () => (
    <Tabs defaultValue="general" orientation="vertical" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="general">Geral</TabsTrigger>
        <TabsTrigger value="security">Segurança</TabsTrigger>
        <TabsTrigger value="notifications">Notificações</TabsTrigger>
      </TabsList>
      <TabsContent value="general">
        <p className="text-sm text-muted-foreground p-4">Configurações gerais.</p>
      </TabsContent>
      <TabsContent value="security">
        <p className="text-sm text-muted-foreground p-4">Configurações de segurança.</p>
      </TabsContent>
      <TabsContent value="notifications">
        <p className="text-sm text-muted-foreground p-4">
          Preferências de notificação.
        </p>
      </TabsContent>
    </Tabs>
  ),
};

export const DisabledTab: Story = {
  render: () => (
    <Tabs defaultValue="active" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="active">Ativo</TabsTrigger>
        <TabsTrigger value="disabled" disabled>
          Desativado
        </TabsTrigger>
        <TabsTrigger value="other">Outro</TabsTrigger>
      </TabsList>
      <TabsContent value="active">
        <p className="text-sm text-muted-foreground p-4">Conteúdo da aba ativa.</p>
      </TabsContent>
      <TabsContent value="other">
        <p className="text-sm text-muted-foreground p-4">Conteúdo da outra aba.</p>
      </TabsContent>
    </Tabs>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-8">
      {[false, true].map((underline) => (
        <Tabs key={String(underline)} defaultValue="tab1" className="w-[300px]">
          <TabsList underline={underline}>
            <TabsTrigger value="tab1">Visão Geral</TabsTrigger>
            <TabsTrigger value="tab2">Detalhes</TabsTrigger>
            <TabsTrigger value="tab3">Análises</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">
            <p className="text-sm text-muted-foreground p-4">
              Underline: {String(underline)}
            </p>
          </TabsContent>
          <TabsContent value="tab2">
            <p className="text-sm text-muted-foreground p-4">
              Conteúdo dos detalhes.
            </p>
          </TabsContent>
          <TabsContent value="tab3">
            <p className="text-sm text-muted-foreground p-4">
              Conteúdo das análises.
            </p>
          </TabsContent>
        </Tabs>
      ))}
    </div>
  ),
};
