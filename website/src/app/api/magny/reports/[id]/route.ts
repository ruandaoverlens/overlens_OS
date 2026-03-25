import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ─── GET /api/magny/reports/[id] ────────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";

  // Fetch the report
  const { data: report, error: reportError } = await supabase
    .from("reports")
    .select(
      "id, slug, title, status, week_start, week_end, published_at, created_at, review_notes, reviewed_by"
    )
    .eq("id", id)
    .single();

  if (reportError || !report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  // Members can only access published reports
  if (!isAdmin && report.status !== "published") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Fetch sections
  const { data: sections, error: sectionsError } = await supabase
    .from("report_sections")
    .select("id, section_key, title, content, order_index")
    .eq("report_id", id)
    .order("order_index", { ascending: true });

  if (sectionsError) {
    return NextResponse.json(
      { error: sectionsError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ report, sections: sections ?? [] });
}

// ─── PATCH /api/magny/reports/[id] ──────────────────────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: {
    status?: string;
    review_notes?: string;
    sections?: { id: string; content: string }[];
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Update report-level fields if provided
  const reportUpdates: Record<string, unknown> = {};
  if (body.status !== undefined) reportUpdates.status = body.status;
  if (body.review_notes !== undefined)
    reportUpdates.review_notes = body.review_notes;

  if (Object.keys(reportUpdates).length > 0) {
    const { error: updateError } = await supabase
      .from("reports")
      .update(reportUpdates)
      .eq("id", id);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }
  }

  // Update individual sections if provided
  if (body.sections && body.sections.length > 0) {
    for (const section of body.sections) {
      const { error: sectionError } = await supabase
        .from("report_sections")
        .update({ content: section.content })
        .eq("id", section.id)
        .eq("report_id", id);

      if (sectionError) {
        return NextResponse.json(
          {
            error: `Failed to update section ${section.id}: ${sectionError.message}`,
          },
          { status: 500 }
        );
      }
    }
  }

  return NextResponse.json({ success: true });
}

// ─── DELETE /api/magny/reports/[id] ──────────────────────────────────────────
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Delete report (cascades to report_sections, report_views, refiner_feedback)
  const { error: deleteError } = await supabase
    .from("reports")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return NextResponse.json(
      { error: deleteError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
