import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./accordion";

const meta = {
  title: "Core Components/Accordion",
  tags: ["autodocs"],
  component: Accordion,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: [
          "Vertically stacked collapsible sections built on Radix UI Accordion.",
          "",
          "## Modes",
          "",
          "| Prop | Values | Behavior |",
          "|------|--------|----------|",
          "| `type` | `single` | Only one item open at a time |",
          "| `type` | `multiple` | Multiple items can be open simultaneously |",
          "| `collapsible` | `true` | Allows closing all items (only with `type=\"single\"`) |",
          "| `defaultValue` | `string` | Item open on initial render |",
          "| `disabled` | `boolean` | Disables an individual `AccordionItem` |",
          "",
          "## Anatomy",
          "",
          "```tsx",
          "<Accordion type=\"single\" collapsible>",
          "  <AccordionItem value=\"item-1\">",
          "    <AccordionTrigger>Title</AccordionTrigger>",
          "    <AccordionContent>Content</AccordionContent>",
          "  </AccordionItem>",
          "</Accordion>",
          "```",
          "",
          "## Key details",
          "",
          "- WAI-ARIA compliant with full keyboard navigation",
          "- Animated open/close via `accordion-up` and `accordion-down` keyframes",
          "- Trigger arrow icon rotates 180deg on open state",
          "- Content text uses `surface-400` color, transitions to `surface-200` on hover",
          "- Long trigger text wraps naturally - arrow icon stays top-right via `items-start` + `shrink-0`",
          "- Supports rich content (lists, paragraphs, nested elements) inside `AccordionContent`",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    type: {
      control: "select",
      options: ["single", "multiple"],
      description: "Modo de abertura: um item por vez ou múltiplos",
    },
    collapsible: {
      control: "boolean",
      description: "Permite fechar todos os itens (apenas para type='single')",
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-2xl mx-auto">
        <Story />
      </div>
    ),
  ],
} as Meta;

export default meta;
type Story = StoryObj;

const faqItems = [
  {
    value: "item-1",
    trigger: "É acessível?",
    content:
      "Sim. Segue o padrão de design WAI-ARIA para accordions, com suporte completo a navegação por teclado e anúncios de leitor de tela.",
  },
  {
    value: "item-2",
    trigger: "É estilizado?",
    content:
      "Sim. Vem com estilos padrão que combinam com seu design system, incluindo anéis de foco, estados de hover e transições suaves.",
  },
  {
    value: "item-3",
    trigger: "É animado?",
    content:
      "Sim. Utiliza animações CSS para transições suaves de abrir/fechar com os keyframes accordion-up e accordion-down.",
  },
];

export const Default: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-full">
      {faqItems.map((item) => (
        <AccordionItem key={item.value} value={item.value}>
          <AccordionTrigger>{item.trigger}</AccordionTrigger>
          <AccordionContent>{item.content}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const firstTrigger = canvas.getByRole("button", { name: "É acessível?" });
    await expect(firstTrigger).toBeInTheDocument();

    await userEvent.click(firstTrigger);

    await expect(
      await canvas.findByText(/Segue o padrão de design WAI-ARIA/)
    ).toBeVisible();

    const secondTrigger = canvas.getByRole("button", { name: "É estilizado?" });
    await userEvent.click(secondTrigger);

    await expect(
      await canvas.findByText(/Vem com estilos padrão/)
    ).toBeVisible();
  },
};

export const Multiple: Story = {
  render: () => (
    <Accordion type="multiple" className="w-full">
      {faqItems.map((item) => (
        <AccordionItem key={item.value} value={item.value}>
          <AccordionTrigger>{item.trigger}</AccordionTrigger>
          <AccordionContent>{item.content}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const firstTrigger = canvas.getByRole("button", { name: "É acessível?" });
    const secondTrigger = canvas.getByRole("button", { name: "É estilizado?" });

    await userEvent.click(firstTrigger);
    await expect(
      await canvas.findByText(/Segue o padrão de design WAI-ARIA/)
    ).toBeVisible();

    await userEvent.click(secondTrigger);
    await expect(
      await canvas.findByText(/Vem com estilos padrão/)
    ).toBeVisible();

    // Verify BOTH are still open (multiple mode)
    await expect(canvas.getByText(/Segue o padrão de design WAI-ARIA/)).toBeVisible();
    await expect(canvas.getByText(/Vem com estilos padrão/)).toBeVisible();
  },
};

export const WithDefaultOpen: Story = {
  render: () => (
    <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
      {faqItems.map((item) => (
        <AccordionItem key={item.value} value={item.value}>
          <AccordionTrigger>{item.trigger}</AccordionTrigger>
          <AccordionContent>{item.content}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>Item habilitado</AccordionTrigger>
        <AccordionContent>Este item pode ser alternado normalmente.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2" disabled>
        <AccordionTrigger>Item desativado</AccordionTrigger>
        <AccordionContent>Este conteúdo não pode ser revelado.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Outro item habilitado</AccordionTrigger>
        <AccordionContent>
          Este item funciona normalmente. O item acima está desativado e não pode ser
          interagido.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const LongContent: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>
          O que acontece com um texto de trigger muito longo que pode quebrar em telas
          menores?
        </AccordionTrigger>
        <AccordionContent>
          O texto do trigger quebra naturalmente enquanto o ícone de seta permanece alinhado
          ao topo-direita graças ao layout flexbox com{" "}
          <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">
            items-start
          </code>{" "}
          e{" "}
          <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">
            shrink-0
          </code>{" "}
          no ícone.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Exemplo de conteúdo rico</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-3">
            <p>
              O conteúdo do accordion pode conter qualquer elemento React, não apenas texto.
              Isso o torna ideal para seções de FAQ, painéis de configuração ou qualquer
              conteúdo recolhível.
            </p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Suporta listas aninhadas</li>
              <li>Lida com conteúdo misto</li>
              <li>Mantém espaçamento adequado</li>
            </ul>
            <p className="text-muted-foreground text-xs">
              A área de conteúdo se adapta ao que você colocar dentro dela.
            </p>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-8 w-full">
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Padrão (Single, Collapsible)</h3>
        <Accordion type="single" collapsible className="w-full">
          {faqItems.map((item) => (
            <AccordionItem key={item.value} value={item.value}>
              <AccordionTrigger>{item.trigger}</AccordionTrigger>
              <AccordionContent>{item.content}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Múltiplos</h3>
        <Accordion type="multiple" className="w-full">
          {faqItems.map((item) => (
            <AccordionItem key={item.value} value={item.value}>
              <AccordionTrigger>{item.trigger}</AccordionTrigger>
              <AccordionContent>{item.content}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Com item aberto por padrão</h3>
        <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
          {faqItems.map((item) => (
            <AccordionItem key={item.value} value={item.value}>
              <AccordionTrigger>{item.trigger}</AccordionTrigger>
              <AccordionContent>{item.content}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Com item desativado</h3>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>Item habilitado</AccordionTrigger>
            <AccordionContent>Este item pode ser alternado normalmente.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2" disabled>
            <AccordionTrigger>Item desativado</AccordionTrigger>
            <AccordionContent>Este conteúdo não pode ser revelado.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Outro item habilitado</AccordionTrigger>
            <AccordionContent>
              Este item funciona normalmente. O item acima está desativado e não pode ser
              interagido.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  ),
};
