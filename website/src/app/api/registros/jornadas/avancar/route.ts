import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRegistrosAdmin } from "@/lib/registros/guard";
import { getPasso, TOTAL_PASSOS } from "@/lib/registros/jornada";
import type { JornadaRow } from "@/lib/registros/jornada";

const schema = z.object({
  jornadaId: z.string().uuid(),
  passo: z.number().int().min(1).max(TOTAL_PASSOS),
  nota: z.string().trim().optional().nullable(),
  storagePath: z.string().trim().optional().nullable(),
  arquivoNome: z.string().trim().optional().nullable(),
  mimeType: z.string().trim().optional().nullable(),
  tamanho: z.number().int().positive().optional().nullable(),
});

export async function POST(request: NextRequest) {
  const guard = await requireRegistrosAdmin();
  if (!guard.ok) return guard.response;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos" }, { status: 400 });
  }
  const { jornadaId, passo, nota, storagePath, arquivoNome, mimeType, tamanho } = parsed.data;

  const { data: jornadaData, error: jornadaError } = await guard.supabase
    .from("registro_jornadas")
    .select("*")
    .eq("id", jornadaId)
    .single();

  if (jornadaError || !jornadaData) {
    return NextResponse.json({ error: "Jornada não encontrada" }, { status: 404 });
  }
  const jornada = jornadaData as JornadaRow;

  if (jornada.status !== "em_andamento") {
    return NextResponse.json({ error: "Jornada não está em andamento" }, { status: 409 });
  }
  if (jornada.passo_atual !== passo) {
    return NextResponse.json(
      { error: `Passo fora de ordem — o passo atual é o ${jornada.passo_atual}` },
      { status: 409 },
    );
  }

  const definicao = getPasso(passo);
  if (!definicao) {
    return NextResponse.json({ error: "Passo inexistente" }, { status: 400 });
  }
  if (definicao.evidencia.tipo === "texto" && !nota) {
    return NextResponse.json({ error: "Este passo exige uma nota como evidência" }, { status: 400 });
  }
  if (definicao.evidencia.tipo === "arquivo" && !storagePath) {
    return NextResponse.json({ error: "Este passo exige um arquivo como evidência" }, { status: 400 });
  }

  const { error: evidenciaError } = await guard.supabase
    .from("registro_jornada_evidencias")
    .insert({
      jornada_id: jornadaId,
      passo,
      nota: nota || null,
      storage_path: storagePath || null,
      arquivo_nome: arquivoNome || null,
      mime_type: mimeType || null,
      tamanho: tamanho ?? null,
      created_by: guard.userId,
    });

  if (evidenciaError) {
    console.error("[registros/jornadas/avancar] evidencia:", evidenciaError.message);
    return NextResponse.json({ error: "Erro ao registrar evidência" }, { status: 500 });
  }

  const concluiu = passo >= TOTAL_PASSOS;
  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
    ...(concluiu ? { status: "concluida" } : { passo_atual: passo + 1 }),
  };
  // O nº do processo informado no depósito (passo 5) vira referência da jornada.
  if (passo === 5 && nota) patch.processo_numero = nota;

  const { data: atualizada, error: updateError } = await guard.supabase
    .from("registro_jornadas")
    .update(patch)
    .eq("id", jornadaId)
    .select()
    .single();

  if (updateError) {
    console.error("[registros/jornadas/avancar] update:", updateError.message);
    return NextResponse.json({ error: "Erro ao avançar jornada" }, { status: 500 });
  }

  return NextResponse.json({ jornada: atualizada, concluida: concluiu });
}
