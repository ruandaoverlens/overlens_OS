"use client";

import { useState, useEffect, useId, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { useAuth, canManageMembers, canDeleteMembers, isAdmin, canAccessRoute, getRoleLabel, type UserRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import { normalizeText, matchesNormalized } from "@/lib/normalize-text";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { notify } from "@/lib/notifications/toast";
import { TableRowsSkeleton } from "@/components/skeletons";
import { EmptyState } from "@/components/empty-state";
import { HeadingTitle } from "@/components/ui/heading";
import { FieldError } from "@/components/ui/field";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  { id: "seguranca", label: "Segurança", icon: SmLockLineIcon },
  { id: "aplicativos", label: "Aplicativos", icon: SmAppsLineIcon },
  { id: "membros", label: "Membros", icon: SmCrownLineIcon, adminOnly: true },
];

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { user, updateUser } = useAuth();
  const confirm = useConfirm();
  const [tab, setTab] = useState<SettingsTab>("conta");
  const [saving, setSaving] = useState(false);
  const panelBaseId = useId();

  /*
   * O primeiro campo do painel só recebe foco quando a troca veio de clique ou
   * Enter. Navegando por setas o foco é do próprio tablist — sem isso o
   * `autoFocus` do painel recém-montado roubaria o foco de volta e as setas
   * ficariam inúteis.
   */
  const focusFieldRef = useRef(true);
  /** Painéis com estado próprio (senha, membro) avisam se há edição pendente. */
  const panelDirtyRef = useRef(false);
  const handlePanelDirtyChange = useCallback((value: boolean) => {
    panelDirtyRef.current = value;
  }, []);
  /**
   * Painéis com submit próprio avisam quando há requisição em voo, para que
   * Esc/overlay não fechem o modal no meio de um save que não é o da aba Conta.
   */
  const panelSavingRef = useRef(false);
  const handlePanelSavingChange = useCallback((value: boolean) => {
    panelSavingRef.current = value;
  }, []);

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

  const viewerCanManage = canManageMembers(user?.role ?? "gratuito");

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.adminOnly || viewerCanManage,
  );

  const contaDirty =
    name.trim() !== (user?.name ?? "") || email.trim() !== (user?.email ?? "");

  const askDiscard = async () => {
    const ok = await confirm({
      title: "Descartar as alterações?",
      description: "O que você preencheu e ainda não salvou será perdido.",
      confirmLabel: "Descartar",
      cancelLabel: "Continuar editando",
      destructive: true,
    });
    return ok;
  };

  /** Trocar de aba desmonta o painel: com edição pendente, confirma antes. */
  const selectTab = async (next: SettingsTab, fromArrowKey = false) => {
    if (next === tab) return;
    const leavingDirty = tab === "conta" ? contaDirty : panelDirtyRef.current;
    if (leavingDirty) {
      if (!(await askDiscard())) return;
      panelDirtyRef.current = false;
      if (tab === "conta") {
        setName(user?.name ?? "");
        setEmail(user?.email ?? "");
      }
    }
    focusFieldRef.current = !fromArrowKey;
    setTab(next);
    if (fromArrowKey) document.getElementById(tabId(next))?.focus();
  };

  /** Fechar com edição pendente em qualquer painel pede confirmação. */
  const handleOpenChange = async (next: boolean) => {
    // Fechar no meio de um save escreveria estado em árvore desmontada.
    if (!next && (saving || panelSavingRef.current)) return;
    if (!next && (contaDirty || panelDirtyRef.current)) {
      if (!(await askDiscard())) return;
      panelDirtyRef.current = false;
      setName(user?.name ?? "");
      setEmail(user?.email ?? "");
    }
    onOpenChange(next);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUser({ name: name.trim(), email: email.trim() });
      notify.success("Conta atualizada");
      onOpenChange(false);
    } catch (err) {
      notify.fromError(err, "Não foi possível atualizar a conta");
    } finally {
      setSaving(false);
    }
  };

  const panelId = (id: SettingsTab) => `${panelBaseId}-panel-${id}`;
  const tabId = (id: SettingsTab) => `${panelBaseId}-tab-${id}`;

  return (
    <Dialog open={open} onOpenChange={(next) => void handleOpenChange(next)}>
      <DialogContent
        className="max-w-none w-full h-full rounded-none sm:max-w-[860px] sm:h-auto sm:rounded-xl p-0 gap-0 overflow-hidden"
        onEscapeKeyDown={(e) => { if (saving) e.preventDefault(); }}
        onPointerDownOutside={(e) => { if (saving) e.preventDefault(); }}
        onInteractOutside={(e) => { if (saving) e.preventDefault(); }}
      >
        <VisuallyHidden.Root>
          <DialogTitle>Configurações</DialogTitle>
        </VisuallyHidden.Root>
        <DialogDescription className="sr-only">
          Conta, segurança, aplicativos e membros
        </DialogDescription>
        <div className="flex h-full flex-col md:flex-row sm:min-h-[600px] sm:h-auto lg:min-h-[720px]">
          {/* Sidebar: horizontal (rolável) no mobile, coluna a partir de md */}
          <nav
            aria-label="Seções de configurações"
            className="flex flex-col gap-1 border-b md:border-b-0 md:border-r border-border bg-surface-raised-2 px-3 pt-4 pb-3 pr-14 md:pr-3 md:py-6 md:w-[180px] shrink-0"
          >
            <HeadingTitle as="h2" size="eyebrow" className="px-2 pb-2">
              Configurações
            </HeadingTitle>
            <div
              role="tablist"
              className="flex flex-row gap-1 overflow-x-auto scrollbar-thin md:flex-col md:overflow-visible"
            >
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const active = tab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    id={tabId(item.id)}
                    aria-selected={active}
                    aria-controls={panelId(item.id)}
                    tabIndex={active ? 0 : -1}
                    onClick={() => void selectTab(item.id)}
                    onKeyDown={(e) => {
                      const forward = e.key === "ArrowDown" || e.key === "ArrowRight";
                      const backward = e.key === "ArrowUp" || e.key === "ArrowLeft";
                      if (!forward && !backward) return;
                      e.preventDefault();
                      const idx = visibleItems.findIndex((i) => i.id === item.id);
                      const delta = forward ? 1 : -1;
                      const next = visibleItems[(idx + delta + visibleItems.length) % visibleItems.length];
                      void selectTab(next.id, true);
                    }}
                    className={cn(
                      "flex shrink-0 items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors text-left cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-foreground",
                      active
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Content */}
          <div
            role="tabpanel"
            id={panelId(tab)}
            aria-labelledby={tabId(tab)}
            className="flex-1 flex flex-col px-6 py-6 min-w-0 min-h-0"
          >
            {tab === "conta" && (
              <ContaPanel
                name={name}
                email={email}
                saving={saving}
                autoFocusField={focusFieldRef.current}
                onNameChange={setName}
                onEmailChange={setEmail}
                onSave={handleSave}
              />
            )}
            {tab === "seguranca" && (
              <SegurancaPanel
                autoFocusField={focusFieldRef.current}
                onDirtyChange={handlePanelDirtyChange}
                onSavingChange={handlePanelSavingChange}
              />
            )}
            {tab === "aplicativos" && (
              <AplicativosPanel role={user?.role ?? "gratuito"} />
            )}
            {tab === "membros" && viewerCanManage && (
              <MembrosPanel
                currentUserEmail={user?.email ?? ""}
                onDirtyChange={handlePanelDirtyChange}
                onSavingChange={handlePanelSavingChange}
              />
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
  saving,
  autoFocusField,
  onNameChange,
  onEmailChange,
  onSave,
}: {
  name: string;
  email: string;
  saving: boolean;
  autoFocusField: boolean;
  onNameChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onSave: () => void;
}) {
  const id = useId();
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    const next: { name?: string; email?: string } = {};
    if (!name.trim()) next.name = "Informe o nome.";
    if (!email.trim() || !email.includes("@")) next.email = "Informe um email válido.";
    setErrors(next);
    if (next.name) return focusField(`${id}-name`);
    if (next.email) return focusField(`${id}-email`);
    onSave();
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col flex-1 min-h-0">
      <PanelHeader
        title="Conta"
        description="Gerencie suas informações pessoais"
      />

      <div className="flex flex-col gap-5 mt-6">
        <div className="space-y-2">
          <Label htmlFor={`${id}-name`}>Nome</Label>
          <Input
            id={`${id}-name`}
            value={name}
            autoComplete="name"
            autoFocus={autoFocusField}
            disabled={saving}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? `${id}-name-error` : undefined}
            onChange={(e) => { onNameChange(e.target.value); setErrors((p) => ({ ...p, name: undefined })); }}
          />
          {errors.name && (
            <FieldError id={`${id}-name-error`} className="text-xs">{errors.name}</FieldError>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${id}-email`}>Email</Label>
          <Input
            id={`${id}-email`}
            type="email"
            autoComplete="email"
            value={email}
            disabled={saving}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? `${id}-email-error` : undefined}
            onChange={(e) => { onEmailChange(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
          />
          {errors.email && (
            <FieldError id={`${id}-email-error`} className="text-xs">{errors.email}</FieldError>
          )}
        </div>

      </div>

      <div className="mt-auto pt-6">
        <Button type="submit" variant="default" loading={saving} loadingText="Salvando…">
          Salvar
        </Button>
      </div>
    </form>
  );
}

/** Foca um campo pelo id (usado ao submeter um formulário inválido). */
function focusField(fieldId: string) {
  document.getElementById(fieldId)?.focus();
}

/* ── Segurança ──────────────────────────────────────────── */

function SegurancaPanel({
  autoFocusField,
  onDirtyChange,
  onSavingChange,
}: {
  autoFocusField: boolean;
  onDirtyChange: (dirty: boolean) => void;
  onSavingChange: (saving: boolean) => void;
}) {
  const id = useId();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [errorField, setErrorField] = useState<"new" | "confirm" | null>(null);

  const dirty = newPassword.length > 0 || confirmPassword.length > 0;
  useEffect(() => {
    onDirtyChange(dirty);
    return () => onDirtyChange(false);
  }, [dirty, onDirtyChange]);

  const saving = status === "saving";
  useEffect(() => {
    onSavingChange(saving);
    return () => onSavingChange(false);
  }, [saving, onSavingChange]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "saving") return;
    if (newPassword.length < 6) {
      setErrorMsg("A senha deve ter pelo menos 6 caracteres.");
      setErrorField("new");
      setStatus("error");
      focusField(`${id}-new-password`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("As senhas não coincidem.");
      setErrorField("confirm");
      setStatus("error");
      focusField(`${id}-confirm-password`);
      return;
    }
    setStatus("saving");
    setErrorMsg("");
    setErrorField(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      // Erro do Supabase fica associado ao campo "Nova senha".
      setErrorMsg(error.message);
      setErrorField("new");
      setStatus("error");
      notify.fromError(error, "Não foi possível atualizar a senha");
      focusField(`${id}-new-password`);
    } else {
      setStatus("success");
      setNewPassword("");
      setConfirmPassword("");
      notify.success("Senha atualizada");
    }
  };

  // Erros ficam sob o campo que os originou (ids distintos por campo).
  const newErrorId = `${id}-new-password-error`;
  const confirmErrorId = `${id}-confirm-password-error`;
  const hasError = status === "error";
  const newHasError = hasError && errorField === "new";
  const confirmHasError = hasError && errorField === "confirm";

  return (
    <form onSubmit={handleUpdatePassword} noValidate className="flex flex-col flex-1 min-h-0">
      <PanelHeader
        title="Segurança"
        description="Atualize sua senha de acesso"
      />

      <div className="flex flex-col gap-5 mt-6">
        <div className="space-y-2">
          <Label htmlFor={`${id}-new-password`}>Nova senha</Label>
          <Input
            id={`${id}-new-password`}
            type="password"
            autoComplete="new-password"
            autoFocus={autoFocusField}
            disabled={saving}
            placeholder="••••••••"
            value={newPassword}
            aria-invalid={newHasError ? true : undefined}
            aria-describedby={newHasError ? newErrorId : undefined}
            onChange={(e) => { setNewPassword(e.target.value); setStatus("idle"); }}
          />
          {newHasError && (
            <FieldError id={newErrorId} className="text-xs">{errorMsg}</FieldError>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${id}-confirm-password`}>Confirmar nova senha</Label>
          <Input
            id={`${id}-confirm-password`}
            type="password"
            autoComplete="new-password"
            disabled={saving}
            placeholder="••••••••"
            value={confirmPassword}
            aria-invalid={confirmHasError ? true : undefined}
            aria-describedby={confirmHasError ? confirmErrorId : undefined}
            onChange={(e) => { setConfirmPassword(e.target.value); setStatus("idle"); }}
          />
          {confirmHasError && (
            <FieldError id={confirmErrorId} className="text-xs">{errorMsg}</FieldError>
          )}
        </div>

        {status === "success" && (
          <p role="status" className="text-sm text-success">Senha atualizada com sucesso.</p>
        )}
      </div>

      <div className="mt-auto pt-6">
        <Button
          type="submit"
          variant="default"
          loading={saving}
          loadingText="Atualizando…"
        >
          Atualizar senha
        </Button>
      </div>
    </form>
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
];

function AplicativosPanel({ role }: { role: UserRole }) {
  return (
    <>
      <PanelHeader
        title="Aplicativos"
        description="Apps conectados à sua conta"
      />

      <ul className="flex flex-col gap-2 mt-6 overflow-y-auto flex-1 scrollbar-thin">
        {APPS.map((app) => {
          const hasAccess = canAccessRoute(role, app.route);
          return (
            <li
              key={app.name}
              className="flex items-center justify-between rounded-lg border border-border px-4 py-2.5"
            >
              <div>
                <p className={cn("text-sm font-medium", !hasAccess && "text-muted-foreground")}>{app.name}</p>
                <p className="text-xs text-muted-foreground">{app.description}</p>
              </div>
              <span
                className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ml-3",
                  hasAccess
                    ? "bg-success/10 text-success"
                    : "bg-accent text-muted-foreground",
                )}
              >
                {hasAccess ? "Conectado" : "Sem acesso"}
              </span>
            </li>
          );
        })}
      </ul>
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

type MemberRow = { id: string; name: string | null; email: string; role: string; created_at: string };

function rowToEntry(p: MemberRow): MemberEntry {
  return {
    id: p.id,
    name: p.name ?? "",
    email: p.email,
    role: p.role as UserRole,
    joinedAt: new Date(p.created_at).toLocaleDateString("pt-BR"),
  };
}

function MembrosPanel({
  currentUserEmail,
  onDirtyChange,
  onSavingChange,
}: {
  currentUserEmail: string;
  onDirtyChange: (dirty: boolean) => void;
  onSavingChange: (saving: boolean) => void;
}) {
  const { user } = useAuth();
  const confirm = useConfirm();
  const searchId = useId();
  // Staff vê e edita membros; só admin remove membros e mexe em admins.
  const viewerIsAdmin = isAdmin(user?.role);
  const canRemove = canDeleteMembers(user?.role ?? "gratuito");
  const [members, setMembers] = useState<MemberEntry[]>([]);
  const [editingMember, setEditingMember] = useState<MemberEntry | null>(null);
  const [addingMember, setAddingMember] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "todos">("todos");
  const [page, setPage] = useState(1);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  // O DELETE de membro roda no próprio painel: sem reportar, Esc/overlay
  // fechariam o modal e desmontariam a árvore no meio da requisição.
  useEffect(() => {
    onSavingChange(removingId !== null);
    return () => onSavingChange(false);
  }, [removingId, onSavingChange]);
  const perPage = 10;

  const [errorMsg, setErrorMsg] = useState("");

  // Ao voltar de "Adicionar"/"Editar", o botão que abriu a subtela já desmontou:
  // devolvemos o foco ao gatilho correspondente na lista.
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const rowButtonRefs = useRef(new Map<string, HTMLButtonElement | null>());
  const [focusTarget, setFocusTarget] = useState<string | null>(null);

  useEffect(() => {
    if (!focusTarget || addingMember || editingMember) return;
    if (focusTarget === "add") addButtonRef.current?.focus();
    else rowButtonRefs.current.get(focusTarget)?.focus();
    setFocusTarget(null);
  }, [focusTarget, addingMember, editingMember]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/auth/list-members");
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error(json.error ?? `HTTP ${res.status}`);
        }
        const { members: data } = await res.json();
        setMembers((data as MemberRow[]).map(rowToEntry));
      } catch (err) {
        console.error("Failed to load members:", err);
        setErrorMsg("Erro ao carregar membros. Tente recarregar a página.");
      } finally {
        setLoadingMembers(false);
      }
    };
    load();
  }, []);

  const deleteMember = async (member: MemberEntry) => {
    const ok = await confirm({
      title: "Remover membro?",
      description: `${member.name || member.email} perderá o acesso à plataforma. Esta ação não pode ser desfeita.`,
      confirmLabel: "Remover",
      cancelLabel: "Cancelar",
      destructive: true,
    });
    if (!ok) return;

    setRemovingId(member.id);
    try {
      const res = await fetch("/api/auth/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: member.id }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? `HTTP ${res.status}`);
      }
      setMembers((prev) => prev.filter((m) => m.id !== member.id));
      notify.success("Membro removido");
    } catch (err) {
      notify.fromError(err, "Não foi possível remover o membro");
    } finally {
      setRemovingId(null);
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
      setFocusTarget(updated.id);
      notify.success("Membro atualizado");
    } else {
      const json = await res.json().catch(() => ({ error: "Erro ao atualizar membro" }));
      notify.error(json.error || "Erro ao atualizar membro");
    }
  };

  const addMember = async (data: { name: string; email: string; password: string; role: UserRole }) => {
    const res = await fetch("/api/auth/create-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    // Só o erro da criação volta para o formulário. Daqui em diante a conta já
    // existe: falhar a listagem não pode virar "Erro ao criar conta" (o usuário
    // tentaria criar de novo).
    if (!res.ok) throw new Error(json.error ?? "Erro ao criar conta");
    setAddingMember(false);
    setFocusTarget("add");
    notify.success("Membro adicionado");
    try {
      const listRes = await fetch("/api/auth/list-members");
      if (!listRes.ok) throw new Error(`HTTP ${listRes.status}`);
      const { members: refreshed } = await listRes.json();
      setMembers((refreshed as MemberRow[]).map(rowToEntry));
    } catch (err) {
      console.error("Failed to refresh members:", err);
      notify.warning("Conta criada, mas a lista não recarregou", {
        description: "Reabra as configurações para ver o novo membro.",
      });
    }
  };

  const isSelf = (memberEmail: string) => memberEmail === currentUserEmail;

  // Termo normalizado uma vez: "Jose" encontra "José", "Munoz" encontra "Muñoz".
  const needle = normalizeText(search);
  const filtered = members.filter((m) => {
    const matchesSearch =
      !needle ||
      matchesNormalized(m.name, needle) ||
      matchesNormalized(m.email, needle);
    const matchesRole = roleFilter === "todos" || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const hasFilters = Boolean(search) || roleFilter !== "todos";
  const clearFilters = () => { setSearch(""); setRoleFilter("todos"); setPage(1); };

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * perPage, safePage * perPage);

  if (addingMember) {
    return (
      <MemberAddView
        allowAdmin={viewerIsAdmin}
        onDirtyChange={onDirtyChange}
        onSavingChange={onSavingChange}
        onBack={() => { setAddingMember(false); setFocusTarget("add"); }}
        onAdd={addMember}
      />
    );
  }

  if (editingMember) {
    return (
      <MemberEditView
        onSavingChange={onSavingChange}
        allowAdmin={viewerIsAdmin}
        onDirtyChange={onDirtyChange}
        member={editingMember}
        onBack={() => { const id = editingMember.id; setEditingMember(null); setFocusTarget(id); }}
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
        <Button ref={addButtonRef} variant="outline" size="sm" onClick={() => setAddingMember(true)}>
          Adicionar
        </Button>
      </div>

      <div className="flex items-center gap-3 mt-5">
        <Select
          value={roleFilter}
          onValueChange={(v) => { setRoleFilter(v as UserRole | "todos"); setPage(1); }}
        >
          <SelectTrigger size="xs" className="w-[140px] shrink-0" aria-label="Filtrar por perfil">
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
          id={searchId}
          type="search"
          aria-label="Buscar membros"
          placeholder="Buscar por nome ou email…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="h-8 text-sm"
        />
      </div>

      {/* Enquanto carrega, o feedback visual é o TableRowsSkeleton abaixo. */}
      <p
        aria-live="polite"
        className={cn("mt-2 text-xs text-muted-foreground", loadingMembers && "sr-only")}
      >
        {loadingMembers
          ? "Carregando membros…"
          : `${filtered.length} membro${filtered.length !== 1 ? "s" : ""}${hasFilters ? " encontrado" + (filtered.length !== 1 ? "s" : "") : ""}`}
      </p>

      <div className="mt-2 overflow-y-auto overflow-x-auto flex-1 scrollbar-thin">
        <table className="w-full text-sm">
          <caption className="sr-only">Membros da equipe</caption>
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th scope="col" className="text-left font-medium pb-2 pl-1">Nome</th>
              <th scope="col" className="text-left font-medium pb-2">Email</th>
              <th scope="col" className="text-left font-medium pb-2">Perfil</th>
              <th scope="col" className="text-left font-medium pb-2">Entrada</th>
              <th scope="col" className="text-right font-medium pb-2 pr-1 w-[70px]">
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {loadingMembers ? (
              <TableRowsSkeleton rows={5} cols={5} />
            ) : errorMsg ? (
              <tr>
                <td colSpan={5} role="alert" className="py-6 text-center text-destructive text-sm">
                  {errorMsg}
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-2">
                  <EmptyState
                    size="sm"
                    title="Nenhum membro encontrado."
                    description={
                      hasFilters
                        ? "Ajuste a busca ou o filtro de perfil."
                        : "Adicione o primeiro membro da equipe."
                    }
                    variant={hasFilters ? "filtered" : "empty"}
                    onClear={hasFilters ? clearFilters : undefined}
                  />
                </td>
              </tr>
            ) : paginated.map((member) => (
              <tr
                key={member.id}
                className="border-b border-border/60 last:border-0 hover:bg-accent/40"
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
                  {!isSelf(member.email) && (viewerIsAdmin || member.role !== "admin") && (
                    <div className="flex items-center justify-end gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            ref={(el) => { rowButtonRefs.current.set(member.id, el); }}
                            onClick={() => setEditingMember(member)}
                            aria-label={`Editar ${member.name || member.email}`}
                          >
                            <SmEditSolidIcon className="size-3.5" aria-hidden />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Editar usuário</TooltipContent>
                      </Tooltip>
                      {canRemove && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="hover:text-destructive"
                              onClick={() => deleteMember(member)}
                              loading={removingId === member.id}
                              aria-label={`Remover ${member.name || member.email}`}
                            >
                              <SmDeleteLineIcon className="size-3.5" aria-hidden />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Remover membro</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <nav
          aria-label="Paginação de membros"
          className="flex items-center justify-between mt-auto pt-4 text-xs text-muted-foreground"
        >
          <span>Página {safePage} de {totalPages}</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              aria-label="Página anterior"
              className="p-1.5 rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-foreground"
            >
              <SmArrowBackIosNewLineIcon className="size-3.5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              aria-label="Próxima página"
              className="p-1.5 rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-foreground"
            >
              <SmArrowForwardIosLineIcon className="size-3.5" aria-hidden />
            </button>
          </div>
        </nav>
      )}
    </>
  );
}

/* ── Member Edit View ───────────────────────────────────── */

function MemberEditView({
  member,
  onBack,
  onSavingChange,
  onSave,
  onDirtyChange,
  allowAdmin,
}: {
  member: MemberEntry;
  onBack: () => void;
  onSavingChange: (saving: boolean) => void;
  onSave: (updated: MemberEntry) => Promise<void> | void;
  onDirtyChange: (dirty: boolean) => void;
  allowAdmin: boolean;
}) {
  const id = useId();
  const [name, setName] = useState(member.name);
  const [email, setEmail] = useState(member.email);
  const [role, setRole] = useState<UserRole>(member.role);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    onSavingChange(saving);
    return () => onSavingChange(false);
  }, [saving, onSavingChange]);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  const dirty =
    name !== member.name || email !== member.email || role !== member.role;
  useEffect(() => {
    onDirtyChange(dirty);
    return () => onDirtyChange(false);
  }, [dirty, onDirtyChange]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    const next: { name?: string; email?: string } = {};
    if (!name.trim()) next.name = "Informe o nome.";
    if (!email.trim() || !email.includes("@")) next.email = "Informe um email válido.";
    setErrors(next);
    if (next.name) return focusField(`${id}-name`);
    if (next.email) return focusField(`${id}-email`);

    setSaving(true);
    try {
      await onSave({ ...member, name: name.trim(), email: email.trim(), role });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} noValidate className="flex flex-col h-full">
      {/* Header */}
      <div>
        <HeadingTitle as="h2" size="sm">Editar usuário</HeadingTitle>
        <button
          type="button"
          onClick={onBack}
          disabled={saving}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer mt-0.5 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-foreground disabled:pointer-events-none disabled:opacity-50"
        >
          Voltar para membros
        </button>
      </div>

      {/* User info */}
      <div className="flex items-center gap-3 mt-5 pb-5 border-b border-border">
        <div
          aria-hidden
          className="size-12 rounded-full bg-accent flex items-center justify-center text-lg font-semibold shrink-0"
        >
          {member.name.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-medium">{member.name}</p>
          <p className="text-xs text-muted-foreground">{member.email}</p>
        </div>
      </div>

      {/* Dados do usuário */}
      <div className="mt-5 overflow-y-auto flex-1 scrollbar-thin">
        <p className="text-sm font-medium mb-3">Dados do usuário</p>
        <div className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <Label htmlFor={`${id}-name`} className="text-xs">Nome</Label>
            <Input
              id={`${id}-name`}
              value={name}
              autoComplete="off"
              autoFocus
              disabled={saving}
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={errors.name ? `${id}-name-error` : undefined}
              onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })); }}
            />
            {errors.name && (
              <FieldError id={`${id}-name-error`} className="text-xs">{errors.name}</FieldError>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor={`${id}-email`} className="text-xs">Email</Label>
              <Input
                id={`${id}-email`}
                type="email"
                autoComplete="off"
                value={email}
                disabled={saving}
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? `${id}-email-error` : undefined}
                onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
              />
              {errors.email && (
                <FieldError id={`${id}-email-error`} className="text-xs">{errors.email}</FieldError>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${id}-role`} className="text-xs">Acesso</Label>
              <Select
                value={role}
                disabled={saving}
                onValueChange={(v) => setRole(v as UserRole)}
              >
                <SelectTrigger id={`${id}-role`} size="sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gratuito">Gratuito</SelectItem>
                  <SelectItem value="assinante">Assinante</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  {allowAdmin && <SelectItem value="admin">Administrador</SelectItem>}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-5">
        <Button type="submit" variant="default" loading={saving} loadingText="Salvando…">
          Salvar alterações
        </Button>
      </div>
    </form>
  );
}

/* ── Member Add View ───────────────────────────────────── */

function MemberAddView({
  onBack,
  onSavingChange,
  onAdd,
  onDirtyChange,
  allowAdmin,
}: {
  onBack: () => void;
  onSavingChange: (saving: boolean) => void;
  onAdd: (data: { name: string; email: string; password: string; role: UserRole }) => Promise<void>;
  onDirtyChange: (dirty: boolean) => void;
  allowAdmin: boolean;
}) {
  const id = useId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("gratuito");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    onSavingChange(saving);
    return () => onSavingChange(false);
  }, [saving, onSavingChange]);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; form?: string }>({});

  const dirty =
    name !== "" || email !== "" || password !== "" || role !== "gratuito";
  useEffect(() => {
    onDirtyChange(dirty);
    return () => onDirtyChange(false);
  }, [dirty, onDirtyChange]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    const next: typeof errors = {};
    if (!name.trim()) next.name = "Informe o nome.";
    if (!email.trim() || !email.includes("@")) next.email = "Informe um email válido.";
    if (!password) next.password = "Informe uma senha.";
    else if (password.length < 6) next.password = "A senha deve ter pelo menos 6 caracteres.";
    setErrors(next);
    if (next.name) return focusField(`${id}-name`);
    if (next.email) return focusField(`${id}-email`);
    if (next.password) return focusField(`${id}-password`);

    setSaving(true);
    try {
      await onAdd({ name: name.trim(), email: email.trim(), password, role });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao criar conta.";
      setErrors({ form: message });
      notify.fromError(err, "Não foi possível criar a conta");
    } finally {
      setSaving(false);
    }
  };

  const clear = (field: keyof typeof errors) =>
    setErrors((p) => ({ ...p, [field]: undefined, form: undefined }));

  return (
    <form onSubmit={handleAdd} noValidate className="flex flex-col h-full">
      <div>
        <HeadingTitle as="h2" size="sm">Adicionar membro</HeadingTitle>
        <button
          type="button"
          onClick={onBack}
          disabled={saving}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer mt-0.5 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-foreground disabled:pointer-events-none disabled:opacity-50"
        >
          Voltar para membros
        </button>
      </div>

      <div className="mt-5 overflow-y-auto flex-1 scrollbar-thin">
        <div className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <Label htmlFor={`${id}-name`} className="text-xs">Nome</Label>
            <Input
              id={`${id}-name`}
              value={name}
              autoComplete="off"
              autoFocus
              disabled={saving}
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={errors.name ? `${id}-name-error` : undefined}
              onChange={(e) => { setName(e.target.value); clear("name"); }}
              placeholder="Nome completo"
            />
            {errors.name && (
              <FieldError id={`${id}-name-error`} className="text-xs">{errors.name}</FieldError>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${id}-email`} className="text-xs">Email</Label>
            <Input
              id={`${id}-email`}
              type="email"
              autoComplete="off"
              value={email}
              disabled={saving}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? `${id}-email-error` : undefined}
              onChange={(e) => { setEmail(e.target.value); clear("email"); }}
              placeholder="email@exemplo.com"
            />
            {errors.email && (
              <FieldError id={`${id}-email-error`} className="text-xs">{errors.email}</FieldError>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${id}-password`} className="text-xs">Senha</Label>
            <Input
              id={`${id}-password`}
              type="password"
              autoComplete="new-password"
              value={password}
              disabled={saving}
              aria-invalid={errors.password ? true : undefined}
              aria-describedby={errors.password ? `${id}-password-error` : undefined}
              onChange={(e) => { setPassword(e.target.value); clear("password"); }}
              placeholder="Mínimo 6 caracteres"
            />
            {errors.password && (
              <FieldError id={`${id}-password-error`} className="text-xs">{errors.password}</FieldError>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${id}-role`} className="text-xs">Acesso</Label>
            <Select
              value={role}
              disabled={saving}
              onValueChange={(v) => setRole(v as UserRole)}
            >
              <SelectTrigger id={`${id}-role`} size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gratuito">Gratuito</SelectItem>
                <SelectItem value="assinante">Assinante</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                {allowAdmin && <SelectItem value="admin">Administrador</SelectItem>}
              </SelectContent>
            </Select>
          </div>

          {errors.form && <FieldError className="pl-0">{errors.form}</FieldError>}
        </div>
      </div>

      <div className="mt-auto pt-5">
        <Button type="submit" variant="default" loading={saving} loadingText="Criando…">
          Criar conta
        </Button>
      </div>
    </form>
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
      <HeadingTitle as="h2" size="sm">{title}</HeadingTitle>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </div>
  );
}
