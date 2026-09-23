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
import { useConfirm } from "@/components/ui/confirm-dialog";
import { notify } from "@/lib/notifications/toast";
import { FieldError } from "@/components/ui/field";

interface JornadaNovaDialogProps {
  /** Pré-preenche o nome da marca (ex.: ao iniciar a partir de uma marca cadastrada). */
  defaultNome?: string;
  /** Pré-preenche o titular. */
  defaultTitular?: string;
  /** Texto do botão que abre o diálogo. */
  triggerLabel?: string;
  /** Variante do botão que abre o diálogo. */
  triggerVariant?: "default" | "outline";
}

type Campo = "nomeMarca" | "titular";

export function JornadaNovaDialog({
  defaultNome = "",
  defaultTitular = "",
  triggerLabel = "Registrar",
  triggerVariant = "default",
}: JornadaNovaDialogProps) {
  const router = useRouter();
  const confirm = useConfirm();
  const id = useId();
  const [open, setOpen] = useState(false);
  const [nomeMarca, setNomeMarca] = useState(defaultNome);
  const [titular, setTitular] = useState(defaultTitular);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<Campo, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const ids = {
    nomeMarca: `${id}-nome-marca`,
    titular: `${id}-titular`,
  };

  function reset() {
    setNomeMarca(defaultNome);
    setTitular(defaultTitular);
    setErrors({});
    setServerError(null);
  }

  const sujo = nomeMarca !== defaultNome || titular !== defaultTitular;

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
    if (!nomeMarca.trim()) next.nomeMarca = "Informe o nome da marca.";
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
      const res = await fetch("/api/registros/jornadas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomeMarca: nomeMarca.trim(),
          titular: titular.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao iniciar registro");

      setOpen(false);
      reset();
      notify.success("Registro iniciado");
      router.push(`/registros/registrar/${data.jornada.id}`);
      router.refresh();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Erro inesperado");
      notify.fromError(err, "Não foi possível iniciar o registro");
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
        <Button size="sm" variant={triggerVariant}>
          {triggerLabel}
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
          <DialogTitle>Iniciar registro de marca</DialogTitle>
          <DialogDescription>
            Inicia o acompanhamento guiado do registro junto ao INPI, um passo
            de cada vez: cada avanço pede uma evidência.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={ids.nomeMarca}>Nome da marca</Label>
            <Input
              id={ids.nomeMarca}
              size="sm"
              autoFocus
              value={nomeMarca}
              onChange={(e) => {
                setNomeMarca(e.target.value);
                if (errors.nomeMarca) setErrors((p) => ({ ...p, nomeMarca: undefined }));
              }}
              placeholder="Ex.: Overlens"
              disabled={loading}
              required
              aria-invalid={!!errors.nomeMarca || undefined}
              aria-describedby={errors.nomeMarca ? `${ids.nomeMarca}-erro` : undefined}
            />
            <FieldError id={`${ids.nomeMarca}-erro`}>{errors.nomeMarca}</FieldError>
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
              placeholder="Ex.: Overlens Educação Ltda."
              disabled={loading}
              required
              aria-invalid={!!errors.titular || undefined}
              aria-describedby={errors.titular ? `${ids.titular}-erro` : undefined}
            />
            <FieldError id={`${ids.titular}-erro`}>{errors.titular}</FieldError>
          </div>

          {serverError && (
            <FieldError>{serverError}</FieldError>
          )}

          <DialogFooter>
            <Button
              type="submit"
              loading={loading}
              loadingText="Iniciando…"
            >
              Iniciar registro
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
