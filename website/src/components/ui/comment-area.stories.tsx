import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { useState } from "react";
import { CommentArea } from "./comment-area";

const meta = {
  title: "Core Components/CommentArea",
  tags: ["autodocs"],
  component: CommentArea,
  args: {
    onSubmit: fn(),
    onValueChange: fn(),
    onUpload: fn(),
    onAIHelp: fn(),
  },
  argTypes: {
    disabled: { control: "boolean" },
    placeholder: { control: "text" },
    maxLength: { control: "number" },
  },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: [
          "Rich text comment input with file attachments, emoji picker, AI help menu, live character counter, and submit via Cmd/Ctrl+Enter.",
          "",
          "## Anatomy",
          "",
          "```tsx",
          "<CommentArea",
          "  placeholder=\"Leave a comment\"",
          "  value={value}",
          "  onValueChange={setValue}",
          "  onSubmit={handleSubmit}",
          "  onUpload={handleUpload}",
          "  onAIHelp={handleAI}",
          "  files={files}",
          "  onFileRemove={handleRemove}",
          "  maxLength={500}",
          "/>",
          "```",
          "",
          "## Props",
          "",
          "| Prop | Type | Default | Description |",
          "|------|------|---------|-------------|",
          "| `placeholder` | `string` | `\"Deixe seu comentario\"` | Textarea placeholder text |",
          "| `value` | `string` | - | Controlled value |",
          "| `defaultValue` | `string` | `\"\"` | Initial value (uncontrolled) |",
          "| `disabled` | `boolean` | `false` | Disables all interactions, sets `data-disabled` and `opacity-50` |",
          "| `maxLength` | `number` | - | Native character limit; shows live `(count/max)` counter in toolbar |",
          "| `files` | `CommentAreaFile[]` | `[]` | Array of `{ id, name }` file attachments displayed as dismissible `Tag` chips |",
          "| `onValueChange` | `(value: string) => void` | - | Callback on every text change |",
          "| `onSubmit` | `(value: string) => void` | - | Callback on submit (button click or Cmd/Ctrl+Enter) |",
          "| `onUpload` | `() => void` | - | Callback for upload action in the plus dropdown |",
          "| `onAIHelp` | `() => void` | - | Callback for AI help action in the plus dropdown |",
          "| `onFileRemove` | `(id: string) => void` | - | Callback when a file tag is dismissed |",
          "| `actions` | `ReactNode` | - | Custom toolbar actions replacing the default dropdown + emoji buttons |",
          "",
          "## Sub-components",
          "",
          "| Component | Role | Notes |",
          "|-----------|------|-------|",
          "| `CommentArea` | Root container | `rounded-2xl`, `bg-input/30`, `focus-within:border-input` transition |",
          "| `CommentAreaAction` | Toolbar icon button | Circular `size-8`, `rounded-full`, used for emoji and custom actions |",
          "",
          "## Data slots",
          "",
          "| Slot | Element | Description |",
          "|------|---------|-------------|",
          "| `comment-area` | Root `div` | Container with `data-disabled` and `data-filled` attributes |",
          "| `comment-area-input` | `textarea` | Auto-growing input with custom scrollbar |",
          "| `comment-area-files` | `div` | File attachments wrapper (only rendered when files exist) |",
          "| `comment-area-toolbar` | `div` | Bottom bar with actions and submit |",
          "| `comment-area-submit` | `button` | Circular send button |",
          "| `comment-area-action` | `button` | Individual toolbar action button |",
          "",
          "## Key details",
          "",
          "- Supports controlled (`value` + `onValueChange`) and uncontrolled (`defaultValue`) modes",
          "- Textarea auto-grows via `field-sizing-content`, caps at `max-h-[160px]` with thin custom scrollbar",
          "- `maxLength` enables a live `(count/max)` counter in `font-mono` next to the submit button, colored `surface-600`",
          "- Plus dropdown menu includes upload and AI help options; emoji button is always visible",
          "- Submit button (`bg-foreground/80`) is disabled when input is empty or component is disabled",
          "- Submit via click or keyboard shortcut: `Cmd+Enter` (macOS) / `Ctrl+Enter` (Windows/Linux)",
          "- File attachments render as `Tag` chips with `max-w-[160px]` truncation and dismiss button",
          "- Container transitions background on hover and shows `border-input` on focus-within",
        ].join("\n"),
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="flex min-h-screen items-center justify-center">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CommentArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByPlaceholderText("Deixe seu comentário");
    await expect(textarea).toBeVisible();
    await userEvent.click(textarea);
    await userEvent.type(textarea, "Olá, mundo!");
    await expect(args.onValueChange).toHaveBeenCalled();
    const submitButton = canvas.getByRole("button", { name: /enviar/i });
    await userEvent.click(submitButton);
    await expect(args.onSubmit).toHaveBeenCalledOnce();
  },
};

