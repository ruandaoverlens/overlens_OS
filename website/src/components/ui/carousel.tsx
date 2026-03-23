"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react"
import { cn } from "@/lib/utils"
import {
  MdArrowBackIosNewLineIcon,
  MdArrowForwardIosLineIcon,
} from "@/components/icons"
import {
  Heading,
  HeadingTitle,
  HeadingDescription,
} from "@/components/ui/heading"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

type CarouselOrientation = "horizontal" | "vertical"

type CarouselContextValue = {
  emblaRef: ReturnType<typeof useEmblaCarousel>[0]
  viewportWrapperRef: React.RefCallback<HTMLDivElement>
  viewportWrapper: HTMLDivElement | null
  api: CarouselApi
  opts: CarouselOptions
  orientation: CarouselOrientation
  canScrollPrev: boolean
  canScrollNext: boolean
  scrollPrev: () => void
  scrollNext: () => void
  selectedIndex: number
  scrollSnaps: number[]
  scrollTo: (index: number) => void
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const CarouselContext = React.createContext<CarouselContextValue | null>(null)

function useCarousel() {
  const ctx = React.useContext(CarouselContext)
  if (!ctx) throw new Error("useCarousel must be used within <Carousel>")
  return ctx
}

// ---------------------------------------------------------------------------
// Carousel (root)
// ---------------------------------------------------------------------------

type CarouselProps = React.ComponentProps<"div"> & {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  orientation?: CarouselOrientation
  setApi?: (api: CarouselApi) => void
  title?: string
  subtitle?: string
}

function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  title,
  subtitle,
  className,
  children,
  ...props
}: CarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      skipSnaps: true,
      dragFree: true,
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
    },
    plugins
  )

  const [viewportWrapper, setViewportWrapper] = React.useState<HTMLDivElement | null>(null)
  const viewportWrapperRef = React.useCallback((node: HTMLDivElement | null) => {
    setViewportWrapper(node)
  }, [])

  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([])

  const onSelect = React.useCallback((api: CarouselApi) => {
    if (!api) return
    setSelectedIndex(api.selectedScrollSnap())
    setCanScrollPrev(api.canScrollPrev())
    setCanScrollNext(api.canScrollNext())
  }, [])

  const scrollPrev = React.useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = React.useCallback(() => emblaApi?.scrollNext(), [emblaApi])
  const scrollTo = React.useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
  )

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault()
        scrollPrev()
      } else if (e.key === "ArrowRight") {
        e.preventDefault()
        scrollNext()
      }
    },
    [scrollPrev, scrollNext]
  )

  React.useEffect(() => {
    if (!emblaApi) return
    onSelect(emblaApi)
    setScrollSnaps(emblaApi.scrollSnapList())
    emblaApi.on("reInit", onSelect)
    emblaApi.on("select", onSelect)
    return () => {
      emblaApi.off("reInit", onSelect)
      emblaApi.off("select", onSelect)
    }
  }, [emblaApi, onSelect])

  React.useEffect(() => {
    if (setApi && emblaApi) setApi(emblaApi)
  }, [emblaApi, setApi])


  return (
    <CarouselContext
      value={{
        emblaRef,
        viewportWrapperRef,
        viewportWrapper,
        api: emblaApi,
        opts,
        orientation,
        canScrollPrev,
        canScrollNext,
        scrollPrev,
        scrollNext,
        selectedIndex,
        scrollSnaps,
        scrollTo,
      }}
    >
      <div
        data-slot="carousel"
        role="region"
        aria-roledescription="carousel"
        onKeyDownCapture={handleKeyDown}
        className={cn("group/carousel relative min-w-0", className)}
        {...props}
      >
        {title && (
          <Heading className="px-4 md:px-0 md:pl-2">
            <HeadingTitle>{title}</HeadingTitle>
            {subtitle && <HeadingDescription>{subtitle}</HeadingDescription>}
          </Heading>
        )}
        {children}
      </div>
    </CarouselContext>
  )
}

// ---------------------------------------------------------------------------
// CarouselContent (slide container)
// ---------------------------------------------------------------------------

function CarouselContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { emblaRef, viewportWrapperRef, orientation } = useCarousel()

  return (
    <div
      ref={viewportWrapperRef}
      data-slot="carousel-viewport-wrapper"
      className={cn(
        "relative",
        orientation === "horizontal" ? "overflow-hidden" : "overflow-visible"
      )}
    >
      <div
        ref={emblaRef}
        data-slot="carousel-viewport"
        className={cn("overflow-hidden p-[3px] -m-[3px]", orientation === "vertical" && className)}
      >
        <div
          data-slot="carousel-content"
          className={cn(
            "flex",
            orientation === "horizontal"
              ? "-ml-2 [&>:first-child]:max-md:ml-2 [&>:last-child]:max-md:mr-2 [&>:last-child]:md:mr-3 touch-pan-y pinch-zoom"
              : "-mt-2 flex-col touch-pan-x pinch-zoom",
            orientation === "horizontal" && className
          )}
          {...props}
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// CarouselItem
// ---------------------------------------------------------------------------

function CarouselItem({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { orientation } = useCarousel()

  return (
    <div
      data-slot="carousel-item"
      role="group"
      aria-roledescription="slide"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-2" : "pt-2",
        className
      )}
      {...props}
    />
  )
}

// ---------------------------------------------------------------------------
// CarouselPrevious
// ---------------------------------------------------------------------------

function CarouselPrevious({
  className,
  ...props
}: React.ComponentProps<"button">) {
  const { orientation, canScrollPrev, scrollPrev, viewportWrapper } = useCarousel()

  if (!viewportWrapper) return null

  return createPortal(
    <button
      type="button"
      data-slot="carousel-previous"
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      className={cn(
        "absolute z-10 flex items-center justify-center border-0 bg-transparent cursor-pointer",
        "opacity-0 transition-opacity duration-300",
        "group-hover/carousel:opacity-100",
        !canScrollPrev && "!opacity-0 pointer-events-none",
        orientation === "horizontal"
          ? "left-2 top-1/2 -translate-y-1/2"
          : "-top-5 left-1/2 -translate-x-1/2",
        className
      )}
      {...props}
    >
      <span className="flex items-center justify-center size-9 rounded-full bg-foreground/10 backdrop-blur-sm text-foreground/80 hover:bg-foreground/20 hover:text-foreground transition-colors">
        <MdArrowBackIosNewLineIcon className={cn("size-6", orientation === "vertical" && "rotate-90")} />
      </span>
      <span className="sr-only">Previous slide</span>
    </button>,
    viewportWrapper
  )
}

// ---------------------------------------------------------------------------
// CarouselNext
// ---------------------------------------------------------------------------

function CarouselNext({
  className,
  ...props
}: React.ComponentProps<"button">) {
  const { orientation, canScrollNext, scrollNext, viewportWrapper } = useCarousel()

  if (!viewportWrapper) return null

  return createPortal(
    <button
      type="button"
      data-slot="carousel-next"
      disabled={!canScrollNext}
      onClick={scrollNext}
      className={cn(
        "absolute z-10 flex items-center justify-center border-0 bg-transparent cursor-pointer",
        "opacity-0 transition-opacity duration-300",
        "group-hover/carousel:opacity-100",
        !canScrollNext && "!opacity-0 pointer-events-none",
        orientation === "horizontal"
          ? "right-2 top-1/2 -translate-y-1/2"
          : "-bottom-5 left-1/2 -translate-x-1/2",
        className
      )}
      {...props}
    >
      <span className="flex items-center justify-center size-9 rounded-full bg-foreground/10 backdrop-blur-sm text-foreground/80 hover:bg-foreground/20 hover:text-foreground transition-colors">
        <MdArrowForwardIosLineIcon className={cn("size-6", orientation === "vertical" && "rotate-90")} />
      </span>
      <span className="sr-only">Next slide</span>
    </button>,
    viewportWrapper
  )
}

// ---------------------------------------------------------------------------
// CarouselDots
// ---------------------------------------------------------------------------

function CarouselDots({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { scrollSnaps, selectedIndex, scrollTo } = useCarousel()

  if (scrollSnaps.length <= 1) return null

  return (
    <div
      data-slot="carousel-dots"
      role="tablist"
      className={cn("flex items-center justify-center gap-1.5 py-3", className)}
      {...props}
    >
      {scrollSnaps.map((_, i) => (
        <button
          key={i}
          role="tab"
          aria-selected={i === selectedIndex}
          aria-label={`Go to slide ${i + 1}`}
          onClick={() => scrollTo(i)}
          className={cn(
            "size-2 rounded-full transition-all duration-200",
            i === selectedIndex
              ? "bg-foreground scale-125"
              : "bg-foreground/30 hover:bg-foreground/50"
          )}
        />
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export {
  type CarouselApi,
  type CarouselOptions,
  type CarouselPlugin,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselDots,
  useCarousel,
}
