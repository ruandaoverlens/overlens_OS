import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect, fn, userEvent, within } from "storybook/test"
import {
  Upload,
  UploadTrigger,
  UploadMessage,
  UploadFile,
  UploadFileList,
  UploadSummary,
} from "./upload"

const meta = {
  title: "Base Components/Upload",
  tags: ["autodocs"],
  component: Upload,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: [
          "Compound file upload component with trigger, file list, collapsible summary, and status messages. Built on InputGroup and Collapsible primitives.",
          "",
          "## Anatomy",
          "",
          "```tsx",
          "<Upload>",
          "  <UploadTrigger accept=\".pdf,.md\" multiple onChange={handleFiles} />",
          "  <UploadMessage variant=\"error\">Error text</UploadMessage>",
          "  <UploadFile name=\"file.pdf\" onRemove={handleRemove} />",
          "  <UploadSummary count={3} defaultOpen={false}>",
          "    <UploadFile name=\"file1.pdf\" onRemove={fn} />",
          "    <UploadFile name=\"file2.md\" onRemove={fn} />",
          "  </UploadSummary>",
          "  <UploadFileList>",
          "    <UploadFile name=\"standalone.pdf\" />",
          "  </UploadFileList>",
          "</Upload>",
          "```",
          "",
          "## Sub-components",
          "",
          "| Sub-component | Description |",
          "|---------------|-------------|",
          "| `Upload` | Root `<div>` container with `flex flex-col gap-2`. |",
          "| `UploadTrigger` | Clickable area wrapping `InputGroup` with a hidden `<input type=\"file\">`. Accepts `accept`, `multiple`, and `onChange` props. Displays `SmUploadLineIcon` with default text \"Carregar arquivos\". |",
          "| `UploadMessage` | Status message with CVA variants: `error` (shows `SmCloseSolidIcon` in `text-destructive`) or `warning` (shows `SmAlertSolidIcon` in `text-warning`). |",
          "| `UploadFile` | Single file row with `SmDocSolidIcon`, truncated filename, and optional remove button (`SmCloseLineIcon`) with `aria-label=\"Remover {name}\"`. |",
          "| `UploadSummary` | Collapsible toggle showing file count (\"Ver todos (+N)\") with `SmOpenFolderLineIcon` in `--brand-sahara` color. Wraps children in a scrollable list (max-h-40) with custom scrollbar. |",
          "| `UploadFileList` | Standalone card-like file list container with `rounded-[12px] bg-input/30` and \"Arquivos carregados\" header. |",
          "",
          "## Key details",
          "",
          "- Hidden file input is triggered via `inputRef.current?.click()` on container click",
          "- File list inside `UploadSummary` scrolls after ~4 items with a thin 2px custom scrollbar",
          "- `UploadMessage` defaults to `error` variant when no variant is specified",
          "- Uses `data-slot` attributes: `upload`, `upload-trigger`, `upload-message`, `upload-file`, `upload-summary`, `upload-file-list`",
        ].join("\n"),
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-sm mx-auto">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Upload>

export default meta
type Story = StoryObj<typeof meta>

/** Default upload trigger only. */
export const Default: Story = {
  render: () => (
    <Upload>
      <UploadTrigger />
    </Upload>
  ),
}

/** Upload with error message. */
export const WithError: Story = {
  render: () => (
    <Upload>
      <UploadTrigger />
      <UploadMessage variant="error">
        Arquivo excede o tamanho máximo (10MB).
      </UploadMessage>
    </Upload>
  ),
}

/** Upload with warning message. */
export const WithWarning: Story = {
  render: () => (
    <Upload>
      <UploadTrigger />
      <UploadMessage variant="warning">
        Falha de conexão. Envie novamente.
      </UploadMessage>
    </Upload>
  ),
}

/** Upload with a single file attached. */
export const WithFile: Story = {
  render: () => {
    const handleRemove = fn()
    return (
      <Upload>
        <UploadTrigger />
        <UploadFile name="auditoria_de_negocio.md" onRemove={handleRemove} />
      </Upload>
    )
  },
}

/** Upload with collapsed summary - click folder to expand. */
export const WithMultipleFiles: Story = {
  render: () => (
    <Upload>
      <UploadTrigger />
      <UploadSummary count={3}>
        <UploadFile name="auditoria_de_negocio.md" onRemove={fn()} />
        <UploadFile name="auditoria_mercado.md" onRemove={fn()} />
        <UploadFile name="PERSONA_sintetica.md" onRemove={fn()} />
      </UploadSummary>
    </Upload>
  ),
}

/** Upload with file list already expanded. */
export const WithFileListOpen: Story = {
  render: () => (
    <Upload>
      <UploadTrigger />
      <UploadSummary count={3} defaultOpen>
        <UploadFile name="auditoria_de_negocio.md" onRemove={fn()} />
        <UploadFile name="auditoria_mercado.md" onRemove={fn()} />
        <UploadFile name="PERSONA_sintetica.md" onRemove={fn()} />
      </UploadSummary>
    </Upload>
  ),
}

/** Upload with many files - scroll activates after 4 items. */
export const WithScrollableList: Story = {
  render: () => (
    <Upload>
      <UploadTrigger />
      <UploadSummary count={7} defaultOpen>
        <UploadFile name="auditoria_de_negocio.md" onRemove={fn()} />
        <UploadFile name="auditoria_mercado.md" onRemove={fn()} />
        <UploadFile name="PERSONA_sintetica.md" onRemove={fn()} />
        <UploadFile name="relatorio_financeiro.pdf" onRemove={fn()} />
        <UploadFile name="apresentacao_final.pptx" onRemove={fn()} />
        <UploadFile name="dados_clientes.csv" onRemove={fn()} />
        <UploadFile name="contrato_servico.docx" onRemove={fn()} />
      </UploadSummary>
    </Upload>
  ),
}

/** Tests that the hidden file input exists inside the trigger. */
export const TriggerHasFileInput: Story = {
  render: () => (
    <Upload>
      <UploadTrigger data-testid="trigger" />
    </Upload>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByTestId("trigger")
    const input = trigger.querySelector("input[type='file']")
    await expect(input).toBeInTheDocument()
  },
}

/** Tests that clicking remove on a file calls the onRemove handler. */
export const FileRemoveClick: Story = {
  render: () => {
    const removeFn = fn()
    return (
      <Upload>
        <UploadFile name="test.pdf" onRemove={removeFn} />
      </Upload>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const removeBtn = canvas.getByRole("button", { name: /remover/i })
    await userEvent.click(removeBtn)
  },
}

/** Tests that clicking the summary toggle reveals the file list. */
export const SummaryToggle: Story = {
  render: () => (
    <Upload>
      <UploadTrigger />
      <UploadSummary count={2}>
        <UploadFile name="relatorio.pdf" onRemove={fn()} />
        <UploadFile name="planilha.xlsx" onRemove={fn()} />
      </UploadSummary>
    </Upload>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // File list should be hidden initially
    await expect(canvas.queryByText("Arquivos carregados")).not.toBeInTheDocument()
    // Click folder button to expand
    const toggle = canvas.getByRole("button", { name: /ver todos/i })
    await userEvent.click(toggle)
    // File list should now be visible
    await expect(canvas.getByText("Arquivos carregados")).toBeInTheDocument()
    await expect(canvas.getByText("relatorio.pdf")).toBeInTheDocument()
    // Click again to collapse
    await userEvent.click(toggle)
    await expect(canvas.queryByText("Arquivos carregados")).not.toBeInTheDocument()
  },
}

/** All variants together for visual reference. */
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <Upload>
        <UploadTrigger />
      </Upload>

      <Upload>
        <UploadTrigger />
        <UploadMessage variant="error">
          Arquivo excede o tamanho máximo (10MB).
        </UploadMessage>
      </Upload>

      <Upload>
        <UploadTrigger />
        <UploadMessage variant="warning">
          Falha de conexão. Envie novamente.
        </UploadMessage>
      </Upload>

      <Upload>
        <UploadTrigger />
        <UploadFile name="auditoria_de_negocio.md" onRemove={fn()} />
      </Upload>

      <Upload>
        <UploadTrigger />
        <UploadSummary count={3}>
          <UploadFile name="auditoria_de_negocio.md" onRemove={fn()} />
          <UploadFile name="auditoria_mercado.md" onRemove={fn()} />
          <UploadFile name="PERSONA_sintetica.md" onRemove={fn()} />
        </UploadSummary>
      </Upload>

      <Upload>
        <UploadTrigger />
        <UploadSummary count={3} defaultOpen>
          <UploadFile name="auditoria_de_negocio.md" onRemove={fn()} />
          <UploadFile name="auditoria_mercado.md" onRemove={fn()} />
          <UploadFile name="PERSONA_sintetica.md" onRemove={fn()} />
        </UploadSummary>
      </Upload>
    </div>
  ),
}
