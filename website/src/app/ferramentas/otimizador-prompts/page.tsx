"use client";

import { useState, useId } from "react";
// Ícone lucide mantido: não há equivalente de "copiar" em @/components/icons
// (ver src/components/icons/lucide-mapping.ts).
import { Copy } from "lucide-react";
import { SmHistoryLineIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/page-header";
import { notify } from "@/lib/notifications/toast";

const templates = {
  geral: {
    label: "Geral",
    structure: `Você é um {{papel}}. Sua tarefa é {{tarefa}}.

## Contexto
{{contexto}}

## Instruções
- {{instrucao_1}}
- {{instrucao_2}}
- {{instrucao_3}}

## Formato de saída
{{formato}}`,
  },
  copywriting: {
    label: "Copywriting",
    structure: `Você é um copywriter especialista em {{nicho}}.

## Objetivo
Escrever {{tipo_de_conteudo}} para {{plataforma}}.

## Tom de voz
{{tom}}

## Público-alvo
{{publico}}

## Informações do produto/serviço
{{info}}

## Instruções adicionais
- {{instrucao_1}}
- Inclua um CTA claro
- Mantenha o texto escaneável`,
  },
  analise: {
    label: "Análise",
    structure: `Analise {{objeto_de_analise}} considerando os seguintes critérios:

## Critérios de avaliação
1. {{criterio_1}}
2. {{criterio_2}}
3. {{criterio_3}}

## Dados/Material para análise
{{dados}}

## Formato esperado
Apresente a análise em formato de relatório com:
- Resumo executivo
- Pontos fortes
- Pontos de melhoria
- Recomendações`,
  },
  codigo: {
    label: "Código",
    structure: `Você é um desenvolvedor sênior especialista em {{tecnologia}}.

## Tarefa
{{tarefa}}

## Requisitos técnicos
- Linguagem/Framework: {{stack}}
- {{requisito_1}}
- {{requisito_2}}

## Contexto do projeto
{{contexto}}

## Restrições
- {{restricao_1}}
- Código limpo e bem documentado
- Sem dependências desnecessárias`,
  },
};

type TemplateKey = keyof typeof templates;

function buildPrompt(
  template: string,
  role: string,
  task: string,
  context: string,
  extra: string
): string {
  let result = template;
  result = result.replace("{{papel}}", role || "[seu papel]");
  result = result.replace("{{tarefa}}", task || "[sua tarefa]");
  result = result.replace("{{contexto}}", context || "[contexto]");

  // Replace remaining placeholders with generic hints
  const remaining = result.match(/\{\{[^}]+\}\}/g);
  if (remaining) {
    remaining.forEach((placeholder) => {
      const name = placeholder.replace(/\{\{|\}\}/g, "").replace(/_/g, " ");
      result = result.replace(placeholder, `[${name}]`);
    });
  }

  if (extra.trim()) {
    result += `\n\n## Observações adicionais\n${extra}`;
  }

  return result;
}

