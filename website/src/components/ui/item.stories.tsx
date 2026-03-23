import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { MdMoreLineIcon, SmFavoriteSolidIcon, SmDocLineIcon } from "@/components/icons";
import {
  Item,
  ItemGroup,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemMedia,
  ItemActions,
  ItemSeparator,
  ItemHeader,
  ItemFooter,
} from "./item";
import { Button } from "./button";
import { Badge } from "./badge";

const meta = {
  title: "Base Components/Item",
  tags: ["autodocs"],
  component: Item,
  parameters: {
    docs: {
      description: {
        component: [
          "Versatile list item row with media, content, and action slots. Supports default, outline, and muted variants.",
          "",
          "## Anatomy",
          "",
          "```tsx",
          "<ItemGroup>",
          "  <Item>",
          "    <ItemHeader> ... </ItemHeader>",
          "    <ItemMedia variant=\"icon\"> ... </ItemMedia>",
          "    <ItemContent>",
          "      <ItemTitle> ... </ItemTitle>",
          "      <ItemDescription> ... </ItemDescription>",
          "    </ItemContent>",
          "    <ItemActions> ... </ItemActions>",
          "    <ItemFooter> ... </ItemFooter>",
          "  </Item>",
          "  <ItemSeparator />",
          "  <Item> ... </Item>",
          "</ItemGroup>",
          "```",
          "",
          "## Sub-components",
          "",
          "| Sub-component | Description |",
          "|---------------|-------------|",
          "| `ItemGroup` | Vertical list container with `role=\"list\"` and `data-slot=\"item-group\"`. |",
          "| `Item` | Row element with CVA variants (`default`, `outline`, `muted`). Supports `asChild` (renders via Radix `Slot.Root`). Exposes `data-variant`. |",
          "| `ItemMedia` | Leading media slot with CVA variants: `default` (bare icon), `icon` (`size-8` with border and `bg-muted`), `image` (`size-10` with `object-cover`). Aligns to top when a description is present. |",
          "| `ItemContent` | Flex column for title and description. Second `ItemContent` gets `flex-none` via `[&+[data-slot=item-content]]:flex-none`. |",
          "| `ItemTitle` | Title line with `text-sm font-medium leading-snug`. |",
          "| `ItemDescription` | Muted description text, clamped to 2 lines via `line-clamp-2`. Supports inline links with underline styling. |",
          "| `ItemActions` | Trailing flex container for action buttons. |",
          "| `ItemHeader` | Full-width header row spanning entire item width via `basis-full`. |",
          "| `ItemFooter` | Full-width footer row spanning entire item width via `basis-full`. |",
          "| `ItemSeparator` | Horizontal `Separator` between items with `my-0`. |",
          "",
          "## Key details",
          "",
          "- Item uses `flex-wrap` to allow `ItemHeader` and `ItemFooter` to span the full row width",
          "- Focus ring uses `focus-visible:border-ring` with a `ring-[3px]` offset",
          "- The `asChild` prop delegates rendering to Radix `Slot.Root`, enabling the item to render as an `<a>` or other element",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outline", "muted"],
      description: "Estilo visual do item",
    },
    asChild: {
      control: "boolean",
      description: "Renderizar como elemento filho via Slot",
    },
  },
  args: { variant: "default" },
} satisfies Meta<typeof Item>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <ItemGroup className="w-[400px]">
      <Item {...args}>
        <ItemContent>
          <ItemTitle>Titulo do Item</ItemTitle>
          <ItemDescription>Uma breve descricao do item.</ItemDescription>
        </ItemContent>
      </Item>
    </ItemGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("Titulo do Item")).toBeInTheDocument();

    await expect(canvas.getByText("Uma breve descricao do item.")).toBeInTheDocument();

    const list = canvas.getByRole("list");
    await expect(list).toBeInTheDocument();

    const item = canvasElement.querySelector('[data-slot="item"]');
    await expect(item).toBeInTheDocument();
    await expect(item).toHaveAttribute("data-variant", "default");
  },
};

