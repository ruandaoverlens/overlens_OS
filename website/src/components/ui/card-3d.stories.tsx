import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect, within } from "storybook/test"
import {
  Card3D,
  Card3DImage,
  Card3DOverlay,
  Card3DContent,
  Card3DTitle,
  Card3DDescription,
  Card3DBadge,
} from "./card-3d"

// --- Shared render helper ---

interface CardArgs {
  inverted: boolean
  showHeader: boolean
  showBadges: boolean
}

function renderCard(
  args: CardArgs,
  bg: React.ReactNode,
  {
    title = "TRILHAS",
    description = "Evolua. Um passo de cada vez.",
    badges = ["Design", "Arte", "Tecnologia"],
    overlay = false,
  }: {
    title?: string
    description?: string
    badges?: string[]
    overlay?: boolean
  } = {}
) {
  const hasContent = args.showHeader || args.showBadges
  return (
    <Card3D>
      {bg}
      {overlay && <Card3DOverlay />}
      {hasContent && (
        <Card3DContent inverted={args.inverted}>
          {args.showHeader && (
            <div>
              <Card3DTitle>{title}</Card3DTitle>
              <Card3DDescription>{description}</Card3DDescription>
            </div>
          )}
          {args.showBadges && (
            <div className="flex flex-wrap gap-1.5">
              {badges.map((b) => (
                <Card3DBadge key={b}>{b}</Card3DBadge>
              ))}
            </div>
          )}
        </Card3DContent>
      )}
    </Card3D>
  )
}

// --- Meta ---

