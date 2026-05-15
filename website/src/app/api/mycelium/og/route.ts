import { NextRequest, NextResponse } from "next/server";
import { fetchOgMetadata, type OgMetadata } from "@/lib/mycelium-og";

/**
 * GET /api/mycelium/og?url=...
 *
 * Tenta extrair OpenGraph metadata da URL.
 * NÃO retorna 500 — sempre 200 com fields null + `error` em caso de falha,
 * pra não bloquear o form de criação no front.
 */
export async function GET(request: NextRequest): Promise<NextResponse<OgMetadata>> {
  const empty: OgMetadata = {
    title: null,
    description: null,
    image: null,
    siteName: null,
  };

  try {
    const target = request.nextUrl.searchParams.get("url");
    if (!target) {
      return NextResponse.json({ ...empty, error: "url é obrigatório" });
    }
    const result = await fetchOgMetadata(target);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[mycelium:og] Error:", err);
    return NextResponse.json({ ...empty, error: "Erro ao buscar metadata" });
  }
}
