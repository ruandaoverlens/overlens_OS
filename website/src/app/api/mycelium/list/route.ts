import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type {
  AttachmentKind,
  MyceliumAttachment,
  MyceliumReference,
  MyceliumType,
} from "@/lib/mycelium-types";

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

interface RawAttachment {
  id: string;
  reference_id: string;
  storage_path: string;
  preview_path: string | null;
  kind: string;
  mime_type: string | null;
  size_bytes: number | null;
  sort_order: number;
}

interface RawReference {
  id: string;
  type: string;
  title: string;
  description: string | null;
  url: string | null;
  cover_path: string | null;
  tags: string[] | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  attachments?: RawAttachment[] | null;
}

type EnrichedAttachment = MyceliumAttachment & { preview_url: string | null };
type EnrichedReference = MyceliumReference & {
  attachments: EnrichedAttachment[];
  cover_url: string | null;
};

/**
 * GET /api/mycelium/list
 *
 * Lê referências do Mycelium. Leitura é livre para qualquer usuário autenticado.
 *
 * Query params:
 *   type   — filtra por MyceliumType (artigo, video, imagem, audio, pdf, skill, post, site)
 *   tag    — filtra por tag (case-sensitive — array contains)
 *   q      — busca em title/description (case-insensitive)
 *   ids    — lista CSV de UUIDs (para favoritos)
 *   limit  — paginação (default 30, max 200)
 *   offset — paginação (default 0)
 *
 * Retorna:
 *   { references: EnrichedReference[], total: number }
 *
 *   Cada attachment ganha `preview_url` (URL pública do bucket mycelium-previews).
 *   Cada reference ganha `cover_url` (URL pública do cover_path) e `author` ({ name, avatar_url }).
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const sp = request.nextUrl.searchParams;
    const type = sp.get("type");
    const tag = sp.get("tag");
    const q = sp.get("q");
    const idsParam = sp.get("ids");
    const limitRaw = parseInt(sp.get("limit") ?? "30", 10);
    const offsetRaw = parseInt(sp.get("offset") ?? "0", 10);
    const limit = Number.isFinite(limitRaw)
      ? Math.min(Math.max(limitRaw, 1), 200)
      : 30;
    const offset = Number.isFinite(offsetRaw) ? Math.max(offsetRaw, 0) : 0;

    let query = supabase
      .from("mycelium_references")
      .select("*, attachments:mycelium_attachments(*)", {
        count: "exact",
        head: false,
      })
      .order("created_at", { ascending: false });

    if (type && VALID_TYPES.has(type as MyceliumType)) {
      query = query.eq("type", type);
    }
    if (tag) {
      query = query.contains("tags", [tag]);
    }
    if (q) {
      const escaped = q.replace(/[%_,]/g, (m) => `\\${m}`);
      query = query.or(`title.ilike.%${escaped}%,description.ilike.%${escaped}%`);
    }
    if (idsParam) {
      const ids = idsParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (ids.length === 0) {
        return NextResponse.json({ references: [], total: 0 });
      }
      query = query.in("id", ids);
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) {
      console.error("[mycelium:list] query error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const rows = (data ?? []) as RawReference[];

    // Build author map via a single profiles fetch (avoids N+1).
    const userIds = Array.from(
      new Set(
        rows
          .map((r) => r.created_by)
          .filter((id): id is string => typeof id === "string" && id.length > 0),
      ),
    );

    const authorMap = new Map<string, { name: string; avatar_url: string | null }>();
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, avatar_url")
        .in("id", userIds);
      for (const p of profiles ?? []) {
        const row = p as { id: string; name: string | null; avatar_url: string | null };
        authorMap.set(row.id, {
          name: row.name ?? "",
          avatar_url: row.avatar_url ?? null,
        });
      }
    }

    const previewBucket = supabase.storage.from("mycelium-previews");

    const references: EnrichedReference[] = rows.map((r) => {
      const attachments: EnrichedAttachment[] = (r.attachments ?? [])
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((a) => ({
          id: a.id,
          reference_id: a.reference_id,
          storage_path: a.storage_path,
          preview_path: a.preview_path,
          kind: a.kind as AttachmentKind,
          mime_type: a.mime_type,
          size_bytes: a.size_bytes,
          sort_order: a.sort_order,
          preview_url: a.preview_path
            ? previewBucket.getPublicUrl(a.preview_path).data.publicUrl
            : null,
        }));

      const cover_url = r.cover_path
        ? previewBucket.getPublicUrl(r.cover_path).data.publicUrl
        : null;

      return {
        id: r.id,
        type: r.type as MyceliumType,
        title: r.title,
        description: r.description,
        url: r.url,
        cover_path: r.cover_path,
        tags: Array.isArray(r.tags) ? r.tags : [],
        created_by: r.created_by,
        created_at: r.created_at,
        updated_at: r.updated_at,
        attachments,
        cover_url,
        author: r.created_by ? authorMap.get(r.created_by) ?? null : null,
      };
    });

    return NextResponse.json({
      references,
      total: typeof count === "number" ? count : references.length,
    });
  } catch (err) {
    console.error("[mycelium:list] Error:", err);
    return NextResponse.json(
      { error: "Erro ao listar referências" },
      { status: 500 },
    );
  }
}
