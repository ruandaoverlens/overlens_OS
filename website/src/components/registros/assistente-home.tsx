"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  FileQuestion,
  Scale,
  Radar,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AssistenteComposer } from "@/components/registros/assistente-composer";
import type { DocumentoRow, MarcaRow } from "@/lib/registros/types";

interface Sugestao {
  titulo: string;
  pergunta: string;
  icon: LucideIcon;
  gradient: string;
}

const SUGESTOES: Sugestao[] = [
  {
    titulo: "Exigências",
    pergunta: "O que significa uma exigência?",
    icon: FileQuestion,
    gradient: "linear-gradient(135deg, #77C5D5 0%, #A8DDE8 50%, #77C5D5 100%)",
  },
  {
    titulo: "Processos",
    pergunta: "Qual a situação atual dos nossos processos?",
    icon: Scale,
    gradient: "linear-gradient(135deg, #D6A461 0%, #FBDD7A 50%, #D6A461 100%)",
  },
  {
    titulo: "Radar",
    pergunta: "Há riscos nos candidatos do radar?",
    icon: Radar,
    gradient: "linear-gradient(135deg, #9B6FD6 0%, #C5A3F0 50%, #9B6FD6 100%)",
  },
  {
    titulo: "Renovação",
    pergunta: "O que precisamos para a renovação da OVERLENS?",
    icon: RefreshCw,
    gradient: "linear-gradient(135deg, #3A913F 0%, #6BBF6F 50%, #3A913F 100%)",
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
      const message = err instanceof Error ? err.message : "Erro inesperado.";
      toast.error(message);
      setSubmitting(false);
    }
    // Sem setSubmitting(false) no sucesso — a navegação cuida.
  }

  return (
    <div className="mx-auto max-w-4xl px-6 pt-4 pb-8 max-[479px]:px-2 md:px-8 md:pt-5 md:pb-10">
      <div className="mb-8 px-2">
        <h1 className="font-heading text-[40px] font-normal uppercase tracking-normal leading-none text-balance">
          Assistente
        </h1>
        <p className="mt-5 text-sm leading-7 text-pretty text-muted-foreground">
          Copiloto de análise jurídica com validação humana obrigatória. As respostas
          se apoiam nos dados cadastrados no módulo, nunca de memória. A decisão
          jurídica final é sempre do time com o escritório.
        </p>
      </div>

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

      <div className="grid gap-3 px-2 sm:grid-cols-2">
        {SUGESTOES.map((s) => {
          const Icon = s.icon;
          return (
            <Card
              key={s.titulo}
              className="group cursor-pointer transition-all duration-200 hover:border-muted-foreground/30 hover:bg-accent/50 hover:-translate-y-0.5 hover:shadow-md"
              onClick={() => void iniciarConversa(s.pergunta)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div
                    className="flex size-12 shrink-0 items-center justify-center rounded-xl text-black"
                    style={{
                      background: s.gradient,
                      backgroundSize: "300% 300%",
                      animation: "icon-gradient 6s ease infinite",
                    }}
                  >
                    <Icon className="size-5" strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="truncate font-heading text-sm font-semibold text-balance">
                      {s.titulo}
                    </CardTitle>
                    <CardDescription className="mt-0.5 text-xs text-pretty">
                      {s.pergunta}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
