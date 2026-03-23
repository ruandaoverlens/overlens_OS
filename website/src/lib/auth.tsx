"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type UserRole = "gratuito" | "assinante" | "staff" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

// Test users
export const TEST_USERS: Record<UserRole, User> = {
  gratuito: {
    id: "1",
    name: "Ana Silva",
    email: "ana@overlens.com",
    role: "gratuito",
  },
  assinante: {
    id: "2",
    name: "Lucas Ferreira",
    email: "lucas@overlens.com",
    role: "assinante",
  },
  staff: {
    id: "3",
    name: "Carlos Mendes",
    email: "carlos@overlens.com",
    role: "staff",
  },
  admin: {
    id: "4",
    name: "Ruan Barbosa",
    email: "ruan@overlens.com",
    role: "admin",
  },
};

// Permissions map
const ROUTE_ACCESS: Record<UserRole, string[]> = {
  gratuito: ["/docs", "/pacote", "/plataforma", "/website"],
  assinante: ["/docs", "/pacote", "/plataforma", "/website", "/codices"],
  staff: ["/docs", "/estudio", "/growth", "/pacote", "/assets", "/plataforma", "/website", "/codices", "/tru", "/playbook-conteudo", "/playbook-videos", "/playbook-operacao", "/playbook-gestao"],
  admin: ["/docs", "/estudio", "/growth", "/pacote", "/assets", "/plataforma", "/website", "/codices", "/tru", "/playbook-conteudo", "/playbook-videos", "/playbook-operacao", "/playbook-gestao"],
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

export function getRoleLabel(role: UserRole): string {
  switch (role) {
    case "gratuito": return "Gratuito";
    case "assinante": return "Assinante";
    case "staff": return "Staff";
    case "admin": return "Administrador";
  }
}

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  updateUser: (data: Partial<Pick<User, "name" | "email">>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem("overlens-user");
    if (stored) {
      try { return JSON.parse(stored); } catch { return null; }
    }
    return null;
  });

  const login = useCallback((email: string, _password: string): boolean => {
    const found = Object.values(TEST_USERS).find((u) => u.email === email);
    if (found) {
      setUser(found);
      localStorage.setItem("overlens-user", JSON.stringify(found));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("overlens-user");
  }, []);

  const updateUser = useCallback((data: Partial<Pick<User, "name" | "email">>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...data };
      localStorage.setItem("overlens-user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
