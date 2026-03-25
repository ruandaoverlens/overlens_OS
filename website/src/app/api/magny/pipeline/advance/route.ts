import { NextRequest, NextResponse } from "next/server";
import { advancePipeline, chainNextStep } from "@/lib/magny/agents/orchestrator";

// Allow up to 5 minutes per step on Vercel Pro
export const maxDuration = 300;

/**
 * POST /api/magny/pipeline/advance
 *
 * Executes the next pending step of a pipeline run, then self-chains
 * to continue with the following step in a fresh function invocation.
 *
 * This solves the serverless timeout problem: each step gets its own
 * 300s budget instead of the entire pipeline sharing one invocation.
 *
 * Auth: internal only (CRON_SECRET).
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { pipelineRunId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { pipelineRunId } = body;
  if (!pipelineRunId) {
    return NextResponse.json(
      { error: "Missing pipelineRunId" },
      { status: 400 }
    );
  }

  try {
    const result = await advancePipeline(pipelineRunId);

    // If there are more steps, chain to self in a new invocation
    if (result.status === "advanced" && result.hasMore) {
      await chainNextStep(pipelineRunId);
    }

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[advance] Unhandled error:", message);
    return NextResponse.json(
      { error: message, pipelineRunId },
      { status: 500 }
    );
  }
}
