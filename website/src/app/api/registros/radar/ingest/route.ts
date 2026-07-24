import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateText } from "ai";
import { requireRegistrosAdmin } from "@/lib/registros/guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { createNotifications } from "@/lib/notifications";
import { openrouter } from "@/lib/ai/openrouter";
import { DEFAULT_MODEL } from "@/lib/ai/models";
import {
  obterUltimaRevista,
  baixarRevista,
  parsearRevista,
  DESPACHOS_COLIDENCIA,
  type PublicacaoParseada,
} from "@/lib/registros/rpi";
import { avaliarSimilaridade, type TipoMatch } from "@/lib/registros/matching";
import type { SupabaseClient } from "@supabase/supabase-js";

// A ingestão baixa (~8-9 MB), descompacta, parseia e roda matching contra todas
// as marcas — pode passar do limite padrão de execução.
export const maxDuration = 300;

// Score a partir do qual um candidato vira alerta automaticamente.
const LIMIAR_ALERTA = 0.9;
// Teto de candidatos que recebem triagem por IA (dado público -> modelo free).
const MAX_TRIAGEM_IA = 20;

const bodySchema = z.object({ revista: z.number().int().positive().optional() });

interface CandidatoInsert {
  execucao_id: string;
  marca_id: string;
  processo_numero: string;
  marca_texto: string;
  classe: string;
  titular: string;
  tipo_match: TipoMatch;
  score: number;
  status: "pendente";
  nomeNossaMarca: string;
}

/**
 * Núcleo da ingestão. Retorna um resumo estruturado ou um erro com status HTTP.
 */
async function runIngest(revistaSolicitada?: number): Promise<
  | { error: string; status: 400 | 500 }
  | {
      status: 200;
      rpi_numero: string;
      jaProcessada?: boolean;
      execucao_id?: string;
      total_publicacoes?: number;
      total_candidatos?: number;
      alertas_processo?: number;
      execucaoStatus?: string;
    }
