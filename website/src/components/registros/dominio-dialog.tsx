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
import { Switch } from "@/components/ui/switch";
import { SmEditSolidIcon, SmDeleteLineIcon } from "@/components/icons";
import type { DominioRow } from "@/lib/registros/types";

interface DominioDialogProps {
  /** Presente = modo edição. Ausente = criação. */
  dominio?: DominioRow;
}

export function DominioDialog({ dominio: registro }: DominioDialogProps) {
  const router = useRouter();
  const isEdit = !!registro;
  const [open, setOpen] = useState(false);
  const [dominio, setDominio] = useState(registro?.dominio ?? "");
  const [registrador, setRegistrador] = useState(registro?.registrador ?? "");
  const [titular, setTitular] = useState(registro?.titular ?? "");
  const [dataExpiracao, setDataExpiracao] = useState(registro?.data_expiracao?.slice(0, 10) ?? "");
  const [renovacaoAutomatica, setRenovacaoAutomatica] = useState(
    registro?.renovacao_automatica ?? true,
  );
  const [observacoes, setObservacoes] = useState(registro?.observacoes ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!dominio.trim()) {
      setError("Informe o domínio.");
      return;
    }

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
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!isEdit) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/registros/dominios", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: registro!.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao excluir domínio");

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
          <Button variant="outline" size="icon" aria-label="Editar">
            <SmEditSolidIcon />
          </Button>
        ) : (
          <Button size="sm">
            Novo domínio
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar domínio" : "Novo domínio"}</DialogTitle>
          <DialogDescription>
            Dados do domínio de internet e sua renovação.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Domínio</Label>
            <Input
              size="sm"
              value={dominio}
              onChange={(e) => setDominio(e.target.value)}
              placeholder="Ex.: overlens.com.br"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Registrador</Label>
            <Input
              size="sm"
              value={registrador}
              onChange={(e) => setRegistrador(e.target.value)}
              placeholder="Ex.: Registro.br, Cloudflare, GoDaddy"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Titular</Label>
            <Input
              size="sm"
              value={titular}
              onChange={(e) => setTitular(e.target.value)}
              placeholder="Titular do registro (opcional)"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Expira em</Label>
            <Input
              size="sm"
              type="date"
              value={dataExpiracao}
              onChange={(e) => setDataExpiracao(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Renovação automática</Label>
            <Switch
              size="sm"
              checked={renovacaoAutomatica}
              onCheckedChange={setRenovacaoAutomatica}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Observações</Label>
            <Textarea
              size="sm"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Anotações internas (opcional)"
            />
          </div>

          {error && <p className="pl-2 text-sm text-destructive">{error}</p>}

          <DialogFooter showCloseButton>
            {isEdit && (
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={handleDelete}
                className="mr-auto text-destructive"
              >
                <SmDeleteLineIcon />
                Excluir
              </Button>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando…" : isEdit ? "Salvar" : "Criar domínio"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