export default function OtimizadorPromptsPage() {
  const uid = useId();
  const [templateKey, setTemplateKey] = useState<TemplateKey>("geral");
  const [role, setRole] = useState("");
  const [task, setTask] = useState("");
  const [context, setContext] = useState("");
  const [extra, setExtra] = useState("");
  const [errors, setErrors] = useState<{
    role?: string;
    task?: string;
    context?: string;
    extra?: string;
  }>({});

  const prompt = buildPrompt(
    templates[templateKey].structure,
    role,
    task,
    context,
    extra
  );

  const [copying, setCopying] = useState(false);

  /*
   * Os campos vazios viram placeholders no prompt ("[seu papel]"). Sem aviso
   * a pessoa copia um prompt cheio de lacunas achando que está pronto — então
   * o Copiar valida antes, marca os campos e leva o foco ao primeiro problema.
   */
  const validate = () => {
    const next: typeof errors = {};
    if (!role.trim()) next.role = "Informe o papel ou a persona.";
    if (!task.trim()) next.task = "Informe a tarefa principal.";
    if (!context.trim()) next.context = "Informe o contexto.";
    if (extra.length > 2000) next.extra = "Use no máximo 2000 caracteres.";
    setErrors(next);
    const first = (["role", "task", "context", "extra"] as const).find(
      (key) => next[key],
    );
    if (first) {
      document.getElementById(ids[first])?.focus();
      return false;
    }
    return true;
  };

  const handleCopy = async () => {
    if (!validate()) return;
    setCopying(true);
    try {
      await navigator.clipboard.writeText(prompt);
      notify.success("Copiado");
    } catch (err) {
      notify.fromError(err, "Não foi possível copiar");
    } finally {
      setCopying(false);
    }
  };

  const handleReset = () => {
    setRole("");
    setTask("");
    setContext("");
    setExtra("");
    setErrors({});
  };

  const clearError = (field: keyof typeof errors) =>
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));

  const ids = {
    template: `${uid}-template`,
    role: `${uid}-role`,
    task: `${uid}-task`,
    context: `${uid}-context`,
    extra: `${uid}-extra`,
    output: `${uid}-output`,
    outputLabel: `${uid}-output-label`,
  };

  const errorId = (field: keyof typeof errors) => `${ids[field]}-error`;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <PageHeader
        title="Otimizador de Prompts"
        description="Estruture seus prompts para obter respostas melhores de qualquer IA."
        backHref="/ferramentas"
        backLabel="Ferramentas"
        className="mb-6"
      />

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor={ids.template}>Template</Label>
            <Select value={templateKey} onValueChange={(v) => setTemplateKey(v as TemplateKey)}>
              <SelectTrigger id={ids.template} size="sm" autoFocus>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(templates).map(([key, val]) => (
                  <SelectItem key={key} value={key}>
                    {val.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor={ids.role}>Papel / Persona</Label>
            <Input
              id={ids.role}
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                clearError("role");
              }}
              placeholder="Ex: desenvolvedor sênior com 10 anos de experiência"
              size="sm"
              aria-invalid={errors.role ? true : undefined}
              aria-describedby={errors.role ? errorId("role") : undefined}
            />
            {errors.role && <FieldError id={errorId("role")}>{errors.role}</FieldError>}
          </div>

          <div className="space-y-2">
            <Label htmlFor={ids.task}>Tarefa principal</Label>
            <Input
              id={ids.task}
              value={task}
              onChange={(e) => {
                setTask(e.target.value);
                clearError("task");
              }}
              placeholder="Ex: criar um sistema de design tokens"
              size="sm"
              aria-invalid={errors.task ? true : undefined}
              aria-describedby={errors.task ? errorId("task") : undefined}
            />
            {errors.task && <FieldError id={errorId("task")}>{errors.task}</FieldError>}
          </div>

          <div className="space-y-2">
            <Label htmlFor={ids.context}>Contexto</Label>
            <Textarea
              id={ids.context}
              value={context}
              onChange={(e) => {
                setContext(e.target.value);
                clearError("context");
              }}
              placeholder="Informações adicionais, restrições, público…"
              size="sm"
              aria-invalid={errors.context ? true : undefined}
              aria-describedby={errors.context ? errorId("context") : undefined}
            />
            {errors.context && (
              <FieldError id={errorId("context")}>{errors.context}</FieldError>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={ids.extra}>Observações extras</Label>
            <Textarea
              id={ids.extra}
              value={extra}
              onChange={(e) => {
                setExtra(e.target.value);
                clearError("extra");
              }}
              placeholder="Algo mais que você queira adicionar ao prompt…"
              size="sm"
              aria-invalid={errors.extra ? true : undefined}
              aria-describedby={
                errors.extra ? `${ids.extra}-hint ${errorId("extra")}` : `${ids.extra}-hint`
              }
            />
            <p id={`${ids.extra}-hint`} className="text-caption text-muted-foreground">
              Opcional. Entra no prompt como uma seção no final.
            </p>
            {errors.extra && <FieldError id={errorId("extra")}>{errors.extra}</FieldError>}
          </div>

          <Button type="button" onClick={handleReset} variant="ghost" size="sm">
            <SmHistoryLineIcon className="size-4" aria-hidden="true" />
            <span>Limpar campos</span>
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            {/* Não é um controle de formulário: `<Label htmlFor>` apontando
                para um `<pre>` não dá nome acessível nenhum. */}
            <span id={ids.outputLabel} className="text-sm font-medium">
              Prompt gerado
            </span>
            <Button
              type="button"
              onClick={handleCopy}
              variant="secondary"
              size="sm"
              loading={copying}
              loadingText="Copiando…"
            >
              <Copy className="size-4" aria-hidden="true" />
              <span>Copiar</span>
            </Button>
          </div>
          <div className="rounded-xl border bg-accent/30 p-5" role="status" aria-live="polite">
            <pre
              id={ids.output}
              tabIndex={0}
              role="region"
              aria-labelledby={ids.outputLabel}
              className="whitespace-pre-wrap text-sm leading-relaxed font-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
            >
              {prompt}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
