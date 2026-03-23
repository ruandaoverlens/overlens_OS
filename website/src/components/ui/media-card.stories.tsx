import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect, within } from "storybook/test"
import { Badge } from "./badge"
import {
  MediaCard,
  MediaCardImage,
  MediaCardBadge,
  MediaCardContent,
  MediaCardTitle,
  MediaCardDescription,
  MediaCardMeta,
  MediaCardMetaItem,
  MediaCardMetaAuthor,
  MediaCardMetaAction,
  MediaCardCheck,
  MediaCardGrid,
} from "./media-card"

const meta = {
  title: "Core Components/MediaCard",
  tags: ["autodocs"],
  component: MediaCard,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Media card with image/video separated from title and metadata. Variant controls card type; width is determined by the parent container.",
          "",
          "## Anatomy",
          "",
          "```tsx",
          "<MediaCard orientation=\"vertical\">",
          "  <MediaCardImage src=\"/photo.jpg\" alt=\"...\">",
          "    <MediaCardCheck checked={false} />",
          "    <MediaCardBadge><Badge>New</Badge></MediaCardBadge>",
          "  </MediaCardImage>",
          "  <MediaCardContent>",
          "    <MediaCardTitle>Title</MediaCardTitle>",
          "    <MediaCardDescription>Secondary text</MediaCardDescription>",
          "    <MediaCardMeta>",
          "      <MediaCardMetaAction>Category</MediaCardMetaAction>",
          "      <MediaCardMetaAuthor>Author</MediaCardMetaAuthor>",
          "      <MediaCardMetaItem>5 min read</MediaCardMetaItem>",
          "    </MediaCardMeta>",
          "  </MediaCardContent>",
          "</MediaCard>",
          "```",
          "",
          "## Sub-components",
          "",
          "| Sub-component | Description |",
          "|---------------|-------------|",
          "| `MediaCard` | Root `<article>` with CVA variants for `variant` (`default`, `compact`) and `orientation` (`vertical`, `horizontal`). `default` is fluid (`w-full`, `text-sm`, `aspect-video`). `compact` has `max-w-[180px] min-w-[120px]`, `text-xs`, `aspect-square`. Portrait aspect (2:3) is set via `className` on `MediaCardImage`. `active` adds a ring border. Provides variant/orientation/active via React context. |",
          "| `MediaCardImage` | Image area as a `<button>`. Supports `src` (image or video), `color` (solid bg), `gradient` (animated bg), and `poster` (video fallback). Aspect ratio driven by variant: default=16:9, compact=1:1. Override with `className` for portrait (`aspect-[2/3]`). Horizontal images have `min-w-[140px]`. Video uses canvas first-frame + crossfade. |",
"| `MediaCardBadge` | Absolutely positioned badge container (`right-2 top-2 z-10`). |",
          "| `MediaCardContent` | Text content area below (vertical) or beside (horizontal) the image. Always `gap-1` (4px). Compact uses `pt-4` (16px); default uses `pt-3` (12px). |",
          "| `MediaCardTitle` | Title as a `<button>` with `leading-[1.2]`. Color: `surface-200` (bright). Compact uses `text-[14px]`, default `text-[16px]`. Vertical: `line-clamp-1`. Horizontal without description: `line-clamp-2`. Horizontal with description: `line-clamp-1`. Transition `duration-500`. |",
          "| `MediaCardDescription` | Secondary text as `<p>` with `line-clamp-1`, `text-[14px]`, `font-medium`. Color: `surface-600` default, `surface-500` on `group-hover`. `pointer-events-none` so clicks pass to container. |",
          "| `MediaCardMeta` | Inline metadata row with dot separators between children. |",
          "| `MediaCardMetaItem` | Non-interactive span at 50% opacity for dates, read time, etc. |",
          "| `MediaCardMetaAuthor` | Author name as a `<button>` with `truncate` (single-line ellipsis) in `surface-500` color. |",
          "| `MediaCardMetaAction` | Interactive category/action as a `<button>` in `surface-500` color. |",
          "| `MediaCardCheck` | Circular checkbox overlay (`left-2 top-2 z-20`) with `role=\"checkbox\"` and `aria-checked`. Renders `SmCheckLineIcon` when checked. |",
          "",
          "## Horizontal variants",
          "",
          "Horizontal mode uses fixed image dimensions (`min-w-[140px]`, `rounded-lg`). The only variation is whether a `MediaCardDescription` is present:",
          "",
          "| Variant | Description | Features |",
          "|---------|-------------|----------|",
          "| Default | No | Thumbnail + check, meta + title (2-line clamp). Timestamp badge is off by default (meta already describes duration). |",
          "| With description | Yes | Same as default + `MediaCardDescription` below the title (title reverts to 1-line clamp) |",
          "",
          "## Container layouts",
          "",
          "MediaCard fills its parent. Use a **responsive grid** or a **carousel** to control card sizes:",
          "",
          "| Strategy | Class | Behavior |",
          "|----------|-------|----------|",
          "| **Grid** | `grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-x-2 gap-y-4` | Cards auto-wrap when they reach 240px minimum. Fills available space with `1fr`. |",
          "| **Carousel** | `flex gap-x-2 overflow-x-auto` | Cards scroll horizontally. Use `w-[Npx] shrink-0` wrappers. |",
          "",
          "The `auto-fill` + `minmax(240px, 1fr)` pattern ensures cards never go below 240px - when the container is too narrow, the grid automatically wraps to fewer columns.",
          "",
          "```tsx",
          "// Vertical cards - auto-wrap at 240px min",
          "<div className=\"grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-x-2 gap-y-4\">",
          "  <MediaCard>...</MediaCard>",
          "</div>",
          "",
          "// Books - flex-wrap, compact has max-w-[180px] min-w-[120px] built in",
          "<div className=\"flex flex-wrap gap-x-2 gap-y-4\">",
          "  <MediaCard variant=\"compact\">...</MediaCard>",
          "</div>",
          "",
          "// Carousel - fixed-width items, horizontal scroll",
          "<div className=\"flex gap-x-2 overflow-x-auto\">",
          "  <div className=\"w-[160px] shrink-0\"><MediaCard variant=\"compact\">...</MediaCard></div>",
          "</div>",
          "```",
          "",
          "## Key details",
          "",
          "- Image area has a `group-hover:scale-[1.03]` zoom effect on static images and a white overlay on hover",
          "- Video playback uses a canvas for the first frame to avoid flash, then crossfades to the playing video",
          "- The `active` prop on the root adds `border-2 border-foreground` to the image area",
          "- Title and description transitions match image hover timing (`duration-500`)",
          "- All clickable sub-components (`MediaCardImage`, `MediaCardTitle`, `MediaCardCheck`) include `focus-visible:ring-2` for keyboard accessibility",
          "",
          "## Badge rules",
          "",
          "Badges inside MediaCard **must** use the `Badge` component - never create a manual pill with an inline `<span>`. `MediaCardBadge` is only the positioner (`absolute right-2 top-2`); the child must be `<Badge variant=\"...\">`. Badge always uses `variant=\"primary\"` (white background) inside MediaCard - never `default` (gray) or other variants. Badge format is rectangular with `rounded` (default border-radius) - never `rounded-full`.",
          "",
          "## Max 2 lines below image",
          "",
          "Title + meta only - never 3 lines (title + description + meta). `MediaCardDescription` is for rare use (horizontal large) - in vertical cards, use only `MediaCardTitle` + `MediaCardMeta`.",
          "",
          "## `active` vs `checked` are INDEPENDENT states",
          "",
          "- `active` = border on image - indicates the **current page/lesson** (only 1 item at a time)",
          "- `checked` = check icon - indicates **completed items** (multiple items)",
          "- An item can be `checked=true, active=false` (completed but not current)",
          "- An item can be `checked=false, active=true` (current lesson, not yet completed)",
          "- Never tie `active` to `checked` - they are different concepts",
          "",
          "## Showcase instantiation checklist",
          "",
          "All variants must be demonstrated:",
          "",
          "- **Vertical default** - `color`, `gradient`, `src` (image), fallback (no media)",
          "- **With badge and description** - `MediaCardBadge` + `Badge`, `MediaCardDescription`, `MediaCardMetaAuthor`",
          "- **Horizontal** - `orientation=\"horizontal\"`, `MediaCardCheck`, `active` state. Timestamp badge optional via `showTimestamp` (default off)",
          "- **Horizontal with description** - same as above + `MediaCardDescription`",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "compact"],
      description: "Card variant - default (articles, lives) or compact (small items)",
    },
    orientation: {
      control: "select",
      options: ["vertical", "horizontal"],
      description: "Card orientation - vertical (default) or horizontal (lesson lists)",
    },
    children: { control: false },
    className: { control: "text" },
  },
} satisfies Meta<typeof MediaCard>

