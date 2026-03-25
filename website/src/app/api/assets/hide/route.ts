import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** GET — list all hidden asset keys (optionally filtered by asset_type) */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const assetType = request.nextUrl.searchParams.get("type");

    let query = supabase.from("hidden_assets").select("asset_key, asset_type");
    if (assetType) {
      query = query.eq("asset_type", assetType);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ hidden: data ?? [] });
  } catch (err) {
    console.error("[hide:list] Error:", err);
    return NextResponse.json({ error: "Erro ao listar ocultos" }, { status: 500 });
  }
}

/** POST — hide an asset (admin only) */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const { assetKey, assetType } = await request.json();
    if (!assetKey || !assetType) {
      return NextResponse.json({ error: "assetKey e assetType são obrigatórios" }, { status: 400 });
    }

    const { error } = await supabase.from("hidden_assets").upsert(
      { asset_key: assetKey, asset_type: assetType, hidden_by: user.id },
      { onConflict: "asset_key,asset_type" },
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[hide:post] Error:", err);
    return NextResponse.json({ error: "Erro ao ocultar asset" }, { status: 500 });
  }
}

/** DELETE — unhide an asset (admin only) */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const { assetKey, assetType } = await request.json();
    if (!assetKey || !assetType) {
      return NextResponse.json({ error: "assetKey e assetType são obrigatórios" }, { status: 400 });
    }

    const { error } = await supabase
      .from("hidden_assets")
      .delete()
      .eq("asset_key", assetKey)
      .eq("asset_type", assetType);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[hide:delete] Error:", err);
    return NextResponse.json({ error: "Erro ao desocultar asset" }, { status: 500 });
  }
}
