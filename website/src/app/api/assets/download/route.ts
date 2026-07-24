import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sanitizeStorageFilename } from "@/lib/supabase/storage";

export const maxDuration = 120;

/**
 * GET /api/assets/download?file=Imagens/photo.jpg
 *
 * Downloads the original full-quality file from Supabase Storage.
 */
export async function GET(request: NextRequest) {
  const fileParam = request.nextUrl.searchParams.get("file");

  if (!fileParam) {
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

  // Sanitize the filename portion of the path (keep folder structure)
  const parts = fileParam.split("/");
  const sanitizedPath = parts.map((p, i) =>
    i === parts.length - 1 ? sanitizeStorageFilename(p) : p
  ).join("/");

  // Download from Storage
  const { data, error } = await supabase.storage
    .from("platform-assets")
    .download(sanitizedPath);

  if (error || !data) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const filename = fileParam.split("/").pop() ?? "download";
  const buffer = Buffer.from(await data.arrayBuffer());

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": data.type || "application/octet-stream",
      "Content-Length": buffer.length.toString(),
      "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
    },
  });
}
