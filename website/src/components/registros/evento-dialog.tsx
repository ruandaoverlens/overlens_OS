"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { notify } from "@/lib/notifications/toast";
import { EVENTO_TIPO_OPTIONS, EVENTO_TIPO_LABEL } from "@/lib/registros/types";
import type { EventoTipo } from "@/lib/registros/types";
import { FieldError } from "@/components/ui/field";

interface ProcessoOption {
  id: string;
  numero: string;
}

interface EventoDialogProps {
  processos: ProcessoOption[];
}

type Campo = "processo" | "titulo" | "data";

export function EventoDialog({ processos }: EventoDialogProps) {
  const router = useRouter();
  const confirm = useConfirm();
  const id = useId();
  const processoInicial = processos[0]?.id ?? "";
  const [open, setOpen] = useState(false);
  const [processoId, setProcessoId] = useState(processoInicial);
  const [tipo, setTipo] = useState<EventoTipo>("deposito");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [data, setData] = useState("");
  const [rpiNumero, setRpiNumero] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<Campo, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const ids = {
    processo: `${id}-processo`,
    tipo: `${id}-tipo`,
    data: `${id}-data`,
    titulo: `${id}-titulo`,
    descricao: `${id}-descricao`,
    rpi: `${id}-rpi`,
  };

  const sujo =
    processoId !== processoInicial ||
    tipo !== "deposito" ||
    titulo.trim() !== "" ||
    descricao.trim() !== "" ||
    data !== "" ||
    rpiNumero.trim() !== "";

  function reset() {
    setProcessoId(processoInicial);
    setTipo("deposito");
    setTitulo("");
    setDescricao("");
    setData("");
    setRpiNumero("");
    setErrors({});
    setServerError(null);
  }

  /** Fecha o diálogo; com rascunho preenchido, confirma o descarte antes. */
  async function requestClose() {
    if (loading) return;
    if (sujo) {
      const ok = await confirm({
        title: "Descartar alterações?",
        description: "O que você preencheu neste formulário será perdido.",
        confirmLabel: "Descartar",
        destructive: true,
      });
      if (!ok) return;
    }
    reset();
    setOpen(false);
  }

  function validar(): boolean {
    const next: Partial<Record<Campo, string>> = {};
    if (!processoId) next.processo = "Selecione um processo.";
    if (!titulo.trim()) next.titulo = "Informe o título do evento.";
    if (!data) next.data = "Informe a data.";
    setErrors(next);
    const primeiro = (Object.keys(next) as Campo[])[0];
    if (primeiro) document.getElementById(ids[primeiro])?.focus();
    return !primeiro;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setServerError(null);
    if (!validar()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/registros/eventos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          processo_id: processoId,
          tipo,
          titulo: titulo.trim(),
          descricao: descricao.trim() || null,
          data,
          rpi_numero: rpiNumero.trim() || null,
        }),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error ?? "Erro ao criar evento");

      setOpen(false);
      reset();
      notify.success("Evento criado");
      router.refresh();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Erro inesperado");
      notify.fromError(err, "Não foi possível salvar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (v) setOpen(true);
        else void requestClose();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={processos.length === 0}>
          Novo evento
        </Button>
      </DialogTrigger>
      <DialogContent
        onEscapeKeyDown={(e) => {
          if (loading) e.preventDefault();
        }}
        onPointerDownOutside={(e) => {
          if (loading) e.preventDefault();
        }}
        onInteractOutside={(e) => {
          if (loading) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Novo evento</DialogTitle>
          <DialogDescription>Marco na timeline de um processo.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={ids.processo}>Processo</Label>
            <NativeSelect
              id={ids.processo}
              size="sm"
              autoFocus
              value={processoId}
              onChange={(e) => {
                setProcessoId(e.target.value);
                if (errors.processo) setErrors((p) => ({ ...p, processo: undefined }));
              }}
              disabled={loading}
              aria-invalid={!!errors.processo || undefined}
              aria-describedby={errors.processo ? `${ids.processo}-erro` : undefined}
            >
              {processos.map((p) => (
                <NativeSelectOption key={p.id} value={p.id}>
                  {p.numero}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <FieldError id={`${ids.processo}-erro`}>{errors.processo}</FieldError>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={ids.tipo}>Tipo</Label>
              <NativeSelect
                id={ids.tipo}
                size="sm"
                value={tipo}
                onChange={(e) => setTipo(e.target.value as EventoTipo)}
                disabled={loading}
              >
                {EVENTO_TIPO_OPTIONS.map((t) => (
                  <NativeSelectOption key={t} value={t}>
                    {EVENTO_TIPO_LABEL[t]}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={ids.data}>Data</Label>
              <Input
                id={ids.data}
                size="sm"
                type="date"
                value={data}
                onChange={(e) => {
                  setData(e.target.value);
                  if (errors.data) setErrors((p) => ({ ...p, data: undefined }));
                }}
                disabled={loading}
                required
                aria-invalid={!!errors.data || undefined}
                aria-describedby={errors.data ? `${ids.data}-erro` : undefined}
              />
              <FieldError id={`${ids.data}-erro`}>{errors.data}</FieldError>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={ids.titulo}>Título</Label>
            <Input
              id={ids.titulo}
              size="sm"
              value={titulo}
              onChange={(e) => {
                setTitulo(e.target.value);
                if (errors.titulo) setErrors((p) => ({ ...p, titulo: undefined }));
              }}
              placeholder="Ex.: Publicação na RPI"
              disabled={loading}
              required
              aria-invalid={!!errors.titulo || undefined}
              aria-describedby={errors.titulo ? `${ids.titulo}-erro` : undefined}
            />
            <FieldError id={`${ids.titulo}-erro`}>{errors.titulo}</FieldError>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={ids.descricao}>Descrição</Label>
            <Textarea
              id={ids.descricao}
              size="sm"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Detalhes do evento (opcional)"
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={ids.rpi}>Número da RPI</Label>
            <Input
              id={ids.rpi}
              size="sm"
              value={rpiNumero}
              onChange={(e) => setRpiNumero(e.target.value)}
              placeholder="Ex.: 2700 (opcional)"
              disabled={loading}
            />
          </div>

          {serverError && (
            <FieldError>{serverError}</FieldError>
          )}

          <DialogFooter>
            <Button
              type="submit"
              loading={loading}
              loadingText="Salvando…"
            >
              Criar evento
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => void requestClose()}
            >
              Fechar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
