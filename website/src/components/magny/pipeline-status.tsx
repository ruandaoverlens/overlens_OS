"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Play,
  Loader2,
  Clock,
  Check,
  X,
  ChevronDown,
  Square,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────

export type StepStatus = "pending" | "running" | "completed" | "failed";

export interface PipelineStep {
  id: string;
  step: string;
  status: StepStatus;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
  metadata: Record<string, unknown> | null;
}

export interface PipelineRun {
  id: string;
  status: StepStatus;
  triggered_by: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
  metadata: Record<string, unknown> | null;
  pipeline_steps: PipelineStep[];
}

// ─── Constants ────────────────────────────────────────────

const TOTAL_STEPS = 6;
const STEP_ORDER = ["explore", "explorer", "translate", "translator", "select", "selector", "expand", "expander", "refine", "refiner", "illustrate", "illustrator"];
/** Canonical stage names in execution order. */
const STAGE_NAMES = ["explore", "translate", "select", "expand", "refine", "illustrate"] as const;

/** Estimated duration per step in seconds (based on observed agent runtimes). */
const STEP_ESTIMATE_SECONDS: Record<string, number> = {
  explore: 60,
  explorer: 60,
  translate: 330,
  translator: 330,
  select: 30,
  selector: 30,
  expand: 70,
  expander: 70,
  refine: 50,
  refiner: 50,
  illustrate: 30,
  illustrator: 30,
};

// ─── Helpers ───────────────────────────────────────────────

function formatDuration(startIso: string | null, endIso: string | null): string {
  if (!startIso || !endIso) return "--";
  const diffMs = new Date(endIso).getTime() - new Date(startIso).getTime();
  if (diffMs < 0) return "--";
  const totalSeconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  if (seconds === 0) return `${minutes}min`;
  return `${minutes}min ${seconds}s`;
}

function formatElapsed(seconds: number): string {
  if (seconds <= 0) return "0s";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  if (s === 0) return `${m}min`;
  return `${m}min ${s}s`;
}

function formatCountdown(seconds: number): string {
  if (seconds <= 0) return "finalizando...";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `~${s}s restantes`;
  return `~${m}min ${s}s restantes`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStepIndex(stepName: string | null | undefined): number {
  if (!stepName) return -1;
  const lower = stepName.toLowerCase();
  const idx = STEP_ORDER.indexOf(lower);
  return idx >= 0 ? Math.floor(idx / 2) : -1;
}

// ─── Status configuration ──────────────────────────────────

const statusConfig: Record<
  StepStatus,
  { label: string; icon: React.ReactNode; badgeVariant: "default" | "secondary" | "outline" | "success" | "warning" | "info" | "destructive"; colorClass: string }
> = {
  pending: {
    label: "Pendente",
    icon: <Clock className="size-3.5 shrink-0" aria-hidden="true" />,
    badgeVariant: "secondary",
    colorClass: "border-l-muted-foreground/30",
  },
  running: {
    label: "Executando",
    icon: <Loader2 className="size-3.5 shrink-0 animate-spin" aria-hidden="true" />,
    badgeVariant: "info",
    colorClass: "border-l-[var(--brand-atmos)]",
  },
  completed: {
    label: "Concluído",
    icon: <Check className="size-3.5 shrink-0" aria-hidden="true" />,
    badgeVariant: "success",
    colorClass: "border-l-green-500",
  },
  failed: {
    label: "Falhou",
    icon: <X className="size-3.5 shrink-0" aria-hidden="true" />,
    badgeVariant: "destructive",
    colorClass: "border-l-red-500",
  },
};

const STEP_LABELS: Record<string, string> = {
  explore: "Explorer",
  explorer: "Explorer",
  translate: "Translator",
  translator: "Translator",
  select: "Selector",
  selector: "Selector",
  expand: "Expander",
  expander: "Expander",
  refine: "Refiner",
  refiner: "Refiner",
  illustrate: "Illustrator",
  illustrator: "Illustrator",
};

function stepDisplayName(name: string | undefined | null): string {
  if (!name) return "—";
  return STEP_LABELS[name.toLowerCase()] ?? name;
}

// ─── Sub-components ────────────────────────────────────────

function StatusBadge({ status }: { status: StepStatus }) {
  const config = statusConfig[status] ?? statusConfig.pending;
  return (
    <Badge variant={config.badgeVariant} className="inline-flex items-center gap-1.5 text-xs font-medium">
      {config.icon}
      {config.label}
    </Badge>
  );
}

function StepRow({ step }: { step: PipelineStep }) {
  const duration = formatDuration(step.started_at, step.completed_at);
  const config = statusConfig[step.status] ?? statusConfig.pending;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-accent/20 px-3 py-2.5">
      <span className={cn("flex size-5 items-center justify-center", {
        "text-muted-foreground": step.status === "pending",
        "text-[var(--brand-atmos)] dark:text-[var(--brand-atmos)]": step.status === "running",
        "text-green-500 dark:text-green-400": step.status === "completed",
        "text-red-500 dark:text-red-400": step.status === "failed",
      })}>
        {config.icon}
      </span>
      <span className="flex-1 text-sm font-medium text-foreground">
        {stepDisplayName(step.step)}
      </span>
      {step.error_message && (
        <span
          className="max-w-[200px] truncate text-xs text-destructive"
          title={step.error_message}
        >
          {step.error_message}
        </span>
      )}
      <span className="ml-auto shrink-0 text-xs text-muted-foreground">
        {duration}
      </span>
      <StatusBadge status={step.status} />
    </div>
  );
}

