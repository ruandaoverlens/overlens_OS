import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect, within } from "storybook/test"
import { Button } from "./button"
import {
  Banner,
  BannerImage,
  BannerContent,
  BannerTitle,
  BannerDescription,
  BannerActions,
} from "./banner"

const meta = {
  title: "Core Components/Banner",
  tags: ["autodocs"],
  component: Banner,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: [
          "Full-width hero banner with responsive layout, media backgrounds, and auto light/dark detection.",
          "",
          "## Responsive layout",
          "",
          "| Breakpoint | Layout |",
          "|-----------|--------|",
          "| **Mobile** (`< 768px`) | Stacked - image container (h-48) + content below |",
          "| **Desktop** (`≥ 768px`) | Single container with content overlaid on media |",
          "",
          "## Sizes",
          "",
          "| Size | Desktop height |",
          "|------|---------------|",
          "| `sm` | `280px` |",
          "| `md` | `400px` (default) |",
          "| `lg` | `500px` |",
          "",
          "## Background types",
          "",
          "| Prop | Behavior |",
          "|------|----------|",
          "| `src` (image) | Static image, `object-cover object-left` |",
          "| `src` (video) | Auto-captures first frame as poster, fades in when buffered |",
          "| `gradient` | Animated CSS gradient (`8s ease infinite`, `background-size: 300%`) |",
          "| `color` | Solid color background |",
          "",
          "## Light/dark auto-detection",
          "",
          "Banner auto-detects luminance from `color` or `gradient` hex values (threshold: `0.4`). On light backgrounds:",
          "- Text color switches to near-black (`oklch(0.15 0 0)`)",
          "- Title font-weight changes from `300` to `400`",
          "- Description font-weight changes from `300` to `500`",
          "- `BannerActions` auto-swaps button variants per breakpoint: mobile forces non-inverted (`inverted` → `default`, `inverted-outline` → `outline`) since content sits on dark bg; desktop forces inverted (`default` → `inverted`, `outline` → `inverted-outline`) since content overlays light bg",
          "",
          "## Key details",
          "",
          "- Media content gets a frosted glass blur overlay when `src` is present (`backdrop-blur-[10px]` with radial mask)",
          "- `BannerContent` uses CSS variables `--banner-fg`, `--banner-title-fw`, `--banner-desc-fw` for theming",
          "- Container has `rounded-[14px]` corners and `max-w-screen-2xl` constraint",
          "- Video uses `muted loop playsInline preload=\"auto\"` for autoplay compliance",
          "- **Buttons inside `BannerActions` must use `size=\"default\"` (medium, h-10)** - never `size=\"lg\"` or `size=\"sm\"`",
          "- **Smart typography**: `BannerTitle` uses `text-balance` (equal line lengths). `BannerDescription` has three layers of typographic intelligence: (1) short words (ou, e, a, de, do, da, se, por, que, com, etc.) are glued to the next word via non-breaking spaces so they never sit alone at end of line; (2) `useSmartWrap` hook anchors description width to the sibling title's rendered text width (measured via `Range.getClientRects()`) - if description is wider, it shrinks to match (allowing +1 line); (3) for multi-line text, binary-searches for the narrowest width that keeps the same line count, using the title width as lower bound. Works on every breakpoint including mobile",
          "- **Description font size**: `text-base` (16px) on all breakpoints",
          "- **Content max-width constraints**: `BannerTitle` uses `sm:max-w-[432px]` and `BannerDescription` uses `max-w-full` (mobile) / `sm:max-w-[25.5rem]` / `md:max-w-[23rem]` to prevent text from stretching too wide",
          "- **`mobileImage`** - boolean prop (default `true`). Set to `false` to hide the image on mobile, showing only the text content",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Banner height variant",
    },
    mobileImage: {
      control: "boolean",
      description: "Show image on mobile (default: true)",
    },
    children: { control: false },
    className: { control: "text" },
  },
} satisfies Meta<typeof Banner>

export default meta
type Story = StoryObj<typeof meta>

type BannerStoryArgs = {
  showCTA?: boolean
  mobileImage?: boolean
}

