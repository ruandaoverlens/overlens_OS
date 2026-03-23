import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import {
  MicroAdmIcon,
  MicroInfiniteIcon,
  MicroShieldIcon,
} from "@/components/icons";

const allIcons = [
  { name: "MicroAdmIcon", Icon: MicroAdmIcon },
  { name: "MicroInfiniteIcon", Icon: MicroInfiniteIcon },
  { name: "MicroShieldIcon", Icon: MicroShieldIcon },
];

const meta = {
  title: "Icons/Micro",
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Gallery: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4 p-4">
      {allIcons.map(({ name, Icon }) => (
        <div key={name} className="flex flex-col items-center gap-1">
          <Icon className="size-4" />
          <span className="text-[10px] text-muted-foreground truncate w-full text-center">{name}</span>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const icons = canvasElement.querySelectorAll("svg");
    await expect(icons.length).toBe(3);
  },
};
