"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type EmptyStateProps = {
  className?: string
  children?: React.ReactNode
}

export function EmptyState({ className, children }: EmptyStateProps) {
  return (
    <div
      data-slot="chat-empty-state"
      className={cn(
        "flex flex-col items-center justify-center gap-6 text-center",
        className
      )}
    >
      <h2 className="text-3xl font-semibold text-foreground">
        O que você quer construir hoje?
      </h2>
      <p className="text-base text-muted-foreground">
        Pergunte, planeje, busque referências da Overlens.
      </p>
      {children}
    </div>
  )
}
