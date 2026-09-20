"use client"

import { useEffect, type RefObject } from "react"
import { isTypingTarget } from "@/lib/is-typing-target"

export type SlashFocusOptions = {
  /**
   * Selecionar o conteúdo ao focar.
   *
   * Padrão (`undefined`): automático — seleciona só quando isso não pode
   * destruir texto do usuário, ou seja, quando o campo é `type="search"`
   * (digitar substituir a busca anterior é o esperado) ou está vazio.
   * Um composer (textarea com rascunho) nunca é selecionado por acidente.
   *
   * `true` força a seleção; `false` nunca seleciona.
   */
  select?: boolean
}

/** Há um diálogo (Dialog, Drawer, Sheet, lightbox) aberto na tela? */
function openDialogs(): HTMLElement[] {
  if (typeof document === "undefined") return []
  // Radix só monta o conteúdo enquanto o diálogo está aberto, então a simples
  // presença do nó já significa "aberto".
  return Array.from(
    document.querySelectorAll<HTMLElement>(
      '[data-slot="dialog-content"], [role="dialog"], [role="alertdialog"]'
    )
  )
}

/**
 * Atalho "/" para focar um campo (normalmente a busca da página).
 *
 * - Ignorado quando o usuário já está digitando (`isTypingTarget`) ou quando
 *   há modificador (Ctrl/⌘/Alt) — "/" com modificador pertence ao navegador.
 * - Ignorado enquanto houver um diálogo aberto que não contenha o campo: lá o
 *   foco pertence ao focus trap do Radix, e engolir a tecla com
 *   `preventDefault` só atrapalharia.
 * - Seleção: ver `SlashFocusOptions.select` (padrão automático e conservador).
 * - `enabled = false` não registra o listener (use quando não há campo).
 *
 * Anuncie o atalho no campo com `aria-keyshortcuts="/"`.
 *
 * ```tsx
 * const searchRef = useRef<HTMLInputElement>(null)
 * useSlashFocus(searchRef, showSearch)
 * useSlashFocus(inputRef, true, { select: true }) // sempre substituir
 * ```
 */
export function useSlashFocus(
  ref: RefObject<HTMLElement | null>,
  enabled: boolean = true,
  options?: SlashFocusOptions
): void {
  const select = options?.select
  useEffect(() => {
    if (!enabled) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return
      if (isTypingTarget(e.target)) return
      const el = ref.current
      if (!el) return
      // Diálogo aberto por cima do campo: a tecla é do diálogo, não nossa.
      if (openDialogs().some((dialog) => !dialog.contains(el))) return
      e.preventDefault()
      el.focus()
      if (
        !(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)
      ) {
        return
      }
      const auto =
        (el instanceof HTMLInputElement && el.type === "search") ||
        el.value === ""
      if (select ?? auto) el.select()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [ref, enabled, select])
}
