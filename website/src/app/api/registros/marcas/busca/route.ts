import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRegistrosAdmin } from "@/lib/registros/guard";
import { verificarDisponibilidade } from "@/lib/registros/disponibilidade";

// A consulta ao vivo (Infosimples) bate no site do INPI e pode demorar; damos
// folga sobre o limite padrão de execução.
export const maxDuration = 90;

const bodySchema = z.object({
  nome: z.string().trim().min(2, "Informe ao menos 2 caracteres"),
  classes: z.array(z.string().trim().min(1)).optional(),
});

export async function POST(request: NextRequest) {
  const guard = await requireRegistrosAdmin();
  if (!guard.ok) return guard.response;

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
      { status: 400 },
    );
  }

  try {
    const resultado = await verificarDisponibilidade(guard.supabase, {
      nome: parsed.data.nome,
      classes: parsed.data.classes ?? [],
    });
    return NextResponse.json(resultado);
  } catch (err) {
    console.error("[registros/marcas/busca]", err);
    return NextResponse.json(
      { error: "Erro ao consultar disponibilidade" },
      { status: 500 },
    );
  }
}