export default meta
type Story = StoryObj<typeof meta>

/** Compact - Square image, small text. Books, small items. */
export const Compact: Story = {
  render: () => (
    <MediaCard variant="compact">
      <MediaCardImage color="#1a1a2e" />
      <MediaCardContent>
        <MediaCardTitle>Virtudes da marca</MediaCardTitle>
        <MediaCardMeta>
          <MediaCardMetaAction>Ruan Braz</MediaCardMetaAction>
        </MediaCardMeta>
      </MediaCardContent>
    </MediaCard>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("Virtudes da marca")).toBeVisible()
    await expect(canvas.getByText("Ruan Braz")).toBeVisible()
  },
}

/** Default - 16:9 landscape. Articles, lives, broadcasts. */
export const Default: Story = {
  decorators: [(Story) => <div className="w-[300px]"><Story /></div>],
  render: () => (
    <MediaCard>
      <MediaCardImage color="#1e293b" />
      <MediaCardContent>
        <MediaCardTitle>Escalando a IA para todos</MediaCardTitle>
        <MediaCardMeta>
          <MediaCardMetaAction>Empresa</MediaCardMetaAction>
          <MediaCardMetaItem>Leitura de 5 minutos</MediaCardMetaItem>
        </MediaCardMeta>
      </MediaCardContent>
    </MediaCard>
  ),
}


