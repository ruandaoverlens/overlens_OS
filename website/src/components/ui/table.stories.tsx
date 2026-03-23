import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Badge } from "./badge";

const meta = {
  title: "Core Components/Table",
  tags: ["autodocs"],
  component: Table,
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Row height variant - typography stays the same, only vertical spacing changes",
    },
    children: {
      control: false,
      description: "Table sub-components (TableHeader, TableBody, TableFooter, TableCaption)",
    },
    className: {
      control: "text",
      description: "Additional CSS classes applied to the table element",
    },
  },
  args: { size: "sm" },
  parameters: {
    docs: {
      description: {
        component: [
          "Responsive data table composed of native HTML table elements with hover highlights, rounded row corners, and selection states.",
          "",
          "## Anatomy",
          "",
          "```tsx",
          "<Table>",
          "  <TableCaption>Description</TableCaption>",
          "  <TableHeader>",
          "    <TableRow>",
          "      <TableHead>Column</TableHead>",
          "    </TableRow>",
          "  </TableHeader>",
          "  <TableBody>",
          "    <TableRow>",
          "      <TableCell>Data</TableCell>",
          "    </TableRow>",
          "  </TableBody>",
          "  <TableFooter>",
          "    <TableRow>",
          "      <TableCell>Total</TableCell>",
          "    </TableRow>",
          "  </TableFooter>",
          "</Table>",
          "```",
          "",
          "## Sub-components",
          "",
          "| Sub-component | Description |",
          "|---------------|-------------|",
          "| `Table` | Wraps a native `<table>` inside a `div` with `overflow-x-auto`. Uses `data-slot=\"table\"` and `data-slot=\"table-container\"`. |",
          "| `TableHeader` | `<thead>` with bottom border on rows and rounded corners on first/last `<th>`. Uses `data-slot=\"table-header\"`. |",
          "| `TableBody` | `<tbody>` with inherited text color. Uses `data-slot=\"table-body\"`. |",
          "| `TableFooter` | `<tfoot>` with `bg-muted/50` background and top border. Uses `data-slot=\"table-footer\"`. |",
          "| `TableRow` | `<tr>` with `hover:bg-muted/50` highlight (no text color change), `data-[state=selected]:bg-muted`, and rounded corners on hover via first/last-child selectors. Uses `data-slot=\"table-row\"`. |",
          "| `TableHead` | `<th>` with `text-[var(--surface-200)]`, `font-body`, and `whitespace-nowrap`. Uses `data-slot=\"table-head\"`. |",
          "| `TableCell` | `<td>` with `whitespace-nowrap` and checkbox alignment support. Uses `data-slot=\"table-cell\"`. |",
          "| `TableCaption` | `<caption>` with `text-muted-foreground` and `mt-4`. Uses `data-slot=\"table-caption\"`. |",
          "",
          "## Size variants",
          "",
          "The `size` prop on `Table` controls row height via context - typography stays the same, only vertical spacing changes.",
          "",
          "| Size | Head height | Cell padding | ~Row height |",
          "|------|-------------|--------------|-------------|",
          "| `sm` (default) | `h-10` (40px) | `py-2` | ~40px |",
          "| `md` | `h-12` (48px) | `py-3` | ~48px |",
          "| `lg` | `h-14` (56px) | `py-4` | ~56px |",
          "",
          "## Avatar pairing",
          "",
          "When using avatars inside table rows, match the avatar size to the table size:",
          "",
          "| Table size | Avatar size |",
          "|------------|------------|",
          "| `sm` | `sm` (24px) |",
          "| `md` | `default` (32px) |",
          "| `lg` | `lg` (40px) |",
          "",
          "## Key details",
          "",
          "- Rows get `rounded-l-[6px]` and `rounded-r-[6px]` on hover for soft row edges.",
          "- Adjacent row borders are hidden on hover via `[&:has(+:hover)]:border-transparent` for a clean highlight effect.",
          "- The table container provides horizontal scroll for responsive overflow.",
          "- Head and cell elements support checkbox alignment with `[&:has([role=checkbox])]:pr-0`.",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

const invoices = [
  { id: "INV001", status: "Pago", method: "Cartão de Crédito", amount: "R$ 250,00" },
  { id: "INV002", status: "Pendente", method: "PayPal", amount: "R$ 150,00" },
  { id: "INV003", status: "Não Pago", method: "Transferência Bancária", amount: "R$ 350,00" },
  { id: "INV004", status: "Pago", method: "Cartão de Crédito", amount: "R$ 450,00" },
  { id: "INV005", status: "Pago", method: "PayPal", amount: "R$ 550,00" },
];

const users = [
  { name: "Ana Silva", email: "ana@email.com", role: "Admin", status: "Ativo", initials: "AS" },
  { name: "Bruno Costa", email: "bruno@email.com", role: "Editor", status: "Ativo", initials: "BC" },
  { name: "Carla Mendes", email: "carla@email.com", role: "Viewer", status: "Inativo", initials: "CM" },
  { name: "Diego Santos", email: "diego@email.com", role: "Editor", status: "Ativo", initials: "DS" },
  { name: "Elena Rocha", email: "elena@email.com", role: "Admin", status: "Pendente", initials: "ER" },
];

export const Default: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Fatura</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Método</TableHead>
          <TableHead className="text-right">Valor</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell className="font-medium">{invoice.id}</TableCell>
            <TableCell>{invoice.status}</TableCell>
            <TableCell>{invoice.method}</TableCell>
            <TableCell className="text-right">{invoice.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const table = canvas.getByRole("table");
    await expect(table).toBeInTheDocument();

    const headers = canvas.getAllByRole("columnheader");
    await expect(headers).toHaveLength(4);
    await expect(headers[0]).toHaveTextContent("Fatura");
    await expect(headers[1]).toHaveTextContent("Status");
    await expect(headers[2]).toHaveTextContent("Método");
    await expect(headers[3]).toHaveTextContent("Valor");

    const rows = canvas.getAllByRole("row");
    await expect(rows).toHaveLength(6); // 1 header + 5 data rows

    await expect(canvas.getByText("INV001")).toBeInTheDocument();
    await expect(canvas.getByText("R$ 250,00")).toBeInTheDocument();
  },
};

export const WithCaption: Story = {
  render: () => (
    <Table>
      <TableCaption>Uma lista das suas faturas recentes.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Fatura</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Valor</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.slice(0, 3).map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell className="font-medium">{invoice.id}</TableCell>
            <TableCell>{invoice.status}</TableCell>
            <TableCell className="text-right">{invoice.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const WithAvatar: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      {(["sm", "md", "lg"] as const).map((size) => (
        <div key={size}>
          <p className="text-sm font-medium mb-2">Size: {size}</p>
          <Table size={size}>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">E-mail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.email}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar size={size === "sm" ? "sm" : size === "md" ? "default" : "lg"}>
                        <AvatarFallback>{user.initials}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.status === "Ativo"
                          ? "default"
                          : user.status === "Inativo"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{user.email}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  ),
};

const SizeTable = ({ size }: { size: "sm" | "md" | "lg" }) => (
  <Table size={size}>
    <TableHeader>
      <TableRow>
        <TableHead className="w-[100px]">Fatura</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Método</TableHead>
        <TableHead className="text-right">Valor</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {invoices.map((invoice) => (
        <TableRow key={invoice.id}>
          <TableCell className="font-medium">{invoice.id}</TableCell>
          <TableCell>{invoice.status}</TableCell>
          <TableCell>{invoice.method}</TableCell>
          <TableCell className="text-right">{invoice.amount}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

export const SizeSmall: Story = {
  render: () => <SizeTable size="sm" />,
};

export const SizeMedium: Story = {
  render: () => <SizeTable size="md" />,
};

export const SizeLarge: Story = {
  render: () => <SizeTable size="lg" />,
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-sm font-medium mb-2">Small (40px)</p>
        <SizeTable size="sm" />
      </div>
      <div>
        <p className="text-sm font-medium mb-2">Medium (48px)</p>
        <SizeTable size="md" />
      </div>
      <div>
        <p className="text-sm font-medium mb-2">Large (56px)</p>
        <SizeTable size="lg" />
      </div>
      <div>
        <p className="text-sm font-medium mb-2">Com legenda</p>
        <Table>
          <TableCaption>Uma lista das suas faturas recentes.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Fatura</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.slice(0, 3).map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">{invoice.id}</TableCell>
                <TableCell>{invoice.status}</TableCell>
                <TableCell className="text-right">{invoice.amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {(["sm", "md", "lg"] as const).map((size) => (
        <div key={size}>
          <p className="text-sm font-medium mb-2">Com avatar ({size})</p>
          <Table size={size}>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">E-mail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.email}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar size={size === "sm" ? "sm" : size === "md" ? "default" : "lg"}>
                        <AvatarFallback>{user.initials}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.status === "Ativo"
                          ? "default"
                          : user.status === "Inativo"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{user.email}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  ),
};
