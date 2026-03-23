import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { SmAdd2LineIcon, SmMailSolidIcon, SmArrowForwardIosLineIcon } from "@/components/icons";
import { Loader2 } from "lucide-react";
import { Button } from "./button";

const meta = {
  title: "Base Components/Button",
  tags: ["autodocs"],
  component: Button,
  args: {
    onClick: fn(),
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive", "inverted", "outline", "secondary", "ghost", "link"],
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon", "icon-xs"],
    },
    disabled: { control: "boolean" },
  },
  parameters: {
    docs: {
      description: {
        component: [
          "Primary interactive button with multiple visual variants and sizes. Uses CVA for variant management and Radix `Slot` for `asChild` polymorphism.",
          "",
          "## Anatomy",
          "",
          "```tsx",
          "<Button variant=\"default\" size=\"default\">",
          "  <Icon /> <span>Label</span>",
          "</Button>",
          "```",
          "",
          "## Props",
          "",
          "| Prop | Type | Default | Description |",
          "|------|------|---------|-------------|",
          "| `variant` | `\"default\" \\| \"destructive\" \\| \"inverted\" \\| \"outline\" \\| \"secondary\" \\| \"ghost\" \\| \"link\"` | `\"default\"` | Visual style variant |",
          "| `size` | `\"default\" \\| \"sm\" \\| \"lg\" \\| \"icon\" \\| \"icon-xs\"` | `\"default\"` | Button size. `icon` renders a 40px square, `icon-xs` a 24px square |",
          "| `asChild` | `boolean` | `false` | Merges props onto the child element via Radix `Slot.Root` |",
          "",
          "## Key details",
          "",
          "- Renders `data-slot=\"button\"`, `data-variant`, and `data-size` attributes for external styling hooks",
          "- All variants use `rounded-full`, `font-heading`, `uppercase`, and `tracking-wide` (except `secondary`, `ghost`, and `link` which use `font-body`)",
          "- SVG children are automatically sized to `size-6`. Horizontal margin `mx-2.5` is applied only on `default`, `sm`, and `lg` sizes - `icon` and `icon-xs` have zero SVG margin",
          "- Disabled state applies `opacity-20` and `pointer-events-none`",
          "- Focus ring uses `ring-2 ring-foreground`; destructive variant overrides to `ring-destructive/20`",
          "",
          "## Ordering & alignment",
          "",
          "- Button groups always align **left** (`justify-start`) - never centered or right-aligned.",
          "- **Hierarchy order** (left to right): primary (`default`) → secondary → outline → ghost → destructive → link → size variants → icon → disabled. The **primary action always comes first** (leftmost position).",
          "- **Action pairs** (Confirm/Cancel, Save/Cancel, Submit/Reset): primary action **always first** (left), secondary/cancel **always second** (right). This applies in `DialogFooter`, `CardFooter`, `AlertDialogFooter`, inline button groups, forms - no exceptions.",
          "- **Icon-only buttons**: Always use an actual SVG icon component (from `@/components/icons`) - never use text characters like `+`. Icon-only buttons must include `aria-label` for accessibility.",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: "Button" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const button = canvas.getByRole("button", { name: "Button" });
    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();

    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);

    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};

export const Destructive: Story = {
  args: { variant: "destructive", children: "Excluir" },
};

export const Inverted: Story = {
  args: { variant: "inverted", children: "Inverted" },
  decorators: [
    (Story) => (
      <div className="rounded-lg bg-white p-6">
        <Story />
      </div>
    ),
  ],
};

export const Outline: Story = {
  args: { variant: "outline", children: "Outline" },
};

export const Secondary: Story = {
  args: { variant: "secondary", children: "Secondary" },
};

export const Ghost: Story = {
  args: { variant: "ghost", children: "Ghost" },
};

export const Link: Story = {
  args: { variant: "link", children: "Link" },
};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <SmMailSolidIcon/> <span>Enviar e-mail</span>
      </>
    ),
  },
};

export const IconOnly: Story = {
  args: {
    variant: "outline",
    size: "icon",
    children: <SmAdd2LineIcon />,
    "aria-label": "Adicionar",
  },
};

export const Loading: Story = {
  args: {
    disabled: true,
    children: (
      <>
        <Loader2 className="animate-spin" /> <span>Aguarde</span>
      </>
    ),
  },
};

export const Disabled: Story = {
  args: { disabled: true, children: "Disabled" },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon" aria-label="Adicionar"><SmAdd2LineIcon /></Button>
    </div>
  ),
};

export const AllSizesWithIcons: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-4">
      <div className="flex items-center gap-4">
        <Button size="sm">
          <SmMailSolidIcon/> <span>Small</span>
        </Button>
        <Button size="sm">
          <span>Small</span> <SmArrowForwardIosLineIcon />
        </Button>
      </div>
      <div className="flex items-center gap-4">
        <Button size="default">
          <SmMailSolidIcon/> <span>Default</span>
        </Button>
        <Button size="default">
          <span>Default</span> <SmArrowForwardIosLineIcon />
        </Button>
      </div>
      <div className="flex items-center gap-4">
        <Button size="lg">
          <SmMailSolidIcon/> <span>Large</span>
        </Button>
        <Button size="lg">
          <span>Large</span> <SmArrowForwardIosLineIcon />
        </Button>
      </div>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button>Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="inverted">Inverted</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};