"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/empty-state";
import { HeadingTitle } from "@/components/ui/heading";
import { SmSearchLineIcon, SmCloseLineIcon } from "@/components/icons";
import { TIPO_MATCH_LABEL, TIPO_MATCH_VARIANT } from "@/lib/registros/radar";
import { FieldError } from "@/components/ui/field";
import { JornadaNovaDialog } from "./jornada-nova-dialog";
import { useSlashFocus } from "@/lib/use-slash-focus";

type Veredicto =
  | "indisponivel"
  | "risco_alto"
  | "risco_medio"
  | "provavelmente_disponivel";

interface ResultadoItem {
  origem: "local" | "inpi_live";
  processoNumero: string;
  marca: string;
  situacao: string | null;
  titular: string | null;
  classes: string[];
  tipoMatch: "exato" | "fonetico" | "edicao";
  score: number;
}

interface ResultadoDisponibilidade {
  nome: string;
  veredicto: Veredicto;
  fontes: {
    local: { consultada: boolean; total: number };
    inpiLive: { consultada: boolean; total: number; motivo?: string };
  };
  resultados: ResultadoItem[];
}

const VEREDICTO_LABEL: Record<Veredicto, string> = {
  indisponivel: "Indisponível",
  risco_alto: "Risco alto",
  risco_medio: "Risco médio",
  provavelmente_disponivel: "Provavelmente disponível",
};

const VEREDICTO_VARIANT: Record<
  Veredicto,
  "destructive" | "warning" | "success"
> = {
  indisponivel: "destructive",
  risco_alto: "destructive",
  risco_medio: "warning",
  provavelmente_disponivel: "success",
};

const VEREDICTO_DESCRICAO: Record<Veredicto, string> = {
  indisponivel:
    "Foi encontrado um registro idêntico ou muito próximo, ativo, em classe conflitante.",
  risco_alto:
    "Há marcas semelhantes registradas ou em processo que podem gerar colidência.",
  risco_medio:
    "Existem ocorrências parecidas, mas com diferenças que podem afastar o risco.",
  provavelmente_disponivel:
    "Não foram encontradas ocorrências relevantes nas fontes consultadas.",
};

const ORIGEM_LABEL: Record<ResultadoItem["origem"], string> = {
  local: "Base local",
  inpi_live: "INPI ao vivo",
};

function parseClasses(raw: string): string[] {
  return Array.from(
    new Set(
      raw
        .split(/[,;\s]+/)
        .map((c) => c.trim())
        .filter(Boolean),
    ),
  );
}

function formatarScore(score: number): string {
  const pct = score <= 1 ? score * 100 : score;
  return `${Math.round(pct)}%`;
}

