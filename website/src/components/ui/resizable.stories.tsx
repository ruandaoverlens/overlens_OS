import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, within } from "storybook/test";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./resizable";

const meta = {
  title: "Core Components/Resizable",
  tags: ["autodocs"],
  component: ResizablePanelGroup,
  argTypes: {
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
      table: { defaultValue: { summary: "horizontal" } },
    },
    autoSaveId: {
      control: "text",
    },
    children: {
      control: false,
    },
    onLayoutChange: {
      control: false,
    },
  },
  args: {
    onLayoutChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        component: [
          "Resizable panel layout using `react-resizable-panels`. Allows users to drag handles to resize adjacent panels horizontally or vertically.",
          "",
          "## Anatomy",
          "",
          "```tsx",
          "<ResizablePanelGroup orientation=\"horizontal\">",
          "  <ResizablePanel defaultSize={50}>Content A</ResizablePanel>",
          "  <ResizableHandle withHandle />",
          "  <ResizablePanel defaultSize={50}>Content B</ResizablePanel>",
          "</ResizablePanelGroup>",
          "```",
          "",
          "## Sub-components",
          "",
          "| Sub-component | Description |",
          "|---------------|-------------|",
          "| `ResizablePanelGroup` | Root container wrapping `PanelGroup` from `react-resizable-panels` (`data-slot=\"resizable-panel-group\"`). Accepts `orientation` (`\"horizontal\"` or `\"vertical\"`), `autoSaveId` for persisting layout, and `onLayoutChange` callback. |",
          "| `ResizablePanel` | Individual panel wrapping `Panel` (`data-slot=\"resizable-panel\"`). Accepts `defaultSize` (percentage), `minSize`, `maxSize`, and `collapsible` props. |",
          "| `ResizableHandle` | Drag separator wrapping `PanelResizeHandle` (`data-slot=\"resizable-handle\"`). Uses `bg-border` with 1px width (vertical) or height (horizontal). Set `withHandle` to show a `SmDehazeLineIcon` grip icon. Rotates grip 90deg for horizontal orientation via `[aria-orientation=horizontal]>div:rotate-90`. |",
          "",
          "## Key details",
          "",
          "- `orientation` controls layout direction: `\"horizontal\"` splits left/right, `\"vertical\"` splits top/bottom.",
          "- Handles have an invisible hit area (`after:` pseudo-element, 4px wide) for easier dragging.",
          "- Focus visible state uses `ring-1 ring-ring` on the handle separator.",
          "- Multiple panels can be composed with handles between each pair.",
        ].join("\n"),
      },
    },
  },
} as Meta<typeof ResizablePanelGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    orientation: "horizontal",
  },
  render: (args) => (
    <ResizablePanelGroup {...args} className="min-h-[200px] max-w-md rounded-lg border">
      <ResizablePanel defaultSize={50}>
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Painel Um</span>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50}>
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Painel Dois</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("Painel Um")).toBeInTheDocument();
    await expect(canvas.getByText("Painel Dois")).toBeInTheDocument();

    const handle = canvasElement.querySelector('[data-slot="resizable-handle"]');
    await expect(handle).toBeInTheDocument();

    const panelGroup = canvasElement.querySelector('[data-slot="resizable-panel-group"]');
    await expect(panelGroup).toBeInTheDocument();
  },
};

export const Vertical: Story = {
  render: () => (
    <div style={{ height: 400, width: 384 }}>
      <ResizablePanelGroup orientation="vertical" className="h-full w-full rounded-lg border">
        <ResizablePanel defaultSize={40}>
          <div className="flex h-full items-center justify-center p-6">
            <span className="font-semibold">Topo</span>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={60}>
          <div className="flex h-full items-center justify-center p-6">
            <span className="font-semibold">Base</span>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
};

export const ThreePanels: Story = {
  render: () => (
    <ResizablePanelGroup orientation="horizontal" className="min-h-[200px] max-w-lg rounded-lg border">
      <ResizablePanel defaultSize={25}>
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Barra Lateral</span>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50}>
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Conteúdo</span>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={25}>
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Inspetor</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-8 w-full">
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Horizontal</h3>
        <ResizablePanelGroup orientation="horizontal" className="min-h-[200px] max-w-md rounded-lg border">
          <ResizablePanel defaultSize={50}>
            <div className="flex h-full items-center justify-center p-6">
              <span className="font-semibold">Painel Um</span>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50}>
            <div className="flex h-full items-center justify-center p-6">
              <span className="font-semibold">Painel Dois</span>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Vertical</h3>
        <div style={{ height: 400, width: 384 }}>
          <ResizablePanelGroup orientation="vertical" className="h-full w-full rounded-lg border">
            <ResizablePanel defaultSize={40}>
              <div className="flex h-full items-center justify-center p-6">
                <span className="font-semibold">Topo</span>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={60}>
              <div className="flex h-full items-center justify-center p-6">
                <span className="font-semibold">Base</span>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Tres paineis</h3>
        <ResizablePanelGroup orientation="horizontal" className="min-h-[200px] max-w-lg rounded-lg border">
          <ResizablePanel defaultSize={25}>
            <div className="flex h-full items-center justify-center p-6">
              <span className="font-semibold">Barra Lateral</span>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50}>
            <div className="flex h-full items-center justify-center p-6">
              <span className="font-semibold">Conteúdo</span>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={25}>
            <div className="flex h-full items-center justify-center p-6">
              <span className="font-semibold">Inspetor</span>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  ),
};
