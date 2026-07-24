// Route access rules — pure module (no "use client"), safe to import from
// both the client auth context and the edge middleware (proxy.ts).
// This is the single source of truth for which role can reach which route.

export type UserRole = "gratuito" | "assinante" | "staff" | "admin";

const ROUTE_ACCESS: Record<UserRole, string[]> = {
  gratuito: ["/docs", "/pacote", "/plataforma", "/website", "/ferramentas"],
  assinante: ["/docs", "/pacote", "/plataforma", "/website", "/ferramentas"],
  staff: ["/docs", "/estudio", "/growth", "/pacote", "/assets", "/plataforma", "/website", "/playbook-conteudo", "/playbook-videos", "/ferramentas", "/mycelium"],
  admin: ["/docs", "/estudio", "/growth", "/pacote", "/assets", "/plataforma", "/website", "/tru", "/playbook-conteudo", "/playbook-videos", "/ferramentas", "/mycelium", "/admin", "/registros"],
};

function matchesPrefix(routes: string[], pathname: string): boolean {
  return routes.some((route) => pathname === route || pathname.startsWith(route + "/"));
}

export function canAccessRoute(role: UserRole, pathname: string): boolean {
  const routes = ROUTE_ACCESS[role];
  if (!routes) return false;
  return matchesPrefix(routes, pathname);
}

// Union of every route that appears in any role's access list. A path that
// isn't managed here (e.g. "/chat", "/settings", the root "/") is left alone
// by the middleware — we only gate routes the access model actually governs.
const MANAGED_ROUTES = Array.from(new Set(Object.values(ROUTE_ACCESS).flat()));

export function isManagedRoute(pathname: string): boolean {
  return matchesPrefix(MANAGED_ROUTES, pathname);
}
