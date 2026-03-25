import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const SUPABASE_URL = "https://lqymftfphjexutgtvjuh.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
  "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxeW1mdGZwaGpleHV0Z3R2anVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NTkyNzEsImV4cCI6MjA4ODAzNTI3MX0." +
  "TB9UWWnUuOw3-OiOn_iVxlvTuxYFv2Oh_G23sL7pVw4";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from Server Component — ignored, middleware handles refresh
          }
        },
      },
    },
  );
}