export const WithMedia: Story = {
  render: () => (
    <ItemGroup className="w-[400px]">
      <Item>
        <ItemMedia>
          <SmDocLineIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Documento</ItemTitle>
          <ItemDescription>Editado ha 2 horas</ItemDescription>
        </ItemContent>
      </Item>
      <Item>
        <ItemMedia>
          <SmFavoriteSolidIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Favoritos</ItemTitle>
          <ItemDescription>12 itens salvos</ItemDescription>
        </ItemContent>
      </Item>
    </ItemGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify media slots are rendered
    const mediaSlots = canvasElement.querySelectorAll('[data-slot="item-media"]');
    await expect(mediaSlots.length).toBe(2);

    // Verify default media variant
    await expect(mediaSlots[0]).toHaveAttribute("data-variant", "default");

    await expect(canvas.getByText("Documento")).toBeInTheDocument();
    await expect(canvas.getByText("Favoritos")).toBeInTheDocument();
  },
};

export const WithActions: Story = {
  render: () => (
    <ItemGroup className="w-[400px]">
      <Item>
        <ItemMedia>
          <SmDocLineIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Relatorio do Projeto</ItemTitle>
          <ItemDescription>Atualizado ontem</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="ghost" size="icon" aria-label="Mais opcoes">
            <MdMoreLineIcon />
          </Button>
        </ItemActions>
      </Item>
    </ItemGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify actions slot is rendered
    const actionsSlot = canvasElement.querySelector('[data-slot="item-actions"]');
    await expect(actionsSlot).toBeInTheDocument();

    // Verify the action button is present
    const actionButton = canvas.getByRole("button", { name: "Mais opcoes" });
    await expect(actionButton).toBeInTheDocument();
  },
};

/** Exercises ItemSeparator between items in a group. */
export const WithSeparator: Story = {
  name: "Com separador",
  render: () => (
    <ItemGroup className="w-[400px]">
      <Item>
        <ItemMedia>
          <SmDocLineIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Primeiro item</ItemTitle>
          <ItemDescription>Descricao do primeiro item</ItemDescription>
        </ItemContent>
      </Item>
      <ItemSeparator />
      <Item>
        <ItemMedia>
          <SmDocLineIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Segundo item</ItemTitle>
          <ItemDescription>Descricao do segundo item</ItemDescription>
        </ItemContent>
      </Item>
      <ItemSeparator />
      <Item>
        <ItemMedia>
          <SmDocLineIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Terceiro item</ItemTitle>
          <ItemDescription>Descricao do terceiro item</ItemDescription>
        </ItemContent>
      </Item>
    </ItemGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify separators are rendered
    const separators = canvasElement.querySelectorAll('[data-slot="item-separator"]');
    await expect(separators.length).toBe(2);

    // Verify all three items
    await expect(canvas.getByText("Primeiro item")).toBeInTheDocument();
    await expect(canvas.getByText("Segundo item")).toBeInTheDocument();
    await expect(canvas.getByText("Terceiro item")).toBeInTheDocument();
  },
};

/** Exercises ItemHeader and ItemFooter sub-components. */
export const WithHeaderAndFooter: Story = {
  name: "Com header e footer",
  render: () => (
    <ItemGroup className="w-[450px]">
      <Item variant="outline">
        <ItemHeader>
          <span className="text-xs text-muted-foreground">Categoria: Design</span>
          <Badge variant="secondary">Novo</Badge>
        </ItemHeader>
        <ItemMedia>
          <SmDocLineIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Componente Card</ItemTitle>
          <ItemDescription>Um container visual para agrupar conteudo.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="ghost" size="icon" aria-label="Opcoes">
            <MdMoreLineIcon />
          </Button>
        </ItemActions>
        <ItemFooter>
          <span className="text-xs text-muted-foreground">Atualizado em 20/02/2026</span>
          <span className="text-xs text-muted-foreground">v2.1.0</span>
        </ItemFooter>
      </Item>
    </ItemGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify header slot
    const headerSlot = canvasElement.querySelector('[data-slot="item-header"]');
    await expect(headerSlot).toBeInTheDocument();

    // Verify footer slot
    const footerSlot = canvasElement.querySelector('[data-slot="item-footer"]');
    await expect(footerSlot).toBeInTheDocument();

    // Verify header content
    await expect(canvas.getByText("Categoria: Design")).toBeInTheDocument();

    // Verify footer content
    await expect(canvas.getByText("Atualizado em 20/02/2026")).toBeInTheDocument();
    await expect(canvas.getByText("v2.1.0")).toBeInTheDocument();
  },
};

