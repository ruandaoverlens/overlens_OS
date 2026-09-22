"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import type { UIMessage } from "@/lib/ai/types"
import type { ChatErrorInfo } from "@/lib/ai/chat-errors"
import { UserMessage } from "./user-message"
import { AssistantMessage } from "./assistant-message"
import { MessageError } from "./message-error"
import type { ChatMessageMeta } from "./chat-experience"

type MessageListProps = {
  messages: UIMessage[]
  meta?: Record<string, ChatMessageMeta>
  isLoading?: boolean
  error?: ChatErrorInfo | null
  onRetry?: () => void
  className?: string
}

const STICKY_THRESHOLD = 120

export function MessageList({
  messages,
  meta,
  isLoading,
  error,
  onRetry,
  className,
}: MessageListProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const stickyRef = React.useRef(true)

  function handleScroll() {
    const el = scrollRef.current
    if (!el) return
    const distanceFromBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight
    stickyRef.current = distanceFromBottom <= STICKY_THRESHOLD
  }

  React.useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    if (stickyRef.current) {
      el.scrollTop = el.scrollHeight
    }
  }, [messages, isLoading])

  const lastRole = messages.length > 0 ? messages[messages.length - 1].role : null
  const showThinking = isLoading && lastRole !== "assistant" && !error
  const showError = !!error && !isLoading

  // Anúncio único ao fim do stream: o log NÃO é aria-live (anunciaria cada
  // fragmento durante o streaming); só o status sr-only fala "Resposta concluída".
  const wasLoadingRef = React.useRef(false)
  const [announcement, setAnnouncement] = React.useState("")
  React.useEffect(() => {
    if (isLoading) {
      wasLoadingRef.current = true
      return
    }
    if (!wasLoadingRef.current) return
    wasLoadingRef.current = false
    setAnnouncement(
      error ? "A resposta falhou." : lastRole === "assistant" ? "Resposta concluída." : "",
    )
  }, [isLoading, error, lastRole])

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      data-slot="chat-message-list"
      className={cn(
        "flex-1 min-h-0 w-full overflow-y-auto scrollbar-hidden",
        className
      )}
    >
      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>
      <div
        role="log"
        aria-label="Mensagens da conversa"
        className="mx-auto w-full max-w-3xl px-4 py-8"
      >
        {messages.map((m) => {
          const messageMeta = meta?.[m.id]
          if (m.role === "user") {
            const attachments =
              messageMeta?.attachments ?? m.experimental_attachments ?? null
            return (
              <UserMessage
                key={m.id}
                content={m.content}
                citedTitle={messageMeta?.citedTitle ?? null}
                attachments={attachments}
              />
            )
          }
          if (m.role === "assistant") {
            return (
              <AssistantMessage
                key={m.id}
                messageId={m.id}
                content={m.content}
                sources={messageMeta?.sources ?? null}
                onRetry={onRetry}
              />
            )
          }
          return null
        })}

        {showThinking && (
          <div
            aria-hidden="true"
            data-slot="chat-thinking"
            className="mb-6 flex justify-start text-base text-muted-foreground motion-safe:animate-pulse"
          >
            Pensando…
          </div>
        )}

        {showError && error && (
          <MessageError
            kind={error.kind}
            message={error.message}
            onRetry={onRetry}
          />
        )}
      </div>
    </div>
  )
}
