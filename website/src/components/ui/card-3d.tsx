import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Badge, type badgeVariants } from "./badge"

// --- Color utilities ---

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>

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

function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r / 255, g / 255, b / 255].map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  )
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255, gn = g / 255, bn = b / 255
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6
  else if (max === gn) h = ((bn - rn) / d + 2) / 6
  else h = ((rn - gn) / d + 4) / 6
  return [h * 360, s, l]
}

function extractColors(value: string): string[] {
  const matches = value.match(/#(?:[0-9a-fA-F]{3}){1,2}/g)
  return matches ?? []
}

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

/** Map the dominant hue of a color/gradient string to the nearest badge variant.
 *  Low saturation → secondary. Hue ranges:
 *  Red/pink (330-30) → destructive, Orange (30-60) → warning,
 *  Yellow/lime (60-90) → warning, Green (90-170) → success,
 *  Cyan/teal (170-210) → info, Blue (210-270) → primary,
 *  Purple (270-330) → primary */
function detectBadgeVariant(value: string): BadgeVariant {
  const colors = extractColors(value)
  if (colors.length === 0) return "outline"

  let totalH = 0, totalS = 0
  let count = 0
  for (const hex of colors) {
    const rgb = hexToRgb(hex)
    if (!rgb) continue
    const [h, s] = rgbToHsl(...rgb)
    totalH += h
    totalS += s
    count++
  }
  if (count === 0) return "outline"

  const avgS = totalS / count
  if (avgS < 0.15) return "outline"

  const avgH = totalH / count

  if (avgH >= 330 || avgH < 30) return "destructive"
  if (avgH >= 30 && avgH < 90) return "warning"
  if (avgH >= 90 && avgH < 170) return "success"
  if (avgH >= 170 && avgH < 210) return "info"
  if (avgH >= 210 && avgH < 270) return "primary"
  return "primary" // 270-330 purple
}

// --- Context ---

const Card3DContext = React.createContext({
  hasMedia: false,
  isLight: false,
  badgeVariant: "outline" as BadgeVariant,
})

// --- 3D tilt effect ---

const TILT_MAX = 8 // max degrees of rotation

function useTilt() {
  const ref = React.useRef<HTMLButtonElement>(null)
  const frameRef = React.useRef<number>(0)

  const handleMouseMove = React.useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const el = ref.current
    if (!el) return
    cancelAnimationFrame(frameRef.current)
    frameRef.current = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width  // 0 to 1
      const y = (e.clientY - rect.top) / rect.height   // 0 to 1
      const rotateY = (x - 0.5) * TILT_MAX * 2   // left/right
      const rotateX = (0.5 - y) * TILT_MAX * 2   // up/down
      el.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
    })
  }, [])

  const handleMouseLeave = React.useCallback(() => {
    const el = ref.current
    if (!el) return
    cancelAnimationFrame(frameRef.current)
    el.style.transform = "perspective(600px) rotateX(0deg) rotateY(0deg)"

  }, [])

  return { ref, handleMouseMove, handleMouseLeave }
}

/**
 * 3D card with background media support (color, gradient, image, video).
 * Text-only - no action buttons. Designed for grid layouts.
 * Auto-detects light/dark backgrounds from color/gradient props.
 * 3D tilt effect on hover - card reacts to mouse position like a playing card.
 */
function Card3D({
  className,
  children,
  type = "button",
  ...props
}: React.ComponentProps<"button">) {
  const { ref, handleMouseMove, handleMouseLeave } = useTilt()

  const imageChildren: React.ReactNode[] = []
  const contentChildren: React.ReactNode[] = []
  let isLight = false
  let hasMedia = false
  let detectedVariant: BadgeVariant = "outline"

  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child)) {
      const slot = (child.type as unknown as Record<string, unknown>)?.displayName
      if (slot === "card-3d-image" || slot === "card-3d-overlay") {
        const childProps = child.props as Record<string, unknown>
        if (childProps.src) {
          hasMedia = true
        }
        const colorValue =
          (childProps.color as string) ?? (childProps.gradient as string)
        if (colorValue) {
          if (isLightBackground(colorValue)) {
            isLight = true
          }
          detectedVariant = detectBadgeVariant(colorValue)
        }
        imageChildren.push(child)
        return
      }
    }
    contentChildren.push(child)
  })

  const fgStyle = isLight
    ? ({
        "--card-3d-fg": "oklch(0.15 0 0)",
        "--card-3d-title-fw": "400",
        "--card-3d-desc-fw": "500",
      } as React.CSSProperties)
    : undefined

  return (
    <Card3DContext value={{ hasMedia, isLight, badgeVariant: detectedVariant }}>
      <button
        ref={ref}
        type={type}
        data-slot="card-3d"
        className={cn(
          "relative w-full aspect-square overflow-hidden rounded-[14px] bg-[var(--surface-950)] select-none cursor-pointer text-left transition-transform duration-200 ease-out will-change-transform focus-visible:ring-2 focus-visible:ring-[var(--surface-200)] focus-visible:outline-none",
          className
        )}
        style={fgStyle}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {imageChildren.length > 0 && (
          <div className="absolute inset-0">
            {imageChildren}
          </div>
        )}
        {contentChildren}

      </button>
    </Card3DContext>
  )
}

