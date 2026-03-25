import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { chainNextStep } from "@/lib/magny/agents/orchestrator";

/**
 * Maximum time (in minutes) a step can be in "running" state before
 * the watchdog considers it a zombie and marks it as failed.
 */
const ZOMBIE_THRESHOLD_MINUTES = 6;

/**
 * Maximum number of auto-resume attempts per pipeline run.
 * Prevents infinite retry loops on permanently broken pipelines.
 */
const MAX_AUTO_RESUME_ATTEMPTS = 3;

/**
 * GET /api/magny/pipeline/watchdog
 *
 * Cron endpoint that runs every 5 minutes to:
 * 1. Detect zombie steps (stuck in "running" beyond threshold)
 * 2. Mark them as failed with a timeout error
 * 3. Auto-resume the pipeline (up to MAX_AUTO_RESUME_ATTEMPTS)
 *
 * Auth: CRON_SECRET via Bearer token.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const results: string[] = [];

  // -----------------------------------------------------------------
  // 1. Find zombie steps: status="running" and started_at older than threshold
  // -----------------------------------------------------------------
  const cutoff = new Date(
    Date.now() - ZOMBIE_THRESHOLD_MINUTES * 60 * 1000
  ).toISOString();

  const { data: zombieSteps, error: zombieError } = await supabase
    .from("pipeline_steps")
    .select("id, pipeline_run_id, step, started_at")
    .eq("status", "running")
    .lt("started_at", cutoff);

  if (zombieError) {
    console.error("[Watchdog] Failed to query zombie steps:", zombieError);
    return NextResponse.json(
      { error: zombieError.message },
      { status: 500 }
    );
  }

  if (!zombieSteps || zombieSteps.length === 0) {
    return NextResponse.json({
      message: "No zombie steps found",
      checked_at: new Date().toISOString(),
    });
  }

  console.log(
    `[Watchdog] Found ${zombieSteps.length} zombie step(s)`
  );

  // -----------------------------------------------------------------
  // 2. Mark zombie steps as failed
  // -----------------------------------------------------------------
  const affectedRunIds = new Set<string>();

  for (const zombie of zombieSteps) {
    const minutesRunning = Math.round(
      (Date.now() - new Date(zombie.started_at).getTime()) / 60000
    );

    console.log(
      `[Watchdog] Marking step "${zombie.step}" (${zombie.id}) as failed — running for ${minutesRunning}min`
    );

    await supabase
      .from("pipeline_steps")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
        error_message: `Watchdog timeout: step was running for ${minutesRunning} minutes (threshold: ${ZOMBIE_THRESHOLD_MINUTES}min)`,
      })
      .eq("id", zombie.id);

    affectedRunIds.add(zombie.pipeline_run_id);
    results.push(
      `Killed zombie step "${zombie.step}" (${zombie.id}) — ${minutesRunning}min`
    );
  }

  // -----------------------------------------------------------------
  // 3. Mark affected runs as failed, then auto-resume if under retry limit
  // -----------------------------------------------------------------
  for (const runId of affectedRunIds) {
    // Mark run as failed
    await supabase
      .from("pipeline_runs")
      .update({
        status: "failed",
        error_message: "Watchdog: step timeout detected",
      })
      .eq("id", runId);

    // Check how many times we've already auto-resumed this run
    const { data: run } = await supabase
      .from("pipeline_runs")
      .select("metadata")
      .eq("id", runId)
      .single();

    const metadata = (run?.metadata ?? {}) as Record<string, unknown>;
    const resumeCount = (metadata.watchdog_resume_count as number) ?? 0;

    if (resumeCount >= MAX_AUTO_RESUME_ATTEMPTS) {
      console.log(
        `[Watchdog] Run ${runId} exceeded max auto-resume attempts (${MAX_AUTO_RESUME_ATTEMPTS}) — leaving as failed`
      );
      results.push(
        `Run ${runId}: max resume attempts reached (${resumeCount}/${MAX_AUTO_RESUME_ATTEMPTS})`
      );
      continue;
    }

    // Increment counter and auto-resume
    await supabase
      .from("pipeline_runs")
      .update({
        metadata: {
          ...metadata,
          watchdog_resume_count: resumeCount + 1,
          last_watchdog_resume: new Date().toISOString(),
        },
      })
      .eq("id", runId);

    console.log(
      `[Watchdog] Auto-resuming run ${runId} (attempt ${resumeCount + 1}/${MAX_AUTO_RESUME_ATTEMPTS})`
    );

    chainNextStep(runId);

    results.push(
      `Run ${runId}: auto-resumed (attempt ${resumeCount + 1}/${MAX_AUTO_RESUME_ATTEMPTS})`
    );
  }

  return NextResponse.json({
    message: `Processed ${zombieSteps.length} zombie step(s)`,
    details: results,
    checked_at: new Date().toISOString(),
  });
}
