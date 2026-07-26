"use client";

import { useState } from "react";
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
import { EVENTO_TIPO_OPTIONS, EVENTO_TIPO_LABEL } from "@/lib/registros/types";
import type { EventoTipo } from "@/lib/registros/types";

interface ProcessoOption {
  id: string;
  numero: string;
}

interface EventoDialogProps {
  processos: ProcessoOption[];
}

export function EventoDialog({ processos }: EventoDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [processoId, setProcessoId] = useState(processos[0]?.id ?? "");
  const [tipo, setTipo] = useState<EventoTipo>("deposito");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [data, setData] = useState("");
  const [rpiNumero, setRpiNumero] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!processoId) {
      setError("Selecione um processo.");
      return;
    }
    if (!titulo.trim() || !data) {
      setError("Título e data são obrigatórios.");
      return;
    }

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
      setTitulo("");
      setDescricao("");
      setData("");
      setRpiNumero("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={processos.length === 0}>
          Novo evento
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo evento</DialogTitle>
          <DialogDescription>Marco na timeline de um processo.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Processo</Label>
            <NativeSelect size="sm" value={processoId} onChange={(e) => setProcessoId(e.target.value)}>
              {processos.map((p) => (
                <NativeSelectOption key={p.id} value={p.id}>
                  {p.numero}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Tipo</Label>
              <NativeSelect size="sm" value={tipo} onChange={(e) => setTipo(e.target.value as EventoTipo)}>
                {EVENTO_TIPO_OPTIONS.map((t) => (
                  <NativeSelectOption key={t} value={t}>
                    {EVENTO_TIPO_LABEL[t]}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Data</Label>
              <Input size="sm" type="date" value={data} onChange={(e) => setData(e.target.value)} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Título</Label>
            <Input size="sm" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex.: Publicação na RPI" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Descrição</Label>
            <Textarea size="sm" value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Detalhes do evento (opcional)" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Número da RPI</Label>
            <Input size="sm" value={rpiNumero} onChange={(e) => setRpiNumero(e.target.value)} placeholder="Ex.: 2700 (opcional)" />
          </div>

          {error && <p className="pl-2 text-sm text-destructive">{error}</p>}

          <DialogFooter showCloseButton>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando…" : "Criar evento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