/** Portrait - 2:3 portrait image. Featured articles, hero cards. */
export const Portrait: Story = {
  decorators: [(Story) => <div className="w-[320px]"><Story /></div>],
  render: () => (
    <MediaCard>
      <MediaCardImage color="#0f172a" className="aspect-[2/3]" />
      <MediaCardContent>
        <MediaCardTitle>OpenAI e Amazon anunciam parceria estratégica</MediaCardTitle>
        <MediaCardMeta>
          <MediaCardMetaAction>Empresa</MediaCardMetaAction>
          <MediaCardMetaItem>Leitura de 5 minutos</MediaCardMetaItem>
        </MediaCardMeta>
      </MediaCardContent>
    </MediaCard>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("OpenAI e Amazon anunciam parceria estratégica")).toBeVisible()
  },
}

/** With badge overlay on image. */
export const WithBadge: StoryObj<{ showBadge: boolean }> = {
  decorators: [(Story) => <div className="w-[320px]"><Story /></div>],
  args: {
    showBadge: true,
  },
  argTypes: {
    showBadge: {
      control: "boolean",
      description: "Toggle badge visibility",
    },
  },
  render: ({ showBadge }) => (
    <MediaCard>
      <MediaCardImage color="#1a1a2e" className="aspect-[2/3]">
        {showBadge && (
          <MediaCardBadge>
            <Badge variant="primary">Novo</Badge>
          </MediaCardBadge>
        )}
      </MediaCardImage>
      <MediaCardContent>
        <MediaCardTitle>Artigo com badge de destaque</MediaCardTitle>
        <MediaCardMeta>
          <MediaCardMetaAction>Tecnologia</MediaCardMetaAction>
          <MediaCardMetaItem>Leitura de 8 minutos</MediaCardMetaItem>
        </MediaCardMeta>
      </MediaCardContent>
    </MediaCard>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("Novo")).toBeVisible()
  },
}


/** Solid color background. */
export const WithColor: Story = {
  decorators: [(Story) => <div className="w-[400px]"><Story /></div>],
  render: () => (
    <MediaCard>
      <MediaCardImage color="#1a1a2e" />
      <MediaCardContent>
        <MediaCardTitle>Card com cor sólida de fundo</MediaCardTitle>
        <MediaCardMeta>
          <MediaCardMetaAction>Design</MediaCardMetaAction>
          <MediaCardMetaItem>Leitura de 3 minutos</MediaCardMetaItem>
        </MediaCardMeta>
      </MediaCardContent>
    </MediaCard>
  ),
}