> {
  const admin = createAdminClient();

  // 1. Resolver número da revista.
  let rpiNumero: string;
  try {
    if (revistaSolicitada) {
      rpiNumero = String(revistaSolicitada);
    } else {
      const info = await obterUltimaRevista();
      rpiNumero = info.numero;
    }
  } catch (err) {
    return {
      error: `Não foi possível resolver a revista: ${
        err instanceof Error ? err.message : String(err)
      }`,
      status: 500,
    };
  }

  // 2. Idempotência: se já há execução 'ok' para essa revista, não reprocessa.
  const { data: jaOk } = await admin
    .from("registro_radar_execucoes")
    .select("id")
    .eq("rpi_numero", rpiNumero)
    .eq("status", "ok")
    .maybeSingle();
  if (jaOk) {
    return { status: 200, rpi_numero: rpiNumero, jaProcessada: true };
  }

  // 3. Baixar + parsear. Falha aqui vira execução 'erro' registrada.
  let publicacoes: PublicacaoParseada[];
  try {
    const xml = await baixarRevista(rpiNumero);
    const parsed = parsearRevista(xml);
    publicacoes = parsed.publicacoes;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await admin.from("registro_radar_execucoes").insert({
      rpi_numero: rpiNumero,
      status: "erro",
      total_publicacoes: 0,
      total_candidatos: 0,
      erro: msg,
    });
    return { error: `Falha ao baixar/parsear a revista: ${msg}`, status: 500 };
  }

  // 4. Criar execução (marcador de progresso; finalizada no fim).
  const { data: execRow, error: execErr } = await admin
    .from("registro_radar_execucoes")
    .insert({
      rpi_numero: rpiNumero,
      status: "parcial",
      total_publicacoes: publicacoes.length,
      total_candidatos: 0,
    })
    .select("id")
    .single();
  if (execErr || !execRow) {
    return { error: "Erro ao criar execução do radar", status: 500 };
  }
  const execucaoId = execRow.id as string;

  // 4b. Idempotência em rerun: se a revista já teve execução 'parcial'/'erro',
  //     não recriar candidatos (nem os alertas derivados deles) já registrados.
  const { data: execsAnteriores } = await admin
    .from("registro_radar_execucoes")
    .select("id")
    .eq("rpi_numero", rpiNumero)
    .neq("id", execucaoId);
  const execAnterioresIds = ((execsAnteriores ?? []) as { id: string }[]).map((e) => e.id);
  let candidatosJaVistos = new Set<string>();
  if (execAnterioresIds.length > 0) {
    const { data: candAnteriores } = await admin
      .from("registro_radar_candidatos")
      .select("marca_id, processo_numero")
      .in("execucao_id", execAnterioresIds);
    candidatosJaVistos = new Set(
      ((candAnteriores ?? []) as { marca_id: string | null; processo_numero: string | null }[]).map(
        (c) => `${c.marca_id}|${c.processo_numero}`,
      ),
    );
  }

  // 5. Carregar nossas marcas e processos uma única vez.
  const { data: marcasData } = await admin
    .from("registro_marcas")
    .select("id, nome");
  const marcas = (marcasData ?? []) as { id: string; nome: string }[];

  const { data: procData } = await admin
    .from("registro_processos")
    .select("numero, marca_id");
  const nossosProcessos = new Map<string, string>(
    ((procData ?? []) as { numero: string; marca_id: string }[]).map((p) => [
      String(p.numero).trim(),
      p.marca_id,
    ]),
  );

  // 6. Matching + detecção de movimentação em processos nossos.
  const candidatos: CandidatoInsert[] = [];
  const movimentacoes: {
    processoNumero: string;
    marcaId: string;
    despachos: { codigo: string; nome: string }[];
  }[] = [];

  for (const pub of publicacoes) {
    // 6a. Movimentação em processo nosso (qualquer despacho).
    const marcaIdNosso = nossosProcessos.get(pub.processoNumero);
    if (marcaIdNosso && pub.despachos.length > 0) {
      movimentacoes.push({
        processoNumero: pub.processoNumero,
        marcaId: marcaIdNosso,
        despachos: pub.despachos,
      });
    }

    // 6b. Colidência: só publicações com despacho de interesse.
    const temDespachoColidencia = pub.despachos.some((d) =>
      DESPACHOS_COLIDENCIA.has(d.codigo),
    );
    if (!temDespachoColidencia || !pub.marcaNome) continue;
    // Não gerar candidato contra a própria marca (processo nosso).
    if (marcaIdNosso) continue;

    for (const m of marcas) {
      if (candidatosJaVistos.has(`${m.id}|${pub.processoNumero}`)) continue;
      const sim = avaliarSimilaridade(pub.marcaNome, m.nome);
      if (!sim) continue;
      candidatos.push({
        execucao_id: execucaoId,
        marca_id: m.id,
        processo_numero: pub.processoNumero,
        marca_texto: pub.marcaNome,
        classe: pub.classes.join(", "),
        titular: pub.titular,
        tipo_match: sim.tipoMatch,
        score: sim.score,
        status: "pendente",
        nomeNossaMarca: m.nome,
      });
    }
  }

  // 7. Inserir candidatos.
  let candidatosInseridos: { id: string; nomeNossaMarca: string; candidato: CandidatoInsert }[] = [];
  if (candidatos.length > 0) {
    const { data: insCand, error: candErr } = await admin
      .from("registro_radar_candidatos")
      .insert(
        candidatos.map((c) => ({
          execucao_id: c.execucao_id,
          marca_id: c.marca_id,
          processo_numero: c.processo_numero,
          marca_texto: c.marca_texto,
          classe: c.classe,
          titular: c.titular,
          tipo_match: c.tipo_match,
          score: c.score,
          status: c.status,
        })),
      )
      .select("id");
    if (candErr) {
      console.error("[radar/ingest] insert candidatos:", candErr.message);
    } else {
      const ids = (insCand ?? []) as { id: string }[];
      candidatosInseridos = ids.map((row, i) => ({
        id: row.id,
        nomeNossaMarca: candidatos[i].nomeNossaMarca,
        candidato: candidatos[i],
      }));
    }
  }

  // 8. Triagem por IA (até MAX_TRIAGEM_IA). Falha por candidato não derruba o
  //    pipeline; se algo falhar, a execução termina como 'parcial'.
  let iaFalhou = false;
  const alvosIA = candidatosInseridos.slice(0, MAX_TRIAGEM_IA);
  for (const alvo of alvosIA) {
    try {
      const resumo = await triarComIA(alvo.candidato, alvo.nomeNossaMarca);
      if (resumo) {
        await admin
          .from("registro_radar_candidatos")
          .update({ resumo_ia: resumo })
          .eq("id", alvo.id);
      }
    } catch (err) {
      iaFalhou = true;
      console.error("[radar/ingest] triagem IA falhou:", err);
    }
  }

  // 9. Candidatos com score >= LIMIAR_ALERTA viram alerta + notificação.
  const paraAlerta = candidatosInseridos.filter(
    (c) => c.candidato.score >= LIMIAR_ALERTA,
  );
  if (paraAlerta.length > 0) {
    await gerarAlertasDeCandidatos(admin, rpiNumero, paraAlerta);
  }

  // 10. Alertas de movimentação em processos nossos (dedup por processo+revista).
  const alertasProcesso = await gerarAlertasMovimentacao(
    admin,
    rpiNumero,
    movimentacoes,
  );

  // 11. Finalizar execução.
  const statusFinal = iaFalhou ? "parcial" : "ok";
  await admin
    .from("registro_radar_execucoes")
    .update({
      status: statusFinal,
      total_publicacoes: publicacoes.length,
      total_candidatos: candidatos.length,
      erro: iaFalhou ? "Triagem por IA falhou em parte dos candidatos." : null,
    })
    .eq("id", execucaoId);

  return {
    status: 200,
    rpi_numero: rpiNumero,
    execucao_id: execucaoId,
    total_publicacoes: publicacoes.length,
    total_candidatos: candidatos.length,
    alertas_processo: alertasProcesso,
    execucaoStatus: statusFinal,
  };
}