// ─── Live Run Card (polling with progress) ─────────────────

function LiveRunCard({ runId, onFinished }: { runId: string; onFinished: (run: PipelineRun) => void }) {
  const [run, setRun] = useState<PipelineRun | null>(null);
  const [now, setNow] = useState(Date.now());
  const [isStopping, setIsStopping] = useState(false);

  // Poll every 3s with proper cleanup
  useEffect(() => {
    let cancelled = false;

    async function fetchRun() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("pipeline_runs")
          .select("*, pipeline_steps(*)")
          .eq("id", runId)
          .single();
        if (cancelled) return; // Component unmounted, discard result
        if (data) {
          setRun(data as PipelineRun);
          if (data.status === "completed" || data.status === "failed") {
            onFinished(data as PipelineRun);
          }
        }
      } catch {
        // Ignore errors (network, auth) — next poll will retry
      }
    }

    fetchRun();
    const interval = setInterval(fetchRun, 3000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [runId, onFinished]);

  // Tick every second for smooth countdown
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  async function handleStop() {
    setIsStopping(true);
    try {
      const res = await fetch(`/api/magny/pipeline/${runId}`, { method: "PATCH" });
      if (res.ok) {
        const supabase = createClient();
        const { data } = await supabase
          .from("pipeline_runs")
          .select("*, pipeline_steps(*)")
          .eq("id", runId)
          .single();
        if (data) {
          onFinished(data as PipelineRun);
        }
      }
    } catch {
      // silent fail — polling will catch the updated state
    } finally {
      setIsStopping(false);
    }
  }

  // ── Calculate real progress based on step timestamps ──
  const steps = run?.pipeline_steps ?? [];
  const completedSteps = steps.filter((s) => s.status === "completed").length;
  const currentStep = steps.find((s) => s.status === "running");
  const currentStepIndex = currentStep ? getStepIndex(currentStep.step) : completedSteps;

  // Real elapsed time since the pipeline started (survives page refresh)
  const runStartMs = run?.started_at ? new Date(run.started_at).getTime() : now;
  const totalElapsed = Math.floor((now - runStartMs) / 1000);

  // Estimate remaining seconds based on actual step data
  const stepEstimate = (name: string) => STEP_ESTIMATE_SECONDS[name.toLowerCase()] ?? 100;

  // Time the current step has been running
  const currentStepElapsed = currentStep?.started_at
    ? Math.floor((now - new Date(currentStep.started_at).getTime()) / 1000)
    : 0;

  // Use actual durations for completed steps, estimates for the rest
  const completedActualTime = steps
    .filter((s) => s.status === "completed" && s.started_at && s.completed_at)
    .reduce((sum, s) => sum + Math.floor((new Date(s.completed_at!).getTime() - new Date(s.started_at!).getTime()) / 1000), 0);

  const knownStepNames = new Set(steps.map((s) => s.step.toLowerCase()));
  const unfinishedEstimate = STAGE_NAMES
    .filter((name) => {
      const step = steps.find((s) => s.step.toLowerCase() === name);
      return !step || step.status !== "completed";
    })
    .reduce((sum, name) => sum + stepEstimate(name), 0);

  // Total adjusted estimate = actual completed time + estimates for the rest
  // Remaining = that total minus real elapsed time (ticks down every second)
  const remaining = Math.max(completedActualTime + unfinishedEstimate - totalElapsed, 0);

  // Progress: completed steps are 100%, current step proportional to elapsed/estimate
  const currentStepEstimate = currentStep ? stepEstimate(currentStep.step) : 0;
  const currentStepProgress = currentStep
    ? Math.min(currentStepElapsed / Math.max(currentStepEstimate, 1), 0.95)
    : 0;
  const progressPercent = Math.min(
    ((completedSteps + currentStepProgress) / TOTAL_STEPS) * 100,
    99
  );

  return (
    <Card className="gap-4 bg-[var(--brand-atmos)]/[0.03]">
      <CardHeader>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Loader2 className="size-4 animate-spin text-[var(--brand-atmos)]" aria-hidden="true" />
              <span className="text-[var(--brand-atmos)]">Pipeline em execução</span>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 border-destructive/50 px-2.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={handleStop}
                disabled={isStopping}
              >
                {isStopping ? "Parando..." : "Parar"}
              </Button>
              <Badge variant="info" className="inline-flex items-center gap-1.5 text-xs font-medium">
                <Loader2 className="size-3 animate-spin" aria-hidden="true" />
                Executando
              </Badge>
            </div>
          </div>
          <CardDescription className="text-xs">
            {run ? `#${run.id.slice(0, 8)}` : "Iniciando..."} &bull; Etapa {currentStepIndex + 1} de {TOTAL_STEPS}
            {currentStep ? (
              <> &bull; <span className="font-medium text-[var(--brand-atmos)]">{stepDisplayName(currentStep.step)}</span> ({formatElapsed(currentStepElapsed)})</>
            ) : (
              <> &bull; <span className="text-muted-foreground">Preparando {stepDisplayName(STAGE_NAMES[completedSteps])}...</span></>
            )}
            {" "}&bull; Total: {formatElapsed(totalElapsed)}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--brand-atmos)]/10">
            <div
              className="h-full rounded-full bg-[var(--brand-atmos)] transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{completedSteps} de {TOTAL_STEPS} etapas concluídas</span>
            <span className="tabular-nums text-[var(--brand-atmos)]">
              {remaining > 0
                ? formatCountdown(remaining)
                : currentStep
                  ? `${stepDisplayName(currentStep.step)} em andamento...`
                  : "Iniciando próxima etapa..."}
            </span>
          </div>
        </div>

        {/* Step indicators */}
        {steps.length > 0 && (
          <div className="mt-4 flex items-center gap-2">
            {steps
              .sort((a, b) => getStepIndex(a.step) - getStepIndex(b.step))
              .map((step) => (
                <div key={step.id} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className={cn(
                      "flex size-6 items-center justify-center rounded-full text-xs transition-colors",
                      step.status === "completed" && "bg-[var(--brand-atmos)] text-white",
                      step.status === "running" && "border-2 border-[var(--brand-atmos)] text-[var(--brand-atmos)]",
                      step.status === "pending" && "border border-muted-foreground/20 text-muted-foreground/40",
                      step.status === "failed" && "bg-red-500 text-white",
                    )}
                  >
                    {step.status === "completed" ? (
                      <Check className="size-3" />
                    ) : step.status === "running" ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : step.status === "failed" ? (
                      <X className="size-3" />
                    ) : (
                      <span>{getStepIndex(step.step) + 1}</span>
                    )}
                  </div>
                  <span className={cn(
                    "text-[10px] leading-none",
                    step.status === "running" ? "text-[var(--brand-atmos)] font-medium" : "text-muted-foreground",
                  )}>
                    {stepDisplayName(step.step)}
                  </span>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Completed Run Card ─────────────────────────────────────

function RunCard({ run, onDelete }: { run: PipelineRun; onDelete?: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const duration = formatDuration(run.started_at, run.completed_at);
  const config = statusConfig[run.status] ?? statusConfig.pending;
  const hasSteps = run.pipeline_steps.length > 0;

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/magny/pipeline/${run.id}`, { method: "DELETE" });
      if (res.ok) {
        onDelete?.(run.id);
      }
    } catch {
      // silent fail
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <Collapsible open={expanded} onOpenChange={setExpanded}>
      <Card
        className={cn(
          "gap-4 transition-shadow hover:shadow-md"
        )}
      >
        <CardHeader>
          <div className="flex flex-col gap-1">
            <CardTitle className="flex items-center gap-2 text-sm">
              <span className="font-mono text-xs text-muted-foreground">
                #{run.id.slice(0, 8)}
              </span>
              <StatusBadge status={run.status} />
            </CardTitle>
            <CardDescription>
              <span>{formatDate(run.created_at)}</span>
              {run.triggered_by && (
                <span className="ml-2 text-xs">
                  &bull; por{" "}
                  <span className="font-medium text-foreground">
                    {run.triggered_by}
                  </span>
                </span>
              )}
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              Duração: <span className="font-medium text-foreground">{duration}</span>
            </span>
            {hasSteps && (
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1 px-2.5 text-xs"
                  aria-expanded={expanded}
                >
                  {expanded ? "Esconder etapas" : "Ver etapas"}
                </Button>
              </CollapsibleTrigger>
            )}
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-7 px-2.5 text-xs",
                confirmDelete && "border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
              )}
              onClick={handleDelete}
              onBlur={() => setConfirmDelete(false)}
              disabled={isDeleting || run.status === "running"}
            >
              {isDeleting ? "Apagando..." : confirmDelete ? "Confirmar exclusão" : "Apagar"}
            </Button>
          </div>
        </CardHeader>

        {/* Expandable steps */}
        {hasSteps && (
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="flex flex-col gap-2">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Etapas
                </p>
                {run.pipeline_steps.map((step) => (
                  <StepRow key={step.id} step={step} />
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        )}

        {/* Error message */}
        {run.error_message && (
          <CardContent className="pt-0">
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2">
              <p className="text-xs text-destructive">
                <span className="font-semibold">Erro: </span>
                {run.error_message}
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </Collapsible>
  );
}

// ─── Main export ───────────────────────────────────────────

interface PipelineStatusProps {
  runs: PipelineRun[];
}

export function PipelineStatus({ runs: initialRuns }: PipelineStatusProps) {
  // Separate all running pipelines from finished ones on mount
  const initialLiveIds = initialRuns.filter((r) => r.status === "running").map((r) => r.id);
  const initialFinished = initialRuns.filter((r) => r.status !== "running");

  const [runs, setRuns] = useState(initialFinished);
  const [liveRunIds, setLiveRunIds] = useState<string[]>(initialLiveIds);
  const [triggerError, setTriggerError] = useState<string | null>(null);
  const [isTriggering, setIsTriggering] = useState(false);

  const hasLiveRuns = liveRunIds.length > 0;

  function handleDelete(id: string) {
    setRuns((prev) => prev.filter((r) => r.id !== id));
  }

  function handleLiveRunFinished(finishedRun: PipelineRun) {
    setLiveRunIds((prev) => prev.filter((id) => id !== finishedRun.id));
    setRuns((prev) => [finishedRun, ...prev]);
  }

  async function handleTrigger() {
    setIsTriggering(true);
    setTriggerError(null);
    try {
      const res = await fetch("/api/magny/pipeline/trigger", { method: "POST" });
      const body = await res.json().catch(() => ({}));
      if (res.ok && (body as { pipelineRunId?: string }).pipelineRunId) {
        const newId = (body as { pipelineRunId: string }).pipelineRunId;
        setLiveRunIds((prev) => [...prev, newId]);
      } else {
        setTriggerError((body as { error?: string }).error ?? `Erro ${res.status}`);
      }
    } catch {
      setTriggerError("Erro de rede. Tente novamente.");
    } finally {
      setIsTriggering(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-6 pt-4 pb-8 md:px-8 md:pt-5 md:pb-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-[40px] font-normal uppercase tracking-normal leading-none text-balance text-foreground">
            Pipeline
          </h1>
          <p className="mt-2 text-sm leading-7 text-pretty text-muted-foreground">
            Acompanhe as execuções do pipeline e seus resultados.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Button
            onClick={handleTrigger}
            disabled={isTriggering || hasLiveRuns}
            size="sm"
          >
            {isTriggering
              ? "Iniciando..."
              : hasLiveRuns
                ? "Em execução..."
                : "Iniciar Pipeline"}
          </Button>
          {triggerError && (
            <p className="text-xs text-red-600 dark:text-red-400">{triggerError}</p>
          )}
        </div>
      </div>

      <Separator />

      {/* Live run cards */}
      {liveRunIds.map((id) => (
        <LiveRunCard key={id} runId={id} onFinished={handleLiveRunFinished} />
      ))}

      {/* Run list */}
      {runs.length === 0 && !hasLiveRuns ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-accent/20 text-center">
          <div className="rounded-full bg-accent/50 p-4">
            <Loader2 className="size-7 text-muted-foreground" aria-hidden="true" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Nenhuma execução ainda</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Inicie o pipeline acima para começar a primeira execução.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {runs.map((run) => (
            <RunCard key={run.id} run={run} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
