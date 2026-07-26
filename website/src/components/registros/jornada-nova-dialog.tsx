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

export function JornadaNovaDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [nomeMarca, setNomeMarca] = useState("");
  const [titular, setTitular] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setNomeMarca("");
    setTitular("");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
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
      router.push(`/registros/registrar/${data.jornada.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">Registrar</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Iniciar registro de marca</DialogTitle>
          <DialogDescription>
            Inicia o acompanhamento guiado do registro junto ao INPI, um passo
            de cada vez — cada avanço pede uma evidência.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Nome da marca</Label>
            <Input
              size="sm"
              value={nomeMarca}
              onChange={(e) => setNomeMarca(e.target.value)}
              placeholder="Ex.: Overlens"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Titular</Label>
            <Input
              size="sm"
              value={titular}
              onChange={(e) => setTitular(e.target.value)}
              placeholder="Ex.: Overlens Educação Ltda."
              required
            />
          </div>

          {error && <p className="pl-2 text-sm text-destructive">{error}</p>}

          <DialogFooter showCloseButton>
            <Button type="submit" disabled={loading}>
              {loading ? "Iniciando…" : "Iniciar registro"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
