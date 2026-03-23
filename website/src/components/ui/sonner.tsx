"use client"

import {
  SmAlertSolidIcon,
  SmCheckSolidIcon,
  SmCloseSolidIcon,
  SmInfoSolidIcon,
} from "@/components/icons"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

/** Toast notification provider with themed styling and semantic icon variants. */
const Toaster = ({ className, ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      data-slot="sonner"
      theme={theme as ToasterProps["theme"]}
      className={cn("toaster group", className)}
      closeButton
      icons={{
        success: <SmCheckSolidIcon className="size-6 text-success" />,
        info: <SmInfoSolidIcon className="size-6 text-info" />,
        warning: <SmAlertSolidIcon className="size-6 text-warning" />,
        error: <SmCloseSolidIcon className="size-6 text-destructive" />,
        loading: <Spinner className="size-4" />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "bg-[var(--surface-950)] text-popover-foreground rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.3)] flex flex-wrap items-center gap-x-2 gap-y-1 pl-3 pr-3 py-3 [&>div:last-of-type]:contents w-[var(--width)]",
          title:
            "text-sm font-medium font-body order-2",
          description:
            "text-sm font-medium font-body text-muted-foreground leading-relaxed basis-full order-4",
          icon: "size-6 m-0 flex items-center justify-center shrink-0 order-1",
          actionButton:
            "bg-foreground/10 text-foreground/80 rounded-full h-6 px-3 text-xs font-heading font-medium uppercase tracking-wide shadow-none border-none order-5 m-0 mt-4 relative z-10 hover:bg-foreground/15",
          cancelButton:
            "bg-transparent text-foreground/80 rounded-full h-6 px-3 text-xs font-heading font-medium uppercase tracking-wide shadow-none border-none order-6 m-0 mt-4 relative z-10 hover:bg-foreground/5",
          closeButton:
            "bg-transparent text-muted-foreground hover:text-foreground hover:bg-transparent border-none shadow-none static size-6 shrink-0 ml-auto transform-none inset-auto p-0 [&>svg]:size-6 order-3",
          success: "border-success/30",
          error: "border-destructive/30",
          warning: "border-warning/30",
          info: "border-info/30",
        },
      }}
      style={
        {
          "--normal-bg": "var(--surface-950)",
          "--normal-bg-hover": "transparent",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--normal-border-hover": "transparent",
          "--border-radius": "var(--radius-xl)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
