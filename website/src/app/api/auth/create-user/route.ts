import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  // 1. Verify the caller is an admin
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  // 2. Parse body
  const body = await req.json();
  const { email, password, name, role } = body as {
    email?: string;
    password?: string;
    name?: string;
    role?: string;
  };

  if (!email || !password || !name) {
    return NextResponse.json(
      { error: "Email, senha e nome são obrigatórios" },
      { status: 400 },
    );
  }

  const validRoles = ["gratuito", "assinante", "staff", "admin"];
  const userRole = validRoles.includes(role ?? "") ? role! : "gratuito";

  // 3. Create auth user with admin client (skips email confirmation)
  const admin = createAdminClient();
  const { data: newUser, error: createError } =
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name },
    });

  if (createError) {
    return NextResponse.json(
      { error: createError.message },
      { status: 400 },
    );
  }

  // 4. Update profile role if not gratuito (trigger creates with gratuito)
  if (userRole !== "gratuito" && newUser.user) {
    await admin
      .from("profiles")
      .update({ role: userRole })
      .eq("id", newUser.user.id);
  }

  return NextResponse.json({ success: true, userId: newUser.user?.id });
}
