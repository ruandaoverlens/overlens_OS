"use client";

import { useEffect, useState } from "react";
import { useUrlState } from "@/lib/use-url-state";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { matchesNormalized, normalizeText } from "@/lib/normalize-text";

/**
 * Busca local sincronizada com `?q=`: o input usa estado local (digitação
 * fluida), o valor vai para a URL após 250ms e o input é atualizado quando a
 * URL muda por fora (voltar/avançar, limpar filtros).
 */
export function useBuscaUrl() {
  const [q, setQ] = useUrlState<string>("q", "");
  const [search, setSearch] = useState(q);
  const [prevQ, setPrevQ] = useState(q);
  if (q !== prevQ) {
    setPrevQ(q);
    setSearch(q);
  }
  const debounced = useDebouncedValue(search, 250);
  useEffect(() => {
    if (search !== debounced) return; // ainda digitando
    if (debounced !== q) setQ(debounced);
  }, [search, debounced, q, setQ]);

  return {
    search,
    setSearch,
    /** `true` enquanto o termo digitado ainda não virou filtro (debounce). */
    pendente: search.trim() !== q.trim(),
    /** Termo normalizado (sem acento, minúsculo) usado para filtrar. */
    query: normalizeText(q),
    clear: () => {
      setSearch("");
      setQ("");
    },
  };
}

/**
 * `true` quando algum dos textos contém o termo, ignorando acento e caixa —
 * "marca registrada" encontra "Marca Registrada" e "Registro" encontra
 * "registro". O `query` já vem normalizado de `useBuscaUrl`.
 */
export function contem(query: string, ...textos: Array<string | null | undefined>): boolean {
  if (!query) return true;
  return textos.some((t) => !!t && matchesNormalized(t, query));
}