export const Default: Story = {
  args: { showCTA: true } as BannerStoryArgs,
  argTypes: {
    showCTA: {
      control: "boolean",
      description: "Show call-to-action button",
    },
  } as Record<string, unknown>,
  render: (_, { args }) => {
    const { showCTA } = args as unknown as BannerStoryArgs
    return (
      <Banner>
        <BannerContent>
          <BannerTitle>LIVES SEMANAIS</BannerTitle>
          <BannerDescription>
            Participe das lives semanais da Overlens e ganhe fractais. Replay gratuito por 7 dias.
          </BannerDescription>
          {showCTA && (
            <BannerActions>
              <Button variant="default" size="default">Ler o Manifesto</Button>
            </BannerActions>
          )}
        </BannerContent>
      </Banner>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const titles = canvas.getAllByRole("heading", { name: "LIVES SEMANAIS" })
    await expect(titles.length).toBeGreaterThanOrEqual(1)
  },
}

export const WithTwoActions: Story = {
  render: () => (
    <Banner>
      <BannerContent>
        <BannerTitle>LIVES SEMANAIS</BannerTitle>
        <BannerDescription>
          Participe das lives semanais da Overlens e ganhe fractais. Replay gratuito por 7 dias.
        </BannerDescription>
        <BannerActions>
          <Button variant="default" size="default">Ler o Manifesto</Button>
          <Button variant="outline" size="default">Saiba Mais</Button>
        </BannerActions>
      </BannerContent>
    </Banner>
  ),
}

export const WithImage: Story = {
  args: { showCTA: true, mobileImage: true } as BannerStoryArgs,
  argTypes: {
    showCTA: {
      control: "boolean",
      description: "Show call-to-action button",
    },
    mobileImage: {
      control: "boolean",
      description: "Show image on mobile",
    },
  } as Record<string, unknown>,
  render: (_, { args }) => {
    const { showCTA, mobileImage } = args as unknown as BannerStoryArgs
    return (
      <Banner size="lg" mobileImage={mobileImage}>
        <BannerImage
          src="/banner-home-poster.png"
          alt="Earth from space"
        />
        <BannerContent>
          <BannerTitle>BOAS-VINDAS À ERA DA CRIAÇÃO</BannerTitle>
          <BannerDescription>
            O briefing é claro: crie pela sua liberdade, ou assista o controle de perto.
          </BannerDescription>
          {showCTA && (
            <BannerActions>
              <Button variant="default" size="default">Ler o Manifesto</Button>
            </BannerActions>
          )}
        </BannerContent>
      </Banner>
    )
  },
}

export const WithVideo: Story = {
  args: { showCTA: true, mobileImage: true } as BannerStoryArgs,
  argTypes: {
    showCTA: {
      control: "boolean",
      description: "Show call-to-action button",
    },
    mobileImage: {
      control: "boolean",
      description: "Show image on mobile",
    },
  } as Record<string, unknown>,
  render: (_, { args }) => {
    const { showCTA, mobileImage } = args as unknown as BannerStoryArgs
    return (
      <Banner size="lg" mobileImage={mobileImage}>
        <BannerImage
          src="/banner-home.mp4"
          poster="/banner-home-poster.png"
          alt="Banner video"
        />
        <BannerContent>
          <BannerTitle>BOAS-VINDAS À ERA DA CRIAÇÃO</BannerTitle>
          <BannerDescription>
            O briefing é claro: crie pela sua liberdade, ou assista o controle de perto.
          </BannerDescription>
          {showCTA && (
            <BannerActions>
              <Button variant="default" size="default">Ler o Manifesto</Button>
            </BannerActions>
          )}
        </BannerContent>
      </Banner>
    )
  },
}

export const WithGradient: Story = {
  args: { showCTA: true, mobileImage: true } as BannerStoryArgs,
  argTypes: {
    showCTA: {
      control: "boolean",
      description: "Show call-to-action button",
    },
    mobileImage: {
      control: "boolean",
      description: "Show image on mobile",
    },
  } as Record<string, unknown>,
  render: (_, { args }) => {
    const { showCTA, mobileImage } = args as unknown as BannerStoryArgs
    return (
      <Banner size="lg" mobileImage={mobileImage}>
        <BannerImage
          gradient="linear-gradient(90deg, #D3EEF4, #F1EEC8, #F3A46C)"
        />
        <BannerContent>
          <BannerTitle>BOAS-VINDAS À ERA DA CRIAÇÃO</BannerTitle>
          <BannerDescription>
            O briefing é claro: crie pela sua liberdade, ou assista o controle de perto.
          </BannerDescription>
          {showCTA && (
            <BannerActions>
              <Button variant="inverted" size="default">Ler o Manifesto</Button>
            </BannerActions>
          )}
        </BannerContent>
      </Banner>
    )
  },
}

export const WithColor: Story = {
  args: { showCTA: true, mobileImage: true } as BannerStoryArgs,
  argTypes: {
    showCTA: {
      control: "boolean",
      description: "Show call-to-action button",
    },
    mobileImage: {
      control: "boolean",
      description: "Show image on mobile",
    },
  } as Record<string, unknown>,
  render: (_, { args }) => {
    const { showCTA, mobileImage } = args as unknown as BannerStoryArgs
    return (
      <Banner size="lg" mobileImage={mobileImage}>
        <BannerImage color="#D3EEF4" />
        <BannerContent>
          <BannerTitle>BOAS-VINDAS À ERA DA CRIAÇÃO</BannerTitle>
          <BannerDescription>
            O briefing é claro: crie pela sua liberdade, ou assista o controle de perto.
          </BannerDescription>
          {showCTA && (
            <BannerActions>
              <Button variant="inverted" size="default">Ler o Manifesto</Button>
            </BannerActions>
          )}
        </BannerContent>
      </Banner>
    )
  },
}

export const WithColorDark: Story = {
  args: { showCTA: true, mobileImage: true } as BannerStoryArgs,
  argTypes: {
    showCTA: {
      control: "boolean",
      description: "Show call-to-action button",
    },
    mobileImage: {
      control: "boolean",
      description: "Show image on mobile",
    },
  } as Record<string, unknown>,
  render: (_, { args }) => {
    const { showCTA, mobileImage } = args as unknown as BannerStoryArgs
    return (
      <Banner size="lg" mobileImage={mobileImage}>
        <BannerImage color="#1a1a2e" />
        <BannerContent>
          <BannerTitle>BOAS-VINDAS À ERA DA CRIAÇÃO</BannerTitle>
          <BannerDescription>
            O briefing é claro: crie pela sua liberdade, ou assista o controle de perto.
          </BannerDescription>
          {showCTA && (
            <BannerActions>
              <Button variant="default" size="default">Ler o Manifesto</Button>
            </BannerActions>
          )}
        </BannerContent>
      </Banner>
    )
  },
}

export const Sizes: Story = {
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="flex w-full flex-col gap-6 p-4">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <>
      {(["sm", "md", "lg"] as const).map((size) => (
        <div key={size}>
          <h3 className="mb-2 text-sm font-medium text-muted-foreground">
            size=&quot;{size}&quot;
          </h3>
          <Banner size={size}>
            <BannerContent>
              <BannerTitle>BANNER {size.toUpperCase()}</BannerTitle>
              <BannerDescription>
                O briefing é claro: crie pela sua liberdade, ou assista o controle de perto.
              </BannerDescription>
            </BannerContent>
          </Banner>
        </div>
      ))}
    </>
  ),
}

