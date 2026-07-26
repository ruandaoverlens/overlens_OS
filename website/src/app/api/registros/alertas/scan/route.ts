import { NextRequest, NextResponse } from "next/server";
import { requireRegistrosAdmin } from "@/lib/registros/guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { createNotifications } from "@/lib/notifications";
import type { AlertaTipo } from "@/lib/registros/types";

// Janela de antecedência para alertar renovações (em dias).
const RENOVACAO_JANELA_DIAS = 180;

interface ProcessoScan {
  id: string;
  numero: string;
  marca_id: string;
  status: string;
  situacao: string | null;
  proxima_renovacao: string | null;
}

interface CandidatoAlerta {
  processo_id: string;
  tipo: AlertaTipo;
  titulo: string;
  descricao: string | null;
  data_limite: string | null;
}

function isoDatePlusDays(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Gera alertas de sistema a partir do estado atual dos processos:
 *  - proxima_renovacao dentro da janela  -> alerta 'renovacao'
 *  - status 'em_exigencia'               -> alerta 'exigencia'
 *  - status 'em_oposicao'                -> alerta 'oposicao'
 *
 * Idempotente: só cria alertas que ainda não existam como pendentes de
 * origem 'sistema' para o mesmo (processo, tipo). Alertas novos disparam
 * notificação in-app para todos os admins.
 */
async function runScan() {
  const admin = createAdminClient();

  const { data: processos, error: procErr } = await admin
    .from("registro_processos")
    .select("id, numero, marca_id, status, situacao, proxima_renovacao");
  if (procErr) {
    console.error("[registros/alertas/scan] processos:", procErr.message);
    return { error: "Erro ao ler processos", status: 500 as const };
  }

  const { data: marcas } = await admin.from("registro_marcas").select("id, nome");
  const nomePorMarca = new Map<string, string>(
    (marcas ?? []).map((m: { id: string; nome: string }) => [m.id, m.nome]),
  );

  const limiteRenovacao = isoDatePlusDays(RENOVACAO_JANELA_DIAS);
  const candidatos: CandidatoAlerta[] = [];

  for (const p of (processos ?? []) as ProcessoScan[]) {
    const marcaNome = nomePorMarca.get(p.marca_id) ?? "marca";

    if (p.proxima_renovacao && p.proxima_renovacao <= limiteRenovacao) {
      candidatos.push({
        processo_id: p.id,
        tipo: "renovacao",
        titulo: `Renovação próxima — ${marcaNome} (${p.numero})`,
        descricao: `A renovação do processo ${p.numero} vence em ${p.proxima_renovacao}.`,
        data_limite: p.proxima_renovacao,
      });
    }

    if (p.status === "em_exigencia") {
      candidatos.push({
        processo_id: p.id,
        tipo: "exigencia",
        titulo: `Exigência pendente — ${marcaNome} (${p.numero})`,
        descricao: p.situacao ?? `O processo ${p.numero} está em exigência.`,
        data_limite: null,
      });
    }

    if (p.status === "em_oposicao") {
      candidatos.push({
        processo_id: p.id,
        tipo: "oposicao",
        titulo: `Oposição em curso — ${marcaNome} (${p.numero})`,
        descricao: p.situacao ?? `O processo ${p.numero} está em oposição.`,
        data_limite: null,
      });
    }
  }

  // Idempotência: descarta candidatos que já têm alerta pendente de sistema
  // para o mesmo (processo, tipo).
  const { data: existentes } = await admin
    .from("registro_alertas")
    .select("processo_id, tipo")
    .eq("origem", "sistema")
    .eq("status", "pendente");
  const jaExiste = new Set<string>(
    (existentes ?? []).map((a: { processo_id: string; tipo: string }) => `${a.processo_id}|${a.tipo}`),
  );

  const novos = candidatos.filter((c) => !jaExiste.has(`${c.processo_id}|${c.tipo}`));

  if (novos.length === 0) {
    return { criados: 0, status: 200 as const };
  }

  const { data: inseridos, error: insErr } = await admin
    .from("registro_alertas")
    .insert(
      novos.map((c) => ({
        processo_id: c.processo_id,
        tipo: c.tipo,
        titulo: c.titulo,
        descricao: c.descricao,
        data_limite: c.data_limite,
        status: "pendente",
        origem: "sistema",
      })),
    )
    .select("id, titulo");

  if (insErr) {
    console.error("[registros/alertas/scan] insert:", insErr.message);
    return { error: "Erro ao criar alertas", status: 500 as const };
  }

  // Notifica todos os admins sobre os novos alertas.
  const { data: admins } = await admin.from("profiles").select("id").eq("role", "admin");
  const adminIds = (admins ?? []).map((r: { id: string }) => r.id);

  if (adminIds.length > 0 && inseridos && inseridos.length > 0) {
    const inputs = adminIds.flatMap((userId) =>
      (inseridos as { id: string; titulo: string }[]).map((al) => ({
        userId,
        variant: "system" as const,
        // A tabela notifications tem CHECK de category sem 'registro';
        // usamos 'system' e identificamos o módulo via entityType.
        category: "system" as const,
        title: al.titulo,
        description: "Novo alerta de prazo em Registros.",
        actionUrl: "/registros/alertas",
        entityType: "registro_alerta",
        entityId: al.id,
      })),
    );
    await createNotifications(inputs);
  }

  return { criados: inseridos?.length ?? 0, status: 200 as const };
}

export async function POST() {
  const guard = await requireRegistrosAdmin();
  if (!guard.ok) return guard.response;

  const result = await runScan();
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true, criados: result.criados });
}

/**
 * GET — usado pelo cron. Aceita admin autenticado OU, se CRON_SECRET estiver
 * definido, um header `Authorization: Bearer <CRON_SECRET>`.
 */
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  const cronAuthorized =
    !!cronSecret && authHeader === `Bearer ${cronSecret}`;

  if (!cronAuthorized) {
    const guard = await requireRegistrosAdmin();
    if (!guard.ok) return guard.response;
  }

  const result = await runScan();
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true, criados: result.criados });
}
