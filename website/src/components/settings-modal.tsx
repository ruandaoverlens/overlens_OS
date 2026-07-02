"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "radix-ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  SmProfileLineIcon,
  SmLockLineIcon,
  SmAppsLineIcon,
  SmCrownLineIcon,
  SmEditSolidIcon,
  SmDeleteLineIcon,
  SmArrowBackIosNewLineIcon,
  SmArrowForwardIosLineIcon,
} from "@/components/icons";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth, canManageMembers, canAccessRoute, getRoleLabel, type UserRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type SettingsTab = "conta" | "seguranca" | "aplicativos" | "membros";

interface NavItem {
  id: SettingsTab;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: "conta", label: "Conta", icon: SmProfileLineIcon },
  { id: "seguranca", label: "Seguranca", icon: SmLockLineIcon },
  { id: "aplicativos", label: "Aplicativos", icon: SmAppsLineIcon },
  { id: "membros", label: "Membros", icon: SmCrownLineIcon, adminOnly: true },
];

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState<SettingsTab>("conta");

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");

  // Sync local state when user data loads/changes asynchronously. Adjust during
  // render (tracking the previous user ref) instead of a setState-in-effect.
  const [prevUser, setPrevUser] = useState(user);
  if (user !== prevUser) {
    setPrevUser(user);
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }

  const isAdmin = canManageMembers(user?.role ?? "gratuito");

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.adminOnly || isAdmin,
  );

  const handleSave = async () => {
    await updateUser({ name, email });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-none w-full h-full rounded-none sm:max-w-[860px] sm:h-auto sm:rounded-xl p-0 gap-0 overflow-hidden"
        showCloseButton={false}
      >
        <VisuallyHidden.Root>
          <DialogTitle>Configurações</DialogTitle>
        </VisuallyHidden.Root>
        <div className="flex h-full sm:min-h-[600px] sm:h-auto lg:min-h-[720px]">
          {/* Sidebar */}
          <nav className="flex flex-col gap-1 border-r border-white/[0.06] bg-white/[0.02] px-3 py-6 w-[180px] shrink-0">
            <span className="text-xs font-medium text-muted-foreground px-2 pb-2 uppercase tracking-wider">
              Configurações
            </span>
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors text-left cursor-pointer",
                    active
                      ? "bg-white/[0.08] text-foreground"
                      : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground",
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Content */}
          <div className="flex-1 flex flex-col px-6 py-6 min-w-0">
            {tab === "conta" && (
              <ContaPanel
                name={name}
                email={email}
                onNameChange={setName}
                onEmailChange={setEmail}
                onSave={handleSave}
              />
            )}
            {tab === "seguranca" && <SegurancaPanel />}
            {tab === "aplicativos" && (
              <AplicativosPanel role={user?.role ?? "gratuito"} />
            )}
            {tab === "membros" && isAdmin && (
              <MembrosPanel currentUserEmail={user?.email ?? ""} />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Conta ──────────────────────────────────────────────── */

function ContaPanel({
  name,
  email,
  onNameChange,
  onEmailChange,
  onSave,
}: {
  name: string;
  email: string;
  onNameChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onSave: () => void;
}) {
  return (
    <>
      <PanelHeader
        title="Conta"
        description="Gerencie suas informações pessoais"
      />

      <div className="flex flex-col gap-5 mt-6">
        <div className="space-y-2">
          <Label htmlFor="settings-name">Nome</Label>
          <Input
            id="settings-name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="settings-email">Email</Label>
          <Input
            id="settings-email"
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
          />
        </div>

      </div>

      <div className="mt-auto pt-6">
        <Button variant="default" onClick={onSave}>
          Salvar
        </Button>
      </div>
    </>
  );
}

/* ── Segurança ──────────────────────────────────────────── */

function SegurancaPanel() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) {
      setErrorMsg("A senha deve ter pelo menos 6 caracteres.");
      setStatus("error");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("As senhas não coincidem.");
      setStatus("error");
      return;
    }
    setStatus("saving");
    setErrorMsg("");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setErrorMsg(error.message);
      setStatus("error");
    } else {
      setStatus("success");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <>
      <PanelHeader
        title="Seguranca"
        description="Atualize sua senha de acesso"
      />

      <div className="flex flex-col gap-5 mt-6">
        <div className="space-y-2">
          <Label htmlFor="settings-new-password">Nova senha</Label>
          <Input
            id="settings-new-password"
            type="password"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => { setNewPassword(e.target.value); setStatus("idle"); }}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="settings-confirm-password">Confirmar nova senha</Label>
          <Input
            id="settings-confirm-password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setStatus("idle"); }}
          />
        </div>

        {status === "error" && (
          <p className="text-sm text-red-500">{errorMsg}</p>
        )}
        {status === "success" && (
          <p className="text-sm text-emerald-400">Senha atualizada com sucesso.</p>
        )}
      </div>

      <div className="mt-auto pt-6">
        <Button
          variant="default"
          onClick={handleUpdatePassword}
          disabled={status === "saving"}
        >
          {status === "saving" ? "Atualizando..." : "Atualizar senha"}
        </Button>
      </div>
    </>
  );
}

