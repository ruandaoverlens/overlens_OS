import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { Avatar, AvatarImage, AvatarFallback, AvatarBadge, AvatarGroup, AvatarGroupCount } from "./avatar";

const meta = {
  title: "Base Components/Avatar",
  tags: ["autodocs"],
  component: Avatar,
  argTypes: {
    size: { control: "select", options: ["default", "sm", "lg"] },
  },
  args: { size: "default" },
  parameters: {
    docs: {
      description: {
        component: [
          "Compound avatar component built on Radix `Avatar` primitives. Supports image, fallback initials with deterministic brand colors, status badges, and grouped stacking.",
          "",
          "## Anatomy",
          "",
          "```tsx",
          "<AvatarGroup>",
          "  <Avatar size=\"default\">",
          "    <AvatarImage src=\"...\" alt=\"...\" />",
          "    <AvatarFallback>AB</AvatarFallback>",
          "    <AvatarBadge />",
          "  </Avatar>",
          "  <AvatarGroupCount>+3</AvatarGroupCount>",
          "</AvatarGroup>",
          "```",
          "",
          "## Sub-components",
          "",
          "| Sub-component | Description |",
          "|---------------|-------------|",
          "| `Avatar` | Root container. Accepts `size` prop (`\"sm\"` 24px, `\"default\"` 32px, `\"lg\"` 40px). Renders `data-slot=\"avatar\"` and `data-size` |",
          "| `AvatarImage` | Image element with `rounded-full` and `overflow-hidden`. Falls back to `AvatarFallback` on error. Always use local assets from `/public/` (e.g. `/avatar-default.png`) - never external URLs (pravatar.cc, placeholder.com, ui-avatars.com) |",
          "| `AvatarFallback` | Initials or icon fallback. Picks a deterministic brand color from 6 options (`--brand-antar`, `--brand-arena`, etc.) via string hashing. Initials use `font-mono` (JetBrains Mono) - rendered in monospace, not Inter |",
          "| `AvatarBadge` | Status dot positioned `absolute right-0 bottom-0`. Size scales with parent avatar via `group-data-[size=*]/avatar` selectors |",
          "| `AvatarGroup` | Horizontal stack with `-space-x-2` overlap and `ring-2 ring-background` on each avatar |",
          "| `AvatarGroupCount` | Overflow counter (e.g. \"+3\") styled as a muted circle matching the avatar size |",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src="/avatar-default.png" alt="Avatar" />
      <AvatarFallback>RB</AvatarFallback>
    </Avatar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // The image will likely fail to load in Storybook, so the fallback should render
    await expect(canvas.getByText("RB")).toBeVisible();

    const avatarRoot = canvasElement.querySelector('[data-slot="avatar"]');
    await expect(avatarRoot).toBeInTheDocument();
    await expect(avatarRoot?.getAttribute("data-size")).toBe("default");
  },
};

export const Fallback: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>AB</AvatarFallback>
    </Avatar>
  ),
};

export const BrandColors: Story = {
  render: () => (
    <div className="flex gap-2">
      <Avatar>
        <AvatarFallback>AC</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>AJ</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>AK</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>AR</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>AS</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>AT</AvatarFallback>
      </Avatar>
    </div>
  ),
};

export const WithBadge: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="/avatar-default.png" alt="Avatar" />
      <AvatarFallback>RB</AvatarFallback>
      <AvatarBadge className="bg-green-500" />
    </Avatar>
  ),
};

export const Group: Story = {
  render: () => (
    <AvatarGroup>
      <Avatar>
        <AvatarFallback>A</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>B</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>C</AvatarFallback>
      </Avatar>
      <AvatarGroupCount>+3</AvatarGroupCount>
    </AvatarGroup>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      {/* Imagem padrão */}
      <Avatar>
        <AvatarImage src="/avatar-default.png" alt="Avatar" />
        <AvatarFallback>RB</AvatarFallback>
      </Avatar>

      {/* Iniciais de fallback */}
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>

      {/* Cores da marca */}
      <Avatar>
        <AvatarFallback>AC</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>AJ</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>AK</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>AR</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>AS</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>AT</AvatarFallback>
      </Avatar>

      {/* Com badge */}
      <Avatar>
        <AvatarImage src="/avatar-default.png" alt="Avatar" />
        <AvatarFallback>RB</AvatarFallback>
        <AvatarBadge className="bg-green-500" />
      </Avatar>

      {/* Grupo */}
      <AvatarGroup>
        <Avatar>
          <AvatarFallback>A</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>B</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>C</AvatarFallback>
        </Avatar>
        <AvatarGroupCount>+3</AvatarGroupCount>
      </AvatarGroup>
    </div>
  ),
};
