"use client"

import { useCallback } from "react"
import { usePathname, useSearchParams } from "next/navigation"

// Última query escrita nesta tick. Chamadas consecutivas de setValue (em hooks
// diferentes, no mesmo evento) partem daqui em vez de um snapshot desatualizado.
let pendingSearch: string | null = null

/**
 * Estado sincronizado com a query string (`?key=value`).
 *
 * - Lê de `useSearchParams`; cai no `fallback` quando a chave não existe.
 * - Escreve com `window.history.replaceState` (sem scroll). O App Router
 *   (Next ≥ 14.1) sincroniza `useSearchParams` com pushState/replaceState
 *   nativos, então não há round-trip RSC a cada mudança de filtro.
 * - Remove a chave da URL quando o valor é vazio, nulo ou igual ao fallback.
 * - `{ history: "push" }` empilha a mudança no histórico — use quando o Back
 *   do navegador deve desfazer a ação (abrir um lightbox via `?item=`, por
 *   exemplo) em vez de sair da página. O padrão continua sendo "replace".
 *
 * ```ts
 * const [tab, setTab] = useUrlState<"all" | "mine">("tab", "all")
 * const [q, setQ] = useUrlState<string>("q", "") // informe <string> quando o fallback for ""
 * const [item, setItem] = useUrlState<string | null>("item", null)
 * setItem(id, { history: "push" }) // Back fecha o lightbox
 * ```
 */
export type UrlStateSetOptions = { history?: "replace" | "push" }

export function useUrlState<T extends string | null = string>(
  key: string,
  fallback: T
): readonly [T, (next: T, options?: UrlStateSetOptions) => void] {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const raw = searchParams.get(key)
  const value = (raw === null || raw === "" ? fallback : raw) as T

  const setValue = useCallback(
    (next: T, options?: UrlStateSetOptions) => {
      if (typeof window === "undefined") return
      // Lê a query atual do navegador (não do snapshot do hook) para que
      // chamadas consecutivas de vários useUrlState não se sobrescrevam.
      const current = pendingSearch ?? window.location.search
      const params = new URLSearchParams(current)
      if (next === null || next === "" || next === fallback) {
        params.delete(key)
      } else {
        params.set(key, next)
      }
      const qs = params.toString()
      pendingSearch = qs ? `?${qs}` : ""
      queueMicrotask(() => {
        pendingSearch = null
      })
      const url = `${pathname}${qs ? `?${qs}` : ""}${window.location.hash}`
      if (options?.history === "push") {
        window.history.pushState(null, "", url)
      } else {
        window.history.replaceState(null, "", url)
      }
    },
    [key, fallback, pathname]
  )

  return [value, setValue] as const
}
