import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runPipeline } from "@/lib/magny/agents/orchestrator";

export const maxDuration = 300;

/**
 * POST /api/magny/pipeline/trigger
 *
 * Manually trigger a new pipeline run. Executes ALL stages sequentially
 * within a single invocation (up to 300s). Returns the pipeline run ID
 * immediately via streaming, then runs the pipeline in background.
 */
export async function POST(_req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Run the full pipeline sequentially — no step-chaining needed.
    // The frontend polls for progress via Supabase, so we don't need
    // to return early. But we DO need to return the pipelineRunId
    // before the pipeline finishes so the UI can start polling.
    //
    // Strategy: create the run first, respond immediately, then
    // run the pipeline. We use waitUntil-like pattern via a detached
    // promise that runs after the response is sent.
    const { createPipelineRun } = await import("@/lib/magny/agents/orchestrator");
    const pipelineRunId = await createPipelineRun({
      triggeredBy: "manual",
      triggeredByUserId: user.id,
    });

    // Start the pipeline execution without awaiting — it continues
    // running in the background within this function's 300s budget.
    // The response is sent immediately so the frontend can start polling.
    runPipeline({
      triggeredBy: "manual",
      triggeredByUserId: user.id,
      resumeRunId: pipelineRunId,
    }).catch((err) => {
      console.error("[trigger] Pipeline execution failed:", err);
    });

    return NextResponse.json({
      success: true,
      pipelineRunId,
      message: "Pipeline triggered — executing sequentially",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[trigger] Failed to create pipeline run:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