/** Triagem de risco por IA (modelo free — dado público). Retorna 2-3 frases. */
async function triarComIA(
  candidato: CandidatoInsert,
  nossaMarca: string,
): Promise<string | null> {
  const prompt = `Você é um analista de propriedade industrial. Compare a marca publicada na RPI com a nossa marca e avalie o risco de colidência em 2-3 frases, em português. Não invente fatos; baseie-se apenas nos dados abaixo. Não conclua sozinho — a decisão é humana.

Nossa marca: "${nossaMarca}"
Marca publicada: "${candidato.marca_texto}"
Titular da publicação: "${candidato.titular || "não informado"}"
Classes (NCL) da publicação: "${candidato.classe || "não informadas"}"
Tipo de semelhança detectada: ${candidato.tipo_match} (score ${candidato.score})

Escreva apenas a avaliação de risco (2-3 frases).`;

  const { text } = await generateText({
    model: openrouter(DEFAULT_MODEL),
    maxTokens: 220,
    prompt,
  });
  const t = text.trim();
  return t.length > 0 ? t : null;
}

/** Cria alertas 'radar' para candidatos fortes + notifica admins. */
async function gerarAlertasDeCandidatos(
  admin: SupabaseClient,
  rpiNumero: string,
  candidatos: { id: string; nomeNossaMarca: string; candidato: CandidatoInsert }[],
) {
  const rows = candidatos.map((c) => ({
    processo_id: null,
    tipo: "radar",
    titulo: `Possível colidência — ${c.nomeNossaMarca} × ${c.candidato.marca_texto}`,
    descricao: `Publicação ${c.candidato.processo_numero} (${c.candidato.titular || "titular não informado"}), classe(s) ${c.candidato.classe || "—"}. Match ${c.candidato.tipo_match} (score ${c.candidato.score}).`,
    data_limite: null,
    status: "pendente",
    origem: "radar",
    metadata: {
      candidato_id: c.id,
      revista: rpiNumero,
      processo_numero: c.candidato.processo_numero,
    },
  }));

  const { data: inseridos, error } = await admin
    .from("registro_alertas")
    .insert(rows)
    .select("id, titulo");
  if (error) {
    console.error("[radar/ingest] insert alertas candidatos:", error.message);
    return;
  }

  await notificarAdmins(admin, (inseridos ?? []) as { id: string; titulo: string }[]);
}

/**
 * Cria alertas de movimentação em processos nossos, deduplicando por
 * (processo, revista) via metadata dos alertas já existentes.
 */
