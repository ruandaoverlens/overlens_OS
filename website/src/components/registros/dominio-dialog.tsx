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
import { Switch } from "@/components/ui/switch";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { SmEditSolidIcon, SmDeleteLineIcon } from "@/components/icons";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { notify } from "@/lib/notifications/toast";
import type { DominioRow } from "@/lib/registros/types";
import { FieldError } from "@/components/ui/field";

interface DominioDialogProps {
  /** Presente = modo edição. Ausente = criação. */
  dominio?: DominioRow;
}

type Campo = "dominio";

export function DominioDialog({ dominio: registro }: DominioDialogProps) {
  const router = useRouter();
  const confirm = useConfirm();
  const id = useId();
  const isEdit = !!registro;
  // Baseline do "sujo" em estado: depois de salvar em modo edição os campos já
  // têm os valores novos e a prop só chega com o `router.refresh()`. Derivar
  // direto da prop fazia reabrir e fechar sem mexer em nada pedir
  // "Descartar alterações?" indevidamente.
  const inicialProps = useMemo(
    () => ({
      dominio: registro?.dominio ?? "",
      registrador: registro?.registrador ?? "",
      titular: registro?.titular ?? "",
      dataExpiracao: registro?.data_expiracao?.slice(0, 10) ?? "",
      renovacaoAutomatica: registro?.renovacao_automatica ?? true,
      observacoes: registro?.observacoes ?? "",
    }),
    [
      registro?.dominio,
      registro?.registrador,
      registro?.titular,
      registro?.data_expiracao,
      registro?.renovacao_automatica,
      registro?.observacoes,
    ],
  );
  const [inicial, setInicial] = useState(inicialProps);
  const [open, setOpen] = useState(false);
  const [dominio, setDominio] = useState(inicial.dominio);
  const [registrador, setRegistrador] = useState(inicial.registrador);
  const [titular, setTitular] = useState(inicial.titular);
  const [dataExpiracao, setDataExpiracao] = useState(inicial.dataExpiracao);
  const [renovacaoAutomatica, setRenovacaoAutomatica] = useState(
    inicial.renovacaoAutomatica,
  );
  const [observacoes, setObservacoes] = useState(inicial.observacoes);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<Campo, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  // Com o diálogo fechado, o formulário volta a espelhar a prop — inclusive
  // depois que o refresh reidrata o domínio salvo.
  useEffect(() => {
    if (open) return;
    setInicial(inicialProps);
    setDominio(inicialProps.dominio);
    setRegistrador(inicialProps.registrador);
    setTitular(inicialProps.titular);
    setDataExpiracao(inicialProps.dataExpiracao);
    setRenovacaoAutomatica(inicialProps.renovacaoAutomatica);
    setObservacoes(inicialProps.observacoes);
  }, [open, inicialProps]);

  const ids = {
    dominio: `${id}-dominio`,
    registrador: `${id}-registrador`,
    titular: `${id}-titular`,
    dataExpiracao: `${id}-data-expiracao`,
    renovacao: `${id}-renovacao`,
    observacoes: `${id}-observacoes`,
  };

  const ocupado = loading || deleting;
  const sujo =
    dominio !== inicial.dominio ||
    registrador !== inicial.registrador ||
    titular !== inicial.titular ||
    dataExpiracao !== inicial.dataExpiracao ||
    renovacaoAutomatica !== inicial.renovacaoAutomatica ||
    observacoes !== inicial.observacoes;

  function reset() {
    setDominio(inicial.dominio);
    setRegistrador(inicial.registrador);
    setTitular(inicial.titular);
    setDataExpiracao(inicial.dataExpiracao);
    setRenovacaoAutomatica(inicial.renovacaoAutomatica);
    setObservacoes(inicial.observacoes);
    setErrors({});
    setServerError(null);
  }

  /** Fecha o diálogo; com rascunho preenchido, confirma o descarte antes. */
  async function requestClose() {
    if (ocupado) return;
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
    if (!dominio.trim()) next.dominio = "Informe o domínio.";
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
      const res = await fetch("/api/registros/dominios", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(isEdit ? { id: registro!.id } : {}),
          dominio: dominio.trim().toLowerCase(),
          registrador: registrador.trim() || null,
          titular: titular.trim() || null,
          data_expiracao: dataExpiracao || null,
          renovacao_automatica: renovacaoAutomatica,
          observacoes: observacoes.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao salvar domínio");

      setOpen(false);
      reset();
      notify.success(isEdit ? "Domínio atualizado" : "Domínio criado");
      router.refresh();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Erro inesperado");
      notify.fromError(err, "Não foi possível salvar");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!isEdit) return;
    const ok = await confirm({
      title: `Excluir ${registro!.dominio}?`,
      description: "O domínio será removido do inventário. Esta ação não pode ser desfeita.",
      confirmLabel: "Excluir",
      destructive: true,
    });
    if (!ok) return;

    setServerError(null);
    setDeleting(true);
    try {
      const res = await fetch("/api/registros/dominios", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: registro!.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao excluir domínio");

      setOpen(false);
      notify.success("Domínio excluído");
      router.refresh();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Erro inesperado");
      notify.fromError(err, "Não foi possível excluir");
    } finally {
      setDeleting(false);
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
              <Button variant="outline" size="icon" aria-label="Editar domínio">
                <SmEditSolidIcon />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>Editar domínio</TooltipContent>
        </Tooltip>
      ) : (
        <DialogTrigger asChild>
          <Button size="sm">Novo domínio</Button>
        </DialogTrigger>
      )}
      <DialogContent
        onEscapeKeyDown={(e) => {
          if (ocupado) e.preventDefault();
        }}
        onPointerDownOutside={(e) => {
          if (ocupado) e.preventDefault();
        }}
        onInteractOutside={(e) => {
          if (ocupado) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar domínio" : "Novo domínio"}</DialogTitle>
          <DialogDescription>
            Dados do domínio de internet e sua renovação.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={ids.dominio}>Domínio</Label>
            <Input
              id={ids.dominio}
              size="sm"
              autoFocus
              value={dominio}
              onChange={(e) => {
                setDominio(e.target.value);
                if (errors.dominio) setErrors((p) => ({ ...p, dominio: undefined }));
              }}
              placeholder="Ex.: overlens.com.br"
              disabled={ocupado}
              required
              aria-invalid={!!errors.dominio || undefined}
              aria-describedby={errors.dominio ? `${ids.dominio}-erro` : undefined}
            />
            <FieldError id={`${ids.dominio}-erro`}>{errors.dominio}</FieldError>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={ids.registrador}>Registrador</Label>
            <Input
              id={ids.registrador}
              size="sm"
              value={registrador}
              onChange={(e) => setRegistrador(e.target.value)}
              placeholder="Ex.: Registro.br, Cloudflare, GoDaddy"
              disabled={ocupado}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={ids.titular}>Titular</Label>
            <Input
              id={ids.titular}
              size="sm"
              value={titular}
              onChange={(e) => setTitular(e.target.value)}
              placeholder="Titular do registro (opcional)"
              disabled={ocupado}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={ids.dataExpiracao}>Expira em</Label>
            <Input
              id={ids.dataExpiracao}
              size="sm"
              type="date"
              value={dataExpiracao}
              onChange={(e) => setDataExpiracao(e.target.value)}
              disabled={ocupado}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor={ids.renovacao}>Renovação automática</Label>
            <Switch
              id={ids.renovacao}
              size="sm"
              checked={renovacaoAutomatica}
              onCheckedChange={setRenovacaoAutomatica}
              disabled={ocupado}
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
              disabled={ocupado}
            />
          </div>

          {serverError && (
            <FieldError>{serverError}</FieldError>
          )}

          <DialogFooter>
            {isEdit && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="destructive"
                    loading={deleting}
                    loadingText="Excluindo…"
                    disabled={loading}
                    onClick={handleDelete}
                    className="mr-auto"
                  >
                    <SmDeleteLineIcon />
                    Excluir
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Excluir este domínio do inventário</TooltipContent>
              </Tooltip>
            )}
            <Button
              type="submit"
              loading={loading}
              loadingText="Salvando…"
              disabled={deleting}
            >
              {isEdit ? "Salvar" : "Criar domínio"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={ocupado}
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
