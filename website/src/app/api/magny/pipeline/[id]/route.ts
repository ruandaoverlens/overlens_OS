import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// ─── Helper: verify admin ───────────────────────────────────────────

async function verifyAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") return null;

  return user;
}

// ─── PATCH /api/magny/pipeline/[id] — stop a running pipeline ────────

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await verifyAdmin();

  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = createAdminClient();

  // Verify the run exists and is stoppable
  const { data: run, error: runError } = await supabase
    .from("pipeline_runs")
    .select("id, status")
    .eq("id", id)
    .single();

  if (runError || !run) {
    return NextResponse.json({ error: "Run not found" }, { status: 404 });
  }

  if (run.status !== "running" && run.status !== "pending") {
    return NextResponse.json(
      { error: `Cannot stop a pipeline with status "${run.status}"` },
      { status: 400 }
    );
  }

  // Mark all running/pending steps as failed
  await supabase
    .from("pipeline_steps")
    .update({
      status: "failed",
      completed_at: new Date().toISOString(),
      error_message: "Pipeline stopped manually by admin",
    })
    .eq("pipeline_run_id", id)
    .in("status", ["running", "pending"]);

  // Mark the run as failed
  const { error: updateError } = await supabase
    .from("pipeline_runs")
    .update({
      status: "failed",
      completed_at: new Date().toISOString(),
      error_message: "Pipeline stopped manually by admin",
    })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: "Pipeline stopped" });
}

// ─── DELETE /api/magny/pipeline/[id] — soft delete (archive) ───────────

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await verifyAdmin();

  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = createAdminClient();

  const { error: updateError } = await supabase
    .from("pipeline_runs")
    .update({ archived: true })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
