import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "admin" && profile.role !== "staff")) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  // PostgREST corta qualquer SELECT em `db.max_rows` (padrão 1000). Sem
  // paginação, times com mais de 1000 membros ficavam invisíveis no painel.
  // Buscamos em páginas até esgotar. Cap de segurança em 50k para evitar loop.
  const PAGE = 1000;
  const MAX = 50_000;
  const members: unknown[] = [];
  for (let from = 0; from < MAX; from += PAGE) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, email, role, created_at")
      .order("created_at", { ascending: true })
      .range(from, from + PAGE - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data || data.length === 0) break;
    members.push(...data);
    if (data.length < PAGE) break;
  }

  return NextResponse.json({ members });
}