/** Animated gradient background with centered icon. */
export const WithGradient: Story = {
  decorators: [(Story) => <div className="w-[400px]"><Story /></div>],
  render: () => (
    <MediaCard>
      <MediaCardImage gradient="linear-gradient(90deg, #D3EEF4, #F1EEC8, #F3A46C)">
        <div className="absolute inset-0 m-auto h-40 w-40 [perspective:600px]">
          <svg viewBox="0 0 160 160" className="h-full w-full transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
            <defs>
              <mask id="icon-cutout">
                <rect width="160" height="160" fill="white" />
                <g transform="translate(32, 32) scale(3)">
                  <path d="M7.14 23.41C5.12 23.41 3.43 22.67 2.06 21.2C0.69 19.73 0 17.98 0 15.93C0 13.91 0.69 12.19 2.07 10.75C3.45 9.31 5.14 8.59 7.14 8.59C7.95 8.59 8.73 8.73 9.48 9C10.24 9.27 10.91 9.68 11.49 10.25L14.5 13.14L12.9 14.71L10.07 11.94C9.68 11.55 9.23 11.27 8.73 11.1C8.22 10.93 7.69 10.85 7.14 10.85C5.77 10.85 4.61 11.34 3.67 12.34C2.72 13.34 2.25 14.54 2.25 15.94C2.25 17.36 2.72 18.58 3.65 19.61C4.58 20.64 5.74 21.15 7.14 21.15C7.68 21.15 8.2 21.07 8.7 20.9C9.2 20.73 9.66 20.46 10.06 20.09L20.51 10.25C21.09 9.68 21.76 9.27 22.52 9C23.27 8.73 24.04 8.59 24.83 8.59C26.85 8.59 28.55 9.31 29.93 10.75C31.31 12.19 32 13.91 32 15.93C32 17.98 31.31 19.73 29.93 21.2C28.55 22.67 26.85 23.41 24.83 23.41C24.04 23.41 23.27 23.28 22.5 23.02C21.73 22.76 21.07 22.35 20.51 21.79L17.58 18.89L19.16 17.32L21.94 20.09C22.3 20.46 22.74 20.73 23.25 20.9C23.77 21.07 24.29 21.15 24.83 21.15C26.22 21.15 27.39 20.64 28.34 19.61C29.28 18.58 29.75 17.36 29.75 15.94C29.75 14.54 29.27 13.34 28.32 12.34C27.37 11.35 26.2 10.85 24.83 10.85C24.29 10.85 23.77 10.94 23.27 11.14C22.76 11.33 22.32 11.61 21.94 11.97L11.49 21.82C10.91 22.36 10.23 22.76 9.47 23.02C8.7 23.28 7.93 23.41 7.14 23.41Z" fill="black" />
                </g>
              </mask>
            </defs>
            <circle cx="80" cy="80" r="80" fill="white" mask="url(#icon-cutout)" />
          </svg>
        </div>
      </MediaCardImage>
      <MediaCardContent>
        <MediaCardTitle>Card com gradiente animado</MediaCardTitle>
        <MediaCardMeta>
          <MediaCardMetaAction>Criativo</MediaCardMetaAction>
          <MediaCardMetaItem>Leitura de 4 minutos</MediaCardMetaItem>
        </MediaCardMeta>
      </MediaCardContent>
    </MediaCard>
  ),
}

/** Static image background. */
export const WithImage: Story = {
  decorators: [(Story) => <div className="w-[400px]"><Story /></div>],
  render: () => (
    <MediaCard>
      <MediaCardImage src="/banner-home-poster.png" alt="Earth from space" />
      <MediaCardContent>
        <MediaCardTitle>Card com imagem de fundo</MediaCardTitle>
        <MediaCardMeta>
          <MediaCardMetaAction>Fotografia</MediaCardMetaAction>
          <MediaCardMetaItem>Leitura de 6 minutos</MediaCardMetaItem>
        </MediaCardMeta>
      </MediaCardContent>
    </MediaCard>
  ),
}

/** Video background with poster fallback. */
export const WithVideo: Story = {
  decorators: [(Story) => <div className="w-[400px]"><Story /></div>],
  render: () => (
    <MediaCard>
      <MediaCardImage src="/banner-home.mp4" poster="/banner-home-poster.png" alt="Banner video" />
      <MediaCardContent>
        <MediaCardTitle>Card com vídeo de fundo</MediaCardTitle>
        <MediaCardMeta>
          <MediaCardMetaAction>Motion</MediaCardMetaAction>
          <MediaCardMetaItem>Leitura de 2 minutos</MediaCardMetaItem>
        </MediaCardMeta>
      </MediaCardContent>
    </MediaCard>
  ),
}

