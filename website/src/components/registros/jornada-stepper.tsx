"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { HeadingTitle } from "@/components/ui/heading";
import {
  SmCheckLineIcon,
  SmLockLineIcon,
  SmDocLineIcon,
} from "@/components/icons";
import { notify } from "@/lib/notifications/toast";
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
import { FieldError } from "@/components/ui/field";
import {
  UPLOAD_ACCEPT,
  isAbortError,
  putToSignedUrl,
  validarArquivo,
} from "./_upload";

interface JornadaStepperProps {
  jornada: JornadaRow;
  evidencias: JornadaEvidenciaRow[];
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
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-800 text-success">
          <SmCheckLineIcon className="size-4" />
        </div>
        <div className="w-px flex-1 bg-surface-800" />
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
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div
          className="flex size-7 shrink-0 items-center justify-center rounded-full border border-surface-800 text-muted-foreground"
          title="Passo bloqueado"
        >
          <SmLockLineIcon className="size-3.5" aria-hidden="true" />
          <span className="sr-only">Passo bloqueado</span>
        </div>
        <div className="w-px flex-1 bg-surface-800" />
      </div>
      <div className="flex flex-1 flex-col gap-0.5 pb-5">
        <div className="flex items-baseline gap-2">
          <span className="text-xs text-muted-foreground">Passo {passo.numero}</span>
          <span className="text-sm font-medium text-muted-foreground">{passo.titulo}</span>
        </div>
        <p className="text-xs text-muted-foreground">{passo.resumo}</p>
      </div>
    </div>
  );
}

type Campo = "nota" | "arquivo";