/** Smart typography - demonstrates non-breaking spaces on short words, smart width adjustment, and orphan prevention. */
export const SmartTypography: Story = {
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="flex w-full flex-col gap-8 p-4">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <>
      <div>
        <h3 className="mb-2 text-sm font-medium text-muted-foreground">Short copy - tight block</h3>
        <Banner>
          <BannerContent>
            <BannerTitle>LIVES SEMANAIS</BannerTitle>
            <BannerDescription>
              Participe e ganhe fractais toda semana.
            </BannerDescription>
            <BannerActions>
              <Button variant="default" size="default">Participar</Button>
            </BannerActions>
          </BannerContent>
        </Banner>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium text-muted-foreground">Medium copy - short words glued (ou, de)</h3>
        <Banner>
          <BannerContent>
            <BannerTitle>BOAS-VINDAS À ERA DA CRIAÇÃO</BannerTitle>
            <BannerDescription>
              O briefing é claro: crie pela sua liberdade, ou assista o controle de perto.
            </BannerDescription>
            <BannerActions>
              <Button variant="default" size="default">Ler o Manifesto</Button>
            </BannerActions>
          </BannerContent>
        </Banner>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium text-muted-foreground">Long copy - smart width rebalance</h3>
        <Banner size="lg">
          <BannerImage gradient="linear-gradient(90deg, #D3EEF4, #F1EEC8, #F3A46C)" />
          <BannerContent>
            <BannerTitle>A REVOLUÇÃO COMEÇA AQUI</BannerTitle>
            <BannerDescription>
              Cada linha de código, cada pixel, cada decisão de design. Tudo converge para criar experiências que transformam a maneira como vivemos.
            </BannerDescription>
            <BannerActions>
              <Button variant="inverted" size="default">Explorar</Button>
              <Button variant="inverted-outline" size="default">Saiba Mais</Button>
            </BannerActions>
          </BannerContent>
        </Banner>
      </div>
    </>
  ),
}

