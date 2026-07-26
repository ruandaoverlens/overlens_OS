import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateText } from "ai";
import { requireRegistrosAdmin } from "@/lib/registros/guard";
import { openrouter } from "@/lib/ai/openrouter";
import { DEFAULT_MODEL } from "@/lib/ai/models";
import type { JornadaRow } from "@/lib/registros/jornada";

export const maxDuration = 60;

const schema = z
  .object({
    jornadaId: z.string().uuid(),
    modo: z.enum(["termos", "classes"]),
    objetivo: z.string().trim().optional(),
  })
  .refine((d) => d.modo !== "classes" || (d.objetivo && d.objetivo.length > 0), {
    message: "Descreva o objetivo do registro",
  });

const TermoSchema = z.object({
  termo: z.string(),
  tipo: z.enum(["fonetica", "grafica", "ideologica"]),
  motivo: z.string().optional().default(""),
});

const ClasseSchema = z.object({
  classe: z.string(),
  titulo: z.string().optional().default(""),
  motivo: z.string().optional().default(""),
});

const RespostaSchema = z.object({
  termos: z.array(TermoSchema).max(20).optional().default([]),
  classes: z.array(ClasseSchema).max(8).optional().default([]),
  observacoes: z.string().optional().default(""),
});

function extrairJson(texto: string): unknown {
  // Modelos free às vezes embrulham o JSON em cerca de código ou prosa.
  const semCerca = texto.replace(/```(?:json)?/gi, "").trim();
  const inicio = semCerca.indexOf("{");
  const fim = semCerca.lastIndexOf("}");
  if (inicio === -1 || fim === -1 || fim <= inicio) throw new Error("Sem JSON na resposta");
  return JSON.parse(semCerca.slice(inicio, fim + 1));
}

function promptTermos(jornada: JornadaRow): string {
  return `Você é um analista de propriedade intelectual apoiando a busca prévia de disponibilidade de uma marca no INPI (Brasil).

Marca a registrar: "${jornada.nome_marca}"

Gere termos de pesquisa para a busca de anterioridade, cobrindo três tipos de colidência:
- "fonetica": variações que soam igual ou parecido em português (trocas de letras com mesmo som, junções/separações, grafias fonéticas).
- "grafica": variações visuais/de grafia (radicais, prefixos/sufixos, hífens, plural, letras dobradas, substituições comuns).
- "ideologica": termos com o mesmo significado ou conceito (traduções para português/inglês/espanhol, sinônimos, conceito evocado).
Gere de 8 a 15 termos no total, cada um com um motivo curto.
Em "observacoes", escreva 1-2 frases com alertas úteis (ex.: risco de termo descritivo/genérico, radicais muito comuns no segmento).

Responda APENAS com JSON válido, sem texto fora dele, no formato:
{"termos":[{"termo":"...","tipo":"fonetica|grafica|ideologica","motivo":"..."}],"observacoes":"..."}`;
}

function promptClasses(jornada: JornadaRow, objetivo: string): string {
  return `Você é um analista de propriedade intelectual apoiando a escolha de classes de Nice (NCL 12) para o registro de uma marca no INPI (Brasil).

Marca a registrar: "${jornada.nome_marca}"
Titular: ${jornada.titular}
Objetivo do registro, segundo o usuário: ${objetivo}

Tarefas:
1. Sugira as classes de Nice adequadas ao objetivo descrito, com o título resumido da classe e um motivo curto. Sugira apenas classes realmente pertinentes ao uso descrito (normalmente 1 a 4).
2. Em "observacoes", escreva 1-2 frases com alertas úteis (classes afins que valem checar na busca de anterioridade, itens da lista pré-aprovada, etc.).

Responda APENAS com JSON válido, sem texto fora dele, no formato:
{"classes":[{"classe":"41","titulo":"...","motivo":"..."}],"observacoes":"..."}`;
}

export async function POST(request: NextRequest) {
  const guard = await requireRegistrosAdmin();
  if (!guard.ok) return guard.response;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
      { status: 400 },
    );
  }

  const { data: jornadaData } = await guard.supabase
    .from("registro_jornadas")
    .select("*")
    .eq("id", parsed.data.jornadaId)
    .single();
  if (!jornadaData) {
    return NextResponse.json({ error: "Jornada não encontrada" }, { status: 404 });
  }
  const jornada = jornadaData as JornadaRow;

  const prompt =
    parsed.data.modo === "termos"
      ? promptTermos(jornada)
      : promptClasses(jornada, parsed.data.objetivo ?? "");

  try {
    const { text } = await generateText({
      model: openrouter(DEFAULT_MODEL),
      prompt,
      maxTokens: 1500,
      temperature: 0.4,
    });

    const analise = RespostaSchema.parse(extrairJson(text));

    // Persiste na jornada para a análise ficar sempre disponível na UI,
    // sem precisar regenerar a cada visita.
    const { error: saveError } = await guard.supabase
      .from("registro_jornadas")
      .update({
        analise: { ...(jornada.analise ?? {}), [parsed.data.modo]: analise },
        updated_at: new Date().toISOString(),
      })
      .eq("id", jornada.id);
    if (saveError) {
      console.error("[registros/jornadas/analise-nome] save:", saveError.message);
    }

    return NextResponse.json({ analise });
  } catch (err) {
    console.error("[registros/jornadas/analise-nome]:", err);
    return NextResponse.json(
      { error: "Não foi possível gerar a análise agora. Tente novamente." },
      { status: 502 },
    );
  }
}
