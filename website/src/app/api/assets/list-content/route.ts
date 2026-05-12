import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const assetType = request.nextUrl.searchParams.get("type");
    if (!assetType) {
      return NextResponse.json({ error: "type é obrigatório" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("content_items")
      .select("storage_path, asset_type, kind, metadata, uploaded_by, uploaded_at")
      .eq("asset_type", assetType)
      .order("uploaded_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const items = (data ?? []).map((row) => {
      const meta = (row.metadata ?? {}) as Record<string, unknown>;
      const kind = row.kind === "link" ? "link" : "file";
      return {
        kind,
        storagePath: row.storage_path,
        assetType: row.asset_type,
        metadata: meta,
        uploadedBy: row.uploaded_by,
        uploadedAt: row.uploaded_at,
      };
    });

    return NextResponse.json({ items });
  } catch (err) {
    console.error("[list-content] Error:", err);
    return NextResponse.json(
      { error: "Erro ao listar conteúdo" },
      { status: 500 },
    );
  }
}
