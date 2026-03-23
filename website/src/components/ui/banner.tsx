import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// --- Luminance utilities ---

/** Parse a hex color (#RGB, #RRGGBB) to [r, g, b] 0-255. */
function hexToRgb(hex: string): [number, number, number] | null {
  const h = hex.replace("#", "")
  if (h.length === 3) {
    return [
      parseInt(h[0] + h[0], 16),
      parseInt(h[1] + h[1], 16),
      parseInt(h[2] + h[2], 16),
    ]
  }
  if (h.length === 6) {
    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16),
    ]
  }
  return null
}

/** Relative luminance (WCAG 2.1). Returns 0 (black) to 1 (white). */
function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r / 255, g / 255, b / 255].map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  )
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/** Extract hex colors from a CSS gradient or color string. */
function extractColors(value: string): string[] {
  const matches = value.match(/#(?:[0-9a-fA-F]{3}){1,2}/g)
  return matches ?? []
}

/** Check if a color/gradient is "light" (luminance > 0.5). */
function isLightBackground(value: string): boolean {
  const colors = extractColors(value)
  if (colors.length === 0) return false
  const avgLuminance =
    colors.reduce((sum, hex) => {
      const rgb = hexToRgb(hex)
      return sum + (rgb ? relativeLuminance(...rgb) : 0)
    }, 0) / colors.length
  return avgLuminance > 0.4
}

// --- Context ---

const BannerContext = React.createContext({ hasMedia: false, isLight: false, size: "md" as "sm" | "md" | "lg" })

// --- Component variants ---

const bannerVariants = cva(
  "",
  {
    variants: {
      size: {
        sm: "md:h-[280px]",
        md: "md:h-[400px]",
        lg: "md:h-[500px]",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

/**
 * Full-width banner.
 * Mobile: two separate containers (image + content).
 * Desktop (md+): single container with overlay.
 * Auto-detects light/dark backgrounds from color/gradient props.
 */
function Banner({
  className,
  size = "md",
  mobileImage = true,
  children,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof bannerVariants> & { mobileImage?: boolean }) {
  const imageChildren: React.ReactNode[] = []
  const contentChildren: React.ReactNode[] = []
  let isLight = false
  let hasMedia = false

  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child)) {
      const slot = (child.type as unknown as Record<string, unknown>)?.displayName
      if (slot === "banner-image" || slot === "banner-overlay") {
        const childProps = child.props as Record<string, unknown>
        // Detect if image/video media is present (not just color/gradient)
        if (childProps.src) {
          hasMedia = true
        }
        // Detect luminance from color/gradient props
        const colorValue =
          (childProps.color as string) ?? (childProps.gradient as string)
        if (colorValue && isLightBackground(colorValue)) {
          isLight = true
        }
        imageChildren.push(child)
        return
      }
    }
    contentChildren.push(child)
  })

  const fgStyle = isLight
    ? ({
        "--banner-fg": "oklch(0.15 0 0)",
        "--banner-title-fw": "400",
        "--banner-desc-fw": "500",
      } as React.CSSProperties)
    : undefined

  return (
    <div data-slot="banner" data-variant={size} className="w-full max-w-[1920px] mx-auto p-3">
      <BannerContext value={{ hasMedia, isLight, size: size ?? "md" }}>
        {/* Mobile layout */}
        <div
          className="flex flex-col md:hidden"
        >
          {mobileImage && (
            <div className="relative overflow-hidden rounded-[14px] h-48 bg-[var(--surface-950)] shrink-0">
              {imageChildren}
            </div>
          )}
          <div>
            {contentChildren}
          </div>
        </div>

        {/* Desktop layout */}
        <div
          className={cn(
            "@container hidden md:block relative w-full overflow-hidden rounded-[14px] bg-[var(--surface-950)]",
            bannerVariants({ size }),
            className
          )}
          style={fgStyle}
          {...props}
        >
          {imageChildren.length > 0 && (
            <div className="absolute inset-0">
              {imageChildren}
            </div>
          )}
          {contentChildren}
        </div>
      </BannerContext>
    </div>
  )
}

const VIDEO_EXTENSIONS = /\.(mp4|webm|ogg|mov)(\?|$)/i

/** Background media for the banner - supports image, video, animated gradient, and solid color.
 *  Video: captures first frame as poster, fades in when ready to play.
 *  Gradient: animated CSS gradient background.
 *  Color: solid background color. */
function BannerImage({
  className,
  src,
  alt = "",
  poster,
  gradient,
  color,
  ...props
}: React.ComponentProps<"div"> & {
  src?: string
  alt?: string
  poster?: string
  gradient?: string
  color?: string
}) {
  const isVideo = src ? VIDEO_EXTENSIONS.test(src) : false
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [frameReady, setFrameReady] = React.useState(false)
  const [videoReady, setVideoReady] = React.useState(false)

  // Capture first frame to canvas as poster
  const handleLoadedData = React.useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.drawImage(video, 0, 0)
      setFrameReady(true)
    }
  }, [])

  // Video buffered enough to play
  const handleCanPlayThrough = React.useCallback(() => {
    setVideoReady(true)
    videoRef.current?.play()
  }, [])

  return (
    <div
      data-slot="banner-image"
      className={cn("absolute inset-0", className)}
      {...props}
    >
      {color && (
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ backgroundColor: color }}
        />
      )}
      {gradient && (
        <div
          aria-hidden="true"
          className="absolute inset-0 animate-[banner-gradient_8s_ease_infinite] [background-size:300%_300%]"
          style={{ backgroundImage: gradient }}
        />
      )}
      {src && !isVideo && (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover object-left"
        />
      )}
      {src && isVideo && (
        <>
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className={cn(
              "absolute inset-0 h-full w-full object-cover object-left transition-opacity duration-500",
              frameReady ? "opacity-100" : "opacity-0"
            )}
          />
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            muted
            loop
            playsInline
            preload="auto"
            onLoadedData={handleLoadedData}
            onCanPlayThrough={handleCanPlayThrough}
            className={cn(
              "absolute inset-0 h-full w-full object-cover object-left transition-opacity duration-700",
              videoReady ? "opacity-100" : "opacity-0"
            )}
          />
        </>
      )}
    </div>
  )
}
BannerImage.displayName = "banner-image"

