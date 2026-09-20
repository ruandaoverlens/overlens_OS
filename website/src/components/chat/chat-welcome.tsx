"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type ChatWelcomeProps = {
  className?: string
  children?: React.ReactNode
}

/**
 * Boas-vindas do chat vazio. É o h1 da rota `/chat/new` (a conversa ainda
 * não tem título); em `/chat/[id]` sem mensagens o h1 sr-only vem do
 * ChatExperience, então aqui vira h2.
 */
export function ChatWelcome({ className, children, as: Heading = "h1" }: ChatWelcomeProps & { as?: "h1" | "h2" }) {
  return (
    <div
      data-slot="chat-welcome"
      className={cn(
        "flex flex-col items-center justify-center gap-6 text-center",
        className
      )}
    >
      <Heading className="text-h2 md:text-display font-light text-balance text-foreground">
        O que você quer construir hoje?
      </Heading>
      <p className="text-base text-pretty text-muted-foreground">
        Pergunte, planeje, busque referências da Overlens.
      </p>
      {children}
    </div>
  )
}
