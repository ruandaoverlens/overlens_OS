import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";
import { ORIGINALS_DIR } from "@/lib/media-optimizer";

/**
 * GET /api/assets/download?file=Imagens/photo.jpg
 *
 * Serves the original full-quality file for download.
 */
export async function GET(request: NextRequest) {
  const fileParam = request.nextUrl.searchParams.get("file");

  if (!fileParam) {
    return NextResponse.json({ error: "Missing file parameter" }, { status: 400 });
  }

  // Prevent path traversal
  const normalized = path.normalize(fileParam).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(ORIGINALS_DIR, normalized);

  if (!filePath.startsWith(ORIGINALS_DIR)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 403 });
  }

  try {
    const fileStat = await stat(filePath);
    const filename = path.basename(filePath);

    // Support range requests for large files
    const range = request.headers.get("range");

    if (range) {
      const buffer = await readFile(filePath);
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileStat.size - 1;
      const chunkSize = end - start + 1;

      return new NextResponse(buffer.subarray(start, end + 1), {
        status: 206,
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Range": `bytes ${start}-${end}/${fileStat.size}`,
          "Content-Length": chunkSize.toString(),
          "Accept-Ranges": "bytes",
          "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
        },
      });
    }

    const buffer = await readFile(filePath);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Length": fileStat.size.toString(),
        "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
        "Accept-Ranges": "bytes",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
