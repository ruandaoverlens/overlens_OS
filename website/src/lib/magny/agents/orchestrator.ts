import { createAdminClient } from "@/lib/supabase/admin";
import { runExplorer } from "./explorer";
import { runTranslator } from "./translator";
import { runSelector } from "./selector";
import { runExpander } from "./expander";
import { runRefiner } from "./refiner";
import { runIllustrator } from "./illustrator";
import { withRetry } from "./retry";

// ============================================================
// Types
// ============================================================

interface OrchestratorInput {
  triggeredBy: "cron" | "manual";
  triggeredByUserId?: string;
  /** When set, load this existing pipeline_run and resume from the first non-completed step. */
  resumeRunId?: string;
}

interface OrchestratorOutput {
  pipelineRunId: string;
  reportId?: string;
  reportSlug?: string;
  status: "completed" | "failed";
  error?: string;
}

export interface AdvanceResult {
  pipelineRunId: string;
  /** The step that was just executed (or null if pipeline is already done). */
  executedStep: PipelineStep | null;
  /** Whether there are more steps to execute. */
  hasMore: boolean;
  /** Set when the pipeline finished (all steps done). */
  reportId?: string;
  reportSlug?: string;
  status: "advanced" | "completed" | "failed";
  error?: string;
}

type PipelineStep = "explore" | "translate" | "select" | "expand" | "refine" | "illustrate";

// ============================================================
// Stage definitions
// ============================================================

interface StageDefinition {
  step: PipelineStep;
  runner: (input: { pipelineRunId: string; pipelineStepId: string }) => Promise<unknown>;
  /** How many times to retry the agent on transient failure (not counting the initial attempt). */
  maxRetries: number;
}

const stages: StageDefinition[] = [
  { step: "explore",     runner: runExplorer,     maxRetries: 3 },
  { step: "translate",   runner: runTranslator,   maxRetries: 2 },
  { step: "select",      runner: runSelector,     maxRetries: 2 },
  { step: "expand",      runner: runExpander,     maxRetries: 2 },
  { step: "refine",      runner: runRefiner,      maxRetries: 2 },
  { step: "illustrate",  runner: runIllustrator,  maxRetries: 2 },
];

const STAGE_ORDER = stages.map((s) => s.step);

// ============================================================
// Step-chaining: create + advance
// ============================================================

/**
 * Creates a new pipeline run record. Does NOT execute any steps.
 * Call `advancePipeline` to execute steps one at a time.
 */
