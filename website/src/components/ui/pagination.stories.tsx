import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
  PaginationStatus,
} from "./pagination";

const meta = {
  title: "Core Components/Pagination",
  tags: ["autodocs"],
  component: Pagination,
  argTypes: {
    children: {
      control: false,
      description: "PaginationContent with pagination items, links, and ellipsis",
    },
    className: {
      control: "text",
      description: "Additional CSS classes for the pagination nav element",
    },
  },
  args: {},
  parameters: {
    docs: {
      description: {
        component: [
          "Pagination navigation component for moving between pages of content. Composed of semantic sub-components using `<nav>`, `<ul>`, and `<li>` elements.",
          "",
          "## Anatomy",
          "",
          "```tsx",
          "<Pagination>",
          "  <PaginationContent>",
          "    <PaginationItem><PaginationPrevious href=\"#\" /></PaginationItem>",
          "    <PaginationItem><PaginationLink href=\"#\">1</PaginationLink></PaginationItem>",
          "    <PaginationItem><PaginationLink href=\"#\" isActive>2</PaginationLink></PaginationItem>",
          "    <PaginationItem><PaginationEllipsis /></PaginationItem>",
          "    <PaginationItem><PaginationLink href=\"#\">10</PaginationLink></PaginationItem>",
          "    <PaginationItem><PaginationNext href=\"#\" /></PaginationItem>",
          "  </PaginationContent>",
          "</Pagination>",
          "```",
          "",
          "## Sub-components",
          "",
          "| Sub-component | Description |",
          "|---------------|-------------|",
          "| `Pagination` | `<nav>` element with `role=\"navigation\"` and `aria-label=\"pagination\"`. Uses `data-slot=\"pagination\"`. |",
          "| `PaginationContent` | `<ul>` flex row container for pagination items (`data-slot=\"pagination-content\"`). |",
          "| `PaginationItem` | `<li>` wrapper for each pagination element (`data-slot=\"pagination-item\"`). |",
          "| `PaginationLink` | `<a>` element styled with `buttonVariants`. When `isActive`, uses `variant=\"outline\"` and sets `aria-current=\"page\"`. Default uses `variant=\"ghost\"` with `size=\"icon\"`. |",
          "| `PaginationPrevious` | Specialized `PaginationLink` with `SmArrowBackIosNewLineIcon` and \"Anterior\" label (hidden on mobile via `hidden sm:block`). |",
          "| `PaginationNext` | Specialized `PaginationLink` with `SmArrowForwardIosLineIcon` and \"Proximo\" label (hidden on mobile). |",
          "| `PaginationEllipsis` | `<span>` with `SmMoreLineIcon` and `sr-only` \"Mais paginas\" text. Uses `aria-hidden` on the visible element. |",
          "",
          "## Key details",
          "",
          "- Active page link uses `data-active` attribute and `aria-current=\"page\"` for accessibility.",
          "- Previous/Next labels are responsive: icon-only on mobile, icon + text on `sm:` breakpoint.",
          "- Uses icon components `SmArrowBackIosNewLineIcon`, `SmArrowForwardIosLineIcon`, and `SmMoreLineIcon` from the icon system.",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>2</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify pagination nav renders
    const nav = canvas.getByRole("navigation", { name: "pagination" });
    await expect(nav).toBeInTheDocument();

    // Verify page links render
    await expect(canvas.getByText("1")).toBeInTheDocument();
    await expect(canvas.getByText("2")).toBeInTheDocument();
    await expect(canvas.getByText("3")).toBeInTheDocument();

    // Verify active page has aria-current
    const activePage = canvas.getByText("2").closest("a");
    await expect(activePage).toHaveAttribute("aria-current", "page");

    // Verify previous and next links
    await expect(canvas.getByLabelText("Ir para página anterior")).toBeInTheDocument();
    await expect(canvas.getByLabelText("Ir para próxima página")).toBeInTheDocument();
  },
};

export const WithEllipsis: Story = {
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>5</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">10</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
};

export const ManyPages: Story = {
  name: "Muitas Páginas",
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">24</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>25</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">26</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">50</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nav = canvas.getByRole("navigation", { name: "pagination" });
    await expect(nav).toBeInTheDocument();

    // Verifica a página ativa no meio
    const activePage = canvas.getByText("25").closest("a");
    await expect(activePage).toHaveAttribute("aria-current", "page");

    // Verifica as reticências (devem existir duas)
    const ellipses = canvas.getAllByText("Mais páginas");
    await expect(ellipses).toHaveLength(2);
  },
};

export const FirstPage: Story = {
  name: "Primeira Página",
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationLink href="#" isActive>1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">2</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">10</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
};

export const LastPage: Story = {
  name: "Última Página",
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">8</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">9</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>10</PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
};

/** Mobile pagination - shows "X / Y" on small screens, full numbers on sm+. */
export const Mobile: Story = {
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem className="hidden sm:list-item">
          <PaginationLink href="#">1</PaginationLink>
        </PaginationItem>
        <PaginationItem className="hidden sm:list-item">
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem className="hidden sm:list-item">
          <PaginationLink href="#">24</PaginationLink>
        </PaginationItem>
        <PaginationItem className="hidden sm:list-item">
          <PaginationLink href="#" isActive>25</PaginationLink>
        </PaginationItem>
        <PaginationItem className="hidden sm:list-item">
          <PaginationLink href="#">26</PaginationLink>
        </PaginationItem>
        <PaginationItem className="hidden sm:list-item">
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem className="hidden sm:list-item">
          <PaginationLink href="#">50</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationStatus current={25} total={50} />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nav = canvas.getByRole("navigation", { name: "pagination" });
    await expect(nav).toBeInTheDocument();
    await expect(canvas.getByText("25")).toBeInTheDocument();
    await expect(canvas.getByText("50")).toBeInTheDocument();
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm font-medium mb-2">Padrão</p>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
      <div>
        <p className="text-sm font-medium mb-2">Com reticências</p>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>5</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">10</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  ),
};
