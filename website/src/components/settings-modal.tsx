"use client";

import { useState } from "react";
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
import { useAuth, canManageMembers, canAccessRoute, getRoleLabel, TEST_USERS, type UserRole } from "@/lib/auth";
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

  const isAdmin = canManageMembers(user?.role ?? "gratuito");

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.adminOnly || isAdmin,
  );

  const handleSave = () => {
    updateUser({ name, email });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-none w-full h-full rounded-none sm:max-w-[860px] sm:h-auto sm:rounded-xl p-0 gap-0 overflow-hidden"
        showCloseButton
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
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <>
      <PanelHeader
        title="Seguranca"
        description="Atualize sua senha de acesso"
      />

      <div className="flex flex-col gap-5 mt-6">
        <div className="space-y-2">
          <Label htmlFor="settings-current-password">Senha atual</Label>
          <Input
            id="settings-current-password"
            type="password"
            placeholder="••••••••"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="settings-new-password">Nova senha</Label>
          <Input
            id="settings-new-password"
            type="password"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="settings-confirm-password">Confirmar nova senha</Label>
          <Input
            id="settings-confirm-password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-auto pt-6">
        <Button variant="default">Atualizar senha</Button>
      </div>
    </>
  );
}

/* ── Aplicativos ────────────────────────────────────────── */

const APPS = [
  { name: "Assets", route: "/assets", description: "Biblioteca de assets digitais" },
  { name: "Brand System", route: "/docs", description: "Documentação de marca" },
  { name: "Códices", route: "/codices", description: "Referências e curadoria" },
  { name: "Content System", route: "/estudio", description: "Produção de conteúdo" },
  { name: "Growth System", route: "/growth", description: "Métricas e crescimento" },
  { name: "Pacote Cultural", route: "/pacote", description: "Inspirações e cultura" },
  { name: "Plata", route: "/plataforma", description: "Ambiente de aprendizado" },
  { name: "T.R.U", route: "/tru", description: "Ferramentas internas" },
  { name: "Website", route: "/website", description: "Site institucional" },
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
  name: string;
  email: string;
  role: UserRole;
  joinedAt: string;
}

const INITIAL_MEMBERS: MemberEntry[] = [
  { name: "Ruan Barbosa", email: "ruan@overlens.com", role: "admin", joinedAt: "22/01/2025" },
  { name: "Carlos Mendes", email: "carlos@overlens.com", role: "staff", joinedAt: "15/03/2025" },
  { name: "Lucas Ferreira", email: "lucas@overlens.com", role: "assinante", joinedAt: "02/06/2025" },
  { name: "Ana Silva", email: "ana@overlens.com", role: "gratuito", joinedAt: "18/09/2025" },
];

function MembrosPanel({ currentUserEmail }: { currentUserEmail: string }) {
  const [members, setMembers] = useState<MemberEntry[]>(INITIAL_MEMBERS);
  const [editingMember, setEditingMember] = useState<MemberEntry | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "todos">("todos");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const deleteMember = (email: string) => {
    setMembers((prev) => prev.filter((m) => m.email !== email));
  };

  const saveMember = (updated: MemberEntry) => {
    setMembers((prev) =>
      prev.map((m) => (m.email === updated.email ? updated : m)),
    );
    setEditingMember(null);
  };

  const isSelf = (email: string) => email === currentUserEmail;

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
      <PanelHeader
        title="Membros"
        description="Gerencie os membros da equipe"
      />

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

      <div className="mt-4 overflow-y-auto max-h-[360px] [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-foreground/20 [&::-webkit-scrollbar-track]:bg-transparent">
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
            {paginated.map((member) => (
              <tr
                key={member.email}
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
                        onClick={() => deleteMember(member.email)}
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
  onSave: (updated: MemberEntry) => void;
}) {
  const [name, setName] = useState(member.name);
  const [email, setEmail] = useState(member.email);
  const [role, setRole] = useState<UserRole>(member.role);

  const handleSave = () => {
    onSave({ ...member, name, email, role });
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
        <Button variant="default" onClick={handleSave}>
          Salvar alterações
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
