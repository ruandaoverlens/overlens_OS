import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function getAdminUser(
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      user: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || profile.role !== "admin") {
    return {
      user: null,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { user, error: null };
}

// ─── GET /api/magny/sources ─────────────────────────────────────────────────
export async function GET(_req: NextRequest) {
  const supabase = await createClient();
  const { error: authError } = await getAdminUser(supabase);

  if (authError) return authError;

  const { data: sources, error } = await supabase
    .from("sources")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ sources }, { status: 200 });
}

// ─── POST /api/magny/sources ────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { error: authError } = await getAdminUser(supabase);

  if (authError) return authError;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { name, url, type, category, reliability_score } = body as Record<
    string,
    unknown
  >;

  if (!name || typeof name !== "string" || name.trim() === "") {
    return NextResponse.json(
      { error: "Field 'name' is required" },
      { status: 400 }
    );
  }
  if (!type || typeof type !== "string") {
    return NextResponse.json(
      { error: "Field 'type' is required" },
      { status: 400 }
    );
  }
  if (!category || typeof category !== "string") {
    return NextResponse.json(
      { error: "Field 'category' is required" },
      { status: 400 }
    );
  }

  const validTypes = ["rss", "api", "instagram", "manual"];
  const validCategories = ["tecnologia", "negocios", "criacao"];

  if (!validTypes.includes(type)) {
    return NextResponse.json(
      { error: `Field 'type' must be one of: ${validTypes.join(", ")}` },
      { status: 400 }
    );
  }
  if (!validCategories.includes(category)) {
    return NextResponse.json(
      {
        error: `Field 'category' must be one of: ${validCategories.join(", ")}`,
      },
      { status: 400 }
    );
  }

  const score =
    reliability_score !== undefined ? Number(reliability_score) : null;
  if (score !== null && (isNaN(score) || score < 1 || score > 10)) {
    return NextResponse.json(
      { error: "Field 'reliability_score' must be a number between 1 and 10" },
      { status: 400 }
    );
  }

  const { data: source, error } = await supabase
    .from("sources")
    .insert({
      name: name.trim(),
      url: url && typeof url === "string" ? url.trim() : null,
      type,
      category,
      reliability_score: score,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ source }, { status: 201 });
}

// ─── PATCH /api/magny/sources ───────────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { error: authError } = await getAdminUser(supabase);

  if (authError) return authError;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { id, ...updates } = body;

  if (!id || typeof id !== "string") {
    return NextResponse.json(
      { error: "Field 'id' is required" },
      { status: 400 }
    );
  }

  // Only allow updating known fields
  const allowedFields = [
    "name",
    "url",
    "type",
    "category",
    "reliability_score",
    "is_active",
  ];
  const sanitizedUpdates: Record<string, unknown> = {};

  for (const key of allowedFields) {
    if (updates[key] !== undefined) {
      sanitizedUpdates[key] = updates[key];
    }
  }

  if (Object.keys(sanitizedUpdates).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 }
    );
  }

  // Validate type if provided
  if (sanitizedUpdates.type) {
    const validTypes = ["rss", "api", "instagram", "manual"];
    if (!validTypes.includes(sanitizedUpdates.type as string)) {
      return NextResponse.json(
        { error: `Field 'type' must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }
  }

  // Validate category if provided
  if (sanitizedUpdates.category) {
    const validCategories = ["tecnologia", "negocios", "criacao"];
    if (!validCategories.includes(sanitizedUpdates.category as string)) {
      return NextResponse.json(
        {
          error: `Field 'category' must be one of: ${validCategories.join(", ")}`,
        },
        { status: 400 }
      );
    }
  }

  // Validate reliability_score if provided
  if (sanitizedUpdates.reliability_score !== undefined) {
    const score = Number(sanitizedUpdates.reliability_score);
    if (isNaN(score) || score < 1 || score > 10) {
      return NextResponse.json(
        {
          error:
            "Field 'reliability_score' must be a number between 1 and 10",
        },
        { status: 400 }
      );
    }
    sanitizedUpdates.reliability_score = score;
  }

  const { data: source, error } = await supabase
    .from("sources")
    .update(sanitizedUpdates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ source });
}

// ─── DELETE /api/magny/sources ──────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { error: authError } = await getAdminUser(supabase);

  if (authError) return authError;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Query parameter 'id' is required" },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("sources").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