export const AllVariants: Story = {
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="flex w-full flex-col gap-8 p-4">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <>
      <div>
        <h3 className="mb-2 text-sm font-medium text-muted-foreground">Default (no background)</h3>
        <Banner>
          <BannerContent>
            <BannerTitle>LIVES SEMANAIS</BannerTitle>
            <BannerDescription>
              Participe das lives semanais da Overlens e ganhe fractais. Replay gratuito por 7 dias.
            </BannerDescription>
          </BannerContent>
        </Banner>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium text-muted-foreground">Image + CTA</h3>
        <Banner size="lg">
          <BannerImage src="/banner-home-poster.png" alt="Earth from space" />
          <BannerContent>
            <BannerTitle>BOAS-VINDAS À ERA DA CRIAÇÃO</BannerTitle>
            <BannerDescription>
              O briefing é claro: crie pela sua liberdade, ou assista o controle de perto.
            </BannerDescription>
            <BannerActions>
              <Button variant="default" size="default">Ler o Manifesto</Button>
            </BannerActions>
          </BannerContent>
        </Banner>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium text-muted-foreground">Video + CTA</h3>
        <Banner size="lg">
          <BannerImage src="/banner-home.mp4" poster="/banner-home-poster.png" alt="Banner video" />
          <BannerContent>
            <BannerTitle>BOAS-VINDAS À ERA DA CRIAÇÃO</BannerTitle>
            <BannerDescription>
              O briefing é claro: crie pela sua liberdade, ou assista o controle de perto.
            </BannerDescription>
            <BannerActions>
              <Button variant="default" size="default">Ler o Manifesto</Button>
            </BannerActions>
          </BannerContent>
        </Banner>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium text-muted-foreground">Gradient (light)</h3>
        <Banner size="lg">
          <BannerImage gradient="linear-gradient(90deg, #D3EEF4, #F1EEC8, #F3A46C)" />
          <BannerContent>
            <BannerTitle>BOAS-VINDAS À ERA DA CRIAÇÃO</BannerTitle>
            <BannerDescription>
              O briefing é claro: crie pela sua liberdade, ou assista o controle de perto.
            </BannerDescription>
            <BannerActions>
              <Button variant="inverted" size="default">Ler o Manifesto</Button>
            </BannerActions>
          </BannerContent>
        </Banner>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium text-muted-foreground">Color light</h3>
        <Banner size="lg">
          <BannerImage color="#D3EEF4" />
          <BannerContent>
            <BannerTitle>BOAS-VINDAS À ERA DA CRIAÇÃO</BannerTitle>
            <BannerDescription>
              O briefing é claro: crie pela sua liberdade, ou assista o controle de perto.
            </BannerDescription>
            <BannerActions>
              <Button variant="inverted" size="default">Ler o Manifesto</Button>
            </BannerActions>
          </BannerContent>
        </Banner>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium text-muted-foreground">Color dark</h3>
        <Banner size="lg">
          <BannerImage color="#1a1a2e" />
          <BannerContent>
            <BannerTitle>BOAS-VINDAS À ERA DA CRIAÇÃO</BannerTitle>
            <BannerDescription>
              O briefing é claro: crie pela sua liberdade, ou assista o controle de perto.
            </BannerDescription>
            <BannerActions>
              <Button variant="default" size="default">Ler o Manifesto</Button>
            </BannerActions>
          </BannerContent>
        </Banner>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium text-muted-foreground">Sizes: sm / md / lg</h3>
        <div className="flex flex-col gap-4">
          {(["sm", "md", "lg"] as const).map((size) => (
            <Banner key={size} size={size}>
              <BannerContent>
                <BannerTitle>BANNER {size.toUpperCase()}</BannerTitle>
                <BannerDescription>
                  O briefing é claro: crie pela sua liberdade, ou assista o controle de perto.
                </BannerDescription>
                <BannerActions>
                  <Button variant="default" size="default">Ler o Manifesto</Button>
                </BannerActions>
              </BannerContent>
            </Banner>
          ))}
        </div>
      </div>
    </>
  ),
}

