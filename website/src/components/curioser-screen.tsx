"use client"

/**
 * "Curioser and Curioser" — Alice in Wonderland easter egg.
 * Renders a full-screen overlay with a mushroom illustration
 * when the viewport width drops below 320px.
 */

import { useState, useEffect } from "react"

function MushroomIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Mushroom cap */}
      <ellipse cx="60" cy="52" rx="50" ry="38" fill="var(--surface-800)" />
      <ellipse cx="60" cy="48" rx="50" ry="38" fill="var(--surface-700)" />

      {/* Cap spots */}
      <circle cx="38" cy="38" r="7" fill="var(--surface-600)" opacity="0.6" />
      <circle cx="72" cy="32" r="9" fill="var(--surface-600)" opacity="0.5" />
      <circle cx="55" cy="50" r="5" fill="var(--surface-600)" opacity="0.4" />
      <circle cx="80" cy="48" r="6" fill="var(--surface-600)" opacity="0.5" />

      {/* Cap highlight */}
      <ellipse cx="50" cy="30" rx="18" ry="8" fill="var(--surface-600)" opacity="0.15" />

      {/* Stem */}
      <path
        d="M48 80 C48 62, 42 58, 42 52 L78 52 C78 58, 72 62, 72 80 Z"
        fill="var(--surface-800)"
      />
      <path
        d="M50 80 C50 64, 45 60, 45 54 L75 54 C75 60, 70 64, 70 80 Z"
        fill="var(--surface-850, var(--surface-900))"
      />

      {/* Stem ring */}
      <ellipse cx="60" cy="68" rx="14" ry="3" fill="var(--surface-700)" opacity="0.5" />

      {/* Gills under cap */}
      <path
        d="M35 52 Q60 62 85 52"
        stroke="var(--surface-600)"
        strokeWidth="1"
        fill="none"
        opacity="0.3"
      />

      {/* Ground / grass */}
      <ellipse cx="60" cy="82" rx="24" ry="4" fill="var(--surface-800)" opacity="0.4" />

      {/* Small dots around — spores */}
      <circle cx="22" cy="70" r="1.5" fill="var(--surface-600)" opacity="0.3" />
      <circle cx="98" cy="66" r="1" fill="var(--surface-600)" opacity="0.25" />
      <circle cx="16" cy="44" r="1" fill="var(--surface-600)" opacity="0.2" />
      <circle cx="104" cy="40" r="1.5" fill="var(--surface-600)" opacity="0.2" />
    </svg>
  )
}

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

  if (!tooSmall) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 bg-background px-6 text-center"
      role="alert"
      aria-live="polite"
    >
      <span className="text-8xl">🍄</span>

      <div className="flex flex-col gap-3">
        <p className="font-heading text-3xl font-extrabold uppercase tracking-tight text-foreground leading-tight">
          CURIOSER<br />✦ AND ✦<br />CURIOSER
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-[240px] italic font-normal">
          Você bebeu a poção errada e ficou pequeno demais. Esta tela precisa de pelo menos 320px para funcionar.
        </p>
      </div>
    </div>
  )
}
