"use client";

import { useEffect, useId, useMemo, useState } from "react";
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
import { SmEditSolidIcon } from "@/components/icons";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { notify } from "@/lib/notifications/toast";
import {
  PROCESSO_STATUS_OPTIONS,
  PROCESSO_STATUS_LABEL,
} from "@/lib/registros/types";
import type { ProcessoRow, ProcessoStatus } from "@/lib/registros/types";
import { FieldError } from "@/components/ui/field";

interface ProcessoDialogProps {
  marcaId: string;
  /** Presente = modo edição. */
  processo?: ProcessoRow;
}

type Campo = "numero" | "classe";

export function ProcessoDialog({ marcaId, processo }: ProcessoDialogProps) {
  const router = useRouter();
  const confirm = useConfirm();
  const id = useId();
  const isEdit = !!processo;
  // Baseline do "sujo" em estado: em modo edição os campos já têm os valores
  // novos depois de salvar, enquanto a prop só chega com o `router.refresh()`.
  const inicialProps = useMemo(
    () => ({
      numero: processo?.numero ?? "",
      classe: processo?.classe ?? "",
      edicaoNcl: processo?.edicao_ncl ?? "",
      classeDescricao: processo?.classe_descricao ?? "",
      status: (processo?.status ?? "requerida") as ProcessoStatus,
      situacao: processo?.situacao ?? "",
      dataDeposito: processo?.data_deposito?.slice(0, 10) ?? "",
      dataConcessao: processo?.data_concessao?.slice(0, 10) ?? "",
      proximaRenovacao: processo?.proxima_renovacao?.slice(0, 10) ?? "",
      observacoes: processo?.observacoes ?? "",
    }),
    [
      processo?.numero,
      processo?.classe,
      processo?.edicao_ncl,
      processo?.classe_descricao,
      processo?.status,
      processo?.situacao,
      processo?.data_deposito,
      processo?.data_concessao,
      processo?.proxima_renovacao,
      processo?.observacoes,
    ],
  );
  const [inicial, setInicial] = useState(inicialProps);
  const [open, setOpen] = useState(false);

  const [numero, setNumero] = useState(inicial.numero);
  const [classe, setClasse] = useState(inicial.classe);
  const [edicaoNcl, setEdicaoNcl] = useState(inicial.edicaoNcl);
  const [classeDescricao, setClasseDescricao] = useState(inicial.classeDescricao);
  const [status, setStatus] = useState<ProcessoStatus>(inicial.status);
  const [situacao, setSituacao] = useState(inicial.situacao);
  const [dataDeposito, setDataDeposito] = useState(inicial.dataDeposito);
  const [dataConcessao, setDataConcessao] = useState(inicial.dataConcessao);
  const [proximaRenovacao, setProximaRenovacao] = useState(inicial.proximaRenovacao);
  const [observacoes, setObservacoes] = useState(inicial.observacoes);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<Campo, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  // Com o diálogo fechado, o formulário volta a espelhar a prop.
  useEffect(() => {
    if (open) return;
    setInicial(inicialProps);
    setNumero(inicialProps.numero);
    setClasse(inicialProps.classe);
    setEdicaoNcl(inicialProps.edicaoNcl);
    setClasseDescricao(inicialProps.classeDescricao);
    setStatus(inicialProps.status);
    setSituacao(inicialProps.situacao);
    setDataDeposito(inicialProps.dataDeposito);
    setDataConcessao(inicialProps.dataConcessao);
    setProximaRenovacao(inicialProps.proximaRenovacao);
    setObservacoes(inicialProps.observacoes);
  }, [open, inicialProps]);

  const ids = {
    numero: `${id}-numero`,
    classe: `${id}-classe`,
      edicaoNcl: `${id}-edicao-ncl`,
    status: `${id}-status`,
      classeDescricao: `${id}-classe-descricao`,
      dataDeposito: `${id}-data-deposito`,
      dataConcessao: `${id}-data-concessao`,
      proximaRenovacao: `${id}-proxima-renovacao`,
    situacao: `${id}-situacao`,
    observacoes: `${id}-observacoes`,
  };

  const sujo =
    numero !== inicial.numero ||
    classe !== inicial.classe ||
      edicaoNcl !== inicial.edicaoNcl ||
      classeDescricao !== inicial.classeDescricao ||
    status !== inicial.status ||
    situacao !== inicial.situacao ||
      dataDeposito !== inicial.dataDeposito ||
      dataConcessao !== inicial.dataConcessao ||
      proximaRenovacao !== inicial.proximaRenovacao ||
    observacoes !== inicial.observacoes;

  function reset() {
    setNumero(inicial.numero);
    setClasse(inicial.classe);
    setEdicaoNcl(inicial.edicaoNcl);
    setClasseDescricao(inicial.classeDescricao);
    setStatus(inicial.status);
    setSituacao(inicial.situacao);
    setDataDeposito(inicial.dataDeposito);
    setDataConcessao(inicial.dataConcessao);
    setProximaRenovacao(inicial.proximaRenovacao);
    setObservacoes(inicial.observacoes);
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
    if (!numero.trim()) next.numero = "Informe o número do processo.";
    if (!classe.trim()) next.classe = "Informe a classe.";
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
      reset();
      notify.success(isEdit ? "Processo atualizado" : "Processo criado");
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
      {isEdit ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Editar processo">
                <SmEditSolidIcon />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>Editar processo</TooltipContent>
        </Tooltip>
      ) : (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            Novo processo
          </Button>
        </DialogTrigger>
      )}
      <DialogContent
        className="sm:max-w-xl"
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
          <DialogTitle>{isEdit ? "Editar processo" : "Novo processo"}</DialogTitle>
          <DialogDescription>Processo junto ao INPI.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={ids.numero}>Número</Label>
              <Input
                id={ids.numero}
                size="sm"
                autoFocus
                value={numero}
                onChange={(e) => {
                  setNumero(e.target.value);
                  if (errors.numero) setErrors((p) => ({ ...p, numero: undefined }));
                }}
                placeholder="Ex.: 900000000"
                disabled={loading}
                required
                aria-invalid={!!errors.numero || undefined}
                aria-describedby={errors.numero ? `${ids.numero}-erro` : undefined}
              />
              <FieldError id={`${ids.numero}-erro`}>{errors.numero}</FieldError>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={ids.classe}>Classe</Label>
              <Input
                id={ids.classe}
                size="sm"
                value={classe}
                onChange={(e) => {
                  setClasse(e.target.value);
                  if (errors.classe) setErrors((p) => ({ ...p, classe: undefined }));
                }}
                placeholder="Ex.: 41"
                disabled={loading}
                required
                aria-invalid={!!errors.classe || undefined}
                aria-describedby={errors.classe ? `${ids.classe}-erro` : undefined}
              />
              <FieldError id={`${ids.classe}-erro`}>{errors.classe}</FieldError>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={ids.edicaoNcl}>Edição NCL</Label>
              <Input
                id={ids.edicaoNcl}
                size="sm"
                value={edicaoNcl}
                onChange={(e) => setEdicaoNcl(e.target.value)}
                placeholder="Ex.: 12"
                disabled={loading}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={ids.status}>Status</Label>
              <NativeSelect
                id={ids.status}
                size="sm"
                value={status}
                onChange={(e) => setStatus(e.target.value as ProcessoStatus)}
                disabled={loading}
              >
                {PROCESSO_STATUS_OPTIONS.map((s) => (
                  <NativeSelectOption key={s} value={s}>
                    {PROCESSO_STATUS_LABEL[s]}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={ids.classeDescricao}>Descrição da classe</Label>
            <Input
              id={ids.classeDescricao}
              size="sm"
              value={classeDescricao}
              onChange={(e) => setClasseDescricao(e.target.value)}
              placeholder="Ex.: Educação e formação"
              disabled={loading}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={ids.dataDeposito}>Depósito</Label>
              <Input
                id={ids.dataDeposito}
                size="sm"
                type="date"
                value={dataDeposito}
                onChange={(e) => setDataDeposito(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={ids.dataConcessao}>Concessão</Label>
              <Input
                id={ids.dataConcessao}
                size="sm"
                type="date"
                value={dataConcessao}
                onChange={(e) => setDataConcessao(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={ids.proximaRenovacao}>Renovação</Label>
              <Input
                id={ids.proximaRenovacao}
                size="sm"
                type="date"
                value={proximaRenovacao}
                onChange={(e) => setProximaRenovacao(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={ids.situacao}>Situação</Label>
            <Input
              id={ids.situacao}
              size="sm"
              value={situacao}
              onChange={(e) => setSituacao(e.target.value)}
              placeholder="Situação/despacho atual (opcional)"
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={ids.observacoes}>Observações</Label>
            <Textarea
              id={ids.observacoes}
              size="sm"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Anotações internas (opcional)"
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
              {isEdit ? "Salvar" : "Criar processo"}
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