function PassoAtual({
  jornada,
  passo,
}: {
  jornada: JornadaRow;
  passo: JornadaPasso;
}) {
  const router = useRouter();
  const id = useId();
  const [nota, setNota] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [errors, setErrors] = useState<Partial<Record<Campo, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const { tipo, label, placeholder } = passo.evidencia;

  const ids = {
    arquivo: `${id}-arquivo`,
    nota: `${id}-nota`,
  };

  // Cancela um upload em andamento ao desmontar (ex.: navegação).
  useEffect(() => () => abortRef.current?.abort(), []);

  function cancelarEnvio() {
    const controller = abortRef.current;
    if (!controller) return;
    controller.abort();
    abortRef.current = null;
    notify.info("Envio cancelado");
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.files?.[0] ?? null;
    setFile(next);
    const msg = next ? validarArquivo(next) : undefined;
    setErrors((prev) => ({ ...prev, arquivo: msg ?? undefined }));
  }

  function validar(): boolean {
    const next: Partial<Record<Campo, string>> = {};
    if (tipo === "texto" && !nota.trim()) {
      next.nota = "Registre a evidência antes de avançar.";
    }
    if (tipo === "arquivo") {
      if (!file) next.arquivo = "Anexe o arquivo de evidência antes de avançar.";
      else {
        const msg = validarArquivo(file);
        if (msg) next.arquivo = msg;
      }
    }
    setErrors(next);
    const primeiro = (Object.keys(next) as Campo[])[0];
    if (primeiro) document.getElementById(ids[primeiro])?.focus();
    return !primeiro;
  }

  async function handleConcluir(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return; // evita duplo envio (Enter + clique)
    setServerError(null);
    if (!validar()) return;

    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    try {
      let storagePath: string | null = null;
      if (file) {
        setProgress(0);
        const signRes = await fetch("/api/registros/jornadas/sign-upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jornadaId: jornada.id,
            filename: file.name,
            size: file.size,
          }),
          signal: controller.signal,
        });
        const signData = await signRes.json();
        if (!signRes.ok) throw new Error(signData.error ?? "Erro ao preparar upload");
        await putToSignedUrl({
          uploadUrl: signData.uploadUrl,
          token: signData.token,
          file,
          signal: controller.signal,
          onProgress: setProgress,
        });
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
        signal: controller.signal,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao avançar");

      setNota("");
      setFile(null);
      setErrors({});
      notify.success(
        passo.numero >= TOTAL_PASSOS ? "Registro concluído" : "Passo concluído",
      );
      router.refresh();
    } catch (err) {
      if (isAbortError(err)) return;
      setServerError(err instanceof Error ? err.message : "Erro inesperado");
      notify.fromError(err, "Não foi possível concluir o passo");
    } finally {
      abortRef.current = null;
      setLoading(false);
      setProgress(null);
    }
  }

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
          {passo.numero}
        </div>
        <div className="w-px flex-1 bg-surface-800" />
      </div>
      <Card className="mb-5 flex-1 gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">
            Passo {passo.numero} de {TOTAL_PASSOS}
          </span>
          <HeadingTitle as="h2" size="sm">
            {passo.titulo}
          </HeadingTitle>
        </div>

        <div className="flex flex-col gap-2">
          {passo.instrucoes.map((par, i) => (
            <p key={i} className="text-sm text-muted-foreground">
              {par}
            </p>
          ))}
        </div>

        {passo.prazo && (
          <p className="rounded-md border border-surface-800 px-3 py-2 text-sm">
            <span className="font-medium">Prazo: </span>
            <span className="text-muted-foreground">{passo.prazo}</span>
          </p>
        )}

        <p className="rounded-md border border-surface-800 px-3 py-2 text-sm">
          <span className="font-medium">Postura recomendada: </span>
          <span className="text-muted-foreground">{passo.postura}</span>
        </p>

        <LinksDoPasso passo={passo} />

        {passo.numero === 1 && <JornadaTermosPesquisa jornada={jornada} />}
        {passo.numero === 2 && <JornadaSugestaoClasses jornada={jornada} />}

        <form
          onSubmit={handleConcluir}
          className="flex flex-col gap-3 border-t border-surface-800 pt-4"
          noValidate
        >
          {tipo === "arquivo" ? (
            <>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={ids.arquivo}>{label}</Label>
                <Input
                  id={ids.arquivo}
                  size="sm"
                  type="file"
                  accept={UPLOAD_ACCEPT}
                  onChange={handleFileChange}
                  disabled={loading}
                  required
                  aria-invalid={!!errors.arquivo || undefined}
                  aria-describedby={
                    errors.arquivo ? `${ids.arquivo}-erro` : `${ids.arquivo}-ajuda`
                  }
                />
                <FieldError id={`${ids.arquivo}-erro`}>{errors.arquivo}</FieldError>
                {!errors.arquivo && (
                  <p id={`${ids.arquivo}-ajuda`} className="pl-2 text-xs text-muted-foreground">
                    PDF, PNG, JPG ou WEBP até 100 MB.
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={ids.nota}>Observações</Label>
                <Input
                  id={ids.nota}
                  size="sm"
                  value={nota}
                  onChange={(e) => setNota(e.target.value)}
                  disabled={loading}
                  placeholder={placeholder ?? "Observações (opcional)"}
                />
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={ids.nota}>{label}</Label>
              <Textarea
                id={ids.nota}
                value={nota}
                onChange={(e) => {
                  setNota(e.target.value);
                  if (errors.nota) setErrors((prev) => ({ ...prev, nota: undefined }));
                }}
                disabled={loading}
                placeholder={placeholder}
                rows={3}
                required
                aria-invalid={!!errors.nota || undefined}
                aria-describedby={errors.nota ? `${ids.nota}-erro` : undefined}
              />
              <FieldError id={`${ids.nota}-erro`}>{errors.nota}</FieldError>
            </div>
          )}

          {progress !== null && (
            <div className="flex flex-col gap-1.5">
              <Progress
                value={progress}
                aria-label="Progresso do upload"
                aria-valuetext={`${progress}%`}
              />
              <span className="pl-2 text-xs text-muted-foreground" aria-live="polite">
                {progress < 100 ? `Enviando… ${progress}%` : "Registrando evidência…"}
              </span>
            </div>
          )}

          {serverError && (
            <FieldError className="pl-0">{serverError}</FieldError>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" loading={loading} loadingText="Registrando…">
              {passo.numero >= TOTAL_PASSOS ? "Concluir registro" : "Concluir passo"}
            </Button>
            {progress !== null && (
              <Button type="button" variant="ghost" onClick={cancelarEnvio}>
                Cancelar envio
              </Button>
            )}
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
        <Progress value={progresso} aria-label="Progresso do registro" />
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