export const WithPlaceholder: Story = {
  args: { placeholder: "Escreva algo..." },
};

export const Filled: Story = {
  args: {
    defaultValue:
      "Hoje eu não quero nem saber, vou maratonar todas as aulas da Overlens, sem dó nem piedade. Quero assistir todas as aulas porque agora vou me tornar nexialista e ninguém vai me impedir. Esse comentário ficou muito ruim, mas eu precisava de um texto longo.",
  },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const DisabledWithContent: Story = {
  args: {
    disabled: true,
    defaultValue: "Este comentário não pode ser editado.",
  },
};

export const WithMaxLength: Story = {
  args: { maxLength: 300, placeholder: "Máximo 300 caracteres", defaultValue: "Hoje eu não quero nem saber, vou maratonar todas as aulas." },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByPlaceholderText("Máximo 300 caracteres");
    await expect(textarea).toHaveAttribute("maxlength", "300");
  },
};

export const WithFiles: Story = {
  args: {
    defaultValue: "Segue os arquivos que você pediu.",
    files: [
      { id: "1", name: "relatorio.pdf" },
      { id: "2", name: "planilha.xlsx" },
      { id: "3", name: "apresentacao-final-do-projeto-revisada-v3.pptx" },
    ],
    onFileRemove: fn(),
  },
};

export const WithManyFiles: Story = {
  args: {
    files: [
      { id: "1", name: "foto.png" },
      { id: "2", name: "documento.pdf" },
      { id: "3", name: "video.mp4" },
      { id: "4", name: "notas.txt" },
    ],
    onFileRemove: fn(),
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm font-medium mb-2">Vazio (padrão)</p>
        <CommentArea />
      </div>
      <div>
        <p className="text-sm font-medium mb-2">Com placeholder personalizado</p>
        <CommentArea placeholder="Escreva algo..." />
      </div>
      <div>
        <p className="text-sm font-medium mb-2">Preenchido</p>
        <CommentArea defaultValue="Hoje eu não quero nem saber, vou maratonar todas as aulas da Overlens, sem dó nem piedade." />
      </div>
      <div>
        <p className="text-sm font-medium mb-2">Desabilitado</p>
        <CommentArea disabled />
      </div>
      <div>
        <p className="text-sm font-medium mb-2">Com limite de caracteres</p>
        <CommentArea maxLength={100} placeholder="Máximo 100 caracteres" />
      </div>
    </div>
  ),
};

export const Controlled: Story = {
  render: function Controlled() {
    const [value, setValue] = useState("");
    const [files, setFiles] = useState([
      { id: "1", name: "briefing.pdf" },
    ]);
    const [submitted, setSubmitted] = useState<string[]>([]);
    let counter = 2;

    return (
      <div className="flex flex-col gap-4">
        <CommentArea
          value={value}
          onValueChange={setValue}
          files={files}
          onFileRemove={(id) => setFiles((f) => f.filter((x) => x.id !== id))}
          onSubmit={(v) => {
            setSubmitted((prev) => [...prev, v]);
            setValue("");
            setFiles([]);
          }}
          onUpload={() => {
            const name = `arquivo-${counter++}.pdf`;
            setFiles((f) => [...f, { id: String(counter), name }]);
          }}
          onAIHelp={() => alert("IA clicado")}
        />
        {submitted.length > 0 && (
          <div className="flex flex-col gap-2">
            {submitted.map((comment, i) => (
              <div
                key={i}
                className="rounded-xl bg-accent/50 dark:bg-input/30 px-4 py-3 text-sm text-foreground"
              >
                {comment}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  },
};
