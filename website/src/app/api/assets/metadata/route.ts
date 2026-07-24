import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface MetadataRow {
  asset_type: string;
  asset_key: string;
  title: string | null;
  caption: string | null;
  author: string | null;
  year: string | null;
  source_url: string | null;
  tags: string[];
  updated_at: string;
}

/**
 * GET — fetch metadata overrides.
 * - `?type=image` returns all rows for that asset_type (used to hydrate the bank).
 * - `?type=image&key=foo.png` returns a single row (or null).
 */
export async function GET(request: NextRequest) {
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

    if (!profile || !["staff", "admin"].includes(profile.role)) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const assetType = request.nextUrl.searchParams.get("type");
    const assetKey = request.nextUrl.searchParams.get("key");

    if (!assetType) {
      return NextResponse.json({ error: "type é obrigatório" }, { status: 400 });
    }

    if (assetKey) {
      const { data, error } = await supabase
        .from("asset_metadata")
        .select("asset_type, asset_key, title, caption, author, year, source_url, tags, updated_at")
        .eq("asset_type", assetType)
        .eq("asset_key", assetKey)
        .maybeSingle();
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ metadata: (data as MetadataRow | null) ?? null });
    }

    const { data, error } = await supabase
      .from("asset_metadata")
      .select("asset_type, asset_key, title, caption, author, year, source_url, tags, updated_at")
      .eq("asset_type", assetType);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ metadata: (data ?? []) as MetadataRow[] });
  } catch (err) {
    console.error("[metadata:get] Error:", err);
    return NextResponse.json({ error: "Erro ao buscar metadados" }, { status: 500 });
  }
}

/** POST — admin upsert of editable fields for a single asset. */
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

    const body = await request.json() as {
      assetType?: string;
      assetKey?: string;
      title?: string | null;
      caption?: string | null;
      author?: string | null;
      year?: string | null;
      sourceUrl?: string | null;
      tags?: string[];
    };

    const { assetType, assetKey } = body;
    if (!assetType || !assetKey) {
      return NextResponse.json({ error: "assetType e assetKey são obrigatórios" }, { status: 400 });
    }

    const row = {
      asset_type: assetType,
      asset_key: assetKey,
      title: body.title ?? null,
      caption: body.caption ?? null,
      author: body.author ?? null,
      year: body.year ?? null,
      source_url: body.sourceUrl ?? null,
      tags: Array.isArray(body.tags) ? body.tags : [],
      updated_by: user.id,
    };

    const { error } = await supabase
      .from("asset_metadata")
      .upsert(row, { onConflict: "asset_type,asset_key" });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[metadata:post] Error:", err);
    return NextResponse.json({ error: "Erro ao salvar metadados" }, { status: 500 });
  }
}

/** DELETE — admin removes overrides for a single asset (reverts to default). */
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

    const { assetType, assetKey } = await request.json() as {
      assetType?: string;
      assetKey?: string;
    };

    if (!assetType || !assetKey) {
      return NextResponse.json({ error: "assetType e assetKey são obrigatórios" }, { status: 400 });
    }

    const { error } = await supabase
      .from("asset_metadata")
      .delete()
      .eq("asset_type", assetType)
      .eq("asset_key", assetKey);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[metadata:delete] Error:", err);
    return NextResponse.json({ error: "Erro ao remover metadados" }, { status: 500 });
  }
}