/* ── Aplicativos ────────────────────────────────────────── */

const APPS = [
  { name: "Overlens", route: "/plataforma", description: "Ambiente de aprendizado" },
  { name: "Brand System", route: "/docs", description: "Documentação de marca" },
  { name: "Website", route: "/website", description: "Site institucional" },
  { name: "Pacote Cultural", route: "/pacote", description: "Inspirações e cultura" },
  { name: "Growth System", route: "/growth", description: "Métricas e crescimento" },
  { name: "Content System", route: "/estudio", description: "Produção de conteúdo" },
  { name: "Assets", route: "/assets", description: "Biblioteca de assets digitais" },
  { name: "Mycelium", route: "/mycelium", description: "Feed interno da equipe" },
  { name: "Botões Mágicos", route: "/ferramentas", description: "Ferramentas mágicas" },
];

function AplicativosPanel({ role }: { role: UserRole }) {
  return (
    <>
      <PanelHeader
        title="Aplicativos"
        description="Apps conectados à sua conta"
      />

      <div className="flex flex-col gap-2 mt-6 overflow-y-auto flex-1 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-foreground/20 [&::-webkit-scrollbar-track]:bg-transparent">
        {APPS.map((app) => {
          const hasAccess = canAccessRoute(role, app.route);
          return (
            <div
              key={app.name}
              className={cn(
                "flex items-center justify-between rounded-lg border border-white/[0.06] px-4 py-2.5",
                !hasAccess && "opacity-50",
              )}
            >
              <div>
                <p className="text-sm font-medium">{app.name}</p>
                <p className="text-xs text-muted-foreground">{app.description}</p>
              </div>
              <span
                className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ml-3",
                  hasAccess
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-white/[0.06] text-muted-foreground",
                )}
              >
                {hasAccess ? "Conectado" : "Sem acesso"}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ── Membros ────────────────────────────────────────────── */

interface MemberEntry {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  joinedAt: string;
}

function MembrosPanel({ currentUserEmail }: { currentUserEmail: string }) {
  const [members, setMembers] = useState<MemberEntry[]>([]);
  const [editingMember, setEditingMember] = useState<MemberEntry | null>(null);
  const [addingMember, setAddingMember] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "todos">("todos");
  const [page, setPage] = useState(1);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const perPage = 10;

  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/auth/list-members");
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error(json.error ?? `HTTP ${res.status}`);
        }
        const { members: data } = await res.json();
        setMembers(
          (data as { id: string; name: string | null; email: string; role: string; created_at: string }[]).map((p) => ({
            id: p.id,
            name: p.name ?? "",
            email: p.email,
            role: p.role as UserRole,
            joinedAt: new Date(p.created_at).toLocaleDateString("pt-BR"),
          })),
        );
      } catch (err) {
        console.error("Failed to load members:", err);
        setErrorMsg("Erro ao carregar membros. Tente recarregar a página.");
      } finally {
        setLoadingMembers(false);
      }
    };
    load();
  }, []);

  const deleteMember = async (id: string) => {
    const res = await fetch("/api/auth/delete-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: id }),
    });
    if (res.ok) {
      setMembers((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const saveMember = async (updated: MemberEntry) => {
    const res = await fetch("/api/auth/update-member", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: updated.id, name: updated.name, email: updated.email, role: updated.role }),
    });
    if (res.ok) {
      setMembers((prev) =>
        prev.map((m) => (m.id === updated.id ? updated : m)),
      );
      setEditingMember(null);
    } else {
      const json = await res.json().catch(() => ({ error: "Erro ao atualizar membro" }));
      alert(json.error || "Erro ao atualizar membro");
    }
  };

  const addMember = async (data: { name: string; email: string; password: string; role: UserRole }) => {
    const res = await fetch("/api/auth/create-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Erro ao criar conta");
    // Reload members
    const listRes = await fetch("/api/auth/list-members");
    if (listRes.ok) {
      const { members: refreshed } = await listRes.json();
      setMembers(
        (refreshed as { id: string; name: string | null; email: string; role: string; created_at: string }[]).map((p) => ({
          id: p.id,
          name: p.name ?? "",
          email: p.email,
          role: p.role as UserRole,
          joinedAt: new Date(p.created_at).toLocaleDateString("pt-BR"),
        })),
      );
    }
    setAddingMember(false);
  };

  const isSelf = (memberEmail: string) => memberEmail === currentUserEmail;

  const filtered = members.filter((m) => {
    const matchesSearch =
      !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "todos" || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * perPage, safePage * perPage);

  if (addingMember) {
    return (
      <MemberAddView
        onBack={() => setAddingMember(false)}
        onAdd={addMember}
      />
    );
  }

  if (editingMember) {
    return (
      <MemberEditView
        member={editingMember}
        onBack={() => setEditingMember(null)}
        onSave={saveMember}
      />
    );
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <PanelHeader
          title="Membros"
          description="Gerencie os membros da equipe"
        />
        <Button variant="outline" size="sm" onClick={() => setAddingMember(true)}>
          Adicionar
        </Button>
      </div>

      <div className="flex items-center gap-3 mt-5">
        <Select
          value={roleFilter}
          onValueChange={(v) => { setRoleFilter(v as UserRole | "todos"); setPage(1); }}
        >
          <SelectTrigger size="xs" className="w-[140px] shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="gratuito">Gratuito</SelectItem>
            <SelectItem value="assinante">Assinante</SelectItem>
            <SelectItem value="staff">Staff</SelectItem>
            <SelectItem value="admin">Administrador</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder="Buscar por nome ou email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="h-8 text-sm"
        />
      </div>

      <div className="mt-4 overflow-y-auto flex-1 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-foreground/20 [&::-webkit-scrollbar-track]:bg-transparent">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] text-xs text-muted-foreground">
              <th className="text-left font-medium pb-2 pl-1">Nome</th>
              <th className="text-left font-medium pb-2">Email</th>
              <th className="text-left font-medium pb-2">Perfil</th>
              <th className="text-left font-medium pb-2">Entrada</th>
              <th className="text-right font-medium pb-2 pr-1 w-[70px]"></th>
            </tr>
          </thead>
          <tbody>
            {loadingMembers ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-muted-foreground text-sm">
                  Carregando membros...
                </td>
              </tr>
            ) : errorMsg ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-red-400 text-sm">
                  {errorMsg}
                </td>
              </tr>
            ) : paginated.map((member) => (
              <tr
                key={member.id}
                className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]"
              >
                <td className="py-2.5 pl-1">
                  <span className="font-medium truncate block max-w-[140px]">
                    {member.name}
                  </span>
                </td>
                <td className="py-2.5 text-muted-foreground truncate max-w-[180px]">
                  {member.email}
                </td>
                <td className="py-2.5 text-muted-foreground">
                  {getRoleLabel(member.role)}
                </td>
                <td className="py-2.5 text-muted-foreground text-xs">
                  {member.joinedAt}
                </td>
                <td className="py-2.5 pr-1">
                  {!isSelf(member.email) && (
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setEditingMember(member)}
                        className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/[0.06] cursor-pointer"
                        title="Editar usuário"
                      >
                        <SmEditSolidIcon className="size-3.5" />
                      </button>
                      <button
                        onClick={() => deleteMember(member.id)}
                        className="p-1 rounded-md text-muted-foreground hover:text-red-400 hover:bg-white/[0.06] cursor-pointer"
                        title="Remover membro"
                      >
                        <SmDeleteLineIcon className="size-3.5" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-auto pt-4 text-xs text-muted-foreground">
          <span>{filtered.length} membro{filtered.length !== 1 && "s"}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="p-1 rounded-md hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <SmArrowBackIosNewLineIcon className="size-3.5" />
            </button>
            <span className="px-2">
              {safePage} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="p-1 rounded-md hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <SmArrowForwardIosLineIcon className="size-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* ── Member Edit View ───────────────────────────────────── */

function MemberEditView({
  member,
  onBack,
  onSave,
}: {
  member: MemberEntry;
  onBack: () => void;
  onSave: (updated: MemberEntry) => Promise<void> | void;
}) {
  const [name, setName] = useState(member.name);
  const [email, setEmail] = useState(member.email);
  const [role, setRole] = useState<UserRole>(member.role);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave({ ...member, name, email, role });
    setSaving(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">Editar usuário</h2>
        <button
          onClick={onBack}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer mt-0.5"
        >
          Voltar para membros
        </button>
      </div>

      {/* User info */}
      <div className="flex items-center gap-3 mt-5 pb-5 border-b border-white/[0.06]">
        <div className="size-12 rounded-full bg-white/[0.08] flex items-center justify-center text-lg font-semibold shrink-0">
          {member.name.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-medium">{member.name}</p>
          <p className="text-xs text-muted-foreground">{member.email}</p>
        </div>
      </div>

      {/* Alterar senha */}
      <div className="mt-5 pb-5 border-b border-white/[0.06]">
        <p className="text-sm font-medium mb-3">Alterar senha</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Senha nova</Label>
            <Input type="password" placeholder="Digite a nova senha" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Confirmar senha nova</Label>
            <Input type="password" placeholder="Digite a senha outra vez" />
          </div>
        </div>
        <Button variant="outline" className="mt-3" size="sm">
          Atualizar
        </Button>
      </div>

      {/* Dados do usuário */}
      <div className="mt-5 overflow-y-auto flex-1 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-foreground/20 [&::-webkit-scrollbar-track]:bg-transparent">
        <p className="text-sm font-medium mb-3">Dados do usuário</p>
        <div className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Acesso</Label>
              <Select
                value={role}
                onValueChange={(v) => setRole(v as UserRole)}
              >
                <SelectTrigger size="sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gratuito">Gratuito</SelectItem>
                  <SelectItem value="assinante">Assinante</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-5">
        <Button variant="default" onClick={handleSave} disabled={saving}>
          {saving ? "Salvando..." : "Salvar alterações"}
        </Button>
      </div>
    </div>
  );
}

/* ── Member Add View ───────────────────────────────────── */

function MemberAddView({
  onBack,
  onAdd,
}: {
  onBack: () => void;
  onAdd: (data: { name: string; email: string; password: string; role: UserRole }) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("gratuito");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleAdd = async () => {
    if (!name.trim() || !email.trim() || !password) {
      setError("Preencha todos os campos.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onAdd({ name: name.trim(), email: email.trim(), password, role });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta.");
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div>
        <h2 className="text-lg font-semibold">Adicionar membro</h2>
        <button
          onClick={onBack}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer mt-0.5"
        >
          Voltar para membros
        </button>
      </div>

      <div className="mt-5 overflow-y-auto flex-1 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-foreground/20 [&::-webkit-scrollbar-track]:bg-transparent">
        <div className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Nome</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome completo"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Senha</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimo 6 caracteres"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Acesso</Label>
            <Select
              value={role}
              onValueChange={(v) => setRole(v as UserRole)}
            >
              <SelectTrigger size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gratuito">Gratuito</SelectItem>
                <SelectItem value="assinante">Assinante</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      </div>

      <div className="mt-auto pt-5">
        <Button variant="default" onClick={handleAdd} disabled={saving}>
          {saving ? "Criando..." : "Criar conta"}
        </Button>
      </div>
    </div>
  );
}

/* ── Shared ─────────────────────────────────────────────── */

function PanelHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </div>
  );
}