const meta = {
  title: "Core Components/Card3D",
  tags: ["autodocs"],
  component: Card3D,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Square container card with background media support (color, gradient, image, video). Features a 3D tilt effect on hover and auto-detects light/dark backgrounds for text and badge color.",
          "",
          "## Anatomy",
          "",
          "```tsx",
          "<Card3D>",
          "  <Card3DImage gradient=\"linear-gradient(...)\" />",
          "  <Card3DOverlay />",
          "  <Card3DContent inverted={false}>",
          "    <div>",
          "      <Card3DTitle>TITLE</Card3DTitle>",
          "      <Card3DDescription>Description</Card3DDescription>",
          "    </div>",
          "    <div className=\"flex gap-1.5\">",
          "      <Card3DBadge>Tag</Card3DBadge>",
          "    </div>",
          "  </Card3DContent>",
          "</Card3D>",
          "```",
          "",
          "## Sub-components",
          "",
          "| Sub-component | Description |",
          "|---------------|-------------|",
          "| `Card3D` | Root `<button>` with `aspect-square`, `rounded-[14px]`, and 3D tilt via `useTilt()` hook (max 8deg rotation). Auto-detects light backgrounds from child color/gradient props and sets CSS custom properties `--card-3d-fg` and font weights accordingly. Uses `data-slot=\"card-3d\"`. |",
          "| `Card3DImage` | Background media layer (`absolute inset-0`). Supports `src` (image/video), `color` (solid), `gradient` (animated with `banner-gradient` keyframes), and `poster` (video fallback). Video uses canvas first-frame crossfade. Uses `displayName=\"card-3d-image\"` for slot detection. |",
          "| `Card3DOverlay` | Gradient overlay (`from-black/85 via-black/45 to-transparent`) for readability over images. Uses `displayName=\"card-3d-overlay\"`. |",
          "| `Card3DContent` | Content layer (`z-[1]`, `p-5`). Uses `flex-col justify-between` by default; set `inverted` to flip order with `flex-col-reverse` (badges top, title bottom). |",
          "| `Card3DTitle` | Heading with `font-heading` (Outfit), `uppercase`, `text-[2rem]`. Color and font-weight respond to `--card-3d-fg` and `--card-3d-title-fw` CSS vars. |",
          "| `Card3DDescription` | Paragraph with `text-sm opacity-80`. Font weight responds to `--card-3d-desc-fw`. |",
          "| `Card3DBadge` | Always white badge (`background: white`, `color: black`) for consistent readability over any card background. No variant prop - always renders white. |",
          "",
          "## Container layouts",
          "",
          "Card3D fills its parent container (`w-full aspect-square`). Use a **responsive grid** or a **carousel** to control card sizes:",
          "",
          "| Strategy | Class | Behavior |",
          "|----------|-------|----------|",
          "| **Grid** | `grid grid-cols-2 gap-x-2 gap-y-3 sm:grid-cols-[repeat(auto-fit,minmax(300px,1fr))]` | 2 columns on mobile, auto-wrap at 300px on `sm:+`. |",
          "| **Carousel** | `flex gap-x-2 overflow-x-auto` | Cards scroll horizontally. Use `w-[220px] shrink-0` wrappers for fixed-width items. |",
          "",
          "```tsx",
          "// Grid (recommended) - 2 col mobile, auto-wrap at 300px on sm+",
          "<div className=\"grid grid-cols-2 gap-x-2 gap-y-3 sm:grid-cols-[repeat(auto-fit,minmax(300px,1fr))]\">",
          "  <Card3D>...</Card3D>",
          "</div>",
          "",
          "// Carousel - fixed-width items, horizontal scroll",
          "<div className=\"flex gap-x-2 overflow-x-auto\">",
          "  <div className=\"w-[220px] shrink-0\"><Card3D>...</Card3D></div>",
          "</div>",
          "```",
          "",
          "## Key details",
          "",
          "- The card is a `<button>` element with `type=\"button\"` by default for click handling",
          "- Light background detection uses relative luminance (threshold 0.4) from hex colors in gradients",
          "- On light backgrounds, text color switches to `oklch(0.15 0 0)` and font weights adjust (title 400, description 500)",
          "- The tilt effect uses `requestAnimationFrame` for smooth `perspective(600px) rotateX/rotateY` transforms",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    children: { control: false },
    className: { control: false },
  },
  args: {
    inverted: false,
    showHeader: true,
    showBadges: true,
  } as unknown as Record<string, unknown>,
  decorators: [
    (Story) => (
      <div className="w-full max-w-[320px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Card3D>

export default meta
type Story = StoryObj<typeof meta>

/** Blue gradient - badges auto-detect as "primary". */
export const Default: Story = {
  render: (args) =>
    renderCard(args as unknown as CardArgs, (
      <Card3DImage gradient="linear-gradient(135deg, #1a3a5c, #2a5a8c, #1a3a5c)" />
    )),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("TRILHAS")).toBeVisible()
    await expect(canvas.getByText("Design")).toBeVisible()
  },
}

/** Image background - badges render white (no color to detect). */
export const WithImage: Story = {
  render: (args) =>
    renderCard(
      args as unknown as CardArgs,
      <Card3DImage src="/banner-home-poster.png" alt="Background" />,
      {
        title: "MUSEU DE PROFECIAS",
        description: "Galeria de futuros",
        badges: ["Arte", "Filosofia"],
        overlay: true,
      }
    ),
}

/** Light warm gradient - badges auto-detect as "warning". */
export const WithLightGradient: Story = {
  render: (args) =>
    renderCard(
      args as unknown as CardArgs,
      <Card3DImage gradient="linear-gradient(135deg, #D3EEF4, #F1EEC8, #F3A46C)" />,
      {
        title: "LIVES",
        description: "Toda terça às 19h00",
        badges: ["Mentoria", "Comunidade"],
      }
    ),
}

/** Deep blue solid color - badges auto-detect as "primary". */
export const WithColor: Story = {
  render: (args) =>
    renderCard(
      args as unknown as CardArgs,
      <Card3DImage color="#0f3460" />,
      {
        title: "LIVES",
        description: "Toda terça às 19h00",
        badges: ["Ao vivo"],
      }
    ),
}

/** Green gradient - badges auto-detect as "success". */
export const GreenGradient: Story = {
  render: (args) =>
    renderCard(
      args as unknown as CardArgs,
      <Card3DImage gradient="linear-gradient(135deg, #0a3d2e, #1a6b4a, #2d8f5e)" />,
      {
        title: "NATUREZA",
        description: "Conexão com o mundo natural.",
        badges: ["Ecologia", "Sustentável"],
      }
    ),
}

