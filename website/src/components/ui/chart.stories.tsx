import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Bar, BarChart, Line, LineChart, Pie, PieChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "./chart";

const meta = {
  title: "Core Components/Chart",
  tags: ["autodocs"],
  component: ChartContainer,
  parameters: {
    docs: {
      description: {
        component: [
          "Wrapper system for **Recharts** that provides design-system theming, responsive sizing, and styled tooltip/legend primitives.",
          "",
          "### How it works",
          "1. Define a `ChartConfig` object mapping each data key to a `label`, optional `icon`, and a `color` (CSS variable or hex) or `theme` object (`{ light, dark }`).",
          "2. Wrap any Recharts chart (`BarChart`, `LineChart`, `PieChart`, etc.) with `ChartContainer`, passing the config.",
          "3. `ChartContainer` injects CSS custom properties (`--color-<key>`) via a `<style>` tag so you can reference them with `fill=\"var(--color-desktop)\"` etc.",
          "",
          "### Anatomy",
          "| Export | Role |",
          "|---|---|",
          "| `ChartContainer` | Responsive wrapper, provides `ChartConfig` context and CSS variables |",
          "| `ChartTooltip` | Recharts `Tooltip` - controls when/where the tooltip appears |",
          "| `ChartTooltipContent` | Styled tooltip renderer. Props: `indicator` (`dot` \\| `line`), `hideLabel`, `hideIndicator`, `nameKey`, `labelKey`, `labelFormatter` |",
          "| `ChartLegend` | Recharts `Legend` - controls position (`verticalAlign`) |",
          "| `ChartLegendContent` | Styled legend renderer. Props: `hideIcon`, `nameKey` |",
          "| `ChartStyle` | Internal - injects `<style>` for theme colors |",
          "| `ChartConfig` (type) | Config type: `{ [key]: { label, icon?, color? | theme? } }` |",
          "",
          "### Color strategy",
          "- **Single color**: `{ color: \"var(--chart-1)\" }` - same in all themes.",
          "- **Theme-aware**: `{ theme: { light: \"#2563eb\", dark: \"#3b82f6\" } }` - different colors per theme.",
          "- Design tokens `--chart-1` through `--chart-5` are defined in `globals.css`.",
          "",
          "### Tips",
          "- Always set `className=\"min-h-[300px] w-full\"` (or similar) on `ChartContainer` so Recharts `ResponsiveContainer` has dimensions to render.",
          "- Use `cursor={{ radius: 6 }}` on `ChartTooltip` for rounded hover indicators on bar charts.",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    config: {
      control: false,
      description: "Chart configuration mapping data keys to labels, icons, and colors",
    },
    children: {
      control: false,
      description: "Recharts chart components (BarChart, LineChart, PieChart, etc.)",
    },
    className: {
      control: "text",
      description: "Additional CSS classes for the chart container",
    },
  },
  args: { className: "min-h-[300px] w-full" },
} as Meta<typeof ChartContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

const barData = [
  { month: "Jan", desktop: 186, mobile: 80 },
  { month: "Feb", desktop: 305, mobile: 200 },
  { month: "Mar", desktop: 237, mobile: 120 },
  { month: "Apr", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "Jun", desktop: 214, mobile: 140 },
];

const chartConfig = {
  desktop: { label: "Desktop", color: "var(--chart-1)" },
  mobile: { label: "Mobile", color: "var(--chart-2)" },
} satisfies ChartConfig;

export const Default: Story = {
  name: "Bar Chart",
  parameters: { docs: { description: { story: "Multi-series bar chart with tooltip and legend. Hover bars to see `ChartTooltipContent` with dot indicators." } } },
  render: () => (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
      <BarChart data={barData}>
        <XAxis dataKey="month" />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} cursor={{ radius: 6 }} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
        <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
      </BarChart>
    </ChartContainer>
  ),
  play: async ({ canvasElement }) => {
    const chartContainer = canvasElement.querySelector("[data-slot='chart']");
    await expect(chartContainer).toBeInTheDocument();

    // ResponsiveContainer may not render chart internals without real dimensions
    // in test environments, so only assert on the container structure
    const responsiveContainer = canvasElement.querySelector(
      ".recharts-responsive-container"
    );
    await expect(responsiveContainer).toBeInTheDocument();
  },
};

const lineData = [
  { month: "Jan", value: 186 },
  { month: "Feb", value: 305 },
  { month: "Mar", value: 237 },
  { month: "Apr", value: 73 },
  { month: "May", value: 209 },
  { month: "Jun", value: 214 },
];

const lineConfig = {
  value: { label: "Revenue", color: "var(--chart-1)" },
} satisfies ChartConfig;

export const LineChartStory: Story = {
  name: "Line Chart",
  parameters: { docs: { description: { story: "Single-series line chart with monotone interpolation and default dot tooltip." } } },
  render: () => (
    <ChartContainer config={lineConfig} className="min-h-[300px] w-full">
      <LineChart data={lineData}>
        <XAxis dataKey="month" />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line type="monotone" dataKey="value" stroke="var(--color-value)" strokeWidth={2} />
      </LineChart>
    </ChartContainer>
  ),
  play: async ({ canvasElement }) => {
    const chartContainer = canvasElement.querySelector("[data-slot='chart']");
    await expect(chartContainer).toBeInTheDocument();

    const responsiveContainer = canvasElement.querySelector(
      ".recharts-responsive-container"
    );
    await expect(responsiveContainer).toBeInTheDocument();
  },
};

const pieData = [
  { name: "Chrome", value: 275, fill: "var(--chart-1)" },
  { name: "Safari", value: 200, fill: "var(--chart-2)" },
  { name: "Firefox", value: 187, fill: "var(--chart-3)" },
  { name: "Edge", value: 173, fill: "var(--chart-4)" },
  { name: "Other", value: 90, fill: "var(--chart-5)" },
];

const pieConfig = {
  chrome: { label: "Chrome", color: "var(--chart-1)" },
  safari: { label: "Safari", color: "var(--chart-2)" },
  firefox: { label: "Firefox", color: "var(--chart-3)" },
  edge: { label: "Edge", color: "var(--chart-4)" },
  other: { label: "Other", color: "var(--chart-5)" },
} satisfies ChartConfig;

export const PieChartStory: Story = {
  name: "Pie Chart",
  parameters: { docs: { description: { story: "Donut-style pie chart (`innerRadius=\"70%\"`). Uses `hideLabel` on tooltip since slices are self-explanatory." } } },
  render: () => (
    <ChartContainer config={pieConfig} className="min-h-[300px] w-full">
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Pie data={pieData} dataKey="value" nameKey="name" stroke="var(--background)" strokeWidth={4} innerRadius="70%" outerRadius="100%" />
      </PieChart>
    </ChartContainer>
  ),
  play: async ({ canvasElement }) => {
    const chartContainer = canvasElement.querySelector("[data-slot='chart']");
    await expect(chartContainer).toBeInTheDocument();

    const responsiveContainer = canvasElement.querySelector(
      ".recharts-responsive-container"
    );
    await expect(responsiveContainer).toBeInTheDocument();
  },
};

export const TooltipWithLineIndicator: Story = {
  name: "Line Indicator Tooltip",
  parameters: { docs: { description: { story: "Tooltip with `indicator=\"line\"` and a custom `labelFormatter` that appends the series count." } } },
  render: () => (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
      <BarChart data={barData}>
        <XAxis dataKey="month" />
        <YAxis />
        <ChartTooltip
          cursor={{ radius: 6 }}
          content={
            <ChartTooltipContent
              indicator="line"
              labelFormatter={(value, payload) =>
                `${value} (${payload.length} series)`
              }
            />
          }
        />
        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
        <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
      </BarChart>
    </ChartContainer>
  ),
  play: async ({ canvasElement }) => {
    const chartContainer = canvasElement.querySelector("[data-slot='chart']");
    await expect(chartContainer).toBeInTheDocument();
  },
};

export const TooltipHiddenParts: Story = {
  name: "Hidden Indicator & Label",
  parameters: { docs: { description: { story: "Tooltip with both `hideIndicator` and `hideLabel` - shows only values, useful for minimal hover feedback." } } },
  render: () => (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
      <BarChart data={barData}>
        <XAxis dataKey="month" />
        <YAxis />
        <ChartTooltip
          cursor={{ radius: 6 }}
          content={<ChartTooltipContent hideIndicator hideLabel />}
        />
        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
        <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
      </BarChart>
    </ChartContainer>
  ),
  play: async ({ canvasElement }) => {
    const chartContainer = canvasElement.querySelector("[data-slot='chart']");
    await expect(chartContainer).toBeInTheDocument();
  },
};

export const TooltipWithNameKey: Story = {
  name: "NameKey Tooltip",
  parameters: { docs: { description: { story: "Tooltip using `nameKey` to resolve labels from `ChartConfig` instead of the default data key." } } },
  render: () => (
    <ChartContainer config={pieConfig} className="min-h-[300px] w-full">
      <PieChart>
        <ChartTooltip
          content={<ChartTooltipContent nameKey="name" />}
        />
        <Pie data={pieData} dataKey="value" nameKey="name" stroke="var(--background)" strokeWidth={4} innerRadius="70%" outerRadius="100%" />
      </PieChart>
    </ChartContainer>
  ),
  play: async ({ canvasElement }) => {
    const chartContainer = canvasElement.querySelector("[data-slot='chart']");
    await expect(chartContainer).toBeInTheDocument();
  },
};

export const LegendVariants: Story = {
  name: "Legend Variants",
  parameters: { docs: { description: { story: "Legend positioning (`verticalAlign=\"top\"`) and `hideIcon` option side by side." } } },
  render: () => (
    <div className="flex flex-col gap-8 w-full">
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Top Legend</h3>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <BarChart data={barData}>
            <XAxis dataKey="month" />
            <YAxis />
            <ChartLegend content={<ChartLegendContent />} verticalAlign="top" />
            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
            <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
          </BarChart>
        </ChartContainer>
      </div>
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">No Icon Legend</h3>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <BarChart data={barData}>
            <XAxis dataKey="month" />
            <YAxis />
            <ChartLegend content={<ChartLegendContent hideIcon />} />
            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
            <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    // Verify both chart containers are rendered
    const chartContainers = canvasElement.querySelectorAll(
      "[data-slot='chart']"
    );
    await expect(chartContainers.length).toBe(2);
  },
};

export const ThemeBasedColors: Story = {
  name: "Theme Colors",
  parameters: { docs: { description: { story: "Uses `theme: { light, dark }` in config instead of a single `color`. `ChartStyle` injects per-theme CSS variables." } } },
  render: () => {
    const themedConfig = {
      desktop: {
        label: "Desktop",
        theme: { light: "#2563eb", dark: "#3b82f6" },
      },
      mobile: {
        label: "Mobile",
        theme: { light: "#e11d48", dark: "#f43f5e" },
      },
    } satisfies ChartConfig;

    return (
      <ChartContainer config={themedConfig} className="min-h-[300px] w-full">
        <BarChart data={barData}>
          <XAxis dataKey="month" />
          <YAxis />
          <ChartTooltip cursor={{ radius: 6 }} content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
          <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
        </BarChart>
      </ChartContainer>
    );
  },
  play: async ({ canvasElement }) => {
    // ChartStyle injects a <style> tag with CSS vars per theme
    const styleTag = canvasElement.querySelector("[data-slot='chart'] style");
    await expect(styleTag).toBeInTheDocument();

    // Verify the style content contains theme-specific color variables
    const styleContent = styleTag?.textContent ?? "";
    await expect(styleContent).toContain("--color-desktop");
    await expect(styleContent).toContain("--color-mobile");
  },
};

export const EmptyConfig: Story = {
  name: "No Colors Config",
  parameters: { docs: { description: { story: "Config with labels only (no `color` or `theme`). `ChartStyle` skips injecting the `<style>` tag - colors must be hardcoded on each element." } } },
  render: () => {
    const emptyConfig = {
      desktop: { label: "Desktop" },
      mobile: { label: "Mobile" },
    } satisfies ChartConfig;

    return (
      <ChartContainer config={emptyConfig} className="min-h-[300px] w-full">
        <BarChart data={barData}>
          <XAxis dataKey="month" />
          <YAxis />
          <Bar dataKey="desktop" fill="#888" radius={4} />
          <Bar dataKey="mobile" fill="#aaa" radius={4} />
        </BarChart>
      </ChartContainer>
    );
  },
  play: async ({ canvasElement }) => {
    const chartContainer = canvasElement.querySelector("[data-slot='chart']");
    await expect(chartContainer).toBeInTheDocument();

    // With no colors in config, ChartStyle should not inject a style tag
    const styleTag = canvasElement.querySelector("[data-slot='chart'] style");
    await expect(styleTag).not.toBeInTheDocument();
  },
};

export const SingleSeriesTooltip: Story = {
  name: "Single Series Tooltip",
  parameters: { docs: { description: { story: "Single-series with `indicator=\"line\"` triggers the nested label layout (`nestLabel`) where the label appears inside the tooltip row." } } },
  render: () => (
    <ChartContainer config={lineConfig} className="min-h-[300px] w-full">
      <LineChart data={lineData}>
        <XAxis dataKey="month" />
        <YAxis />
        <ChartTooltip
          content={<ChartTooltipContent indicator="line" />}
        />
        <Line type="monotone" dataKey="value" stroke="var(--color-value)" strokeWidth={2} />
      </LineChart>
    </ChartContainer>
  ),
  play: async ({ canvasElement }) => {
    const chartContainer = canvasElement.querySelector("[data-slot='chart']");
    await expect(chartContainer).toBeInTheDocument();
  },
};

export const AllVariants: Story = {
  parameters: { docs: { description: { story: "Bar, line, and pie charts in a responsive grid - overview of all chart types." } } },
  render: () => (
    <div className="flex flex-col gap-8 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Bar Chart</h3>
          <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <BarChart data={barData}>
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} cursor={{ radius: 6 }} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
              <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
            </BarChart>
          </ChartContainer>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Line Chart</h3>
          <ChartContainer config={lineConfig} className="min-h-[300px] w-full">
            <LineChart data={lineData}>
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="value" stroke="var(--color-value)" strokeWidth={2} />
            </LineChart>
          </ChartContainer>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Pie Chart</h3>
        <ChartContainer config={pieConfig} className="min-h-[300px] w-full max-w-md mx-auto">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie data={pieData} dataKey="value" nameKey="name" stroke="var(--background)" strokeWidth={4} innerRadius="70%" outerRadius="100%" />
          </PieChart>
        </ChartContainer>
      </div>
    </div>
  ),
};