/** Gradient overlay on top of the banner image. */
function BannerOverlay({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="banner-overlay"
      className={cn(
        "absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent",
        className
      )}
      {...props}
    />
  )
}
BannerOverlay.displayName = "banner-overlay"

/** Content area - flow in mobile, overlay with frosted glass in desktop.
 *  Text color adapts via --banner-fg CSS variable set by Banner. */
function BannerContent({
  className,
  children,
  ...props
}: React.ComponentProps<"header">) {
  const { hasMedia, size } = React.useContext(BannerContext)

  return (
    <header
      data-slot="banner-content"
      className={cn(
        "relative flex flex-col justify-center px-0 py-5 md:absolute md:inset-y-0 md:w-full md:px-6 md:py-6",
        size === "sm" && "md:pb-7",
        className
      )}
      {...props}
    >
      {hasMedia && (
        <>
          <div
            aria-hidden="true"
            className="hidden md:block absolute inset-0 rounded-[14px] backdrop-blur-[10px] [mask-image:radial-gradient(circle_at_0%_50%,black_30%,transparent_90%)] z-0 select-none pointer-events-none"
          />
          <div
            aria-hidden="true"
            className="hidden md:block absolute inset-0 rounded-[14px] bg-[radial-gradient(circle_at_0%_50%,rgba(255,255,255,0.05)_30%,transparent_90%)] z-0 select-none pointer-events-none"
          />
        </>
      )}
      <section className="w-full flex flex-col justify-center gap-4">
        {children}
      </section>
    </header>
  )
}