async function gerarAlertasMovimentacao(
  admin: SupabaseClient,
  rpiNumero: string,
  movimentacoes: {
    processoNumero: string;
    marcaId: string;
    despachos: { codigo: string; nome: string }[];
  }[],
): Promise<number> {
  if (movimentacoes.length === 0) return 0;

  // Alertas de origem 'radar' já existentes -> chave (processo|revista).
  const { data: existentes } = await admin
    .from("registro_alertas")
    .select("metadata")
    .eq("origem", "radar")
    .eq("tipo", "radar");
  const jaExiste = new Set<string>(
    ((existentes ?? []) as { metadata: Record<string, unknown> | null }[])
      .map((a) => {
        const m = a.metadata ?? {};
        const proc = m["processo_numero"];
        const rev = m["revista"];
        return proc && rev ? `${proc}|${rev}` : null;
      })
      .filter((x): x is string => x !== null),
  );

  // Mapear marca_id -> processo_id nosso (para linkar o alerta ao processo).
  const numeros = movimentacoes.map((m) => m.processoNumero);
  const { data: procRows } = await admin
    .from("registro_processos")
    .select("id, numero")
    .in("numero", numeros);
  const procIdPorNumero = new Map<string, string>(
    ((procRows ?? []) as { id: string; numero: string }[]).map((p) => [
      String(p.numero).trim(),
      p.id,
    ]),
  );

  const novos = movimentacoes.filter(
    (m) => !jaExiste.has(`${m.processoNumero}|${rpiNumero}`),
  );
  if (novos.length === 0) return 0;

  const rows = novos.map((m) => {
    const despachoTxt = m.despachos
      .map((d) => `${d.codigo}${d.nome ? ` (${d.nome})` : ""}`)
      .join("; ");
    return {
      processo_id: procIdPorNumero.get(m.processoNumero) ?? null,
      tipo: "radar",
      titulo: `Movimentação no processo ${m.processoNumero}`,
      descricao: `A RPI ${rpiNumero} traz despacho(s) para o processo ${m.processoNumero}: ${despachoTxt}.`,
      data_limite: null,
      status: "pendente",
      origem: "radar",
      metadata: {
        revista: rpiNumero,
        processo_numero: m.processoNumero,
        despachos: m.despachos,
      },
    };
  });

  const { data: inseridos, error } = await admin
    .from("registro_alertas")
    .insert(rows)
    .select("id, titulo");
  if (error) {
    console.error("[radar/ingest] insert alertas movimentação:", error.message);
    return 0;
  }

  await notificarAdmins(admin, (inseridos ?? []) as { id: string; titulo: string }[]);
  return inseridos?.length ?? 0;
}

/** Broadcast in-app para todos os admins sobre novos alertas do radar. */
async function notificarAdmins(
  admin: SupabaseClient,
  alertas: { id: string; titulo: string }[],
) {
  if (alertas.length === 0) return;
  const { data: admins } = await admin
    .from("profiles")
    .select("id")
    .eq("role", "admin");
  const adminIds = ((admins ?? []) as { id: string }[]).map((r) => r.id);
  if (adminIds.length === 0) return;

  const inputs = adminIds.flatMap((userId) =>
    alertas.map((al) => ({
      userId,
      variant: "system" as const,
      // A tabela notifications tem CHECK de category sem 'registro';
      // usamos 'system' e identificamos o módulo via entityType.
      category: "system" as const,
      title: al.titulo,
      description: "Novo alerta do Radar em Ativos Registrados.",
      actionUrl: "/registros/radar",
      entityType: "registro_alerta",
      entityId: al.id,
    })),
  );
  await createNotifications(inputs);
}

// ─── Handlers HTTP ────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const guard = await requireRegistrosAdmin();
  if (!guard.ok) return guard.response;

  const parsed = bodySchema.safeParse(
    await request.json().catch(() => ({})),
  );
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const result = await runIngest(parsed.data.revista);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true, ...result });
}

/**
 * GET — usado pelo cron semanal. Aceita admin autenticado OU, se CRON_SECRET
 * estiver definido, `Authorization: Bearer <CRON_SECRET>`. Usa a última revista.
 */
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  const cronAuthorized = !!cronSecret && authHeader === `Bearer ${cronSecret}`;

  if (!cronAuthorized) {
    const guard = await requireRegistrosAdmin();
    if (!guard.ok) return guard.response;
  }

  const result = await runIngest();
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true, ...result });
}
