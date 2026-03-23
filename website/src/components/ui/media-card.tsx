import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { SmCheckLineIcon } from "@/components/icons"

import { cn } from "@/lib/utils"

// --- Context ---

type MediaCardVariant = "default" | "compact"
type MediaCardOrientation = "vertical" | "horizontal"

const MediaCardContext = React.createContext<{
  variant: MediaCardVariant
  orientation: MediaCardOrientation
  active: boolean
}>({
  variant: "default",
  orientation: "vertical",
  active: false,
})

// --- Root variants ---

const mediaCardVariants = cva("group flex cursor-pointer", {
  variants: {
    variant: {
      default: "text-sm",
      compact: "text-xs",
    },
    orientation: {
      vertical: "flex-col",
      horizontal: "flex-row items-center gap-3",
    },
  },
  compoundVariants: [
    { orientation: "vertical", variant: "compact", class: "w-full max-w-[180px] min-w-[120px]" },
    { orientation: "vertical", variant: "default", class: "w-full" },
  ],
  defaultVariants: {
    variant: "default",
    orientation: "vertical",
  },
})

// --- Image aspect ratio per variant ---

const imageAspectMap: Record<MediaCardVariant, string> = {
  default: "aspect-video",
  compact: "aspect-square",
}

// Horizontal image - fixed dimensions regardless of variant
const HORIZONTAL_IMAGE_CLASSES = "aspect-video min-w-[140px] w-[140px] sm:w-[160px]"

/**
 * Media card - image separated from title/metadata.
 * Variant controls image aspect ratio and text scale.
 * Width is determined by the parent container / grid.
 *
 * `orientation="horizontal"` renders image left / text right (lesson lists).
 * `active` adds a ring border to indicate the current item.
 */
function MediaCard({
  className,
  variant = "default",
  orientation = "vertical",
  active = false,
  children,
  ...props
}: React.ComponentProps<"article"> &
  VariantProps<typeof mediaCardVariants> & { active?: boolean }) {
  return (
    <MediaCardContext
      value={{
        variant: variant ?? "default",
        orientation: orientation ?? "vertical",
        active,
      }}
    >
      <article
        data-slot="media-card"
        data-variant={variant}
        data-orientation={orientation}
        data-active={active || undefined}
        className={cn(
          mediaCardVariants({ variant, orientation }),
          className
        )}
        {...props}
      >
        {children}
      </article>
    </MediaCardContext>
  )
}

const VIDEO_EXTENSIONS = /\.(mp4|webm|ogg|mov)(\?|$)/i

/** Image area - aspect ratio driven by card variant.
 *  Supports image, video, animated gradient, and solid color (same API as Banner/Card3D).
 *  Renders bg-[var(--surface-950)] fallback when no media is provided. */
function MediaCardImage({
  className,
  src,
  alt = "",
  poster,
  gradient,
  color,
  children,
  ...props
}: React.ComponentProps<"button"> & {
  src?: string
  alt?: string
  poster?: string
  gradient?: string
  color?: string
}) {
  const { variant, orientation, active } = React.useContext(MediaCardContext)
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
    <button
      data-slot="media-card-image"
      className={cn(
        "relative shrink-0 overflow-hidden bg-[var(--surface-950)] cursor-pointer outline-none",
        orientation === "horizontal" ? "rounded-lg" : "rounded-[14px]",
        orientation === "horizontal"
          ? HORIZONTAL_IMAGE_CLASSES
          : ["w-full", imageAspectMap[variant]],
        active && "border-2 border-foreground",
        className
      )}
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
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
      )}
      {src && isVideo && (
        <>
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
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
              "absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
              videoReady ? "opacity-100" : "opacity-0"
            )}
          />
        </>
      )}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] bg-white/[0.06] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />
      {children}
    </button>
  )
}

/** Badge positioned over the image area. */
function MediaCardBadge({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="media-card-badge"
      className={cn("absolute right-2 top-2 z-10", className)}
      {...props}
    />
  )
}

/** Text content area below (vertical) or beside (horizontal) the image. */
function MediaCardContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { variant, orientation } = React.useContext(MediaCardContext)

  return (
    <div
      data-slot="media-card-content"
      className={cn(
        "flex min-w-0 flex-col group/content",
        "gap-1",
        orientation === "horizontal"
          ? "flex-1 px-0 py-0"
          : cn("px-1", variant === "compact" ? "pt-4" : "pt-3"),
        className
      )}
      {...props}
    />
  )
}

