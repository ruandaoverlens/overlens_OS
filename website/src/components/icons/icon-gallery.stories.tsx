import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { IconGallery } from "./icon-gallery";

const meta = {
  title: "Icons/Gallery",
  component: IconGallery,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof IconGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