export async function createPipelineRun(input: {
  triggeredBy: "cron" | "manual";
  triggeredByUserId?: string;
}): Promise<string> {
  const supabase = createAdminClient();

  const { data: runRow, error } = await supabase
    .from("pipeline_runs")
    .insert({
      status: "running",
      triggered_by: input.triggeredBy,
      triggered_by_user_id: input.triggeredByUserId ?? null,
      started_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error || !runRow) {
    throw new Error(
      `Failed to create pipeline_run: ${error?.message ?? "unknown"}`
    );
  }

  console.log(
    `[Orchestrator] Created pipeline_run ${runRow.id} (triggered_by=${input.triggeredBy})`
  );

  return runRow.id as string;
}

/**
 * Advances the pipeline by ONE step. Returns info about what happened
 * and whether there are more steps remaining.
 *
 * This is designed for step-chaining on serverless: each invocation
 * runs exactly one step within its own function timeout budget.
 */
export async function advancePipeline(
  pipelineRunId: string
): Promise<AdvanceResult> {
  const supabase = createAdminClient();

  // 1. Verify run exists and is in a resumable state
  const { data: run, error: runError } = await supabase
    .from("pipeline_runs")
    .select("id, status")
    .eq("id", pipelineRunId)
    .single();

  if (runError || !run) {
    return {
      pipelineRunId,
      executedStep: null,
      hasMore: false,
      status: "failed",
      error: `Pipeline run not found: ${runError?.message ?? "unknown"}`,
    };
  }

  if (run.status === "completed") {
    return {
      pipelineRunId,
      executedStep: null,
      hasMore: false,
      status: "completed",
    };
  }

  // If it was failed (e.g. from watchdog), reset to running for resume
  if (run.status === "failed") {
    await supabase
      .from("pipeline_runs")
      .update({ status: "running", error_message: null })
      .eq("id", pipelineRunId);
  }

  // 2. Find completed steps
  const { data: existingSteps } = await supabase
    .from("pipeline_steps")
    .select("step, status")
    .eq("pipeline_run_id", pipelineRunId);

  const completedSteps = new Set<string>();
  for (const row of existingSteps ?? []) {
    if (row.status === "completed") {
      completedSteps.add(row.step);
    }
  }

  // 3. Find the next step to execute
  const nextStage = stages.find((s) => !completedSteps.has(s.step));

  if (!nextStage) {
    // All steps done — mark run as completed
    // Fetch report info from the refiner's output
    const { data: refineStep } = await supabase
      .from("pipeline_steps")
      .select("output_data")
      .eq("pipeline_run_id", pipelineRunId)
      .eq("step", "refine")
      .single();

    const refineOutput = refineStep?.output_data as {
      reportId?: string;
      reportSlug?: string;
    } | null;

    await supabase
      .from("pipeline_runs")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        metadata: {
          report_id: refineOutput?.reportId ?? null,
          report_slug: refineOutput?.reportSlug ?? null,
        },
      })
      .eq("id", pipelineRunId);

    console.log(
      `[Orchestrator] Pipeline ${pipelineRunId} completed — all steps done`
    );

    return {
      pipelineRunId,
      executedStep: null,
      hasMore: false,
      reportId: refineOutput?.reportId,
      reportSlug: refineOutput?.reportSlug,
      status: "completed",
    };
  }

  console.log(
    `[Orchestrator] Advancing pipeline ${pipelineRunId} — executing step "${nextStage.step}"`
  );

  // 4. Create the pipeline_step record
  const { data: stepRow, error: stepError } = await supabase
    .from("pipeline_steps")
    .insert({
      pipeline_run_id: pipelineRunId,
      step: nextStage.step,
      status: "pending",
    })
    .select("id")
    .single();

  if (stepError || !stepRow) {
    const msg = `Failed to create step "${nextStage.step}": ${stepError?.message ?? "unknown"}`;
    await supabase
      .from("pipeline_runs")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
        error_message: msg,
      })
      .eq("id", pipelineRunId);

    return {
      pipelineRunId,
      executedStep: nextStage.step,
      hasMore: false,
      status: "failed",
      error: msg,
    };
  }

  const pipelineStepId = stepRow.id as string;

  // 5. Execute the step with retry
  try {
    await withRetry(
      () => nextStage.runner({ pipelineRunId, pipelineStepId }),
      {
        maxRetries: nextStage.maxRetries,
        baseDelayMs: 1000,
        maxDelayMs: 30000,
        onRetry: (attempt, err) => {
          console.warn(
            `[Orchestrator] Step "${nextStage.step}" — retry ${attempt}/${nextStage.maxRetries}: ${err.message}`
          );
        },
      }
    );

    console.log(
      `[Orchestrator] Step "${nextStage.step}" completed successfully`
    );

    // Check if there are more steps
    const stageIndex = STAGE_ORDER.indexOf(nextStage.step);
    const hasMore = stageIndex < STAGE_ORDER.length - 1;

    return {
      pipelineRunId,
      executedStep: nextStage.step,
      hasMore,
      status: "advanced",
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(
      `[Orchestrator] Step "${nextStage.step}" failed after retries:`,
      errorMessage
    );

    await supabase
      .from("pipeline_runs")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
        error_message: `Step "${nextStage.step}" failed: ${errorMessage}`,
      })
      .eq("id", pipelineRunId);

    return {
      pipelineRunId,
      executedStep: nextStage.step,
      hasMore: false,
      status: "failed",
      error: `Step "${nextStage.step}" failed: ${errorMessage}`,
    };
  }
}

// ============================================================
// Internal URL helper for step chaining
// ============================================================

export function getPipelineBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

/**
 * Calls the advance route to trigger the next step in a fresh serverless
 * function invocation. Awaitable so the caller can ensure the request
 * was accepted before its own invocation ends (prevents Vercel from
 * killing the outgoing fetch).
 */
