"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { fmtDate, useInsights } from "./insights-context";

export default function AdminInsightsQuestionsPage() {
  const { data, reload, searching } = useInsights();
  const [search, setSearch] = useState(data.query ?? "");

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          reload(search.trim() || undefined);
        }}
        className="mb-4 flex gap-2"
      >
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar nas perguntas dos membros… (ex: posicionamento, tom de voz)"
          className="max-w-md"
        />
        <button
          type="submit"
          disabled={searching}
          className="rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {searching ? "Buscando…" : "Buscar"}
        </button>
        {data.query && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              reload();
            }}
            className="rounded-md border px-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Limpar
          </button>
        )}
      </form>

      <p className="mb-2 text-xs text-muted-foreground">
        {data.query
          ? `${data.questions.length} resultado(s) para "${data.query}"`
          : `${data.questions.length} perguntas mais recentes`}
      </p>

      <div className="space-y-2">
        {data.questions.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhuma pergunta encontrada.
          </p>
        ) : (
          data.questions.map((q) => (
            <Link
              key={q.id}
              href={`/admin/conversas/${q.conversationId}`}
              className="block rounded-lg border p-3 transition-colors hover:bg-accent/50"
            >
              <p className="line-clamp-2 text-sm">{q.content}</p>
              <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground/70">{q.name || q.email}</span>
                <span>·</span>
                <span>{fmtDate(q.createdAt)}</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
