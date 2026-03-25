import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const folder = request.nextUrl.searchParams.get("folder");
    const bucket = request.nextUrl.searchParams.get("bucket") || "asset-previews";

    if (!folder) {
      return NextResponse.json({ error: "folder é obrigatório" }, { status: 400 });
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder, { limit: 1000, sortBy: { column: "created_at", order: "desc" } });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Filter out folders (empty items) and .emptyFolderPlaceholder
    const files = (data ?? [])
      .filter((f) => f.name && f.name !== ".emptyFolderPlaceholder" && f.id)
      .map((f) => ({
        name: f.name,
        id: f.id,
        createdAt: f.created_at,
        size: f.metadata?.size ?? 0,
        mimetype: f.metadata?.mimetype ?? "",
      }));

    return NextResponse.json({ files });
  } catch (err) {
    console.error("[list] Error:", err);
    return NextResponse.json(
      { error: "Erro ao listar assets" },
      { status: 500 },
    );
  }
}
