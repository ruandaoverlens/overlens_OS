import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRegistrosAdmin } from "@/lib/registros/guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { createNotifications } from "@/lib/notifications";

const STATUS = ["pendente", "descartado", "alerta"] as const;

const updateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(STATUS),
});

/**
 * PATCH — muda o status de um candidato do radar. Ao virar 'alerta', cria um
 * `registro_alertas` (tipo/origem 'radar') e notifica os admins, no mesmo
 * padrão da ingestão. Idempotente: não recria o alerta se o candidato já
 * estava marcado como 'alerta'.
 */
export async function PATCH(request: NextRequest) {
  const guard = await requireRegistrosAdmin();
  if (!guard.ok) return guard.response;

  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }
  const { id, status } = parsed.data;

  const admin = createAdminClient();

  const { data: candidato, error: candErr } = await admin
    .from("registro_radar_candidatos")
    .select(
      "id, marca_id, processo_numero, marca_texto, classe, titular, tipo_match, score, status, execucao_id",
    )
    .eq("id", id)
    .single();
  if (candErr || !candidato) {
    return NextResponse.json({ error: "Candidato não encontrado" }, { status: 404 });
  }

  const jaEraAlerta = candidato.status === "alerta";

  const { error: updErr } = await admin
    .from("registro_radar_candidatos")
    .update({ status })
    .eq("id", id);
  if (updErr) {
    console.error("[radar/candidatos] update:", updErr.message);
    return NextResponse.json({ error: "Erro ao atualizar candidato" }, { status: 500 });
  }

  // Ao virar 'alerta' (e ainda não era), cria o alerta + notificações.
  if (status === "alerta" && !jaEraAlerta) {
    const { data: marca } = candidato.marca_id
      ? await admin
          .from("registro_marcas")
          .select("nome")
          .eq("id", candidato.marca_id)
          .single()
      : { data: null };

    const { data: execucao } = candidato.execucao_id
      ? await admin
          .from("registro_radar_execucoes")
          .select("rpi_numero")
          .eq("id", candidato.execucao_id)
          .single()
      : { data: null };

    const nossaMarca = (marca as { nome: string } | null)?.nome ?? "nossa marca";
    const rpiNumero = (execucao as { rpi_numero: string } | null)?.rpi_numero ?? null;

    const { data: inseridos, error: alertaErr } = await admin
      .from("registro_alertas")
      .insert({
        processo_id: null,
        tipo: "radar",
        titulo: `Possível colidência — ${nossaMarca} × ${candidato.marca_texto}`,
        descricao: `Publicação ${candidato.processo_numero} (${candidato.titular || "titular não informado"}), classe(s) ${candidato.classe || "—"}. Match ${candidato.tipo_match} (score ${candidato.score}).`,
        data_limite: null,
        status: "pendente",
        origem: "radar",
        metadata: {
          candidato_id: candidato.id,
          revista: rpiNumero,
          processo_numero: candidato.processo_numero,
        },
      })
      .select("id, titulo");

    if (alertaErr) {
      console.error("[radar/candidatos] insert alerta:", alertaErr.message);
    } else {
      const { data: admins } = await admin
        .from("profiles")
        .select("id")
        .eq("role", "admin");
      const adminIds = ((admins ?? []) as { id: string }[]).map((r) => r.id);
      const alertas = (inseridos ?? []) as { id: string; titulo: string }[];
      if (adminIds.length > 0 && alertas.length > 0) {
        await createNotifications(
          adminIds.flatMap((userId) =>
            alertas.map((al) => ({
              userId,
              variant: "system" as const,
              // CHECK de category em notifications não inclui 'registro';
              // usamos 'system' e identificamos o módulo via entityType.
              category: "system" as const,
              title: al.titulo,
              description: "Alerta do Radar gerado manualmente.",
              actionUrl: "/registros/radar",
              entityType: "registro_alerta",
              entityId: al.id,
            })),
          ),
        );
      }
    }
  }

  return NextResponse.json({ ok: true });
}
