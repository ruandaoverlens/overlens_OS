import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { ScrollArea, ScrollBar } from "./scroll-area";
import { Separator } from "./separator";

const meta = {
  title: "Base Components/ScrollArea",
  tags: ["autodocs"],
  component: ScrollArea,
  argTypes: {
    type: {
      control: "select",
      options: ["auto", "always", "scroll", "hover"],
      table: { defaultValue: { summary: "auto" } },
    },
    dir: {
      control: "select",
      options: ["ltr", "rtl"],
    },
    scrollHideDelay: {
      control: "text",
      table: { defaultValue: { summary: "600" } },
    },
    children: {
      control: false,
    },
  },
  args: { type: "auto" },
  parameters: {
    docs: {
      description: {
        component: [
          "Custom scrollable container with styled scrollbar overlays, built on Radix ScrollArea primitive.",
          "",
          "## Anatomy",
          "",
          "```tsx",
          "<ScrollArea>",
          "  {children}",
          "  <ScrollBar orientation=\"horizontal\" />",
          "</ScrollArea>",
          "```",
          "",
          "## Sub-components",
          "",
          "| Sub-component | Description |",
          "|---------------|-------------|",
          "| `ScrollArea` | Root container wrapping `ScrollAreaPrimitive.Root` with a viewport and default vertical scrollbar. Uses `data-slot=\"scroll-area\"`. |",
          "| `ScrollBar` | Scrollbar track and thumb for vertical or horizontal scrolling. Renders `ScrollAreaPrimitive.ScrollAreaScrollbar` with a `ScrollAreaThumb`. Uses `data-slot=\"scroll-area-scrollbar\"`. |",
          "",
          "## Key details",
          "",
          "- `ScrollArea` automatically includes a vertical `ScrollBar` and a `Corner`; add a horizontal `<ScrollBar orientation=\"horizontal\" />` manually when needed.",
          "- The viewport (`data-slot=\"scroll-area-viewport\"`) has `focus-visible:ring` styles for keyboard accessibility.",
          "- Scrollbar thumb uses `bg-border` and `rounded-full`; track width is `w-1.5` (vertical) or height `h-1.5` (horizontal).",
          "- The `type` prop on the root controls scrollbar visibility: `\"auto\"`, `\"always\"`, `\"scroll\"`, or `\"hover\"`.",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

const tags = Array.from({ length: 50 }, (_, i) => `v1.0.${i}`);

export const Default: Story = {
  render: (args) => (
    <ScrollArea {...args} className="h-72 w-48 rounded-md border">
      <div className="p-4">
        <h4 className="mb-4 text-sm font-medium">Versões</h4>
        {tags.map((tag) => (
          <div key={tag}>
            <div className="text-sm">{tag}</div>
            <Separator className="my-2" />
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("Versões")).toBeInTheDocument();
    await expect(canvas.getByText("v1.0.0")).toBeInTheDocument();
    await expect(canvas.getByText("v1.0.49")).toBeInTheDocument();

    const scrollArea = canvasElement.querySelector('[data-slot="scroll-area"]');
    await expect(scrollArea).toBeInTheDocument();

    const viewport = canvasElement.querySelector('[data-slot="scroll-area-viewport"]');
    await expect(viewport).toBeInTheDocument();
  },
};

export const Horizontal: Story = {
  render: () => (
    <ScrollArea className="w-96 whitespace-nowrap rounded-md border">
      <div className="flex w-max space-x-4 p-4">
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className="flex h-20 w-32 shrink-0 items-center justify-center rounded-md bg-muted"
          >
            Item {i + 1}
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  ),
};

export const BothDirections: Story = {
  render: () => (
    <ScrollArea className="h-72 w-72 rounded-md border">
      <div className="w-[600px] p-4">
        <h4 className="mb-4 text-sm font-medium">Tabela de dados</h4>
        <table className="text-sm">
          <thead>
            <tr>
              {Array.from({ length: 10 }, (_, i) => (
                <th key={i} className="px-4 py-2 text-left font-medium whitespace-nowrap">
                  Coluna {i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 30 }, (_, row) => (
              <tr key={row}>
                {Array.from({ length: 10 }, (_, col) => (
                  <td key={col} className="px-4 py-2 whitespace-nowrap">
                    Célula {row + 1}-{col + 1}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Tabela de dados")).toBeInTheDocument();
    await expect(canvas.getByText("Coluna 1")).toBeInTheDocument();
    await expect(canvas.getByText("Célula 1-1")).toBeInTheDocument();

    const scrollArea = canvasElement.querySelector('[data-slot="scroll-area"]');
    await expect(scrollArea).toBeInTheDocument();
  },
};

export const LargeContent: Story = {
  render: () => (
    <ScrollArea className="h-96 w-80 rounded-md border">
      <div className="p-4 space-y-4">
        <h4 className="text-sm font-medium">Termos de uso</h4>
        {Array.from({ length: 20 }, (_, i) => (
          <p key={i} className="text-sm text-muted-foreground leading-relaxed">
            Parágrafo {i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
            quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
        ))}
      </div>
    </ScrollArea>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Rolagem vertical</p>
        <ScrollArea className="h-72 w-48 rounded-md border">
          <div className="p-4">
            <h4 className="mb-4 text-sm font-medium">Versões</h4>
            {tags.map((tag) => (
              <div key={tag}>
                <div className="text-sm">{tag}</div>
                <Separator className="my-2" />
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Rolagem horizontal</p>
        <ScrollArea className="w-96 whitespace-nowrap rounded-md border">
          <div className="flex w-max space-x-4 p-4">
            {Array.from({ length: 20 }, (_, i) => (
              <div
                key={i}
                className="flex h-20 w-32 shrink-0 items-center justify-center rounded-md bg-muted"
              >
                Item {i + 1}
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  ),
};