/** Red/warm gradient - badges auto-detect as "destructive". */
export const RedGradient: Story = {
  render: (args) =>
    renderCard(
      args as unknown as CardArgs,
      <Card3DImage gradient="linear-gradient(135deg, #5c1a1a, #8c2a2a, #a03030)" />,
      {
        title: "URGENTE",
        description: "Ação necessária agora.",
        badges: ["Crítico", "Alerta"],
      }
    ),
}

/** Teal/cyan gradient - badges auto-detect as "info". */
export const TealGradient: Story = {
  render: (args) =>
    renderCard(
      args as unknown as CardArgs,
      <Card3DImage gradient="linear-gradient(135deg, #0a3d3d, #1a6b6b, #2d8f8f)" />,
      {
        title: "INSIGHTS",
        description: "Dados e análises em tempo real.",
        badges: ["Dados", "Analytics"],
      }
    ),
}

/** Image only - no text content. */
export const ImageOnly: Story = {
  args: { showHeader: false, showBadges: false } as unknown as Record<string, unknown>,
  render: () => (
    <Card3D>
      <Card3DImage src="/banner-home-poster.png" alt="Featured image" />
    </Card3D>
  ),
}

/** Video only - no text content. */
export const VideoOnly: Story = {
  args: { showHeader: false, showBadges: false } as unknown as Record<string, unknown>,
  render: () => (
    <Card3D>
      <Card3DImage
        src="/banner-home.mp4"
        poster="/banner-home-poster.png"
        alt="Featured video"
      />
    </Card3D>
  ),
}

/** Responsive grid - cards adapt typography and padding across breakpoints. */
export const Responsive: Story = {
  decorators: [
    (Story) => (
      <div className="w-full max-w-[960px]">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <div className="grid grid-cols-2 gap-x-2 gap-y-3 sm:grid-cols-[repeat(auto-fit,minmax(300px,1fr))]">
      <Card3D>
        <Card3DImage gradient="linear-gradient(135deg, #1a3a5c, #2a5a8c, #1a3a5c)" />
        <Card3DContent>
          <div>
            <Card3DTitle>TRILHAS</Card3DTitle>
            <Card3DDescription>Evolua. Um passo de cada vez.</Card3DDescription>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Card3DBadge>Design</Card3DBadge>
            <Card3DBadge>Arte</Card3DBadge>
          </div>
        </Card3DContent>
      </Card3D>

      <Card3D>
        <Card3DImage gradient="linear-gradient(135deg, #D3EEF4, #F1EEC8, #F3A46C)" />
        <Card3DContent>
          <div>
            <Card3DTitle>LIVES</Card3DTitle>
            <Card3DDescription>Toda terca as 19h00</Card3DDescription>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Card3DBadge>Mentoria</Card3DBadge>
          </div>
        </Card3DContent>
      </Card3D>

      <Card3D>
        <Card3DImage gradient="linear-gradient(135deg, #0a3d2e, #1a6b4a, #2d8f5e)" />
        <Card3DContent>
          <div>
            <Card3DTitle>NATUREZA</Card3DTitle>
            <Card3DDescription>Conexao com o mundo natural.</Card3DDescription>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Card3DBadge>Ecologia</Card3DBadge>
          </div>
        </Card3DContent>
      </Card3D>

      <Card3D>
        <Card3DImage gradient="linear-gradient(135deg, #5c1a1a, #8c2a2a, #a03030)" />
        <Card3DContent>
          <div>
            <Card3DTitle>URGENTE</Card3DTitle>
            <Card3DDescription>Acao necessaria agora.</Card3DDescription>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Card3DBadge>Critico</Card3DBadge>
            <Card3DBadge>Alerta</Card3DBadge>
          </div>
        </Card3DContent>
      </Card3D>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("TRILHAS")).toBeVisible()
    await expect(canvas.getByText("URGENTE")).toBeVisible()
  },
}