/** Exercises ItemMedia with icon and image variants. */
export const MediaVariants: Story = {
  name: "Variantes de media",
  render: () => (
    <ItemGroup className="w-[450px]">
      <Item>
        <ItemMedia variant="default">
          <SmDocLineIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Media padrao</ItemTitle>
          <ItemDescription>Icone sem fundo</ItemDescription>
        </ItemContent>
      </Item>
      <ItemSeparator />
      <Item>
        <ItemMedia variant="icon">
          <SmFavoriteSolidIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Media icone</ItemTitle>
          <ItemDescription>Icone com fundo e borda</ItemDescription>
        </ItemContent>
      </Item>
      <ItemSeparator />
      <Item>
        <ItemMedia variant="image">
          <img
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%23666'/%3E%3C/svg%3E"
            alt="Placeholder"
          />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Media imagem</ItemTitle>
          <ItemDescription>Slot para imagem ou avatar</ItemDescription>
        </ItemContent>
      </Item>
    </ItemGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const mediaSlots = canvasElement.querySelectorAll('[data-slot="item-media"]');
    await expect(mediaSlots.length).toBe(3);

    // Verify each variant
    await expect(mediaSlots[0]).toHaveAttribute("data-variant", "default");
    await expect(mediaSlots[1]).toHaveAttribute("data-variant", "icon");
    await expect(mediaSlots[2]).toHaveAttribute("data-variant", "image");

    // Verify image is rendered in the image variant
    const img = canvas.getByAltText("Placeholder");
    await expect(img).toBeInTheDocument();
  },
};

/** Exercises Item with asChild prop to render as a different element. */
export const AsChildLink: Story = {
  name: "Item como link (asChild)",
  render: () => (
    <ItemGroup className="w-[400px]">
      <Item asChild>
        <a href="#example" className="no-underline">
          <ItemMedia>
            <SmDocLineIcon />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Link para documentacao</ItemTitle>
            <ItemDescription>Clique para abrir o documento</ItemDescription>
          </ItemContent>
        </a>
      </Item>
    </ItemGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // With asChild, the item should be rendered as an anchor
    const link = canvas.getByRole("link");
    await expect(link).toBeInTheDocument();
    await expect(link).toHaveAttribute("href", "#example");

    await expect(canvas.getByText("Link para documentacao")).toBeInTheDocument();
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-[450px]">
      {(["default", "outline", "muted"] as const).map((variant) => (
        <ItemGroup key={variant}>
          <Item variant={variant}>
            <ItemMedia>
              <SmDocLineIcon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Variante: {variant}</ItemTitle>
              <ItemDescription>
                Exemplo de item com a variante {variant}.
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button variant="ghost" size="icon" aria-label="Mais opcoes">
                <MdMoreLineIcon />
              </Button>
            </ItemActions>
          </Item>
        </ItemGroup>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const items = canvasElement.querySelectorAll('[data-slot="item"]');
    await expect(items.length).toBe(3);

    await expect(items[0]).toHaveAttribute("data-variant", "default");
    await expect(items[1]).toHaveAttribute("data-variant", "outline");
    await expect(items[2]).toHaveAttribute("data-variant", "muted");
  },
};
