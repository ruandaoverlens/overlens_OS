import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect, within, userEvent } from "storybook/test"
import Autoplay from "embla-carousel-autoplay"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselDots,
} from "@/components/ui/carousel"
import { Card, CardContent } from "@/components/ui/card"

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: "Core Components/Carousel",
  tags: ["autodocs"],
  component: Carousel,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Carousel component built on top of [Embla Carousel](https://www.embla-carousel.com/).",
          "",
          "## Features",
          "",
          "- **Touch & drag** - drag-free by default (stops where you release); arrow buttons still snap to slides",
          "- **Keyboard navigation** - arrow keys to navigate between slides",
          "- **Loop mode** - infinite wrapping via `opts={{ loop: true }}`",
          "- **Autoplay** - via `embla-carousel-autoplay` plugin",
          "- **Vertical orientation** - `orientation=\"vertical\"`",
          "- **Multiple slides** - control visible count with `basis-*` on `CarouselItem`",
          "- **Snap mode** - opt back into snap-to-slide via `opts={{ dragFree: false }}`",
          "- **Dot indicators** - `CarouselDots` with active state and click-to-navigate",
          "- **Hover nav buttons** - chevron buttons appear on hover, hidden by default",
          "- **Accessible** - `role=\"region\"`, `aria-roledescription=\"carousel\"` / `\"slide\"`",
          "- **Edge-to-edge mobile** - first/last items get extra padding on mobile only, no lateral padding on carousel sections",
          "- **Built-in heading** - `title` and `subtitle` props render a `Heading` with responsive padding",
          "",
          "## Anatomy",
          "",
          "```tsx",
          '<Carousel opts={{ loop: true }}>',
          "  <CarouselContent>",
          "    <CarouselItem>Slide 1</CarouselItem>",
          "    <CarouselItem>Slide 2</CarouselItem>",
          "  </CarouselContent>",
          "  <CarouselPrevious />     {/* hover-only nav */}",
          "  <CarouselNext />",
          "  <CarouselDots />         {/* dot indicators */}",
          "</Carousel>",
          "```",
          "",
          "## Sub-components",
          "",
          "| Component | Description |",
          "|---|---|",
          "| `Carousel` | Root provider - accepts `opts`, `plugins`, `orientation`, `setApi` |",
          "| `CarouselContent` | Viewport + slide container (renders Embla ref internally) |",
          "| `CarouselItem` | Individual slide - use `basis-*` classes for multi-slide layouts |",
          "| `CarouselPrevious` | Previous button - appears on hover, disabled at start |",
          "| `CarouselNext` | Next button - appears on hover, disabled at end |",
          "| `CarouselDots` | Dot indicators - hidden when single slide |",
          "",
          "## Embla options",
          "",
          "Pass any [Embla option](https://www.embla-carousel.com/api/options/) via `opts`:",
          "",
          "```tsx",
          "<Carousel opts={{ loop: true, align: 'start', dragFree: false }} />",
          "```",
          "",
          "## Plugins",
          "",
          "Pass Embla plugins via the `plugins` prop:",
          "",
          "```tsx",
          "import Autoplay from 'embla-carousel-autoplay'",
          "",
          "<Carousel plugins={[Autoplay({ delay: 3000 })]} />",
          "```",
          "",
          "## API access",
          "",
          "Use `setApi` or the `useCarousel()` hook for programmatic control:",
          "",
          "```tsx",
          "const [api, setApi] = useState<CarouselApi>()",
          "<Carousel setApi={setApi}>...</Carousel>",
          "```",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof Carousel>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SLIDE_COLORS = [
  "bg-[var(--surface-800)]",
  "bg-[var(--surface-700)]",
  "bg-[var(--surface-600)]",
  "bg-[var(--surface-800)]",
  "bg-[var(--surface-700)]",
]

function SlideCard({ index, className }: { index: number; className?: string }) {
  return (
    <Card className={className}>
      <CardContent className="flex aspect-[16/9] items-center justify-center p-6">
        <span className="text-3xl font-heading font-semibold text-foreground/60">
          {index + 1}
        </span>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Default carousel with 5 slides, nav buttons, and dots. */
export const Default: Story = {
  render: () => (
    <div className="w-full max-w-sm">
      <Carousel title="Slides" subtitle="Navigate through slides using arrows or dots.">
        <CarouselContent>
          {SLIDE_COLORS.map((bg, i) => (
            <CarouselItem key={i}>
              <SlideCard index={i} className={bg} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
        <CarouselDots />
      </Carousel>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const region = canvas.getByRole("region")
    await expect(region).toHaveAttribute("aria-roledescription", "carousel")

    const slides = canvas.getAllByRole("group")
    await expect(slides.length).toBe(5)

    const nextBtn = canvas.getByRole("button", { name: "Next slide" })
    await expect(nextBtn).toBeInTheDocument()
  },
}

/** Carousel without title or subtitle. */
export const WithoutTitle: Story = {
  render: () => (
    <div className="w-full max-w-sm">
      <Carousel>
        <CarouselContent>
          {SLIDE_COLORS.map((bg, i) => (
            <CarouselItem key={i}>
              <SlideCard index={i} className={bg} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
        <CarouselDots />
      </Carousel>
    </div>
  ),
}

/** Title only, no subtitle. */
export const TitleOnly: Story = {
  render: () => (
    <div className="w-full max-w-sm">
      <Carousel title="Featured">
        <CarouselContent>
          {SLIDE_COLORS.map((bg, i) => (
            <CarouselItem key={i}>
              <SlideCard index={i} className={bg} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
        <CarouselDots />
      </Carousel>
    </div>
  ),
}

/** Loop mode - carousel wraps around infinitely. */
export const Loop: Story = {
  render: () => (
    <div className="w-full max-w-sm">
      <Carousel opts={{ loop: true }} title="Loop mode">
        <CarouselContent>
          {SLIDE_COLORS.map((bg, i) => (
            <CarouselItem key={i}>
              <SlideCard index={i} className={bg} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
        <CarouselDots />
      </Carousel>
    </div>
  ),
}

/** Autoplay - slides advance automatically. Pauses on hover/focus. */
export const WithAutoplay: Story = {
  render: () => (
    <div className="w-full max-w-sm">
      <Carousel
        opts={{ loop: true }}
        plugins={[
          Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true }),
        ]}
      >
        <CarouselContent>
          {SLIDE_COLORS.map((bg, i) => (
            <CarouselItem key={i}>
              <SlideCard index={i} className={bg} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselDots />
      </Carousel>
    </div>
  ),
}

/** Multiple slides visible at once with peek effect and edge fades. */
export const MultipleSlides: Story = {
  render: () => (
    <div className="w-full max-w-2xl">
      <Carousel opts={{ align: "start" }} title="Multiple slides" subtitle="Showing 3 slides at once.">
        <CarouselContent>
          {Array.from({ length: 8 }, (_, i) => (
            <CarouselItem key={i} className="basis-1/3">
              <SlideCard index={i} className={SLIDE_COLORS[i % SLIDE_COLORS.length]} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  ),
}

/** Vertical carousel - scrolls up and down. */
export const Vertical: Story = {
  render: () => (
    <div className="w-full max-w-xs py-12">
      <Carousel orientation="vertical">
        <CarouselContent className="h-[200px]">
          {SLIDE_COLORS.map((bg, i) => (
            <CarouselItem key={i}>
              <SlideCard index={i} className={bg} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  ),
}

/** Snap mode - overrides the default drag-free behavior to snap to slides. */
export const SnapMode: Story = {
  render: () => (
    <div className="w-full max-w-2xl">
      <Carousel opts={{ dragFree: false }}>
        <CarouselContent>
          {Array.from({ length: 8 }, (_, i) => (
            <CarouselItem key={i} className="basis-1/4">
              <SlideCard index={i} className={SLIDE_COLORS[i % SLIDE_COLORS.length]} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  ),
}

/** Navigation test - verifies prev/next buttons work correctly. */
export const NavigationTest: Story = {
  render: () => (
    <div className="w-full max-w-sm">
      <Carousel>
        <CarouselContent>
          {SLIDE_COLORS.map((bg, i) => (
            <CarouselItem key={i}>
              <SlideCard index={i} className={bg} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
        <CarouselDots />
      </Carousel>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const prevBtn = canvas.getByRole("button", { name: "Previous slide" })
    const nextBtn = canvas.getByRole("button", { name: "Next slide" })

    // Initially on first slide - prev should be disabled
    await expect(prevBtn).toBeDisabled()
    await expect(nextBtn).not.toBeDisabled()

    // Click next
    await userEvent.click(nextBtn)

    // After small delay for animation, prev should be enabled
    await new Promise((r) => setTimeout(r, 400))
    await expect(prevBtn).not.toBeDisabled()

    // Dot indicators should exist
    const dots = canvas.getAllByRole("tab")
    await expect(dots.length).toBe(5)
  },
}
