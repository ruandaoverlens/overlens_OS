"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Scale, RefreshCw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { SmQuestionLineIcon, SmGraphicEqLineIcon } from "@/components/icons";
import { AssistenteComposer } from "@/components/registros/assistente-composer";
import { notify } from "@/lib/notifications/toast";
import { getGradient, isLightBrandBase } from "@/lib/brand-gradients";
import type { DocumentoRow, MarcaRow } from "@/lib/registros/types";

interface Sugestao {
  titulo: string;
  pergunta: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" }>;
}

// Scale/RefreshCw seguem no lucide: a biblioteca de ícones não tem equivalente.
const SUGESTOES: Sugestao[] = [
  {
    titulo: "Exigências",
    pergunta: "O que significa uma exigência?",
    icon: SmQuestionLineIcon,
  },
  {
    titulo: "Processos",
    pergunta: "Qual a situação atual dos nossos processos?",
    icon: Scale,
  },
  {
    titulo: "Radar",
    pergunta: "Há riscos nos candidatos do radar?",
    icon: SmGraphicEqLineIcon,
  },
  {
    titulo: "Renovação",
    pergunta: "O que precisamos para a renovação da OVERLENS?",
    icon: RefreshCw,
  },
];

interface AssistenteHomeProps {
  marcas: Pick<MarcaRow, "id" | "nome">[];
  documentos: Pick<DocumentoRow, "id" | "marca_id" | "titulo" | "tipo" | "sensivel" | "mime_type">[];
}

export function AssistenteHome({ marcas, documentos }: AssistenteHomeProps) {
  const router = useRouter();
  const [marcaId, setMarcaId] = React.useState<string>("");
  const [docIds, setDocIds] = React.useState<string[]>([]);
  const [submitting, setSubmitting] = React.useState(false);

  // Ao trocar de marca, descarta anexos que não pertencem mais à seleção.
  React.useEffect(() => {
    setDocIds((prev) =>
      prev.filter((id) =>
        documentos.some((d) => d.id === id && (!marcaId || d.marca_id === marcaId)),
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marcaId]);

  function toggleDoc(id: string) {
    setDocIds((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]));
  }

  async function iniciarConversa(pergunta: string) {
    const trimmed = pergunta.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/registros/assistente/conversas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstMessage: trimmed,
          marcaId: marcaId || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Não foi possível iniciar a conversa.");
      }
      const { id } = (await res.json()) as { id: string };
      const query = docIds.length > 0 ? `?docs=${docIds.join(",")}` : "";
      router.push(`/registros/assistente/${id}${query}`);
      router.refresh();
    } catch (err) {
      notify.fromError(err, "Não foi possível iniciar a conversa");
      setSubmitting(false);
    }
    // Sem setSubmitting(false) no sucesso — a navegação cuida.
  }

  return (
    <div className="mx-auto max-w-4xl px-4 pt-4 pb-8 md:px-8 md:pt-5 md:pb-10">
      <PageHeader
        title="Assistente"
        size="xl"
        description="Copiloto de análise jurídica com validação humana obrigatória. As respostas se apoiam nos dados cadastrados no módulo, nunca de memória. A decisão jurídica final é sempre do time com o escritório."
        className="mb-6 px-2"
      />

      <div className="mb-8 px-2">
        <AssistenteComposer
          marcas={marcas}
          documentos={documentos}
          marcaId={marcaId}
          onMarcaChange={setMarcaId}
          docIds={docIds}
          onToggleDoc={toggleDoc}
          onSubmit={iniciarConversa}
          loading={submitting}
        />
      </div>

      <ul className="grid gap-3 px-2 sm:grid-cols-2" aria-label="Sugestões de perguntas">
        {SUGESTOES.map((s) => {
          const Icon = s.icon;
          const gradiente = getGradient(s.titulo);
          // Marcas de cor cheia escura (kobold, boreal) derrubam o contraste do
          // glifo preto quando a animação traz a parada de 0% para baixo dele.
          const baseEscura = !isLightBrandBase(gradiente);
          return (
            <li key={s.titulo}>
              <Card className="group relative h-full transition-all duration-200 hover:border-muted-foreground/30 hover:bg-accent/50 hover:-translate-y-0.5 hover:shadow-md focus-within:ring-2 focus-within:ring-foreground">
                <CardHeader>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => void iniciarConversa(s.pergunta)}
                    className="flex w-full items-center gap-3 text-left outline-none after:absolute after:inset-0 after:content-[''] disabled:cursor-not-allowed"
                  >
                    {/* Os gradientes de marca são claros nos dois temas (são
                        cores de marca, não seguem o tema), então o glifo é
                        preto literal — não o preto que inverteria no escuro. */}
                    <span
                      className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl text-absolute-black"
                      style={{
                        background: gradiente,
                        backgroundSize: "300% 300%",
                        animation: "icon-gradient 6s ease infinite",
                      }}
                    >
                      {baseEscura && (
                        // Véu branco literal sobre a marca escura: mantém o
                        // ladrilho claro em qualquer quadro da animação.
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 bg-absolute-white/55"
                        />
                      )}
                      <Icon className="relative size-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <CardTitle size="sm" className="truncate text-balance">
                        {s.titulo}
                      </CardTitle>
                      <CardDescription className="mt-0.5 text-xs text-pretty">
                        {s.pergunta}
                      </CardDescription>
                    </span>
                  </button>
                </CardHeader>
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
