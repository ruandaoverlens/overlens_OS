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
import { SmAdd2LineIcon, SmEditSolidIcon } from "@/components/icons";
import type { MarcaRow } from "@/lib/registros/types";

interface MarcaDialogProps {
  /** Presente = modo edição. Ausente = criação. */
  marca?: Pick<MarcaRow, "id" | "nome" | "titular" | "apresentacao" | "observacoes">;
}

export function MarcaDialog({ marca }: MarcaDialogProps) {
  const router = useRouter();
  const isEdit = !!marca;
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState(marca?.nome ?? "");
  const [titular, setTitular] = useState(marca?.titular ?? "");
  const [apresentacao, setApresentacao] = useState(marca?.apresentacao ?? "mista");
  const [observacoes, setObservacoes] = useState(marca?.observacoes ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!nome.trim() || !titular.trim()) {
      setError("Nome e titular são obrigatórios.");
      return;
    }

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
          <Button variant="outline" size="sm">
            <SmEditSolidIcon />
            Editar
          </Button>
        ) : (
          <Button size="sm">
            <SmAdd2LineIcon />
            Nova marca
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar marca" : "Nova marca"}</DialogTitle>
          <DialogDescription>
            Dados da marca registrada e seu titular.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Nome</Label>
            <Input size="sm" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: OVERLENS" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Titular</Label>
            <Input size="sm" value={titular} onChange={(e) => setTitular(e.target.value)} placeholder="Razão social do titular" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Apresentação</Label>
            <Input size="sm" value={apresentacao} onChange={(e) => setApresentacao(e.target.value)} placeholder="Ex.: mista, nominativa, figurativa" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Observações</Label>
            <Textarea size="sm" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder="Anotações internas (opcional)" />
          </div>

          {error && <p className="pl-2 text-sm text-destructive">{error}</p>}

          <DialogFooter showCloseButton>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando…" : isEdit ? "Salvar" : "Criar marca"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