const VIDEO_EXTENSIONS = /\.(mp4|webm|ogg|mov)(\?|$)/i

/** Background media - supports image, video, animated gradient, and solid color. */
function Card3DImage({
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

  const handleCanPlayThrough = React.useCallback(() => {
    setVideoReady(true)
    videoRef.current?.play()
  }, [])

  return (
    <div
      data-slot="card-3d-image"
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
          className="h-full w-full object-cover"
        />
      )}
      {src && isVideo && (
        <>
          {poster && (
            <img
              src={poster}
              alt={alt}
              aria-hidden={frameReady || videoReady}
              className={cn(
                "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
                frameReady || videoReady ? "opacity-0" : "opacity-100"
              )}
            />
          )}
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
              frameReady && !videoReady ? "opacity-100" : "opacity-0"
            )}
          />
          <video
            ref={videoRef}
            src={src}
            muted
            loop
            playsInline
            preload="auto"
            onLoadedData={handleLoadedData}
            onCanPlayThrough={handleCanPlayThrough}
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
              videoReady ? "opacity-100" : "opacity-0"
            )}
          />
        </>
      )}
    </div>
  )
}
Card3DImage.displayName = "card-3d-image"

/** Gradient overlay on top of the background. */
function Card3DOverlay({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-3d-overlay"
      className={cn(
        "absolute inset-0 bg-gradient-to-b from-black/90 via-black/60 to-black/20",
        className
      )}
      {...props}
    />
  )
}
Card3DOverlay.displayName = "card-3d-overlay"

/** Content area - positioned over the background. Uses flex column with justify-between by default
 *  (header at top, footer at bottom). Set `inverted` to flip the order (badges top, header bottom). */
function Card3DContent({
  className,
  children,
  inverted = false,
  ...props
}: React.ComponentProps<"div"> & { inverted?: boolean }) {
  return (
    <div
      data-slot="card-3d-content"
      className="relative z-[1] h-full p-3 sm:p-5"
      {...props}
    >
      <div className={cn("relative z-[1] flex h-full justify-between", inverted ? "flex-col-reverse" : "flex-col", className)}>
        {children}
      </div>
    </div>
  )
}

/** Card heading - uppercase, font-heading (Outfit). */
function Card3DTitle({
  className,
  ...props
}: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="card-3d-title"
      className={cn(
        "text-balance font-heading uppercase text-[2rem] leading-[120%] text-[var(--card-3d-fg,var(--foreground))] font-[var(--card-3d-title-fw,300)]",
        className
      )}
      {...props}
    />
  )
}

/** Card description text. */
function Card3DDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-3d-description"
      className={cn(
        "mt-1 text-pretty text-xs leading-relaxed text-[var(--card-3d-fg,var(--foreground))] font-[var(--card-3d-desc-fw,500)] opacity-80 sm:text-sm",
        className
      )}
      {...props}
    />
  )
}

/** Badge - always white background with black text for consistent readability over any card background. */
function Card3DBadge({
  className,
  style,
  ...props
}: Omit<React.ComponentProps<typeof Badge>, "variant">) {
  return (
    <Badge
      variant="default"
      className={cn("border-0", className)}
      style={{ background: "white", color: "black", ...style }}
      {...props}
    />
  )
}

export {
  Card3D,
  Card3DImage,
  Card3DOverlay,
  Card3DContent,
  Card3DTitle,
  Card3DDescription,
  Card3DBadge,
}
