"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { CitationPill } from "./citation-pill"

type UserMessageProps = {
  content: string
  citedTitle?: string | null
  className?: string
}

export function UserMessage({
  content,
  citedTitle,
  className,
}: UserMessageProps) {
  return (
    <div
      data-slot="chat-user-message"
      className={cn("mb-6 flex flex-col items-end gap-1.5", className)}
    >
      {citedTitle && <CitationPill title={citedTitle} compact />}
      <div
        className={cn(
          "max-w-[75%] rounded-3xl bg-muted px-4 py-2.5 text-foreground",
          "whitespace-pre-wrap break-words text-base leading-[1.6]",
        )}
      >
        {content}
      </div>
    </div>
  )
}