/** Grid layout - featured card + stacked smaller cards. */
export const GridMixed: Story = {
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="w-full max-w-[1200px] p-6">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1.5fr]">
      {/* Left column: portrait card */}
      <MediaCard>
        <MediaCardImage color="#0f172a" className="aspect-[2/3]" />
        <MediaCardContent>
          <MediaCardTitle>OpenAI e Amazon anunciam parceria estratégica</MediaCardTitle>
          <MediaCardMeta>
            <MediaCardMetaAction>Empresa</MediaCardMetaAction>
            <MediaCardMetaItem>Leitura de 5 minutos</MediaCardMetaItem>
          </MediaCardMeta>
        </MediaCardContent>
      </MediaCard>

      {/* Right column: stacked sm cards */}
      <div className="flex flex-col gap-4">
        <MediaCard>
          <MediaCardImage color="#1e293b" />
          <MediaCardContent>
            <MediaCardTitle>Escalando a IA para todos</MediaCardTitle>
            <MediaCardMeta>
              <MediaCardMetaAction>Empresa</MediaCardMetaAction>
              <MediaCardMetaItem>Leitura de 5 minutos</MediaCardMetaItem>
            </MediaCardMeta>
          </MediaCardContent>
        </MediaCard>

        <MediaCard>
          <MediaCardImage color="#162032" />
          <MediaCardContent>
            <MediaCardTitle>2026: o ano dos criadores silenciosos</MediaCardTitle>
            <MediaCardMeta>
              <MediaCardMetaItem>Transmitido em 27 de janeiro de 2026</MediaCardMetaItem>
            </MediaCardMeta>
          </MediaCardContent>
        </MediaCard>
      </div>
    </div>
  ),
}


// ---------------------------------------------------------------------------
// Horizontal variants - with or without description
// ---------------------------------------------------------------------------

/** Horizontal - thumbnail with check, meta + title. Timestamp badge is off by default (meta already describes duration). */
export const Horizontal: StoryObj<{ showTimestamp: boolean }> = {
  decorators: [(Story) => <div className="w-[420px]"><Story /></div>],
  args: {
    showTimestamp: false,
  },
  argTypes: {
    showTimestamp: {
      control: "boolean",
      description: "Show timestamp badge on image (off by default - meta already describes duration)",
    },
  },
  render: ({ showTimestamp }) => (
    <MediaCard variant="compact" orientation="horizontal">
      <MediaCardImage color="#1a1a2e">
        <MediaCardCheck checked={false} />
        {showTimestamp && (
          <MediaCardBadge className="absolute bottom-2 right-2 top-auto">
            <Badge variant="secondary" className="bg-[var(--surface-950)]">8:24</Badge>
          </MediaCardBadge>
        )}
      </MediaCardImage>
      <MediaCardContent>
        <MediaCardMeta>
          <MediaCardMetaItem>Aula gravada</MediaCardMetaItem>
          <MediaCardMetaItem>8 min</MediaCardMetaItem>
        </MediaCardMeta>
        <MediaCardTitle>Introdução ao Design System, fundamentos e arquitetura</MediaCardTitle>
      </MediaCardContent>
    </MediaCard>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("Introdução ao Design System, fundamentos e arquitetura")).toBeVisible()
    await expect(canvas.getByRole("checkbox")).toBeVisible()
  },
}

