// Revalidação de auth + role para as APIs do módulo "Ativos Registrados".
// Mesmo padrão das APIs de assets: getUser() -> 401; profiles.role admin -> 403.

import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

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
 * Garante que o requisitante é um admin autenticado. Retorna o client server
 * e o id do usuário quando autorizado, ou uma resposta 401/403 já pronta.
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return {
      ok: false,
      response: NextResponse.json({ error: "Sem permissão" }, { status: 403 }),
    };
  }

  return { ok: true, supabase, userId: user.id };
}

/** Lista os ids de todos os admins (para broadcast de notificações). */
export async function listarAdminIds(
  supabase: SupabaseClient,
): Promise<string[]> {
  const { data } = await supabase.from("profiles").select("id").eq("role", "admin");
  return (data ?? []).map((r: { id: string }) => r.id);
}
