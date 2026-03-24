import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Call at the top of any protected server layout/page. Redirects to /login if no session. */
export async function requireAuth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return user;
}