/** Horizontal with description - adds a secondary text line below the title. */
export const HorizontalWithDescription: StoryObj<{ showTimestamp: boolean }> = {
  decorators: [(Story) => <div className="w-[420px]"><Story /></div>],
  args: {
    showTimestamp: false,
  },
  argTypes: {
    showTimestamp: {
      control: "boolean",
      description: "Show timestamp badge on image (off by default - meta already describes duration)",
    },
  },
  render: ({ showTimestamp }) => (
    <MediaCard variant="compact" orientation="horizontal">
      <MediaCardImage color="#162032">
        <MediaCardCheck checked={false} />
        {showTimestamp && (
          <MediaCardBadge className="absolute bottom-2 right-2 top-auto">
            <Badge variant="secondary" className="bg-[var(--surface-950)]">15:32</Badge>
          </MediaCardBadge>
        )}
      </MediaCardImage>
      <MediaCardContent>
        <MediaCardMeta>
          <MediaCardMetaItem>Aula gravada</MediaCardMetaItem>
          <MediaCardMetaItem>15 min</MediaCardMetaItem>
        </MediaCardMeta>
        <MediaCardTitle>Tokens de cor, do Figma ao código</MediaCardTitle>
        <MediaCardDescription>
          Aprenda a extrair tokens de cor do Figma, converter para OKLCH e implementar no Tailwind CSS v4 com custom properties.
        </MediaCardDescription>
      </MediaCardContent>
    </MediaCard>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("Tokens de cor, do Figma ao código")).toBeVisible()
    await expect(canvas.getByText(/Aprenda a extrair tokens/)).toBeVisible()
  },
}

/** Lesson list - vertical stack of horizontal cards with mixed states. */
export const LessonList: Story = {
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="w-full max-w-[600px] p-6">
        <Story />
      </div>
    ),
  ],
  render: () => {
    const lessons = [
      { title: "Introdução ao Design System, fundamentos e arquitetura", meta: "Aula gravada", time: "8 min", checked: true, active: false },
      { title: "Anatomia de um componente, slots, variantes e composição", meta: "Aula gravada", time: "12 min", checked: true, active: false },
      { title: "Tokens de cor, do Figma ao código com OKLCH", meta: "Aula gravada", time: "15 min", checked: false, active: true },
      { title: "Variantes e estados, interação e feedback visual", meta: "Aula gravada", time: "10 min", checked: false, active: false },
      { title: "Acessibilidade na prática, WCAG, ARIA e testes", meta: "Aula ao vivo", time: "20 min", checked: false, active: false },
    ]
    return (
      <div className="flex flex-col gap-2">
        {lessons.map((lesson, i) => (
          <MediaCard
            key={i}
            variant="compact"
            orientation="horizontal"
            active={lesson.active}
          >
            <MediaCardImage
              color={["#1a1a2e", "#1e293b", "#162032", "#0f172a", "#1a1a2e"][i]}
            >
              <MediaCardCheck checked={lesson.checked} />
            </MediaCardImage>
            <MediaCardContent>
              <MediaCardMeta>
                <MediaCardMetaItem>{lesson.meta}</MediaCardMetaItem>
                <MediaCardMetaItem>{lesson.time}</MediaCardMetaItem>
              </MediaCardMeta>
              <MediaCardTitle>{lesson.title}</MediaCardTitle>
            </MediaCardContent>
          </MediaCard>
        ))}
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const checkboxes = canvas.getAllByRole("checkbox")
    await expect(checkboxes).toHaveLength(5)
    await expect(checkboxes[0]).toHaveAttribute("aria-checked", "true")
    await expect(checkboxes[2]).toHaveAttribute("aria-checked", "false")
  },
}

/** Responsive grid - cards auto-wrap based on available space using MediaCardGrid.
 *  Resize the viewport to see columns change: 1 → 2 → 3 → 4+. */
export const ResponsiveGrid: Story = {
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="w-full p-6">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <MediaCardGrid>
      {[
        { title: "Design Tokens na prática", category: "Design System", time: "32 min", color: "oklch(0.30 0.08 212.201)", badge: "68%" },
        { title: "Componentes compostos com Radix", category: "React", time: "48 min", color: "oklch(0.30 0.116 243.133)", badge: "45%" },
        { title: "Acessibilidade e ARIA patterns", category: "A11y", time: "1h 12min", color: "oklch(0.30 0.145 144.414)", badge: "22%" },
        { title: "Figma Variables e Design Tokens", category: "Figma", time: "1h 05min", color: "oklch(0.30 0.103 73.232)", badge: "15%" },
        { title: "Storybook: Testes visuais", category: "Testing", time: "8 min", color: "oklch(0.30 0.154 24.222)", badge: "90%" },
        { title: "Tailwind CSS 4: Novidades", category: "CSS", time: "55 min", color: "oklch(0.30 0.123 92.922)", badge: "33%" },
      ].map((item, i) => (
        <MediaCard key={i}>
          <MediaCardImage color={item.color}>
            <MediaCardBadge>
              <Badge variant="primary">{item.badge}</Badge>
            </MediaCardBadge>
          </MediaCardImage>
          <MediaCardContent>
            <MediaCardTitle>{item.title}</MediaCardTitle>
            <MediaCardMeta>
              <MediaCardMetaAction>{item.category}</MediaCardMetaAction>
              <MediaCardMetaItem>{item.time}</MediaCardMetaItem>
            </MediaCardMeta>
          </MediaCardContent>
        </MediaCard>
      ))}
    </MediaCardGrid>
  ),
}

