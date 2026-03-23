import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import {
  Heading,
  HeadingTitle,
  HeadingDescription,
} from "./heading";

const meta = {
  title: "Base Components/Heading",
  tags: ["autodocs"],
  component: Heading,
  parameters: {
    docs: {
      description: {
        component: [
          "Heading block used to introduce content sections. Combines an uppercase Outfit title with an optional Inter description.",
          "",
          "## Anatomy",
          "",
          "```tsx",
          '<Heading>',
          '  <HeadingTitle>Buttons</HeadingTitle>',
          '  <HeadingDescription>',
          '    Interactive elements for actions and navigation.',
          '  </HeadingDescription>',
          '</Heading>',
          "```",
          "",
          "## Sub-components",
          "",
          "| Component | Element | Description |",
          "|-----------|---------|-------------|",
          "| `Heading` | `<header>` | Wrapper - `flex flex-col gap-1` |",
          "| `HeadingTitle` | `<h2>` | Uppercase Outfit heading with `size` variant (`sm`, `default`, `lg`, `xl`) |",
          "| `HeadingDescription` | `<p>` | Optional subtitle with `size` variant (`sm`, `default`, `lg`) |",
          "",
          "## Key details",
          "",
          "- Title always renders `uppercase` via Outfit (`font-heading`)",
          "- Description uses Inter (`font-body`) in `surface-500` gray",
          "- Default title styling is `text-2xl font-semibold tracking-wide`",
          "- Both title and description accept a `size` prop for predefined sizing",
          "- No separator line - the heading pair stands on its own",
          "- All sub-components expose `data-slot` attributes for styling hooks",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithDescription: Story = {
  render: () => (
    <Heading>
      <HeadingTitle>Buttons</HeadingTitle>
      <HeadingDescription>
        Interactive elements for triggering actions and navigation.
      </HeadingDescription>
    </Heading>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const title = canvas.getByText("Buttons");
    expect(title.tagName).toBe("H2");
    expect(title).toHaveClass("uppercase");
    const desc = canvas.getByText(/Interactive elements/);
    expect(desc.tagName).toBe("P");
  },
};

export const TitleOnly: Story = {
  render: () => (
    <Heading>
      <HeadingTitle>Badges & Tags</HeadingTitle>
    </Heading>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText("Badges & Tags")).toBeInTheDocument();
  },
};

export const Small: Story = {
  render: () => (
    <Heading>
      <HeadingTitle size="sm">Small Heading</HeadingTitle>
      <HeadingDescription size="sm">
        A smaller heading for compact layouts.
      </HeadingDescription>
    </Heading>
  ),
};

export const Large: Story = {
  render: () => (
    <Heading className="gap-2">
      <HeadingTitle size="lg">Large Heading</HeadingTitle>
      <HeadingDescription size="lg">
        A larger variant for prominent sections.
      </HeadingDescription>
    </Heading>
  ),
};

export const ExtraLarge: Story = {
  render: () => (
    <Heading className="gap-2">
      <HeadingTitle size="xl">Extra Large Heading</HeadingTitle>
      <HeadingDescription size="lg">
        The largest title size for hero-level sections.
      </HeadingDescription>
    </Heading>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <Heading>
        <HeadingTitle size="sm">Small (sm)</HeadingTitle>
        <HeadingDescription size="sm">
          text-lg title · text-sm description
        </HeadingDescription>
      </Heading>

      <Heading>
        <HeadingTitle>Default</HeadingTitle>
        <HeadingDescription>
          text-2xl title · text-base description
        </HeadingDescription>
      </Heading>

      <Heading className="gap-2">
        <HeadingTitle size="lg">Large (lg)</HeadingTitle>
        <HeadingDescription size="lg">
          text-3xl title · text-lg description
        </HeadingDescription>
      </Heading>

      <Heading className="gap-2">
        <HeadingTitle size="xl">Extra Large (xl)</HeadingTitle>
        <HeadingDescription size="lg">
          text-4xl title · text-lg description
        </HeadingDescription>
      </Heading>
    </div>
  ),
};