/** Banner heading - uppercase, font-heading (Outfit). */
function BannerTitle({
  className,
  ...props
}: React.ComponentProps<"h1">) {
  return (
    <h1
      data-slot="banner-title"
      className={cn(
        "z-[1] px-1 md:px-0 md:pl-1 max-w-full sm:max-w-[432px] text-balance font-heading uppercase text-[2.25rem] sm:text-[2.25rem] md:text-[2.5rem] leading-[120%] text-[var(--banner-fg,var(--foreground))] font-[var(--banner-title-fw,300)]",
        className
      )}
      {...props}
    />
  )
}

/**
 * Smart text-wrap hook - anchors description width to the sibling title.
 *
 * 1. **Title anchor**: if the description fits on 1 line but is wider than
 *    the title's rendered text, it shrinks to match the title width (allowing
 *    +1 line). If that adds too many lines, binary-searches for the closest fit.
 * 2. **Line elimination**: tries widening up to 20 % to drop a line when a
 *    single word overflows.
 * 3. **Line balancing**: binary-searches for the narrowest width that keeps
 *    the same line count, using the title width as lower bound when available.
 *
 * Works on every breakpoint (mobile included) and with any text/language.
 */
function useSmartWrap(ref: React.RefObject<HTMLElement | null>) {
  React.useEffect(() => {
    const el = ref.current
    if (!el) return

    // Reset any previous inline max-width so we measure the CSS value
    el.style.maxWidth = ""

    /** Count visual lines using scrollHeight and computed lineHeight. */
    const countLines = () => {
      const style = getComputedStyle(el)
      const lh = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.5
      return { lineCount: Math.round(el.scrollHeight / lh), lineHeight: lh }
    }

    const measure = () => {
      el.style.maxWidth = ""
      const { lineCount: naturalLines } = countLines()
      const naturalWidth = el.offsetWidth

      // Find sibling title and measure its actual rendered text width
      // (offsetWidth returns the box width, not the text width)
      const title = el.closest("[data-slot='banner-content']")?.querySelector<HTMLElement>("[data-slot='banner-title']")
      let titleWidth = 0
      if (title) {
        const range = document.createRange()
        range.selectNodeContents(title)
        const rects = Array.from(range.getClientRects())
        if (rects.length > 0) {
          titleWidth = Math.max(...rects.map(r => r.width))
        }
      }

      // If text fits in 1 line but is wider than the title, try to wrap it
      // to match the title width (allowing +1 line).
      if (naturalLines < 2 && titleWidth > 0 && naturalWidth > titleWidth * 1.15) {
        el.style.maxWidth = `${titleWidth}px`
        const { lineCount: wrappedLines } = countLines()
        // Accept if it only adds 1 line; otherwise binary search
        // for the narrowest width that stays within +1 line
        if (wrappedLines <= naturalLines + 1) return

        // Title width added too many lines - find best width between title and natural
        let lo = titleWidth
        let hi = naturalWidth
        let best = naturalWidth
        while (lo <= hi) {
          const mid = Math.round((lo + hi) / 2)
          el.style.maxWidth = `${mid}px`
          if (countLines().lineCount <= naturalLines + 1) {
            best = mid
            hi = mid - 1
          } else {
            lo = mid + 1
          }
        }
        el.style.maxWidth = `${best}px`
        return
      }

      // Only balance multi-line text
      if (naturalLines < 2) return

      // Strategy 1 - Eliminate a line by widening (up to 20% of natural width).
      const maxGrow = Math.round(naturalWidth * 0.2)
      for (let grow = 4; grow <= maxGrow; grow += 4) {
        el.style.maxWidth = `${naturalWidth + grow}px`
        if (countLines().lineCount < naturalLines) return
      }
      el.style.maxWidth = ""

      // Strategy 2 - Balance lines by binary-searching for the narrowest width
      // that keeps the same line count. Naturally redistributes text so
      // all lines are roughly equal length.
      // Use title width as lower bound if available and reasonable.
      const loBound = titleWidth > 0 && titleWidth >= naturalWidth * 0.4
        ? titleWidth
        : Math.round(naturalWidth * 0.5)

      let lo = loBound
      let hi = naturalWidth
      let best = naturalWidth

      while (lo <= hi) {
        const mid = Math.round((lo + hi) / 2)
        el.style.maxWidth = `${mid}px`
        if (countLines().lineCount <= naturalLines) {
          best = mid
          hi = mid - 1
        } else {
          lo = mid + 1
        }
      }

      el.style.maxWidth = `${best}px`
    }

    // Run after layout
    requestAnimationFrame(measure)

    // Re-run on resize
    const observer = new ResizeObserver(() => {
      el.style.maxWidth = ""
      requestAnimationFrame(measure)
    })
    observer.observe(el.parentElement ?? el)

    return () => observer.disconnect()
  }, [ref])
}

