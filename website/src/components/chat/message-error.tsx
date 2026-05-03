"use client"

import * as React from "react"
import { RotateCcw } from "lucide-react"
import { SmAlertSolidIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ChatErrorKind } from "@/lib/ai/chat-errors"

type MessageErrorProps = {
  kind: ChatErrorKind
  message: string
  onRetry?: () => void
  className?: string
}

const KIND_LABEL: Record<ChatErrorKind, string> = {
  credits: "Créditos esgotados",
  rate_limit: "Muitas requisições",
  auth: "Erro de autenticação",
  network: "Falha de conexão",
  unknown: "A resposta não chegou",
}

export function MessageError({
  kind,
  message,
  onRetry,
  className,
}: MessageErrorProps) {
  const canRetry = kind !== "credits" && kind !== "auth"
  return (
    <div
      role="alert"
      data-slot="chat-message-error"
      className={cn(
        "mb-6 flex w-full justify-start",
        className,
      )}
    >
      <div className="w-full rounded-lg border border-destructive/30 bg-destructive/5 p-4">
        <div className="flex items-start gap-3">
          <SmAlertSolidIcon className="size-5 shrink-0 text-destructive" />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-semibold text-foreground">
              {KIND_LABEL[kind]}
            </p>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
        </div>
        {onRetry && canRetry && (
          <div className="mt-3 flex justify-end">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onRetry}
              className="gap-2"
            >
              <RotateCcw className="size-4" />
              Tentar novamente
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
