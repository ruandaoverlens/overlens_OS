import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { DadoBadge } from "./dado-badge";
import { DADO_GRADES, DADO_GRADE_ORDER } from "@/lib/dado";

const meta = {
  title: "Base de Conhecimento/DadoBadge",
  tags: ["autodocs"],
  component: DadoBadge,
  argTypes: {
    q: { control: "select", options: DADO_GRADE_ORDER },
    fonte: { control: "text" },
    nota: { control: "text" },
  },
  parameters: {
    docs: {
      description: {
        component: [
          "Ponto de qualidade do dado. Cada afirmação estratégica da base carrega uma letra que diz o quanto ela é verdade hoje; o tooltip explica a qualidade e a origem.",
          "",
          "No markdown a marcação é inline:",
          "",
          "```markdown",
          '<dado q="A" />',
          '<dado q="C" nota="Candidato mais forte." fonte="TRU/changes.md" />',
          "```",
          "",
          "| Letra | Significa | Quando usar |",
          "|---|---|---|",
          ...DADO_GRADE_ORDER.map(
            (g) => `| **${g}** | ${DADO_GRADES[g].label} | ${DADO_GRADES[g].meaning} |`,
          ),
          "",
          "`fonte` acrescenta um segundo ponto, marcado **F**. Ausência de fonte é informação verdadeira sobre a base: nunca se inventa uma.",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof DadoBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { q: "A" },
};

export const AEscala: Story = {
  name: "A escala completa",
  args: { q: "A" },
  render: () => (
    <div className="space-y-3 text-body text-muted-foreground">
      {DADO_GRADE_ORDER.map((grade) => (
        <p key={grade}>
          <DadoBadge q={grade} />
          {DADO_GRADES[grade].meaning}
        </p>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const grade of DADO_GRADE_ORDER) {
      await expect(canvas.getByText(grade)).toBeInTheDocument();
    }
  },
};

export const ComFonte: Story = {
  name: "Com fonte declarada",
  args: {
    q: "B",
    nota: "Direção testada em duas turmas.",
    fonte: "TRU/changes.md",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("F")).toBeInTheDocument();
  },
};

export const NoTexto: Story = {
  name: "Dentro de um parágrafo",
  args: { q: "A" },
  render: () => (
    <p className="max-w-prose text-body text-muted-foreground">
      <DadoBadge q="A" />O público da Overlens é o empreendedor: quem tem uma ideia,
      ambição ou visão de futuro e quer transformá-la em realidade. A estrutura
      dinâmica de posicionamento <DadoBadge q="B" nota="Expressão em exploração." />
      ainda está em teste.
    </p>
  ),
};