/** Responsive grid with portrait cards - narrower min-width for denser packing. */
export const ResponsiveGridPortrait: Story = {
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="w-full p-6">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <MediaCardGrid style={{ "--media-card-grid-min": "200px" } as React.CSSProperties}>
      {[
        { title: "Design System do zero ao deploy", category: "Design System", lessons: "24 aulas", color: "oklch(0.30 0.057 6.005)" },
        { title: "React avançado: Patterns e performance", category: "React", lessons: "18 aulas", color: "oklch(0.30 0.161 37.732)" },
        { title: "Tailwind CSS 4: Novidades e migração", category: "CSS", lessons: "12 aulas", color: "oklch(0.30 0.08 212.201)" },
        { title: "Acessibilidade Web: WCAG 2.2 completo", category: "A11y", lessons: "16 aulas", color: "oklch(0.30 0.116 243.133)" },
        { title: "TypeScript para Design Engineers", category: "TypeScript", lessons: "20 aulas", color: "oklch(0.30 0.145 144.414)" },
        { title: "Figma avançado: Variables e Tokens", category: "Figma", lessons: "14 aulas", color: "oklch(0.30 0.103 73.232)" },
        { title: "Next.js 16: App Router e Server Actions", category: "Next.js", lessons: "22 aulas", color: "oklch(0.30 0.132 181.532)" },
        { title: "Motion Design para interfaces", category: "Motion", lessons: "10 aulas", color: "oklch(0.30 0.154 24.222)" },
      ].map((item, i) => (
        <MediaCard key={i}>
          <MediaCardImage color={item.color} className="aspect-[2/3]" />
          <MediaCardContent>
            <MediaCardTitle>{item.title}</MediaCardTitle>
            <MediaCardMeta>
              <MediaCardMetaAction>{item.category}</MediaCardMetaAction>
              <MediaCardMetaItem>{item.lessons}</MediaCardMetaItem>
            </MediaCardMeta>
          </MediaCardContent>
        </MediaCard>
      ))}
    </MediaCardGrid>
  ),
}

/** All card types side by side - default, compact, portrait. */
export const AllTypes: Story = {
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="flex flex-wrap items-start gap-6 p-6">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <>
      <div>
        <h3 className="mb-2 text-xs font-medium text-muted-foreground">
          compact - 120–180px, 1:1
        </h3>
        <MediaCard variant="compact">
          <MediaCardImage color="#1a1a2e" />
          <MediaCardContent>
            <MediaCardTitle>Virtudes da marca</MediaCardTitle>
            <MediaCardMeta>
              <MediaCardMetaAction>Ruan Braz</MediaCardMetaAction>
            </MediaCardMeta>
          </MediaCardContent>
        </MediaCard>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-medium text-muted-foreground">
          default - 16:9
        </h3>
        <div className="w-[360px]">
          <MediaCard>
            <MediaCardImage color="#1e293b" />
            <MediaCardContent>
              <MediaCardTitle>Escalando a IA para todos</MediaCardTitle>
              <MediaCardMeta>
                <MediaCardMetaAction>Empresa</MediaCardMetaAction>
                <MediaCardMetaItem>Leitura de 5 minutos</MediaCardMetaItem>
              </MediaCardMeta>
            </MediaCardContent>
          </MediaCard>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-medium text-muted-foreground">
          portrait - 2:3
        </h3>
        <div className="w-[280px]">
          <MediaCard>
            <MediaCardImage color="#0f172a" className="aspect-[2/3]" />
            <MediaCardContent>
              <MediaCardTitle>OpenAI e Amazon anunciam parceria estratégica</MediaCardTitle>
              <MediaCardMeta>
                <MediaCardMetaAction>Empresa</MediaCardMetaAction>
                <MediaCardMetaItem>Leitura de 5 minutos</MediaCardMetaItem>
              </MediaCardMeta>
            </MediaCardContent>
          </MediaCard>
        </div>
      </div>
    </>
  ),
}

