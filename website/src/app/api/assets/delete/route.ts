import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Admin-only
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const { storagePath, previewPath } = await request.json();

    if (!storagePath || typeof storagePath !== "string") {
      return NextResponse.json({ error: "storagePath é obrigatório" }, { status: 400 });
    }

    // Delete original from platform-assets (best effort — may not exist)
    await supabase.storage
      .from("platform-assets")
      .remove([storagePath])
      .catch(() => {});

    // Delete preview from asset-previews
    // Try the given path + webp variant (previews may have different extension)
    const previewPaths: string[] = [];
    if (previewPath && typeof previewPath === "string") {
      previewPaths.push(previewPath);
      // Also try .webp variant
      const dotIdx = previewPath.lastIndexOf(".");
      if (dotIdx > -1) {
        previewPaths.push(previewPath.substring(0, dotIdx) + ".webp");
      }
    }
    if (previewPaths.length > 0) {
      await supabase.storage
        .from("asset-previews")
        .remove(previewPaths)
        .catch(() => {});
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[delete] Error:", err);
    return NextResponse.json(
      { error: "Erro ao excluir asset" },
      { status: 500 },
    );
  }
}
