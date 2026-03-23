import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { Separator } from "./separator";

const meta = {
  title: "Base Components/Separator",
  tags: ["autodocs"],
  component: Separator,
  argTypes: {
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
      table: { defaultValue: { summary: "horizontal" } },
    },
    decorative: {
      control: "boolean",
      table: { defaultValue: { summary: "true" } },
    },
  },
  args: { orientation: "horizontal", decorative: true },
  parameters: {
    docs: {
      description: {
        component: [
          "Visual divider line built on Radix Separator primitive, supporting horizontal and vertical orientations.",
          "",
          "## Anatomy",
          "",
          "```tsx",
          "<Separator orientation=\"horizontal\" decorative />",
          "```",
          "",
          "## Props",
          "",
          "| Prop | Type | Default | Description |",
          "|------|------|---------|-------------|",
          "| `orientation` | `\"horizontal\"` \\| `\"vertical\"` | `\"horizontal\"` | Direction of the divider line |",
          "| `decorative` | `boolean` | `true` | When `true`, renders with `role=\"none\"`; when `false`, renders with `role=\"separator\"` for semantic meaning |",
          "| `className` | `string` | - | Additional CSS classes |",
          "",
          "## Key details",
          "",
          "- Uses `data-slot=\"separator\"` for styling hooks.",
          "- Sizing is controlled via `data-[orientation=horizontal]` (full width, 1px height) and `data-[orientation=vertical]` (full height, 1px width) attribute selectors.",
          "- Background color uses the `bg-border` design token.",
          "- Set `decorative={false}` when the separator conveys meaningful content boundaries to assistive technologies.",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    orientation: "horizontal",
    decorative: true,
  },
  render: (args) => (
    <div className="space-y-1">
      <h4 className="text-sm font-medium">Radix Primitives</h4>
      <p className="text-sm text-muted-foreground">Uma biblioteca de componentes UI de código aberto.</p>
      <Separator {...args} className="my-4" />
      <div className="flex h-5 items-center space-x-4 text-sm">
        <div>Blog</div>
        <Separator orientation="vertical" />
        <div>Docs</div>
        <Separator orientation="vertical" />
        <div>Source</div>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("Radix Primitives")).toBeInTheDocument();

    const separators = canvasElement.querySelectorAll('[data-slot="separator"]');
    await expect(separators.length).toBe(3);

    const horizontalSep = separators[0];
    await expect(horizontalSep).toHaveAttribute("data-orientation", "horizontal");
    await expect(horizontalSep).toHaveAttribute("role", "none");

    const verticalSep = separators[1];
    await expect(verticalSep).toHaveAttribute("data-orientation", "vertical");
    await expect(verticalSep).toHaveAttribute("role", "none");
  },
};

export const Vertical: Story = {
  render: () => (
    <div className="flex h-5 items-center space-x-4 text-sm">
      <div>Item 1</div>
      <Separator orientation="vertical" />
      <div>Item 2</div>
      <Separator orientation="vertical" />
      <div>Item 3</div>
    </div>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div className="w-[300px] space-y-4">
      <div className="space-y-1">
        <h4 className="text-sm font-medium">Seção A</h4>
        <p className="text-sm text-muted-foreground">Conteúdo da primeira seção.</p>
      </div>
      <div className="relative">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
          ou
        </span>
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-medium">Seção B</h4>
        <p className="text-sm text-muted-foreground">Conteúdo da segunda seção.</p>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("ou")).toBeInTheDocument();
    await expect(canvas.getByText("Seção A")).toBeInTheDocument();
    await expect(canvas.getByText("Seção B")).toBeInTheDocument();

    const separators = canvasElement.querySelectorAll('[data-slot="separator"]');
    await expect(separators.length).toBe(1);
    await expect(separators[0]).toHaveAttribute("data-orientation", "horizontal");
  },
};

export const NonDecorative: Story = {
  render: () => (
    <div className="w-[300px] space-y-4">
      <nav aria-label="Navegação principal">
        <ul className="space-y-2 text-sm">
          <li><a href="#" className="hover:underline">Início</a></li>
          <li><a href="#" className="hover:underline">Produtos</a></li>
        </ul>
      </nav>
      <Separator decorative={false} />
      <nav aria-label="Navegação secundária">
        <ul className="space-y-2 text-sm">
          <li><a href="#" className="hover:underline">Ajuda</a></li>
          <li><a href="#" className="hover:underline">Termos de uso</a></li>
        </ul>
      </nav>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const separator = canvasElement.querySelector('[data-slot="separator"]');
    await expect(separator).toBeInTheDocument();
    // Non-decorative separators have role="separator" instead of role="none"
    await expect(separator).toHaveAttribute("role", "separator");

    await expect(canvas.getByText("Início")).toBeInTheDocument();
    await expect(canvas.getByText("Ajuda")).toBeInTheDocument();
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      {/* Horizontal */}
      <div className="w-[300px] space-y-1">
        <span className="text-sm text-muted-foreground">Horizontal</span>
        <Separator />
      </div>

      {/* Vertical */}
      <div className="flex h-5 items-center space-x-4 text-sm">
        <div>Item 1</div>
        <Separator orientation="vertical" />
        <div>Item 2</div>
        <Separator orientation="vertical" />
        <div>Item 3</div>
      </div>
    </div>
  ),
};
