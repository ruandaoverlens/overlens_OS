"use client";

import { useState, useMemo, useId } from "react";
// Ícone lucide mantido: não há equivalente de "copiar" em @/components/icons
// (ver src/components/icons/lucide-mapping.ts).
import { Copy } from "lucide-react";
import { SmAdd2LineIcon, SmDeleteLineIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/page-header";
import { HeadingTitle } from "@/components/ui/heading";
import { FieldError } from "@/components/ui/field";
import { notify } from "@/lib/notifications/toast";
import { cn } from "@/lib/utils";

type TimeUnit = "minutos" | "horas" | "dias";

interface Task {
  id: string;
  name: string;
  minTime: number;
  maxTime: number;
  unit: TimeUnit;
}

function toMinutes(value: number, unit: TimeUnit): number {
  switch (unit) {
    case "minutos": return value;
    case "horas": return value * 60;
    case "dias": return value * 480; // 8h workday
  }
}

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  if (minutes < 480) return `${(minutes / 60).toFixed(1)}h`;
  const days = minutes / 480;
  if (days < 5) return `${days.toFixed(1)} dias`;
  const weeks = days / 5;
  return `${weeks.toFixed(1)} semanas`;
}

let nextId = 1;

export default function CalculadoraTempoPage() {
  const uid = useId();
  const [tasks, setTasks] = useState<Task[]>([
    { id: String(nextId++), name: "", minTime: 0, maxTime: 0, unit: "horas" },
  ]);
  const [buffer, setBuffer] = useState(20);

  const addTask = () => {
    setTasks([
      ...tasks,
      { id: String(nextId++), name: "", minTime: 0, maxTime: 0, unit: "horas" },
    ]);
  };

  const removeTask = (id: string) => {
    // Guarda no handler: o botão fica habilitado para continuar focável e
    // explicável — desabilitar já na primeira pintura só esconde o porquê.
    if (tasks.length === 1) {
      notify.info("Mantenha ao menos uma tarefa na lista");
      return;
    }
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const totals = useMemo(() => {
    let totalMin = 0;
    let totalMax = 0;
    tasks.forEach((t) => {
      totalMin += toMinutes(t.minTime, t.unit);
      totalMax += toMinutes(t.maxTime, t.unit);
    });
    const bufferMin = Math.round(totalMin * (1 + buffer / 100));
    const bufferMax = Math.round(totalMax * (1 + buffer / 100));
    return { totalMin, totalMax, bufferMin, bufferMax };
  }, [tasks, buffer]);

  const summaryText = useMemo(() => {
    const lines = tasks
      .filter((t) => t.name.trim())
      .map(
        (t) =>
          `- ${t.name}: ${t.minTime}–${t.maxTime} ${t.unit}`
      );
    return [
      "Estimativa de tempo",
      "",
      ...lines,
      "",
      `Estimativa: ${formatTime(totals.totalMin)} – ${formatTime(totals.totalMax)}`,
      `Com buffer de ${buffer}%: ${formatTime(totals.bufferMin)} – ${formatTime(totals.bufferMax)}`,
    ].join("\n");
  }, [tasks, totals, buffer]);

  const [copying, setCopying] = useState(false);

  const handleCopy = async () => {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(summaryText);
      notify.success("Copiado");
    } catch (err) {
      notify.fromError(err, "Não foi possível copiar");
    } finally {
      setCopying(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <PageHeader
        title="Calculadora de Tempo"
        description="Estime quanto tempo um projeto vai levar, com margem de segurança."
        backHref="/ferramentas"
        backLabel="Ferramentas"
        className="mb-6"
      />

      <div className="space-y-6">
        <div className="space-y-3">
          {tasks.map((task, i) => {
            const base = `${uid}-${task.id}`;
            // Rótulos visíveis na primeira linha (e sempre no mobile); nas demais, só para leitores de tela.
            const labelClass = cn(i > 0 && "sm:sr-only");
            // Validação inline: a estimativa mínima não pode passar da máxima.
            const rangeInvalid = task.maxTime > 0 && task.minTime > task.maxTime;
            const rangeErrorId = `${base}-range-error`;
            return (
              <div
                key={task.id}
                className="grid grid-cols-2 items-end gap-2 sm:grid-cols-[1fr_80px_80px_100px_auto]"
              >
                <div className="col-span-2 space-y-1 sm:col-span-1">
                  <Label htmlFor={`${base}-name`} className={labelClass}>
                    Tarefa
                  </Label>
                  <Input
                    id={`${base}-name`}
                    autoFocus={i === 0}
                    value={task.name}
                    onChange={(e) => updateTask(task.id, { name: e.target.value })}
                    placeholder="Nome da tarefa"
                    size="sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`${base}-min`} className={labelClass}>
                    Min
                  </Label>
                  <Input
                    id={`${base}-min`}
                    type="number"
                    min={0}
                    value={task.minTime || ""}
                    aria-invalid={rangeInvalid ? true : undefined}
                    aria-describedby={rangeInvalid ? rangeErrorId : undefined}
                    onChange={(e) =>
                      updateTask(task.id, { minTime: Number(e.target.value) })
                    }
                    size="sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`${base}-max`} className={labelClass}>
                    Max
                  </Label>
                  <Input
                    id={`${base}-max`}
                    type="number"
                    min={0}
                    value={task.maxTime || ""}
                    aria-invalid={rangeInvalid ? true : undefined}
                    aria-describedby={rangeInvalid ? rangeErrorId : undefined}
                    onChange={(e) =>
                      updateTask(task.id, { maxTime: Number(e.target.value) })
                    }
                    size="sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`${base}-unit`} className={labelClass}>
                    Unidade
                  </Label>
                  <Select
                    value={task.unit}
                    onValueChange={(v) => updateTask(task.id, { unit: v as TimeUnit })}
                  >
                    <SelectTrigger id={`${base}-unit`} size="xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minutos">min</SelectItem>
                      <SelectItem value="horas">horas</SelectItem>
                      <SelectItem value="dias">dias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => removeTask(task.id)}
                    aria-label={`Remover tarefa ${task.name.trim() || i + 1}`}
                  >
                    <SmDeleteLineIcon className="size-3.5" aria-hidden="true" />
                  </Button>
                </div>
                {rangeInvalid && (
                  <FieldError
                    id={rangeErrorId}
                    className="col-span-2 text-xs pl-0 sm:col-span-5"
                  >
                    O tempo mínimo não pode ser maior que o máximo.
                  </FieldError>
                )}
              </div>
            );
          })}
        </div>

        <Button type="button" onClick={addTask} variant="secondary" size="sm">
          <SmAdd2LineIcon className="size-4" aria-hidden="true" />
          <span>Adicionar tarefa</span>
        </Button>

        <div className="space-y-2">
          <Label htmlFor={`${uid}-buffer`}>Buffer de segurança: {buffer}%</Label>
          <Input
            id={`${uid}-buffer`}
            type="range"
            min={0}
            max={100}
            step={5}
            value={buffer}
            onChange={(e) => setBuffer(Number(e.target.value))}
            className="h-2 cursor-pointer"
          />
          <p className="text-xs text-muted-foreground pl-2">
            Margem extra para imprevistos, revisões e reuniões.
          </p>
        </div>

        <div className="rounded-xl border bg-accent/30 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <HeadingTitle as="h2" size="sm">Resultado</HeadingTitle>
            <Button
              type="button"
              onClick={handleCopy}
              variant="secondary"
              size="sm"
              loading={copying}
              loadingText="Copiando…"
            >
              <Copy className="size-4" aria-hidden="true" />
              <span>Copiar resumo</span>
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2" role="status" aria-live="polite">
            <div>
              <p className="text-sm text-muted-foreground">Estimativa pura</p>
              <p className="text-xl font-semibold">
                {formatTime(totals.totalMin)} – {formatTime(totals.totalMax)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Com buffer ({buffer}%)</p>
              <p className="text-xl font-semibold">
                {formatTime(totals.bufferMin)} – {formatTime(totals.bufferMax)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