/** All variants - vertical sizes + horizontal side by side. */
export const AllVariants: Story = {
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="flex flex-col gap-8 p-6">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <>
      {/* Vertical variants */}
      <div>
        <h3 className="mb-3 text-xs font-medium text-muted-foreground">Vertical - default, portrait, compact</h3>
        <div className="grid grid-cols-1 items-start gap-6 sm:grid-cols-3">
          <MediaCard>
            <MediaCardImage color="#1e293b" />
            <MediaCardContent>
              <MediaCardTitle>Escalando a IA para todos</MediaCardTitle>
              <MediaCardMeta>
                <MediaCardMetaAction>Empresa</MediaCardMetaAction>
                <MediaCardMetaItem>Leitura de 5 minutos</MediaCardMetaItem>
              </MediaCardMeta>
            </MediaCardContent>
          </MediaCard>
          <MediaCard>
            <MediaCardImage color="#0f172a" className="aspect-[2/3]" />
            <MediaCardContent>
              <MediaCardTitle>OpenAI e Amazon anunciam parceria</MediaCardTitle>
              <MediaCardMeta>
                <MediaCardMetaAction>Empresa</MediaCardMetaAction>
                <MediaCardMetaItem>Leitura de 5 minutos</MediaCardMetaItem>
              </MediaCardMeta>
            </MediaCardContent>
          </MediaCard>
          <MediaCard variant="compact">
            <MediaCardImage color="#1a1a2e" />
            <MediaCardContent>
              <MediaCardTitle>Virtudes da marca</MediaCardTitle>
              <MediaCardMeta><MediaCardMetaAction>Ruan Braz</MediaCardMetaAction></MediaCardMeta>
            </MediaCardContent>
          </MediaCard>
        </div>
      </div>

      {/* Horizontal */}
      <div>
        <h3 className="mb-3 text-xs font-medium text-muted-foreground">Horizontal</h3>
        <div className="flex flex-col gap-4">
          <div className="w-full max-w-[420px]">
            <MediaCard variant="compact" orientation="horizontal">
              <MediaCardImage color="#1a1a2e">
                <MediaCardCheck checked={false} />
              </MediaCardImage>
              <MediaCardContent>
                <MediaCardMeta>
                  <MediaCardMetaItem>Aula gravada</MediaCardMetaItem>
                  <MediaCardMetaItem>8 min</MediaCardMetaItem>
                </MediaCardMeta>
                <MediaCardTitle>Introdução ao Design System, fundamentos e arquitetura</MediaCardTitle>
              </MediaCardContent>
            </MediaCard>
          </div>
          <div className="w-full max-w-[420px]">
            <MediaCard variant="compact" orientation="horizontal" active>
              <MediaCardImage color="#1e293b">
                <MediaCardCheck checked />
              </MediaCardImage>
              <MediaCardContent>
                <MediaCardMeta>
                  <MediaCardMetaItem>Aula gravada</MediaCardMetaItem>
                  <MediaCardMetaItem>12 min</MediaCardMetaItem>
                </MediaCardMeta>
                <MediaCardTitle>Anatomia de um componente, slots e composição (active)</MediaCardTitle>
              </MediaCardContent>
            </MediaCard>
          </div>
        </div>
      </div>

      {/* Horizontal com descrição */}
      <div>
        <h3 className="mb-3 text-xs font-medium text-muted-foreground">Horizontal com descrição</h3>
        <div className="w-full max-w-[420px]">
          <MediaCard variant="compact" orientation="horizontal">
            <MediaCardImage color="#162032">
              <MediaCardCheck checked={false} />
            </MediaCardImage>
            <MediaCardContent>
              <MediaCardMeta>
                <MediaCardMetaItem>Aula gravada</MediaCardMetaItem>
              </MediaCardMeta>
              <MediaCardTitle>Tokens de cor, do Figma ao código</MediaCardTitle>
              <MediaCardDescription>
                Aprenda a extrair tokens de cor do Figma, converter para OKLCH e implementar no Tailwind CSS v4.
              </MediaCardDescription>
            </MediaCardContent>
          </MediaCard>
        </div>
      </div>
    </>
  ),
}
