"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { CitationPill } from "./citation-pill"
import { SmFolderLineIcon } from "@/components/icons"
import type { ChatAttachment } from "@/lib/ai/types"

type UserMessageProps = {
  content: string
  citedTitle?: string | null
  attachments?: ChatAttachment[] | null
  className?: string
}

function isImageAttachment(att: ChatAttachment) {
  return att.contentType.startsWith("image/")
}

export function UserMessage({
  content,
  citedTitle,
  attachments,
  className,
}: UserMessageProps) {
  const imageAttachments = (attachments ?? []).filter(isImageAttachment)
  const fileAttachments = (attachments ?? []).filter((a) => !isImageAttachment(a))
  const hasAttachments = imageAttachments.length > 0 || fileAttachments.length > 0

  return (
    <div
      data-slot="chat-user-message"
      className={cn("mb-6 flex flex-col items-end gap-1.5", className)}
    >
      {citedTitle && <CitationPill title={citedTitle} compact />}
      {hasAttachments && (
        <div
          data-slot="chat-user-message-attachments"
          className="flex max-w-[75%] flex-wrap items-center justify-end gap-1.5"
        >
          {imageAttachments.map((att, i) => (
            <div
              key={`img-${i}-${att.name}`}
              className="h-[72px] w-[72px] overflow-hidden rounded-xl border border-border/50 bg-muted"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={att.url}
                alt={att.name}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
          {fileAttachments.map((att, i) => (
            <div
              key={`file-${i}-${att.name}`}
              className={cn(
                "inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full pl-2.5 pr-3 text-xs font-medium",
                "bg-[#D6A461]/10 text-[#D6A461]",
              )}
            >
              <SmFolderLineIcon className="size-3.5" />
              <span className="max-w-[180px] truncate">{att.name}</span>
            </div>
          ))}
        </div>
      )}
      {content && (
        <div
          className={cn(
            "max-w-[75%] rounded-3xl bg-muted px-4 py-2.5 text-foreground",
            "whitespace-pre-wrap break-words text-base leading-[1.6]",
          )}
        >
          {content}
        </div>
      )}
    </div>
  )
}
