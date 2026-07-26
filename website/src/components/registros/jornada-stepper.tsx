"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  SmCheckLineIcon,
  SmLockLineIcon,
  SmDocLineIcon,
} from "@/components/icons";
import {
  JORNADA_PASSOS,
  TOTAL_PASSOS,
  JORNADA_STATUS_LABEL,
  JORNADA_STATUS_VARIANT,
} from "@/lib/registros/jornada";
import type {
  JornadaRow,
  JornadaEvidenciaRow,
  JornadaPasso,
} from "@/lib/registros/jornada";
import { formatarData, formatarTamanho } from "@/lib/registros/types";
import {
  JornadaTermosPesquisa,
  JornadaSugestaoClasses,
} from "@/components/registros/jornada-analise-nome";

interface JornadaStepperProps {
  jornada: JornadaRow;
  evidencias: JornadaEvidenciaRow[];
}

async function putToSignedUrl(uploadUrl: string, token: string, file: File) {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "x-upsert": "false",
      ...(file.type ? { "Content-Type": file.type } : {}),
    },
    body: file,
  });
  if (!res.ok) {
    throw new Error(`Falha no upload (HTTP ${res.status})`);
  }
}

function LinksDoPasso({ passo }: { passo: JornadaPasso }) {
  return (
    <div className="flex flex-wrap gap-2">
      {passo.links.map((link) =>
        link.interno ? (
          <Button key={link.url} variant="outline" size="sm" asChild>
            <Link href={link.url}>{link.titulo}</Link>
          </Button>
        ) : (
          <Button key={link.url} variant="outline" size="sm" asChild>
            <a href={link.url} target="_blank" rel="noopener noreferrer">
              {link.titulo}
            </a>
          </Button>
        ),
      )}
    </div>
  );
}

