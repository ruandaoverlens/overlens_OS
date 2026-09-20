"use client"

import { useEffect, useState } from "react"

/** Retorna `value` com atraso de `delay` ms após a última mudança (padrão 250ms). */
export function useDebouncedValue<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])

  return debounced
}
