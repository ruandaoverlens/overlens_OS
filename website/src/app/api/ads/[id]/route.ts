import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface PatchBody {
  title?: string;
  platform?: string | null;
  ctr?: number | null;
  retention_seconds?: number | null;
  retention_percent?: number | null;
  conversion?: number | null;
  notes?: string | null;
  tags?: string[];
}

async function requireStaff(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado", status: 401 as const };
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || !["staff", "admin"].includes(profile.role)) {
    return { error: "Sem permissão", status: 403 as const };
  }
  return { user, role: profile.role as "staff" | "admin" };
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const auth = await requireStaff(supabase);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await context.params;
    if (!id) return NextResponse.json({ error: "id é obrigatório" }, { status: 400 });

    const body = (await request.json()) as PatchBody;

    const update: Record<string, unknown> = {};
    if (typeof body.title === "string") update.title = body.title.trim();
    if (body.platform !== undefined) update.platform = body.platform || null;
    if (body.ctr !== undefined) update.ctr = body.ctr;
    if (body.retention_seconds !== undefined) update.retention_seconds = body.retention_seconds;
    if (body.retention_percent !== undefined) update.retention_percent = body.retention_percent;
    if (body.conversion !== undefined) update.conversion = body.conversion;
    if (body.notes !== undefined) update.notes = body.notes;
    if (Array.isArray(body.tags)) update.tags = body.tags;

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "Nada para atualizar" }, { status: 400 });
    }

    const { error } = await supabase
      .from("ads")
      .update(update)
      .eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[ads:patch] Error:", err);
    return NextResponse.json({ error: "Erro ao atualizar anúncio" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const auth = await requireStaff(supabase);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await context.params;
    if (!id) return NextResponse.json({ error: "id é obrigatório" }, { status: 400 });

    // Collect storage paths before deleting rows.
    const { data: media } = await supabase
      .from("ad_media")
      .select("storage_path, preview_path")
      .eq("ad_id", id);

    const originalPaths = (media ?? [])
      .map((m) => m.storage_path)
      .filter((p): p is string => typeof p === "string" && p.length > 0);
    const previewPaths = (media ?? [])
      .map((m) => m.preview_path)
      .filter((p): p is string => typeof p === "string" && p.length > 0);

    // Delete from Storage (best effort).
    if (originalPaths.length > 0) {
      await supabase.storage.from("platform-assets").remove(originalPaths).catch(() => {});
    }
    if (previewPaths.length > 0) {
      await supabase.storage.from("asset-previews").remove(previewPaths).catch(() => {});
    }

    // ad_media cascades on ad deletion.
    const { error } = await supabase.from("ads").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[ads:delete] Error:", err);
    return NextResponse.json({ error: "Erro ao excluir anúncio" }, { status: 500 });
  }
}
