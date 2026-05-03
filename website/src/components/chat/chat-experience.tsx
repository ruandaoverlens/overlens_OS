"use client"

import * as React from "react"
import { useChat } from "ai/react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { ModelId } from "@/lib/ai/models"
import type { UIMessage } from "@/lib/ai/types"
import { classifyClientError, type ChatErrorInfo } from "@/lib/ai/chat-errors"
import { PromptArea, type PromptSubmitPayload } from "@/components/prompt-area"
import { MessageList } from "./message-list"
import { EmptyState } from "./empty-state"
import type { AssistantSource } from "./assistant-message"

export type ChatMessageMeta = {
  citedTitle?: string | null
  sources?: AssistantSource[] | null
}

type ChatExperienceProps = {
  conversationId: string
  model: ModelId
  planMode: boolean
  initialMessages: UIMessage[]
  initialCitedSegments?: string[] | null
  initialMeta?: Record<string, ChatMessageMeta>
  className?: string
}

type StreamAnnotation = {
  kind?: string
  sources?: AssistantSource[]
}

function isStreamAnnotation(value: unknown): value is StreamAnnotation {
  return typeof value === "object" && value !== null
}

export function ChatExperience({
  conversationId,
  model,
  planMode,
  initialMessages,
  initialCitedSegments,
  initialMeta,
  className,
}: ChatExperienceProps) {
  const {
    messages,
    append,
    isLoading,
    error,
    reload,
  } = useChat({
    api: "/api/chat",
    id: conversationId,
    initialMessages,
    body: {
      conversationId,
      model,
      planMode,
    },
  })

  // Per-message meta that's tracked client-side: citation pill for user
  // messages submitted in-session (id is generated locally so we can map),
  // plus a fallback for sources when DB hasn't reloaded yet.
  const [localMeta, setLocalMeta] = React.useState<
    Record<string, ChatMessageMeta>
  >({})

  const errorInfo: ChatErrorInfo | null = React.useMemo(
    () => (error ? classifyClientError(error) : null),
    [error],
  )

  React.useEffect(() => {
    if (!errorInfo) return
    toast.error(errorInfo.message)
  }, [errorInfo])

  // Auto-trigger assistant response when initial messages end in a user turn
  // (happens after creating a new conversation: first message is already in DB,
  //  but there's no assistant reply yet).
  const autoTriggeredRef = React.useRef(false)
  React.useEffect(() => {
    if (autoTriggeredRef.current) return
    if (initialMessages.length === 0) return
    const last = initialMessages[initialMessages.length - 1]
    if (last.role !== "user") return
    autoTriggeredRef.current = true
    reload({
      body: {
        skipPersistFirstUser: true,
        // Re-attach the citation saved with the user message so the first
        // response uses the cited doc as context (instead of falling back
        // to the LLM router).
        citedSection:
          initialCitedSegments && initialCitedSegments.length > 0
            ? {
                title: "(seção citada)",
                segments: initialCitedSegments,
              }
            : null,
      },
    })
  }, [initialMessages, initialCitedSegments, reload])

  async function handleSubmit(payload: PromptSubmitPayload) {
    const userMessageId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `local-${Date.now()}`
    if (payload.selectedSection) {
      setLocalMeta((prev) => ({
        ...prev,
        [userMessageId]: { citedTitle: payload.selectedSection!.title },
      }))
    }
    await append(
      { id: userMessageId, role: "user", content: payload.text },
      {
        body: {
          conversationId,
          model,
          planMode: payload.planMode || planMode,
          citedSection: payload.selectedSection,
        },
      },
    )
  }

  // Merge: server-rendered meta + locally-tracked meta + sources extracted
  // from useChat message annotations (current in-flight assistant message).
  const meta = React.useMemo<Record<string, ChatMessageMeta>>(() => {
    const merged: Record<string, ChatMessageMeta> = {
      ...(initialMeta ?? {}),
      ...localMeta,
    }
    for (const m of messages) {
      if (m.role !== "assistant") continue
      const annotations = (m as { annotations?: unknown[] }).annotations
      if (!Array.isArray(annotations)) continue
      for (const a of annotations) {
        if (!isStreamAnnotation(a)) continue
        if (a.kind === "sources" && Array.isArray(a.sources)) {
          merged[m.id] = { ...merged[m.id], sources: a.sources }
        }
      }
    }
    return merged
  }, [initialMeta, localMeta, messages])

  const hasMessages = messages.length > 0

  return (
    <div
      data-slot="chat-experience"
      className={cn("flex h-full min-h-0 w-full flex-col", className)}
    >
      <div className="flex min-h-0 flex-1 flex-col">
        {hasMessages ? (
          <MessageList
            messages={messages as UIMessage[]}
            meta={meta}
            isLoading={isLoading}
            error={errorInfo}
            onRetry={() => reload()}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <EmptyState />
          </div>
        )}
      </div>

      <div className="w-full shrink-0 bg-gradient-to-t from-background via-background to-background/0 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2">
        <div className="mx-auto w-full max-w-3xl px-4">
          <PromptArea
            onSubmit={handleSubmit}
            loading={isLoading}
            autoFocus
          />
        </div>
      </div>
    </div>
  )
}
