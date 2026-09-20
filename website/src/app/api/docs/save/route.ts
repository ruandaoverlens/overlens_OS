import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/route-access";
import { isSystemSlug, getSystemConfig } from "@/lib/system-configs";

const MAX_CONTENT_BYTES = 2 * 1024 * 1024;

/**
 * Salva (POST) ou restaura (DELETE) o texto de uma página.
 * Exclusivo do admin — staff tem todas as outras permissões, mas não esta.
 */
async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Não autenticado" }, { status: 401 }) };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !isAdmin(profile.role)) {
    return { error: NextResponse.json({ error: "Apenas administradores podem editar textos" }, { status: 403 }) };
  }
  return { user };
}

function parseTarget(body: unknown): { system: string; path: string } | null {
  if (!body || typeof body !== "object") return null;
  const { system, path } = body as { system?: unknown; path?: unknown };
  if (typeof system !== "string" || !isSystemSlug(system)) return null;
  if (typeof path !== "string" || !path || path.includes("..")) return null;
  return { system, path };
}

function pagePath(system: string, path: string): string {
  return `${getSystemConfig(system).basePath}/${path}`;
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  const target = parseTarget(body);
  const content = (body as { content?: unknown } | null)?.content;

  if (!target) {
    return NextResponse.json({ error: "system e path são obrigatórios" }, { status: 400 });
  }
  if (typeof content !== "string") {
    return NextResponse.json({ error: "content é obrigatório" }, { status: 400 });
  }
  if (Buffer.byteLength(content, "utf-8") > MAX_CONTENT_BYTES) {
    return NextResponse.json({ error: "Conteúdo grande demais" }, { status: 413 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("doc_pages").upsert(
    {
      system: target.system,
      path: target.path,
      content,
      updated_by: auth.user.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "system,path" },
  );

  if (error) {
    console.error("[docs/save] upsert failed:", error.message);
    return NextResponse.json({ error: "Erro ao salvar a página" }, { status: 500 });
  }

  // Histórico é best-effort — nunca falha o salvamento.
  await admin
    .from("doc_page_revisions")
    .insert({ system: target.system, path: target.path, content, created_by: auth.user.id })
    .then(() => undefined, () => undefined);

  revalidatePath(pagePath(target.system, target.path));
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  const target = parseTarget(body);
  if (!target) {
    return NextResponse.json({ error: "system e path são obrigatórios" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("doc_pages")
    .delete()
    .eq("system", target.system)
    .eq("path", target.path);

  if (error) {
    console.error("[docs/save] delete failed:", error.message);
    return NextResponse.json({ error: "Erro ao restaurar a página" }, { status: 500 });
  }

  revalidatePath(pagePath(target.system, target.path));
  return NextResponse.json({ success: true });
}
