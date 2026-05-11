import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const limit = Math.min(
      Math.max(parseInt(request.nextUrl.searchParams.get("limit") ?? "50", 10), 1),
      200,
    );

    const { data, error } = await supabase
      .from("notifications")
      .select(
        "id, user_id, variant, category, title, description, cover_url, action_url, entity_type, entity_id, metadata, read_at, created_at",
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ items: data ?? [] });
  } catch (err) {
    console.error("[notifications/list] error:", err);
    return NextResponse.json({ error: "Erro ao listar notificações" }, { status: 500 });
  }
}
