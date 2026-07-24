import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sanitizeStorageFilename } from "@/lib/supabase/storage";

export const maxDuration = 120;

/**
 * GET /api/footages/download?file=video.mp4
 *
 * Downloads a footage file from Supabase Storage.
 */
export async function GET(request: NextRequest) {
  const filename = request.nextUrl.searchParams.get("file");

  if (!filename) {
    return NextResponse.json({ error: "Missing file parameter" }, { status: 400 });
  }

  const supabase = await createClient();

  // Auth check
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

  // Footages are stored under Footages/ in platform-assets (sanitized names)
  const storagePath = `Footages/${sanitizeStorageFilename(filename)}`;

  const { data, error } = await supabase.storage
    .from("platform-assets")
    .download(storagePath);

  if (error || !data) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const buffer = Buffer.from(await data.arrayBuffer());

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "video/mp4",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
      "Content-Length": buffer.length.toString(),
    },
  });
}
