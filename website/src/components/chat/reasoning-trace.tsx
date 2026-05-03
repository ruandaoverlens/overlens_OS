"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type ReasoningTraceProps = {
  content: string
  durationSeconds?: number
  className?: string
}

export function ReasoningTrace({
  content,
  durationSeconds,
  className,
}: ReasoningTraceProps) {
  const summary =
    typeof durationSeconds === "number"
      ? `Pensou por ${durationSeconds} segundos`
      : "Raciocínio"

  return (
    <details
      data-slot="chat-reasoning-trace"
      className={cn(
        "group rounded-lg border border-border/40 bg-muted/30 px-3 py-2 text-sm text-muted-foreground",
        className
      )}
    >
      <summary className="cursor-pointer select-none text-muted-foreground hover:text-foreground">
        {summary}
      </summary>
      <div className="mt-2 whitespace-pre-wrap break-words text-muted-foreground/90">
        {content}
      </div>
    </details>
  )
}
