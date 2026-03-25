import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateCoverImage } from "@/lib/magny/seedream";

// ─── POST /api/magny/reports/[id]/publish ──────────────────────────────────────
export async function POST(
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

  // Verify report exists
  const { data: report, error: reportError } = await supabase
    .from("reports")
    .select("id, status, title, cover_image_url")
    .eq("id", id)
    .single();

  if (reportError || !report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  if (report.status === "published") {
    return NextResponse.json({ error: "Report is already published" }, { status: 400 });
  }

  // Generate cover image if not already set
  let coverImageUrl = report.cover_image_url;
  if (!coverImageUrl) {
    coverImageUrl = await generateCoverImage(report.title);
  }

  // Publish the report
  const { error: updateError } = await supabase
    .from("reports")
    .update({
      status: "published",
      published_at: new Date().toISOString(),
      ...(coverImageUrl ? { cover_image_url: coverImageUrl } : {}),
    })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
