"use client"

import * as React from "react"
// Copy/ThumbsUp/ThumbsDown não têm equivalente em @/components/icons
// (verificado: não há SmCopy*/SmThumb*). Mantidos em lucide.
import { Copy, ThumbsDown, ThumbsUp } from "lucide-react"
import { SmHistoryLineIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { notify } from "@/lib/notifications/toast"
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
      notify.success("Copiado")
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      notify.error("Não foi possível copiar")
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
      notify.error("Falha ao enviar feedback")
    }
  }

  return (
    <div
      data-slot="chat-assistant-actions"
      role="group"
      aria-label="Ações da resposta"
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
        toggle
      >
        <ThumbsUp className="size-4" />
      </ActionButton>

      <ActionButton
        label="Não útil"
        onClick={() => sendFeedback(-1)}
        active={feedback === -1}
        toggle
      >
        <ThumbsDown className="size-4" />
      </ActionButton>

      <ActionButton
        label="Tentar novamente"
        onClick={() => onRetry?.()}
        disabled={!onRetry}
      >
        <SmHistoryLineIcon className="size-4" />
      </ActionButton>
    </div>
  )
}

type ActionButtonProps = {
  label: string
  onClick: () => void
  active?: boolean
  disabled?: boolean
  /** Botão de alternância (Útil/Não útil): expõe `aria-pressed`. */
  toggle?: boolean
  children: React.ReactNode
}

function ActionButton({
  label,
  onClick,
  active,
  disabled,
  toggle = false,
  children,
}: ActionButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={toggle ? Boolean(active) : undefined}
      title={label}
      data-active={active || undefined}
      className={cn(
        "text-muted-foreground hover:text-foreground",
        "data-[active]:bg-accent data-[active]:text-foreground",
        "disabled:opacity-30",
      )}
    >
      {children}
    </Button>
  )
}
