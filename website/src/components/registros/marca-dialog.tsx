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
import { useUrlState } from "@/lib/use-url-state";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { SmEditSolidIcon } from "@/components/icons";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { notify } from "@/lib/notifications/toast";
import type { MarcaRow } from "@/lib/registros/types";
import { FieldError } from "@/components/ui/field";

interface MarcaDialogProps {
  /** Presente = modo edição. Ausente = criação. */
  marca?: Pick<MarcaRow, "id" | "nome" | "titular" | "apresentacao" | "observacoes">;
}

type Campo = "nome" | "titular";

// A mesma página pode montar dois gatilhos (header + empty state). Só o
// primeiro consome o `?novo=1`, senão dois diálogos abririam ao mesmo tempo.
let novoClaimed = false;

function claimNovo(): boolean {
  if (novoClaimed) return false;
  novoClaimed = true;
  return true;
}

function releaseNovo(): void {
  novoClaimed = false;
}

export function MarcaDialog({ marca }: MarcaDialogProps) {
  const router = useRouter();
  const confirm = useConfirm();
  const id = useId();
  const isEdit = !!marca;
  // Baseline do "sujo". Fica em estado (e não derivado direto da prop) porque
  // depois de salvar em modo edição os campos já têm os valores novos enquanto
  // a prop só chega com o `router.refresh()` — sem isso, reabrir e fechar sem
  // mexer em nada pedia "Descartar alterações?" indevidamente.
  const inicialProps = useMemo(
    () => ({
      nome: marca?.nome ?? "",
      titular: marca?.titular ?? "",
      apresentacao: marca?.apresentacao ?? "mista",
      observacoes: marca?.observacoes ?? "",
    }),
    [marca?.nome, marca?.titular, marca?.apresentacao, marca?.observacoes],
  );
  const [inicial, setInicial] = useState(inicialProps);
  const [open, setOpen] = useState(false);
  const [novo, setNovo] = useUrlState<string | null>("novo", null);
  const [nome, setNome] = useState(inicial.nome);
  const [titular, setTitular] = useState(inicial.titular);
  const [apresentacao, setApresentacao] = useState(inicial.apresentacao);
  const [observacoes, setObservacoes] = useState(inicial.observacoes);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<Campo, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  // Deep link `?novo=1` (command palette → "Nova marca"): abre o diálogo de
  // criação e limpa a query, para que um reload não o reabra sem contexto.
  useEffect(() => {
    if (isEdit || novo !== "1") return;
    if (claimNovo()) {
      // A URL é a fonte externa: abrir é sincronizar com ela. Roda uma vez por
      // deep link, não em cascata.
      setOpen(true);
      setNovo(null);
    }
    return releaseNovo;
  }, [isEdit, novo, setNovo]);

  // Com o diálogo fechado, o formulário volta a espelhar a prop — inclusive
  // depois que o refresh reidrata a marca salva.
  useEffect(() => {
    if (open) return;
    setInicial(inicialProps);
    setNome(inicialProps.nome);
    setTitular(inicialProps.titular);
    setApresentacao(inicialProps.apresentacao);
    setObservacoes(inicialProps.observacoes);
  }, [open, inicialProps]);

  const ids = {
    nome: `${id}-nome`,
    titular: `${id}-titular`,
    apresentacao: `${id}-apresentacao`,
    observacoes: `${id}-observacoes`,
  };

  const sujo =
    nome !== inicial.nome ||
    titular !== inicial.titular ||
    apresentacao !== inicial.apresentacao ||
    observacoes !== inicial.observacoes;

  function reset() {
    setNome(inicial.nome);
    setTitular(inicial.titular);
    setApresentacao(inicial.apresentacao);
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
    if (!nome.trim()) next.nome = "Informe o nome da marca.";
    if (!titular.trim()) next.titular = "Informe o titular.";
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
      const res = await fetch("/api/registros/marcas", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(isEdit ? { id: marca!.id } : {}),
          nome: nome.trim(),
          titular: titular.trim(),
          apresentacao: apresentacao.trim() || "mista",
          observacoes: observacoes.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao salvar marca");

      setOpen(false);
      reset();
      notify.success(isEdit ? "Marca atualizada" : "Marca criada");
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
              <Button variant="outline" size="icon" aria-label="Editar marca">
                <SmEditSolidIcon />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>Editar marca</TooltipContent>
        </Tooltip>
      ) : (
        <DialogTrigger asChild>
          <Button size="sm">Nova marca</Button>
        </DialogTrigger>
      )}
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
          <DialogTitle>{isEdit ? "Editar marca" : "Nova marca"}</DialogTitle>
          <DialogDescription>
            Dados da marca registrada e seu titular.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={ids.nome}>Nome</Label>
            <Input
              id={ids.nome}
              size="sm"
              autoFocus
              value={nome}
              onChange={(e) => {
                setNome(e.target.value);
                if (errors.nome) setErrors((p) => ({ ...p, nome: undefined }));
              }}
              placeholder="Ex.: OVERLENS"
              disabled={loading}
              required
              aria-invalid={!!errors.nome || undefined}
              aria-describedby={errors.nome ? `${ids.nome}-erro` : undefined}
            />
            <FieldError id={`${ids.nome}-erro`}>{errors.nome}</FieldError>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={ids.titular}>Titular</Label>
            <Input
              id={ids.titular}
              size="sm"
              value={titular}
              onChange={(e) => {
                setTitular(e.target.value);
                if (errors.titular) setErrors((p) => ({ ...p, titular: undefined }));
              }}
              placeholder="Razão social do titular"
              disabled={loading}
              required
              aria-invalid={!!errors.titular || undefined}
              aria-describedby={errors.titular ? `${ids.titular}-erro` : undefined}
            />
            <FieldError id={`${ids.titular}-erro`}>{errors.titular}</FieldError>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={ids.apresentacao}>Apresentação</Label>
            <Input
              id={ids.apresentacao}
              size="sm"
              value={apresentacao}
              onChange={(e) => setApresentacao(e.target.value)}
              placeholder="Ex.: mista, nominativa, figurativa"
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
              {isEdit ? "Salvar" : "Criar marca"}
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
