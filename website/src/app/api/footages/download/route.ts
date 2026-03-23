import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

const FOOTAGES_DIR = path.resolve(process.cwd(), "..", "assets", "Footages");

export async function GET(request: NextRequest) {
  const filename = request.nextUrl.searchParams.get("file");

  if (!filename) {
    return NextResponse.json({ error: "Missing file parameter" }, { status: 400 });
  }

  // Prevent path traversal
  const sanitized = path.basename(filename);
  const filePath = path.join(FOOTAGES_DIR, sanitized);

  if (!filePath.startsWith(FOOTAGES_DIR)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 403 });
  }

  try {
    const buffer = await readFile(filePath);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="${sanitized}"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
