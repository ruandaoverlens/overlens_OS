// Revalidação de auth para as APIs do módulo "Registros".
// getUser() -> 401; e-mail fora de @overlens.com.br -> 403. O módulo é
// exclusivo da equipe interna, gateado por domínio de e-mail (não por role).

import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isOverlensEmail } from "@/lib/route-access";

export interface RegistrosGuardOk {
  ok: true;
  supabase: SupabaseClient;
  userId: string;
}

export interface RegistrosGuardFail {
  ok: false;
  response: NextResponse;
}

/**
 * Garante que o requisitante é um usuário autenticado da equipe interna
 * (e-mail @overlens.com.br). Retorna o client server e o id do usuário
 * quando autorizado, ou uma resposta 401/403 já pronta.
 */
export async function requireRegistrosAdmin(): Promise<
  RegistrosGuardOk | RegistrosGuardFail
> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Não autenticado" }, { status: 401 }),
    };
  }

  if (!isOverlensEmail(user.email)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Sem permissão" }, { status: 403 }),
    };
  }

  return { ok: true, supabase, userId: user.id };
}

/** Lista os ids da equipe interna @overlens (para broadcast de notificações). */
export async function listarAdminIds(
  supabase: SupabaseClient,
): Promise<string[]> {
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .ilike("email", "%@overlens.com.br");
  return (data ?? []).map((r: { id: string }) => r.id);
}