function PassoConcluido({
  passo,
  evidencias,
}: {
  passo: JornadaPasso;
  evidencias: JornadaEvidenciaRow[];
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--surface-800)] text-[color:var(--success,#4ade80)]">
          <SmCheckLineIcon className="size-4" />
        </div>
        <div className="w-px flex-1 bg-[var(--surface-800)]" />
      </div>
      <div className="flex flex-1 flex-col gap-1 pb-5">
        <div className="flex items-baseline gap-2">
          <span className="text-xs text-muted-foreground">Passo {passo.numero}</span>
          <span className="text-sm font-medium">{passo.titulo}</span>
        </div>
        {evidencias.map((ev) => (
          <div key={ev.id} className="flex flex-col gap-0.5 text-xs text-muted-foreground">
            {ev.nota && <p className="whitespace-pre-wrap">{ev.nota}</p>}
            {ev.arquivo_nome && (
              <span className="flex items-center gap-1">
                <SmDocLineIcon className="size-3.5" />
                {ev.arquivo_nome}
                {ev.tamanho ? ` · ${formatarTamanho(ev.tamanho)}` : ""}
              </span>
            )}
            <span>Concluído em {formatarData(ev.created_at.slice(0, 10))}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PassoFuturo({ passo }: { passo: JornadaPasso }) {
  return (
    <div className="flex gap-3 opacity-50">
      <div className="flex flex-col items-center">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full border border-[var(--surface-800)] text-muted-foreground">
          <SmLockLineIcon className="size-3.5" />
        </div>
        <div className="w-px flex-1 bg-[var(--surface-800)]" />
      </div>
      <div className="flex flex-1 flex-col gap-0.5 pb-5">
        <div className="flex items-baseline gap-2">
          <span className="text-xs text-muted-foreground">Passo {passo.numero}</span>
          <span className="text-sm font-medium">{passo.titulo}</span>
        </div>
        <p className="text-xs text-muted-foreground">{passo.resumo}</p>
      </div>
    </div>
  );
}

function PassoAtual({
  jornada,
  passo,
}: {
  jornada: JornadaRow;
  passo: JornadaPasso;
}) {
  const router = useRouter();
  const [nota, setNota] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { tipo, label, placeholder } = passo.evidencia;

  async function handleConcluir(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (tipo === "texto" && !nota.trim()) {
      setError("Registre a evidência antes de avançar.");
      return;
    }
    if (tipo === "arquivo" && !file) {
      setError("Anexe o arquivo de evidência antes de avançar.");
      return;
    }

    setLoading(true);
    try {
      let storagePath: string | null = null;
      if (file) {
        const signRes = await fetch("/api/registros/jornadas/sign-upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jornadaId: jornada.id,
            filename: file.name,
            size: file.size,
          }),
        });
        const signData = await signRes.json();
        if (!signRes.ok) throw new Error(signData.error ?? "Erro ao preparar upload");
        await putToSignedUrl(signData.uploadUrl, signData.token, file);
        storagePath = signData.path;
      }

      const res = await fetch("/api/registros/jornadas/avancar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jornadaId: jornada.id,
          passo: passo.numero,
          nota: nota.trim() || null,
          storagePath,
          arquivoNome: file?.name ?? null,
          mimeType: file?.type || null,
          tamanho: file?.size ?? null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao avançar");

      setNota("");
      setFile(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
          {passo.numero}
        </div>
        <div className="w-px flex-1 bg-[var(--surface-800)]" />
      </div>
      <Card className="mb-5 flex-1 gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">
            Passo {passo.numero} de {TOTAL_PASSOS}
          </span>
          <h2 className="text-lg font-medium">{passo.titulo}</h2>
        </div>

        <div className="flex flex-col gap-2">
          {passo.instrucoes.map((par, i) => (
            <p key={i} className="text-sm text-muted-foreground">
              {par}
            </p>
          ))}
        </div>

        {passo.prazo && (
          <p className="rounded-md border border-[var(--surface-800)] px-3 py-2 text-sm">
            <span className="font-medium">Prazo: </span>
            <span className="text-muted-foreground">{passo.prazo}</span>
          </p>
        )}

        <p className="rounded-md border border-[var(--surface-800)] px-3 py-2 text-sm">
          <span className="font-medium">Postura recomendada: </span>
          <span className="text-muted-foreground">{passo.postura}</span>
        </p>

        <LinksDoPasso passo={passo} />

        {passo.numero === 1 && <JornadaTermosPesquisa jornada={jornada} />}
        {passo.numero === 2 && <JornadaSugestaoClasses jornada={jornada} />}

        <form onSubmit={handleConcluir} className="flex flex-col gap-3 border-t border-[var(--surface-800)] pt-4">
          <div className="flex flex-col gap-1.5">
            <Label>{label}</Label>
            {tipo === "arquivo" ? (
              <>
                <Input
                  size="sm"
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
                <Input
                  size="sm"
                  value={nota}
                  onChange={(e) => setNota(e.target.value)}
                  placeholder={placeholder ?? "Observações (opcional)"}
                />
              </>
            ) : (
              <Textarea
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                placeholder={placeholder}
                rows={3}
              />
            )}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div>
            <Button type="submit" disabled={loading}>
              {loading
                ? "Registrando…"
                : passo.numero >= TOTAL_PASSOS
                  ? "Concluir registro"
                  : "Concluir passo"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export function JornadaStepper({ jornada, evidencias }: JornadaStepperProps) {
  const concluidos =
    jornada.status === "concluida" ? TOTAL_PASSOS : jornada.passo_atual - 1;
  const progresso = Math.round((concluidos / TOTAL_PASSOS) * 100);

  const evidenciasPorPasso = new Map<number, JornadaEvidenciaRow[]>();
  for (const ev of evidencias) {
    const arr = evidenciasPorPasso.get(ev.passo) ?? [];
    arr.push(ev);
    evidenciasPorPasso.set(ev.passo, arr);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {concluidos} de {TOTAL_PASSOS} passos concluídos
          </span>
          <Badge variant={JORNADA_STATUS_VARIANT[jornada.status]}>
            {JORNADA_STATUS_LABEL[jornada.status]}
          </Badge>
        </div>
        <Progress value={progresso} />
      </div>

      <div className="flex flex-col">
        {JORNADA_PASSOS.map((passo) => {
          if (passo.numero < jornada.passo_atual || jornada.status === "concluida") {
            return (
              <PassoConcluido
                key={passo.numero}
                passo={passo}
                evidencias={evidenciasPorPasso.get(passo.numero) ?? []}
              />
            );
          }
          if (passo.numero === jornada.passo_atual && jornada.status === "em_andamento") {
            return <PassoAtual key={passo.numero} jornada={jornada} passo={passo} />;
          }
          return <PassoFuturo key={passo.numero} passo={passo} />;
        })}
      </div>
    </div>
  );
}
