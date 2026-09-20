"use client"

/**
 * "Curioser and Curioser" — Alice in Wonderland easter egg.
 * Renders a full-screen overlay when the viewport width drops below 320px.
 * Enquanto ativo, o conteúdo principal fica `inert` (fora do foco e da
 * árvore de acessibilidade), como um modal.
 */

import { useState, useEffect } from "react"
import { HeadingTitle } from "@/components/ui/heading"

export function CurioserScreen() {
  const [tooSmall, setTooSmall] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 319px)")

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setTooSmall(e.matches)
    }

    // Check initial state
    handleChange(mq)

    mq.addEventListener("change", handleChange)
    return () => mq.removeEventListener("change", handleChange)
  }, [])

  // Torna o conteúdo por baixo inerte enquanto o overlay está visível.
  useEffect(() => {
    if (!tooSmall) return
    const main = document.getElementById("main-content")
    if (!main) return
    main.setAttribute("inert", "")
    return () => main.removeAttribute("inert")
  }, [tooSmall])

  if (!tooSmall) return null

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-background px-6 text-center"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="curioser-title"
      aria-describedby="curioser-description"
    >
      <span className="text-8xl" role="img" aria-label="Cogumelo">
        🍄
      </span>

      <div className="flex flex-col gap-3">
        <HeadingTitle
          as="h2"
          size="lg"
          id="curioser-title"
          className="tracking-tight leading-tight"
        >
          Curioser<br /><span aria-hidden="true">✦ </span>and<span aria-hidden="true"> ✦</span><br />Curioser
        </HeadingTitle>
        <p
          id="curioser-description"
          className="text-sm text-muted-foreground leading-relaxed max-w-[240px] italic font-normal"
        >
          Você bebeu a poção errada e ficou pequeno demais. Esta tela precisa de pelo menos 320px para funcionar.
        </p>
      </div>
    </div>
  )
}