/** Title - single line with ellipsis (two lines when horizontal without description). Rendered as button. */
function MediaCardTitle({
  className,
  children,
  ...props
}: React.ComponentProps<"button">) {
  const { variant, orientation } = React.useContext(MediaCardContext)
  const titleText = typeof children === "string" ? children : undefined

  return (
    <button
      data-slot="media-card-title"
      title={titleText}
      className={cn(
        "font-medium leading-[1.2] text-left cursor-pointer outline-none",
        "focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm",
        "transition-colors duration-500",
        "text-[var(--surface-200)]",
        orientation === "horizontal"
          ? "line-clamp-2 group-has-[[data-slot=media-card-description]]/content:line-clamp-1"
          : "line-clamp-1",
        variant === "compact" ? "text-[14px]" : "text-[16px]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

/** Metadata line - category, author, date, read time, etc.
 *  Renders children inline with a dot separator between them. */
function MediaCardMeta({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const items = React.Children.toArray(children).filter(Boolean)

  return (
    <div
      data-slot="media-card-meta"
      className={cn(
        "flex items-center gap-x-1.5 overflow-hidden flex-nowrap whitespace-nowrap font-sans text-[14px]",
        className
      )}
      {...props}
    >
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && (
            <span aria-hidden="true" className="text-[0.5em] leading-none text-[var(--foreground)] opacity-50 select-none">
              ·
            </span>
          )}
          {item}
        </React.Fragment>
      ))}
    </div>
  )
}

/** Non-interactive metadata item - date, read time, etc. Rendered as span, gray. */
function MediaCardMetaItem({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="media-card-meta-item"
      className={cn(
        "text-[length:inherit] leading-relaxed text-[var(--foreground)] opacity-50",
        className
      )}
      {...props}
    />
  )
}

/** Author / person name - surface-500 by default (secondary). Rendered as button. */
function MediaCardMetaAuthor({
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      data-slot="media-card-meta-author"
      className={cn(
        "min-w-0 truncate text-[length:inherit] leading-relaxed font-medium text-[var(--surface-500)] cursor-pointer",
        className
      )}
      {...props}
    />
  )
}

/** Interactive metadata item - category, author, etc. Rendered as button, surface-500. */
function MediaCardMetaAction({
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      data-slot="media-card-meta-action"
      className={cn(
        "text-[length:inherit] leading-relaxed font-medium text-[var(--surface-500)] cursor-pointer",
        className
      )}
      {...props}
    />
  )
}

/** Circular check toggle overlaid on the image area (top-left).
 *  Must be rendered as a child of MediaCardImage. */
function MediaCardCheck({
  className,
  checked = false,
  onCheckedChange,
  ...props
}: Omit<React.ComponentProps<"div">, "onChange"> & {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}) {
  return (
    <div
      role="checkbox"
      tabIndex={0}
      aria-checked={checked}
      data-slot="media-card-check"
      className={cn(
        "absolute left-2 top-2 z-20 shrink-0 size-5 rounded-full border-2 grid place-content-center transition-all outline-none cursor-pointer",
        checked
          ? "border-foreground bg-foreground text-background"
          : "border-foreground/30 bg-black/40 hover:border-primary",
        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className
      )}
      onClick={(e) => {
        e.stopPropagation()
        onCheckedChange?.(!checked)
      }}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault()
          e.stopPropagation()
          onCheckedChange?.(!checked)
        }
      }}
      {...props}
    >
      {checked && <SmCheckLineIcon className="size-3" style={{ stroke: "currentColor", strokeWidth: 2 }} />}
    </div>
  )
}

/** Description - secondary text below the title. Clamped to 1 line. */
function MediaCardDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="media-card-description"
      className={cn(
        "line-clamp-1 text-[14px] leading-[1.4] font-medium text-[var(--surface-600)] group-hover:text-[var(--surface-500)] transition-colors duration-500 pointer-events-none",
        className
      )}
      {...props}
    />
  )
}

/**
 * Responsive grid container for MediaCards.
 * Uses CSS Grid `auto-fill` + `minmax` so cards grow to share
 * available space and automatically wrap into more/fewer columns.
 *
 * The `--media-card-grid-min` CSS variable (default 280px) sets
 * the minimum card width before wrapping. Override via `style`
 * or `className` to tune density:
 *
 * ```tsx
 * // Default - wraps at 280px per card
 * <MediaCardGrid>…</MediaCardGrid>
 *
 * // Narrower cards (portrait/books) - wraps at 180px
 * <MediaCardGrid style={{ "--media-card-grid-min": "180px" } as React.CSSProperties}>
 *
 * // Override gap
 * <MediaCardGrid className="gap-6">…</MediaCardGrid>
 * ```
 */
function MediaCardGrid({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="media-card-grid"
      className={cn(
        "grid grid-cols-[repeat(auto-fill,minmax(min(100%,var(--media-card-grid-min,280px)),1fr))] gap-4",
        className
      )}
      {...props}
    />
  )
}

export {
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
  mediaCardVariants,
}
