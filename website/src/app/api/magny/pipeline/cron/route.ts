import { NextRequest, NextResponse } from "next/server";
import { createPipelineRun, runPipeline } from "@/lib/magny/agents/orchestrator";

export const maxDuration = 300;

/**
 * GET /api/magny/pipeline/cron
 *
 * Scheduled cron trigger. Creates a new pipeline run and executes
 * all stages sequentially.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const pipelineRunId = await createPipelineRun({
      triggeredBy: "cron",
    });

    // Run sequentially in background within this function's 300s budget
    runPipeline({
      triggeredBy: "cron",
      resumeRunId: pipelineRunId,
    }).catch((err) => {
      console.error("[cron] Pipeline execution failed:", err);
    });

    return NextResponse.json({
      success: true,
      pipelineRunId,
      message: "Pipeline triggered via cron",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[cron] Failed to create pipeline run:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
