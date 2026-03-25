"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Plus, Pencil, Trash2 } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────

export type SourceType = "rss" | "api";

export type SourceCategory = "tecnologia" | "negocios" | "criacao";

export interface Source {
  id: string;
  name: string;
  url: string | null;
  type: SourceType;
  category: SourceCategory;
  reliability_score: number | null;
  is_active: boolean;
  created_at: string;
}

interface FormState {
  name: string;
  url: string;
  type: SourceType;
  category: SourceCategory;
  reliability_score: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  url: "",
  type: "rss",
  category: "tecnologia",
  reliability_score: "",
};

const TYPE_LABELS: Record<SourceType, string> = {
  rss: "RSS",
  api: "API",
};

const CATEGORY_LABELS: Record<SourceCategory, string> = {
  tecnologia: "Tecnologia",
  negocios: "Negócios",
  criacao: "Criação",
};

const CATEGORY_COLORS: Record<SourceCategory, string> = {
  tecnologia: "border-[var(--brand-atmos)] text-[var(--brand-atmos)]",
  negocios: "border-[var(--brand-nubia)] text-[var(--brand-nubia)]",
  criacao: "border-[var(--brand-midori)] text-[var(--brand-midori)]",
};

// ─── Component ─────────────────────────────────────────────

interface SourcesManagerProps {
  initialSources: Source[];
}

