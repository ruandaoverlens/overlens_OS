"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Copy, Check } from "lucide-react";
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
  const [tasks, setTasks] = useState<Task[]>([
    { id: String(nextId++), name: "", minTime: 0, maxTime: 0, unit: "horas" },
  ]);
  const [buffer, setBuffer] = useState(20);
  const [copied, setCopied] = useState(false);

  const addTask = () => {
    setTasks([
      ...tasks,
      { id: String(nextId++), name: "", minTime: 0, maxTime: 0, unit: "horas" },
    ]);
  };

  const removeTask = (id: string) => {
    if (tasks.length === 1) return;
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

  const handleCopy = () => {
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href="/ferramentas"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Botoes Magicos
      </Link>

      <h1 className="text-2xl font-semibold tracking-tight">Calculadora de Tempo</h1>
      <p className="mt-1 mb-8 text-muted-foreground">
        Estime quanto tempo um projeto vai levar, com margem de seguranca.
      </p>

      <div className="space-y-6">
        <div className="space-y-3">
          {tasks.map((task, i) => (
            <div
              key={task.id}
              className="grid grid-cols-[1fr_80px_80px_100px_auto] items-end gap-2"
            >
              {i === 0 && (
                <>
                  <Label className="col-span-1">Tarefa</Label>
                  <Label>Min</Label>
                  <Label>Max</Label>
                  <Label>Unidade</Label>
                  <div />
                </>
              )}
              <Input
                value={task.name}
                onChange={(e) => updateTask(task.id, { name: e.target.value })}
                placeholder="Nome da tarefa"
                size="sm"
              />
              <Input
                type="number"
                min={0}
                value={task.minTime || ""}
                onChange={(e) =>
                  updateTask(task.id, { minTime: Number(e.target.value) })
                }
                size="sm"
              />
              <Input
                type="number"
                min={0}
                value={task.maxTime || ""}
                onChange={(e) =>
                  updateTask(task.id, { maxTime: Number(e.target.value) })
                }
                size="sm"
              />
              <Select
                value={task.unit}
                onValueChange={(v) => updateTask(task.id, { unit: v as TimeUnit })}
              >
                <SelectTrigger size="xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minutos">min</SelectItem>
                  <SelectItem value="horas">horas</SelectItem>
                  <SelectItem value="dias">dias</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => removeTask(task.id)}
                disabled={tasks.length === 1}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          ))}
        </div>

        <Button onClick={addTask} variant="secondary" size="sm">
          <Plus className="size-4" />
          <span>Adicionar tarefa</span>
        </Button>

        <div className="space-y-2">
          <Label>Buffer de seguranca: {buffer}%</Label>
          <Input
            type="range"
            min={0}
            max={100}
            step={5}
            value={buffer}
            onChange={(e) => setBuffer(Number(e.target.value))}
            className="h-2 cursor-pointer"
          />
          <p className="text-xs text-muted-foreground pl-2">
            Margem extra para imprevistos, revisoes e reunioes.
          </p>
        </div>

        <div className="rounded-xl border bg-accent/30 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Resultado</h2>
            <Button onClick={handleCopy} variant="secondary" size="sm">
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              <span>{copied ? "Copiado!" : "Copiar resumo"}</span>
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
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
