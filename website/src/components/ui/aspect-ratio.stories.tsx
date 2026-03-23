import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { AspectRatio } from "./aspect-ratio";

const meta = {
  title: "Base Components/AspectRatio",
  tags: ["autodocs"],
  component: AspectRatio,
  argTypes: {
    ratio: {
      control: "text",
      description: "Width-to-height ratio (e.g. 16/9, 1, 21/9)",
      table: { defaultValue: { summary: "1" } },
    },
    children: {
      control: false,
      description: "Content to render inside the aspect ratio container",
    },
  },
  args: { ratio: 16 / 9 },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: [
          "Constrains child content to a specific width-to-height ratio. Wraps Radix `AspectRatio.Root` primitive.",
          "",
          "## Anatomy",
          "",
          "```tsx",
          "<AspectRatio ratio={16 / 9}>",
          "  <img src=\"...\" />",
          "</AspectRatio>",
          "```",
          "",
          "## Props",
          "",
          "| Prop | Type | Default | Description |",
          "|------|------|---------|-------------|",
          "| `ratio` | `number` | `1` | Width-to-height ratio (e.g. `16/9`, `4/3`, `1`) |",
          "",
          "## Key details",
          "",
          "- Renders `data-slot=\"aspect-ratio\"` for styling hooks",
          "- The container enforces the ratio via padding-bottom technique (handled by Radix internally)",
          "- Child elements should use `h-full w-full` to fill the constrained area",
        ].join("\n"),
      },
    },
  },
  decorators: [
    // max-w-lg limita a largura apenas para organizar o preview
    (Story) => (
      <div className="w-full max-w-lg p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AspectRatio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <AspectRatio {...args}>
      <div className="flex h-full w-full items-center justify-center rounded-md bg-muted">
        16:9
      </div>
    </AspectRatio>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("16:9")).toBeVisible();

    const container = canvasElement.querySelector('[data-slot="aspect-ratio"]');
    await expect(container).toBeInTheDocument();
  },
};

export const Square: Story = {
  render: () => (
    <AspectRatio ratio={1}>
        <div className="flex h-full w-full items-center justify-center rounded-md bg-muted">
          1:1
        </div>
      </AspectRatio>
  ),
};

export const Wide: Story = {
  render: () => (
    <AspectRatio ratio={21 / 9}>
        <div className="flex h-full w-full items-center justify-center rounded-md bg-muted">
          21:9
        </div>
      </AspectRatio>
  ),
};

export const Portrait: Story = {
  render: () => (
    <AspectRatio ratio={3 / 4}>
        <div className="flex h-full w-full items-center justify-center rounded-md bg-muted">
          3:4
        </div>
      </AspectRatio>
  ),
};

export const Vertical: Story = {
  render: () => (
    <AspectRatio ratio={9 / 16}>
        <div className="flex h-full w-full items-center justify-center rounded-md bg-muted">
          9:16
        </div>
      </AspectRatio>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      <div>
        <span className="text-sm text-muted-foreground">16:9</span>
        <AspectRatio ratio={16 / 9}>
          <div className="flex h-full w-full items-center justify-center rounded-md bg-muted">
            16:9
          </div>
        </AspectRatio>
      </div>
      <div>
        <span className="text-sm text-muted-foreground">4:3</span>
        <AspectRatio ratio={4 / 3}>
          <div className="flex h-full w-full items-center justify-center rounded-md bg-muted">
            4:3
          </div>
        </AspectRatio>
      </div>
      <div>
        <span className="text-sm text-muted-foreground">3:4</span>
        <AspectRatio ratio={3 / 4}>
          <div className="flex h-full w-full items-center justify-center rounded-md bg-muted">
            3:4
          </div>
        </AspectRatio>
      </div>
      <div>
        <span className="text-sm text-muted-foreground">1:1</span>
        <AspectRatio ratio={1}>
          <div className="flex h-full w-full items-center justify-center rounded-md bg-muted">
            1:1
          </div>
        </AspectRatio>
      </div>
      <div>
        <span className="text-sm text-muted-foreground">9:16</span>
        <AspectRatio ratio={9 / 16}>
          <div className="flex h-full w-full items-center justify-center rounded-md bg-muted">
            9:16
          </div>
        </AspectRatio>
      </div>
      <div>
        <span className="text-sm text-muted-foreground">21:9</span>
        <AspectRatio ratio={21 / 9}>
          <div className="flex h-full w-full items-center justify-center rounded-md bg-muted">
            21:9
          </div>
        </AspectRatio>
      </div>
    </div>
  ),
};