export function MagnySourcesManager({ initialSources }: SourcesManagerProps) {
  const [sources, setSources] = useState<Source[]>(initialSources);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  function openAddForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setShowForm(true);
  }

  function openEditForm(source: Source) {
    setEditingId(source.id);
    setForm({
      name: source.name,
      url: source.url ?? "",
      type: source.type,
      category: source.category,
      reliability_score: source.reliability_score !== null ? String(source.reliability_score) : "",
    });
    setFormError(null);
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
  }

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const score = form.reliability_score.trim() !== "" ? Number(form.reliability_score) : null;
    if (score !== null && (isNaN(score) || score < 1 || score > 10)) {
      setFormError("A pontuação de confiabilidade deve ser um número entre 1 e 10.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      url: form.url.trim() || null,
      type: form.type,
      category: form.category,
      reliability_score: score,
    };

    setSubmitting(true);
    try {
      if (editingId) {
        const res = await fetch(`/api/magny/sources/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json();
          setFormError(data.error ?? "Erro ao atualizar a fonte.");
          return;
        }
        const data = await res.json();
        setSources((prev) =>
          prev.map((s) => (s.id === editingId ? data.source : s))
        );
      } else {
        const res = await fetch("/api/magny/sources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json();
          setFormError(data.error ?? "Erro ao criar a fonte.");
          return;
        }
        const data = await res.json();
        setSources((prev) => [data.source, ...prev]);
      }
      cancelForm();
    } catch {
      setFormError("Erro de rede. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleActive(source: Source) {
    setTogglingId(source.id);
    try {
      const res = await fetch(`/api/magny/sources/${source.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !source.is_active }),
      });
      if (res.ok) {
        const data = await res.json();
        setSources((prev) =>
          prev.map((s) => (s.id === source.id ? data.source : s))
        );
      }
    } catch {
      // silent fail
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/magny/sources/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSources((prev) => prev.filter((s) => s.id !== id));
        setConfirmDeleteId(null);
        if (editingId === id) cancelForm();
      }
    } catch {
      // silent fail
    } finally {
      setDeletingId(null);
    }
  }

  const sourceToDelete = sources.find((s) => s.id === confirmDeleteId);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-6 pt-4 pb-8 md:px-8 md:pt-5 md:pb-10">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-[40px] font-normal uppercase tracking-normal leading-none text-balance text-foreground">
            Fontes
          </h1>
          <p className="mt-2 text-sm leading-7 text-pretty text-muted-foreground">
            Gerencie as fontes de pesquisa usadas pelo pipeline de inteligência.
          </p>
        </div>
        {!showForm && (
          <Button onClick={openAddForm} size="sm">
            Adicionar Fonte
          </Button>
        )}
      </div>

      <Separator />

      {/* Inline form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {editingId ? "Editar Fonte" : "Nova Fonte"}
            </CardTitle>
            <CardDescription>
              {editingId
                ? "Atualize os dados da fonte selecionada."
                : "Preencha os dados para adicionar uma nova fonte."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Name */}
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <Label htmlFor="source-name">
                    Nome <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="source-name"
                    name="name"
                    value={form.name}
                    onChange={handleFormChange}
                    placeholder="Ex: MIT Technology Review"
                    required
                  />
                </div>

                {/* URL */}
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <Label htmlFor="source-url">URL</Label>
                  <Input
                    id="source-url"
                    name="url"
                    type="url"
                    value={form.url}
                    onChange={handleFormChange}
                    placeholder="https://..."
                  />
                </div>

                {/* Type */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="source-type">
                    Tipo <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={form.type}
                    onValueChange={(value) =>
                      setForm((prev) => ({ ...prev, type: value as SourceType }))
                    }
                  >
                    <SelectTrigger id="source-type" className="w-full">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rss">RSS</SelectItem>
                      <SelectItem value="api">API</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Category */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="source-category">
                    Categoria <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={form.category}
                    onValueChange={(value) =>
                      setForm((prev) => ({ ...prev, category: value as SourceCategory }))
                    }
                  >
                    <SelectTrigger id="source-category" className="w-full">
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tecnologia">Tecnologia</SelectItem>
                      <SelectItem value="negocios">Negócios</SelectItem>
                      <SelectItem value="criacao">Criação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Reliability score */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="source-score">Confiabilidade (1-10)</Label>
                  <Input
                    id="source-score"
                    name="reliability_score"
                    type="number"
                    min={1}
                    max={10}
                    step={1}
                    value={form.reliability_score}
                    onChange={handleFormChange}
                    placeholder="Ex: 8"
                  />
                </div>
              </div>

              {formError && (
                <p className="text-sm text-destructive">{formError}</p>
              )}

              <div className="flex items-center gap-3">
                <Button type="submit" disabled={submitting} size="sm">
                  {submitting
                    ? editingId
                      ? "Salvando..."
                      : "Adicionando..."
                    : editingId
                    ? "Salvar Alterações"
                    : "Adicionar Fonte"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={cancelForm}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                {editingId && (
                  <>
                    <div className="flex-1" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmDeleteId(editingId)}
                      disabled={submitting}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      Excluir fonte
                    </Button>
                  </>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Sources table */}
      {sources.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-center">
            <p className="text-muted-foreground">
              Nenhuma fonte cadastrada ainda.
            </p>
            {!showForm && (
              <Button onClick={openAddForm} variant="outline" size="sm">
                Adicionar primeira fonte
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-accent/30 hover:bg-accent/30">
                <TableHead className="px-4 py-3">Nome</TableHead>
                <TableHead className="px-4 py-3">Tipo</TableHead>
                <TableHead className="px-4 py-3">Categoria</TableHead>
                <TableHead className="px-4 py-3">Score</TableHead>
                <TableHead className="px-4 py-3">Status</TableHead>
                <TableHead className="px-4 py-3 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sources.map((source) => (
                <TableRow
                  key={source.id}
                  className={
                    editingId === source.id
                      ? "bg-primary/5 hover:bg-primary/5"
                      : undefined
                  }
                >
                  {/* Name + URL */}
                  <TableCell className="px-4 py-3">
                    <span className="font-medium text-foreground">
                      {source.name}
                    </span>
                    {source.url && (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-0.5 block max-w-[220px] truncate text-xs text-muted-foreground hover:text-primary"
                        title={source.url}
                      >
                        {source.url}
                      </a>
                    )}
                  </TableCell>

                  {/* Type */}
                  <TableCell className="px-4 py-3">
                    <Badge variant="secondary">
                      {TYPE_LABELS[source.type] ?? source.type}
                    </Badge>
                  </TableCell>

                  {/* Category */}
                  <TableCell className="px-4 py-3">
                    <Badge variant="outline" className={CATEGORY_COLORS[source.category] ?? ""}>
                      {CATEGORY_LABELS[source.category] ?? source.category}
                    </Badge>
                  </TableCell>

                  {/* Reliability score */}
                  <TableCell className="px-4 py-3 text-muted-foreground">
                    {source.reliability_score !== null ? (
                      source.reliability_score
                    ) : (
                      <span className="text-muted-foreground/40">--</span>
                    )}
                  </TableCell>

                  {/* Active toggle */}
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={source.is_active}
                        onCheckedChange={() => handleToggleActive(source)}
                        disabled={togglingId === source.id}
                        aria-label={
                          source.is_active
                            ? "Desativar fonte"
                            : "Ativar fonte"
                        }
                      />
                      <span className="text-xs text-muted-foreground">
                        {togglingId === source.id
                          ? "..."
                          : source.is_active
                          ? "Ativa"
                          : "Inativa"}
                      </span>
                    </div>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditForm(source)}
                      >
                        Editar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={confirmDeleteId !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmDeleteId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir fonte</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a fonte{" "}
              <strong>{sourceToDelete?.name}</strong>? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingId === confirmDeleteId}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deletingId === confirmDeleteId}
              onClick={() => {
                if (confirmDeleteId) handleDelete(confirmDeleteId);
              }}
            >
              {deletingId === confirmDeleteId ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
