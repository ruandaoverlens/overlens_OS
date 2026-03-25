import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://lqymftfphjexutgtvjuh.supabase.co";

export function createAdminClient() {
  return createSupabaseClient(
    SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