export function BuscaPageClient({
  initialNome = "",
  initialClasses = "",
}: {
  initialNome?: string;
  initialClasses?: string;
}) {
  const router = useRouter();
  const id = useId();
  const [nome, setNome] = useState(initialNome);
  const [classesInput, setClassesInput] = useState(initialClasses);
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ResultadoDisponibilidade | null>(
    null,
  );
  const abortRef = useRef<AbortController | null>(null);
  const nomeRef = useRef<HTMLInputElement>(null);
  // Chave (nome|classes) da última busca disparada — evita repetir a busca
  // automática quando a própria busca sincroniza a URL e os props mudam.
  const lastKeyRef = useRef<string | null>(null);

  const ids = { nome: `${id}-nome`, classes: `${id}-classes` };
  useSlashFocus(nomeRef);
  const classes = parseClasses(classesInput);

  function removerClasse(classe: string) {
    setClassesInput(classes.filter((c) => c !== classe).join(", "));
  }

  const buscar = useCallback(
    async (
      nomeRaw: string,
      classesRaw: string,
      opts: { controller?: AbortController; syncUrl?: boolean } = {},
    ) => {
      const nomeTrim = nomeRaw.trim();
      const classesLista = parseClasses(classesRaw);
      if (!nomeTrim) {
        setFieldError("Informe o nome da marca para verificar.");
        document.getElementById(ids.nome)?.focus();
        return;
      }
      setFieldError(null);
      lastKeyRef.current = `${nomeTrim}|${classesLista.join(",")}`;

      if (opts.syncUrl !== false) {
        // Sincroniza a URL para a busca ser compartilhável/recarregável.
        const params = new URLSearchParams();
        params.set("nome", nomeTrim);
        if (classesLista.length > 0) params.set("classes", classesLista.join(","));
        router.replace(`/registros/busca?${params.toString()}`, { scroll: false });
      }

      abortRef.current?.abort();
      const controller = opts.controller ?? new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/registros/marcas/busca", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome: nomeTrim,
            ...(classesLista.length > 0 ? { classes: classesLista } : {}),
          }),
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error ?? "Erro ao verificar disponibilidade");
        }
        setResultado(data as ResultadoDisponibilidade);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setResultado(null);
        setError(err instanceof Error ? err.message : "Erro inesperado");
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
          setLoading(false);
        }
      }
    },
    [router, ids.nome],
  );

  function handleBuscar() {
    if (loading) return;
    void buscar(nome, classesInput);
  }

  // Chegou com ?nome= na URL (ex.: vindo dos termos de pesquisa): busca automaticamente.
  // Um único effect dispara a busca e aborta no cleanup — em StrictMode o
  // primeiro disparo é abortado e o segundo refaz a busca normalmente.
  useEffect(() => {
    const nomeTrim = initialNome.trim();
    if (!nomeTrim) return;
    const key = `${nomeTrim}|${parseClasses(initialClasses).join(",")}`;
    // A URL foi sincronizada pela própria busca: nada a refazer.
    if (lastKeyRef.current === key) return;
    const controller = new AbortController();
    void buscar(initialNome, initialClasses, { controller, syncUrl: false });
    return () => {
      controller.abort();
      if (lastKeyRef.current === key) lastKeyRef.current = null;
    };
  }, [initialNome, initialClasses, buscar]);

  return (
    <div className="flex flex-col gap-6">
      <form
        className="flex flex-col gap-3 rounded-lg bg-surface-950 p-4"
        onSubmit={(e) => {
          e.preventDefault();
          handleBuscar();
        }}
        noValidate
      >
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex min-w-56 flex-1 flex-col gap-1.5">
            <Label htmlFor={ids.nome}>Nome da marca</Label>
            <Input
              ref={nomeRef}
              id={ids.nome}
              size="sm"
              autoFocus
              aria-keyshortcuts="/"
              placeholder="Ex.: Overlens"
              value={nome}
              onChange={(e) => {
                setNome(e.target.value);
                if (fieldError) setFieldError(null);
              }}
              disabled={loading}
              required
              aria-invalid={!!fieldError || undefined}
              aria-describedby={fieldError ? `${ids.nome}-erro` : undefined}
            />
            <FieldError id={`${ids.nome}-erro`}>{fieldError}</FieldError>
          </div>
          <div className="flex min-w-56 flex-1 flex-col gap-1.5">
            <Label htmlFor={ids.classes}>Classes de Nice (opcional)</Label>
            <Input
              id={ids.classes}
              size="sm"
              placeholder="Ex.: 09, 35, 41, 42"
              value={classesInput}
              onChange={(e) => setClassesInput(e.target.value)}
              disabled={loading}
            />
          </div>
          <Button
            type="submit"
            size="sm"
            loading={loading}
            loadingText="Verificando…"
          >
            Verificar disponibilidade
          </Button>
        </div>
        {classes.length > 0 && (
          <ul className="flex flex-wrap gap-1" aria-label="Classes selecionadas">
            {classes.map((c) => (
              <li key={c}>
                <Badge asChild variant="outline">
                  <button
                    type="button"
                    onClick={() => removerClasse(c)}
                    disabled={loading}
                    aria-label={`Remover classe ${c}`}
                    className="cursor-pointer focus-visible:ring-2 focus-visible:ring-foreground"
                  >
                    classe {c}
                    <SmCloseLineIcon aria-hidden="true" />
                  </button>
                </Badge>
              </li>
            ))}
          </ul>
        )}
        {error && (
          <FieldError className="pl-0">{error}</FieldError>
        )}
      </form>

      {!resultado ? (
        <EmptyState
          icon={<SmSearchLineIcon />}
          title="Nenhuma verificação ainda"
          description="Informe o nome de uma marca para cruzar com a base local de processos e, quando disponível, com a consulta ao vivo do INPI."
          action={
            <Button
              type="button"
              size="sm"
              onClick={() => {
                nomeRef.current?.focus();
                nomeRef.current?.select();
              }}
            >
              Informar o nome da marca
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          {/* Veredicto */}
          <div className="flex flex-col gap-2 rounded-lg bg-surface-950 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={VEREDICTO_VARIANT[resultado.veredicto]}>
                {VEREDICTO_LABEL[resultado.veredicto]}
              </Badge>
              <span className="text-sm font-medium">
                &ldquo;{resultado.nome}&rdquo;
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {VEREDICTO_DESCRICAO[resultado.veredicto]}
            </p>
            <p className="text-xs text-muted-foreground">
              Esta análise é indicativa. A colidência real depende de análise
              jurídica — a decisão final é sempre humana.
            </p>
            {!resultado.fontes.inpiLive.consultada && (
              <p className="text-xs text-warning">
                Consulta ao vivo ao INPI indisponível
                {resultado.fontes.inpiLive.motivo
                  ? ` (${resultado.fontes.inpiLive.motivo})`
                  : ""}
                — mostrando apenas a base local.
              </p>
            )}
          </div>

          {/* Resultados */}
          <section className="flex flex-col gap-2">
            <HeadingTitle as="h2" size="eyebrow">
              Ocorrências encontradas
            </HeadingTitle>
            {resultado.resultados.length === 0 ? (
              <EmptyState
                icon={<SmSearchLineIcon />}
                title="Nenhuma ocorrência relevante"
                description="Não foram encontradas marcas semelhantes nas fontes consultadas. O caminho está livre para iniciar o registro."
                action={
                  <JornadaNovaDialog
                    defaultNome={resultado.nome}
                    triggerLabel="Iniciar registro desta marca"
                  />
                }
              />
            ) : (
              <div className="flex flex-col gap-2">
                {resultado.resultados.map((r, i) => (
                  <div
                    key={`${r.origem}-${r.processoNumero}-${i}`}
                    className="flex flex-col gap-3 rounded-lg bg-surface-950 px-4 py-3 sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">
                          {ORIGEM_LABEL[r.origem]}
                        </Badge>
                        <Badge variant={TIPO_MATCH_VARIANT[r.tipoMatch]}>
                          {TIPO_MATCH_LABEL[r.tipoMatch]}
                        </Badge>
                        <span className="truncate text-sm font-medium">
                          {r.marca}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {r.processoNumero && <span>proc. {r.processoNumero}</span>}
                        {r.titular && <span>· {r.titular}</span>}
                        {r.situacao && <span>· {r.situacao}</span>}
                        {r.classes.length > 0 && (
                          <span>· classes {r.classes.join(", ")}</span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 text-right text-xs text-muted-foreground">
                      score {formatarScore(r.score)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Fontes consultadas */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>
              Base local: {resultado.fontes.local.consultada
                ? `${resultado.fontes.local.total} resultado(s)`
                : "não consultada"}
            </span>
            <span>
              INPI ao vivo: {resultado.fontes.inpiLive.consultada
                ? `${resultado.fontes.inpiLive.total} resultado(s)`
                : "não consultada"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