/** Short words that should never sit alone at the end of a line - glued to the NEXT word via non-breaking space. */
const SHORT_WORDS = /\s(ou|e|a|o|à|é|se|de|do|da|no|na|em|um|por|que|os|as|ao|às|dos|das|nos|nas|uns|com)\s/gi

/** Replace the space AFTER short words with a non-breaking space so they stay with the next word. */
function preventShortWordBreaks(node: React.ReactNode): React.ReactNode {
  if (typeof node === "string") {
    return node.replace(SHORT_WORDS, (_, word) => ` ${word}\u00A0`)
  }
  if (Array.isArray(node)) {
    return node.map(preventShortWordBreaks)
  }
  return node
}

/** Banner description - smart text wrapping to avoid orphans, font-light. */
function BannerDescription({
  className,
  children,
  ...props
}: React.ComponentProps<"h2">) {
  const descRef = React.useRef<HTMLHeadingElement>(null)
  useSmartWrap(descRef)

  return (
    <h2
      ref={descRef}
      data-slot="banner-description"
      className={cn(
        "z-[1] px-1 md:px-0 md:pl-1 max-w-full sm:max-w-[25.5rem] md:max-w-[23rem] text-pretty text-base leading-relaxed text-[var(--banner-fg,var(--foreground))] font-[var(--banner-desc-fw,300)] opacity-80",
        className
      )}
      {...props}
    >
      {preventShortWordBreaks(children)}
    </h2>
  )
}

/** Container for banner action buttons (CTA). */
function BannerActions({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const { isLight } = React.useContext(BannerContext)

  if (!isLight) {
    return (
      <div
        data-slot="banner-actions"
        className={cn("z-[1] mt-1 flex flex-wrap items-center gap-2", className)}
        {...props}
      >
        {children}
      </div>
    )
  }

  // Light background - two swap maps:
  // Desktop: content overlays light bg → ensure inverted variants
  // Mobile: content sits below image on dark bg → ensure non-inverted variants
  const swapVariant = (nodes: React.ReactNode, map: Record<string, string>) =>
    React.Children.map(nodes, (child) => {
      if (React.isValidElement(child)) {
        const childProps = child.props as Record<string, unknown>
        const v = (childProps.variant as string) ?? "default"
        if (v in map) {
          return React.cloneElement(child as React.ReactElement<Record<string, unknown>>, { variant: map[v] })
        }
      }
      return child
    })

  const toInverted: Record<string, string> = {
    default: "inverted",
    outline: "inverted-outline",
  }
  const toDark: Record<string, string> = {
    inverted: "default",
    "inverted-outline": "outline",
  }

  return (
    <div
      data-slot="banner-actions"
      className={cn("z-[1] mt-1 flex flex-wrap items-center gap-2", className)}
      {...props}
    >
      {/* Mobile: force non-inverted (content sits on dark bg below image) */}
      <div className="contents md:hidden">{swapVariant(children, toDark)}</div>
      {/* Desktop: force inverted (content overlays light bg) */}
      <div className="hidden md:contents">{swapVariant(children, toInverted)}</div>
    </div>
  )
}

export {
  Banner,
  BannerImage,
  BannerOverlay,
  BannerContent,
  BannerTitle,
  BannerDescription,
  BannerActions,
  bannerVariants,
}
