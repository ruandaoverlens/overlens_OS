import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { SmInfoLineIcon, SmFolderLineIcon, MdInfoLineIcon } from "@/components/icons";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "./empty";
import { Button } from "./button";

const meta = {
  title: "Base Components/Empty",
  tags: ["autodocs"],
  component: Empty,
  argTypes: {
    className: {
      control: false,
      description: "Classes CSS adicionais para o container vazio",
    },
  },
  args: {},
  parameters: {
    docs: {
      description: {
        component: [
          "Empty state container for displaying placeholder content when no data is available.",
          "",
          "## Anatomy",
          "",
          "```tsx",
          "<Empty>",
          "  <EmptyHeader>",
          "    <EmptyMedia contained />",
          "    <EmptyTitle />",
          "    <EmptyDescription />",
          "  </EmptyHeader>",
          "  <EmptyContent>",
          "    {/* action buttons */}",
          "  </EmptyContent>",
          "</Empty>",
          "```",
          "",
          "## Sub-components",
          "",
          "| Sub-component | Description |",
          "|---------------|-------------|",
          "| `Empty` | Root flex container with `items-center justify-center`, `border-dashed`, and `text-balance` |",
          "| `EmptyHeader` | Centered header section (`max-w-sm`) containing icon, title, and description |",
          "| `EmptyMedia` | Icon/illustration slot. When `contained={true}`, renders with `bg-muted size-14 rounded-lg` background. Uses `data-variant` (`\"icon\"` or `\"default\"`) |",
          "| `EmptyTitle` | Title text styled `text-lg font-heading uppercase tracking-wide` |",
          "| `EmptyDescription` | Description text styled `text-muted-foreground text-sm/relaxed` with auto-styled links |",
          "| `EmptyContent` | Action area below header (`max-w-sm`) for buttons or links |",
          "",
          "## Key details",
          "",
          "- EmptyMedia uses `data-slot=\"empty-icon\"` (not `empty-media`) for the slot attribute",
          "- EmptyMedia `contained` variant adds a muted background container for icons with `[&_svg:not([class*='size-'])]:size-10`",
          "- EmptyDescription auto-styles anchor tags with `underline underline-offset-4` and hover color `text-primary`",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof Empty>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Empty>
      <EmptyHeader>
        <EmptyMedia>
          <SmInfoLineIcon className="size-10 text-[var(--surface-800)]" />
        </EmptyMedia>
        <EmptyTitle>Nenhum resultado</EmptyTitle>
        <EmptyDescription>Tente ajustar sua busca ou filtro para encontrar o que procura.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const icon = canvasElement.querySelector('[data-slot="empty-icon"]');
    await expect(icon).toBeInTheDocument();

    await expect(canvas.getByText("Nenhum resultado")).toBeInTheDocument();

    await expect(
      canvas.getByText("Tente ajustar sua busca ou filtro para encontrar o que procura.")
    ).toBeInTheDocument();

    const container = canvasElement.querySelector('[data-slot="empty"]');
    await expect(container).toBeInTheDocument();

    const header = canvasElement.querySelector('[data-slot="empty-header"]');
    await expect(header).toBeInTheDocument();
  },
};

export const WithAction: Story = {
  render: () => (
    <Empty>
      <EmptyHeader>
        <EmptyMedia>
          <SmFolderLineIcon className="size-10 text-[var(--surface-800)]" />
        </EmptyMedia>
        <EmptyTitle>Nenhum projeto ainda</EmptyTitle>
        <EmptyDescription>Comece criando seu primeiro projeto.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button>Criar Projeto</Button>
      </EmptyContent>
    </Empty>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-4">
      {[false, true].map((contained) => (
        <Empty key={String(contained)} className="w-[320px]">
          <EmptyHeader>
            <EmptyMedia contained={contained}>
              {!contained ? (
                <SmInfoLineIcon className="size-10 text-[var(--surface-800)]" />
              ) : (
                <MdInfoLineIcon />
              )}
            </EmptyMedia>
            <EmptyTitle>Contained: {String(contained)}</EmptyTitle>
            <EmptyDescription>
              Exemplo de estado vazio com contained={String(contained)}.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ))}
    </div>
  ),
};
