import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./card";
import { Button } from "./button";

type CardStoryArgs = {
  showFooter?: boolean;
};

const meta = {
  title: "Core Components/Card",
  tags: ["autodocs"],
  component: Card,
  argTypes: {
    children: {
      control: false,
      description: "Card sub-components (CardHeader, CardContent, CardFooter, etc.)",
    },
    className: {
      control: "text",
      description: "Additional CSS classes for the card container",
    },
  },
  parameters: {
    docs: {
      description: {
        component: [
          "Container component for grouping related content with consistent styling. Compound component pattern with named sub-components.",
          "",
          "## Anatomy",
          "",
          "```tsx",
          "<Card>",
          "  <CardHeader>",
          "    <CardTitle>Title</CardTitle>",
          "    <CardDescription>Description</CardDescription>",
          "  </CardHeader>",
          "  <CardContent>Content</CardContent>",
          "  <CardFooter>",
          "    <Button>Action</Button>",
          "  </CardFooter>",
          "</Card>",
          "```",
          "",
          "## Sub-components",
          "",
          "| Component | Role | Notes |",
          "|-----------|------|-------|",
          "| `Card` | Root container | `surface-950` bg, `rounded-xl`, uniform `p-4`, inner shadow |",
          "| `CardHeader` | Title + description wrapper | `@container/card-header`, optional bottom border |",
          "| `CardTitle` | Heading | `text-lg font-medium`, flex row with `justify-between` for inline actions |",
          "| `CardDescription` | Subtitle | `text-sm text-muted-foreground` |",
          "| `CardContent` | Main body | `px-1` padding, transparent bg when nested in popover |",
          "| `CardFooter` | Action buttons area | `flex-row`, `gap-2`, optional top border |",
          "",
          "## Key details",
          "",
          "- All sub-components are optional - compose only what you need",
          "- Card background is transparent when inside `[data-slot=popover-content]` or `[data-slot=card-content]`",
          "- `CardHeader` supports `border-b` class for divider (auto-adds `pb-6`)",
          "- `CardFooter` supports `border-t` class for divider (auto-adds `pt-6`)",
          "- Shadow uses `dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]` - visible only in dark mode",
        ].join("\n"),
      },
    },
  },
  args: { className: "w-full max-w-[380px]" },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { showFooter: true } as CardStoryArgs,
  argTypes: {
    showFooter: {
      control: "boolean",
      description: "Show footer with action buttons",
    },
  } as Record<string, unknown>,
  render: (_, { args }) => {
    const { showFooter } = args as unknown as CardStoryArgs;
    return (
      <Card className="w-full max-w-[380px]">
        <CardHeader>
          <CardTitle>Título do card</CardTitle>
          <CardDescription>Descrição do card vai aqui.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Esta é a área de conteúdo do card. Você pode colocar qualquer conteúdo aqui.
          </p>
        </CardContent>
        {showFooter && (
          <CardFooter>
            <Button size="sm">Salvar</Button>
            <Button variant="outline" size="sm">Cancelar</Button>
          </CardFooter>
        )}
      </Card>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("Título do card")).toBeInTheDocument();
    await expect(canvas.getByText("Descrição do card vai aqui.")).toBeInTheDocument();

    const saveButton = canvas.getByRole("button", { name: "Salvar" });
    const cancelButton = canvas.getByRole("button", { name: "Cancelar" });
    await expect(saveButton).toBeInTheDocument();
    await expect(cancelButton).toBeInTheDocument();

    await userEvent.click(saveButton);
    await expect(saveButton).toHaveFocus();
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-6 w-full max-w-[800px]">
      <Card className="w-full max-w-[380px]">
        <CardHeader>
          <CardTitle>Com footer</CardTitle>
          <CardDescription>Card com botões de ação no footer.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Esta é a área de conteúdo do card.
          </p>
        </CardContent>
        <CardFooter>
          <Button size="sm">Salvar</Button>
          <Button variant="outline" size="sm">Cancelar</Button>
        </CardFooter>
      </Card>

      <Card className="w-full max-w-[380px]">
        <CardHeader>
          <CardTitle>Sem footer</CardTitle>
          <CardDescription>Card minimalista sem ações.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Um card com apenas título, descrição e conteúdo.
          </p>
        </CardContent>
      </Card>
    </div>
  ),
};
