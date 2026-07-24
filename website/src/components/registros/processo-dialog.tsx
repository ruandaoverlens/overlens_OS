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
import { SmAdd2LineIcon, SmEditSolidIcon } from "@/components/icons";
import {
  PROCESSO_STATUS_OPTIONS,
  PROCESSO_STATUS_LABEL,
} from "@/lib/registros/types";
import type { ProcessoRow, ProcessoStatus } from "@/lib/registros/types";

interface ProcessoDialogProps {
  marcaId: string;
  /** Presente = modo edição. */
  processo?: ProcessoRow;
}

export function ProcessoDialog({ marcaId, processo }: ProcessoDialogProps) {
  const router = useRouter();
  const isEdit = !!processo;
  const [open, setOpen] = useState(false);

  const [numero, setNumero] = useState(processo?.numero ?? "");
  const [classe, setClasse] = useState(processo?.classe ?? "");
  const [edicaoNcl, setEdicaoNcl] = useState(processo?.edicao_ncl ?? "");
  const [classeDescricao, setClasseDescricao] = useState(processo?.classe_descricao ?? "");
  const [status, setStatus] = useState<ProcessoStatus>(processo?.status ?? "requerida");
  const [situacao, setSituacao] = useState(processo?.situacao ?? "");
  const [dataDeposito, setDataDeposito] = useState(processo?.data_deposito?.slice(0, 10) ?? "");
  const [dataConcessao, setDataConcessao] = useState(processo?.data_concessao?.slice(0, 10) ?? "");
  const [proximaRenovacao, setProximaRenovacao] = useState(processo?.proxima_renovacao?.slice(0, 10) ?? "");
  const [observacoes, setObservacoes] = useState(processo?.observacoes ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!numero.trim() || !classe.trim()) {
      setError("Número e classe são obrigatórios.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...(isEdit ? { id: processo!.id } : { marca_id: marcaId }),
        numero: numero.trim(),
        classe: classe.trim(),
        edicao_ncl: edicaoNcl.trim() || null,
        classe_descricao: classeDescricao.trim() || null,
        status,
        situacao: situacao.trim() || null,
        data_deposito: dataDeposito || null,
        data_concessao: dataConcessao || null,
        proxima_renovacao: proximaRenovacao || null,
        observacoes: observacoes.trim() || null,
      };

      const res = await fetch("/api/registros/processos", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao salvar processo");

      setOpen(false);
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
        {isEdit ? (
          <Button variant="ghost" size="sm">
            <SmEditSolidIcon />
            Editar
          </Button>
        ) : (
          <Button variant="outline" size="sm">
            <SmAdd2LineIcon />
            Novo processo
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar processo" : "Novo processo"}</DialogTitle>
          <DialogDescription>Processo junto ao INPI.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Número</Label>
              <Input size="sm" value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="Ex.: 900000000" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Classe</Label>
              <Input size="sm" value={classe} onChange={(e) => setClasse(e.target.value)} placeholder="Ex.: 41" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Edição NCL</Label>
              <Input size="sm" value={edicaoNcl} onChange={(e) => setEdicaoNcl(e.target.value)} placeholder="Ex.: 12" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Status</Label>
              <NativeSelect size="sm" value={status} onChange={(e) => setStatus(e.target.value as ProcessoStatus)}>
                {PROCESSO_STATUS_OPTIONS.map((s) => (
                  <NativeSelectOption key={s} value={s}>
                    {PROCESSO_STATUS_LABEL[s]}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Descrição da classe</Label>
            <Input size="sm" value={classeDescricao} onChange={(e) => setClasseDescricao(e.target.value)} placeholder="Ex.: Educação e formação" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Depósito</Label>
              <Input size="sm" type="date" value={dataDeposito} onChange={(e) => setDataDeposito(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Concessão</Label>
              <Input size="sm" type="date" value={dataConcessao} onChange={(e) => setDataConcessao(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Renovação</Label>
              <Input size="sm" type="date" value={proximaRenovacao} onChange={(e) => setProximaRenovacao(e.target.value)} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Situação</Label>
            <Input size="sm" value={situacao} onChange={(e) => setSituacao(e.target.value)} placeholder="Situação/despacho atual (opcional)" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Observações</Label>
            <Textarea size="sm" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder="Anotações internas (opcional)" />
          </div>

          {error && <p className="pl-2 text-sm text-destructive">{error}</p>}

          <DialogFooter showCloseButton>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando…" : isEdit ? "Salvar" : "Criar processo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