export async function chainNextStep(pipelineRunId: string): Promise<void> {
  const baseUrl = getPipelineBaseUrl();
  const secret = process.env.CRON_SECRET;

  try {
    const res = await fetch(`${baseUrl}/api/magny/pipeline/advance`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({ pipelineRunId }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(
        `[Orchestrator] chainNextStep failed for ${pipelineRunId}: ${res.status} ${text}`
      );
    }
  } catch (err) {
    console.error(
      `[Orchestrator] Failed to chain next step for ${pipelineRunId}:`,
      err
    );
  }
}

// ============================================================
// Legacy: runPipeline (full sequential execution)
// Kept for local dev / testing where serverless timeouts don't apply.
// ============================================================

export async function runPipeline(
  input: OrchestratorInput
): Promise<OrchestratorOutput> {
  const { triggeredBy, triggeredByUserId, resumeRunId } = input;
  const supabase = createAdminClient();

  // ----------------------------------------------------------
  // 1. Obtain pipeline_run — either resume or create new
  // ----------------------------------------------------------
  let pipelineRunId: string;
  const completedSteps = new Set<PipelineStep>();

  if (resumeRunId) {
    const { data: existingRun, error: fetchError } = await supabase
      .from("pipeline_runs")
      .select("id, status")
      .eq("id", resumeRunId)
      .single();

    if (fetchError || !existingRun) {
      const msg =
        fetchError?.message ?? `pipeline_run "${resumeRunId}" not found`;
      return { pipelineRunId: resumeRunId, status: "failed", error: msg };
    }

    if (existingRun.status === "completed") {
      return { pipelineRunId: resumeRunId, status: "completed" };
    }

    pipelineRunId = existingRun.id as string;

    const { data: existingSteps } = await supabase
      .from("pipeline_steps")
      .select("step, status")
      .eq("pipeline_run_id", pipelineRunId);

    for (const row of existingSteps ?? []) {
      if (row.status === "completed") {
        completedSteps.add(row.step as PipelineStep);
      }
    }

    await supabase
      .from("pipeline_runs")
      .update({ status: "running", error_message: null })
      .eq("id", pipelineRunId);
  } else {
    const { data: runRow, error: runCreateError } = await supabase
      .from("pipeline_runs")
      .insert({
        status: "running",
        triggered_by: triggeredBy,
        triggered_by_user_id: triggeredByUserId ?? null,
        started_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (runCreateError || !runRow) {
      const msg =
        runCreateError?.message ?? "Unknown error creating pipeline_run";
      return { pipelineRunId: "unknown", status: "failed", error: msg };
    }

    pipelineRunId = runRow.id as string;
  }

  let reportId: string | undefined;
  let reportSlug: string | undefined;

  // ----------------------------------------------------------
  // 2. Execute each stage in sequence
  // ----------------------------------------------------------
  for (const stage of stages) {
    if (completedSteps.has(stage.step)) {
      console.log(`[Orchestrator] Skipping "${stage.step}" — already completed`);
      continue;
    }

    const { data: stepRow, error: stepCreateError } = await supabase
      .from("pipeline_steps")
      .insert({
        pipeline_run_id: pipelineRunId,
        step: stage.step,
        status: "pending",
      })
      .select("id")
      .single();

    if (stepCreateError || !stepRow) {
      const msg = stepCreateError?.message ?? `Failed to create step "${stage.step}"`;
      await supabase
        .from("pipeline_runs")
        .update({
          status: "failed",
          completed_at: new Date().toISOString(),
          error_message: msg,
        })
        .eq("id", pipelineRunId);
      return { pipelineRunId, status: "failed", error: msg };
    }

    const pipelineStepId = stepRow.id as string;

    try {
      const result = await withRetry(
        () => stage.runner({ pipelineRunId, pipelineStepId }),
        {
          maxRetries: stage.maxRetries,
          baseDelayMs: 1000,
          maxDelayMs: 30000,
          onRetry: (attempt, err) => {
            console.warn(
              `[Orchestrator] Stage "${stage.step}" — retry ${attempt}/${stage.maxRetries}: ${err.message}`
            );
          },
        }
      );

      if (stage.step === "refine") {
        const out = result as { reportId?: string; reportSlug?: string };
        reportId = out.reportId;
        reportSlug = out.reportSlug;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      await supabase
        .from("pipeline_runs")
        .update({
          status: "failed",
          completed_at: new Date().toISOString(),
          error_message: `Stage "${stage.step}" failed: ${errorMessage}`,
        })
        .eq("id", pipelineRunId);

      return {
        pipelineRunId,
        status: "failed",
        error: `Stage "${stage.step}" failed: ${errorMessage}`,
      };
    }
  }

  // ----------------------------------------------------------
  // 3. All stages done
  // ----------------------------------------------------------
  await supabase
    .from("pipeline_runs")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      metadata: {
        report_id: reportId ?? null,
        report_slug: reportSlug ?? null,
      },
    })
    .eq("id", pipelineRunId);

  return { pipelineRunId, reportId, reportSlug, status: "completed" };
}
