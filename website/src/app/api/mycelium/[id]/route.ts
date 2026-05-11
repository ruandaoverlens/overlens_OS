import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { MyceliumType } from "@/lib/mycelium-types";

const VALID_TYPES: ReadonlySet<MyceliumType> = new Set([
  "artigo",
  "video",
  "imagem",
  "audio",
  "pdf",
  "skill",
  "post",
  "site",
]);

interface PatchBody {
  type?: string;
  title?: string;
  description?: string | null;
  url?: string | null;
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

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado", status: 401 as const };
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || profile.role !== "admin") {
    return { error: "Sem permissão", status: 403 as const };
  }
  return { user, role: "admin" as const };
}

/**
 * PATCH /api/mycelium/[id]
 * Atualiza title / description / url / tags / type. Restrito a staff/admin.
 * O `updated_at` é atualizado automaticamente pelo trigger no Postgres.
 */
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
    if (!id) {
      return NextResponse.json({ error: "id é obrigatório" }, { status: 400 });
    }

    const body = (await request.json()) as PatchBody;
    const update: Record<string, unknown> = {};

    if (typeof body.title === "string") {
      const t = body.title.trim();
      if (!t) {
        return NextResponse.json({ error: "Título não pode ser vazio" }, { status: 400 });
      }
      update.title = t;
    }
    if (body.description !== undefined) {
      update.description = body.description ? String(body.description).trim() || null : null;
    }
    if (body.url !== undefined) {
      update.url = body.url ? String(body.url).trim() || null : null;
    }
    if (Array.isArray(body.tags)) {
      update.tags = body.tags
        .filter((t): t is string => typeof t === "string")
        .map((t) => t.trim())
        .filter(Boolean);
    }
    if (typeof body.type === "string") {
      if (!VALID_TYPES.has(body.type as MyceliumType)) {
        return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
      }
      update.type = body.type;
    }
    // updated_at é sempre atualizado pelo trigger; manter explícito por segurança.
    update.updated_at = new Date().toISOString();

    if (Object.keys(update).length <= 1) {
      // só updated_at — nada útil para atualizar
      return NextResponse.json({ error: "Nada para atualizar" }, { status: 400 });
    }

    const { error } = await supabase
      .from("mycelium_references")
      .update(update)
      .eq("id", id);

    if (error) {
      console.error("[mycelium:patch] update error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[mycelium:patch] Error:", err);
    return NextResponse.json(
      { error: "Erro ao atualizar referência" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/mycelium/[id]
 * Remove a referência e todos os arquivos associados (originais + previews + capa).
 * Restrito a admin.
 *
 * Ordem:
 *   1. Lista attachments para coletar storage_path/preview_path
 *   2. Deleta originais de mycelium-attachments
 *   3. Deleta previews de mycelium-previews (incluindo cover_path da reference)
 *   4. Deleta a row em mycelium_references (cascade limpa mycelium_attachments)
 */
export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const auth = await requireAdmin(supabase);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "id é obrigatório" }, { status: 400 });
    }

    // 1) Fetch cover_path da reference + attachments
    const { data: ref } = await supabase
      .from("mycelium_references")
      .select("cover_path")
      .eq("id", id)
      .single();

    const { data: atts } = await supabase
      .from("mycelium_attachments")
      .select("storage_path, preview_path")
      .eq("reference_id", id);

    const originals = (atts ?? [])
      .map((a) => a.storage_path)
      .filter((p): p is string => typeof p === "string" && p.length > 0);

    const previews = (atts ?? [])
      .map((a) => a.preview_path)
      .filter((p): p is string => typeof p === "string" && p.length > 0);

    if (ref?.cover_path) {
      previews.push(ref.cover_path);
    }

    // 2) Remove originals (best-effort)
    if (originals.length > 0) {
      await supabase.storage
        .from("mycelium-attachments")
        .remove(originals)
        .catch((err: unknown) =>
          console.error("[mycelium:delete] originals remove failed:", err),
        );
    }

    // 3) Remove previews + cover (best-effort)
    if (previews.length > 0) {
      await supabase.storage
        .from("mycelium-previews")
        .remove(previews)
        .catch((err: unknown) =>
          console.error("[mycelium:delete] previews remove failed:", err),
        );
    }

    // 4) Delete da reference (cascade cuida de mycelium_attachments)
    const { error } = await supabase
      .from("mycelium_references")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[mycelium:delete] delete error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[mycelium:delete] Error:", err);
    return NextResponse.json(
      { error: "Erro ao excluir referência" },
      { status: 500 },
    );
  }
}
