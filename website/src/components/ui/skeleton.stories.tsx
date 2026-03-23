import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { Skeleton } from "./skeleton";

const meta = {
  title: "Base Components/Skeleton",
  tags: ["autodocs"],
  component: Skeleton,
  parameters: {
    docs: {
      description: {
        component: [
          "Pulsing placeholder element used to indicate loading state. Renders a `div` with `animate-pulse` and `bg-surface-3`.",
          "",
          "## Anatomy",
          "",
          "```tsx",
          "<Skeleton className=\"h-4 w-[250px]\" />",
          "```",
          "",
          "## Key details",
          "",
          "- Uses `animate-pulse` for the loading animation",
          "- Background: `bg-muted` (semantic surface color)",
          "- Border radius: `rounded-md` by default",
          "- Fully customizable via `className` - set width, height, and border-radius as needed",
          "- Exposes `data-slot=\"skeleton\"` for styling hooks",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Skeleton className="h-4 w-[250px]" />,
  play: async ({ canvasElement }) => {
    const skeleton = canvasElement.querySelector('[data-slot="skeleton"]');
    await expect(skeleton).toBeInTheDocument();
    await expect(skeleton).toHaveClass("animate-pulse");
  },
};

export const Circle: Story = {
  render: () => <Skeleton className="size-12 rounded-full" />,
  play: async ({ canvasElement }) => {
    const skeleton = canvasElement.querySelector('[data-slot="skeleton"]');
    await expect(skeleton).toBeInTheDocument();
    await expect(skeleton).toHaveClass("rounded-full");
  },
};

export const CardSkeleton: Story = {
  name: "Card placeholder",
  render: () => (
    <div className="flex items-center gap-4">
      <Skeleton className="size-12 rounded-full" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const skeletons = canvasElement.querySelectorAll('[data-slot="skeleton"]');
    await expect(skeletons.length).toBe(3);
  },
};

export const AllShapes: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-[350px]">
      <div className="flex items-center gap-4">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex flex-col gap-2 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-[125px] w-full rounded-xl" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const skeletons = canvasElement.querySelectorAll('[data-slot="skeleton"]');
    await expect(skeletons.length).toBe(7);

    // Verify all have the base skeleton classes
    for (const skeleton of skeletons) {
      await expect(skeleton).toHaveClass("animate-pulse");
      await expect(skeleton).toHaveAttribute("data-slot", "skeleton");
    }
  },
};
