"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";

export type UserRole = "gratuito" | "assinante" | "staff" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

// Real users for dev quick-access on login page
export const TEST_USERS: Record<
  UserRole,
  { email: string; password: string; name: string; role: UserRole }
> = {
  admin: {
    email: "admin@overlens.com.br",
    password: "admin123",
    name: "Admin Overlens",
    role: "admin",
  },
  staff: {
    email: "staff@overlens.com.br",
    password: "staff123",
    name: "Equipe Overlens",
    role: "staff",
  },
  assinante: {
    email: "assinante@overlens.com.br",
    password: "assinante123",
    name: "Maria Souza",
    role: "assinante",
  },
  gratuito: {
    email: "visitante@overlens.com.br",
    password: "visitante123",
    name: "João Visitante",
    role: "gratuito",
  },
};

// --- Permission functions (unchanged API) ---

const ROUTE_ACCESS: Record<UserRole, string[]> = {
  gratuito: ["/docs", "/pacote", "/plataforma", "/website", "/ferramentas"],
  assinante: ["/docs", "/pacote", "/plataforma", "/website", "/codices", "/ferramentas"],
  staff: ["/docs", "/estudio", "/growth", "/pacote", "/assets", "/plataforma", "/website", "/playbook-conteudo", "/playbook-videos", "/ferramentas"],
  admin: ["/docs", "/estudio", "/growth", "/magny", "/pacote", "/assets", "/plataforma", "/website", "/codices", "/tru", "/playbook-conteudo", "/playbook-videos", "/ferramentas"],
};

export function canAccessRoute(role: UserRole, pathname: string): boolean {
  const routes = ROUTE_ACCESS[role];
  if (!routes) return false;
  return routes.some((route) => pathname === route || pathname.startsWith(route + "/"));
}

export function canEdit(role: UserRole): boolean {
  return role === "admin";
}

export function canManageMembers(role: UserRole): boolean {
  return role === "admin";
}

export function canDownload(role: UserRole): boolean {
  return role === "staff" || role === "admin";
}

export function canUpload(role: UserRole): boolean {
  return role === "staff" || role === "admin";
}

export function canDelete(role: UserRole): boolean {
  return role === "admin";
}

export function getRoleLabel(role: UserRole): string {
  switch (role) {
    case "gratuito": return "Gratuito";
    case "assinante": return "Assinante";
    case "staff": return "Staff";
    case "admin": return "Administrador";
  }
}

// --- Auth Context ---

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<Pick<User, "name" | "email">>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<User | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, email, role, avatar_url")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("[auth] fetchProfile failed:", error.message, error.code);
  }

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role as UserRole,
    avatarUrl: data.avatar_url ?? undefined,
  };
}

// Set to true to bypass auth during development
const BYPASS_AUTH = false;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<User | null>(
    BYPASS_AUTH ? { id: "bypass", name: "Ruan Barbosa", email: "ruan@overlens.com", role: "admin" } : null,
  );
  const [loading, setLoading] = useState(BYPASS_AUTH ? false : true);

  useEffect(() => {
    // Build a minimal User from the auth session as a fallback when
    // the profiles table query fails (e.g. RLS timing, network).
    function fallbackUser(sessionUser: { id: string; email?: string; user_metadata?: Record<string, unknown> }): User {
      return {
        id: sessionUser.id,
        name: (sessionUser.user_metadata?.full_name as string) ?? sessionUser.email?.split("@")[0] ?? "",
        email: sessionUser.email ?? "",
        role: "gratuito",
      };
    }

    // Load profile in the background — never block the auth callbacks.
    // Set fallback user immediately so UI is never empty, then upgrade
    // to the full profile once the query resolves.
    function loadProfile(sessionUser: { id: string; email?: string; user_metadata?: Record<string, unknown> }) {
      // Immediate: set fallback so name/email are visible right away
      setUser(fallbackUser(sessionUser));
      // Background: upgrade to full profile (with correct role)
      fetchProfile(supabase, sessionUser.id).then((profile) => {
        if (profile) {
          console.log("[auth] profile loaded:", profile.name, profile.role);
          setUser(profile);
        } else {
          console.log("[auth] profile query failed, using fallback");
        }
      });
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("[auth] getSession:", session ? session.user.email : "no session");
      if (session?.user) {
        loadProfile(session.user);
      }
      setLoading(false);
    }).catch((err) => {
      console.error("[auth] getSession error:", err);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("[auth] onAuthStateChange:", _event, session ? session.user.email : "no session");
      if (session?.user) {
        loadProfile(session.user);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return !error;
    },
    [supabase],
  );

  const signup = useCallback(
    async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
      try {
        // 1. Create user (trigger auto-confirms email)
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (signUpError) return { success: false, error: signUpError.message };

        // 2. Small delay for trigger to confirm email
        await new Promise((r) => setTimeout(r, 500));

        // 3. Sign in
        const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        if (loginError) return { success: false, error: loginError.message };
        return { success: true };
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : "Erro ao criar conta" };
      }
    },
    [supabase],
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, [supabase]);

  const updateUser = useCallback(
    async (data: Partial<Pick<User, "name" | "email">>) => {
      if (!user) return;
      const { error } = await supabase
        .from("profiles")
        .update({ name: data.name, email: data.email })
        .eq("id", user.id);
      if (!error) {
        setUser((prev) => (prev ? { ...prev, ...data } : prev));
      }
    },
    [supabase, user],
  );

  return (
    <AuthContext value={{ user, loading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
