"use client"

import * as React from "react"
import { Copy, RotateCcw, ThumbsDown, ThumbsUp } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type Feedback = 1 | -1 | null

type AssistantActionsProps = {
  messageId: string
  content: string
  onRetry?: () => void
  className?: string
}

export function AssistantActions({
  messageId,
  content,
  onRetry,
  className,
}: AssistantActionsProps) {
  const [feedback, setFeedback] = React.useState<Feedback>(null)
  const [copied, setCopied] = React.useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      toast.success("Copiado")
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error("Não foi possível copiar")
    }
  }

  async function sendFeedback(value: 1 | -1) {
    const next: Feedback = feedback === value ? null : value
    setFeedback(next)
    try {
      await fetch(`/api/chat/messages/${messageId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback: next ?? 0 }),
      })
    } catch {
      toast.error("Falha ao enviar feedback")
    }
  }

  return (
    <div
      data-slot="chat-assistant-actions"
      className={cn("mt-2 flex items-center gap-1", className)}
    >
      <ActionButton
        label={copied ? "Copiado" : "Copiar"}
        onClick={handleCopy}
        active={copied}
      >
        <Copy className="size-4" />
      </ActionButton>

      <ActionButton
        label="Útil"
        onClick={() => sendFeedback(1)}
        active={feedback === 1}
      >
        <ThumbsUp className="size-4" />
      </ActionButton>

      <ActionButton
        label="Não útil"
        onClick={() => sendFeedback(-1)}
        active={feedback === -1}
      >
        <ThumbsDown className="size-4" />
      </ActionButton>

      <ActionButton
        label="Tentar novamente"
        onClick={() => onRetry?.()}
        disabled={!onRetry}
      >
        <RotateCcw className="size-4" />
      </ActionButton>
    </div>
  )
}

type ActionButtonProps = {
  label: string
  onClick: () => void
  active?: boolean
  disabled?: boolean
  children: React.ReactNode
}

function ActionButton({
  label,
  onClick,
  active,
  disabled,
  children,
}: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      data-active={active || undefined}
      className={cn(
        "flex size-8 items-center justify-center rounded-full transition-colors outline-none",
        "text-muted-foreground/70 hover:bg-accent hover:text-foreground",
        "data-[active]:bg-accent data-[active]:text-foreground",
        "disabled:opacity-30 disabled:pointer-events-none"
      )}
    >
      {children}
    </button>
  )
}
