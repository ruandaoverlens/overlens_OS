"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const templates = {
  geral: {
    label: "Geral",
    structure: `Voce e um {{papel}}. Sua tarefa e {{tarefa}}.

## Contexto
{{contexto}}

## Instrucoes
- {{instrucao_1}}
- {{instrucao_2}}
- {{instrucao_3}}

## Formato de saida
{{formato}}`,
  },
  copywriting: {
    label: "Copywriting",
    structure: `Voce e um copywriter especialista em {{nicho}}.

## Objetivo
Escrever {{tipo_de_conteudo}} para {{plataforma}}.

## Tom de voz
{{tom}}

## Publico-alvo
{{publico}}

## Informacoes do produto/servico
{{info}}

## Instrucoes adicionais
- {{instrucao_1}}
- Inclua um CTA claro
- Mantenha o texto escaneavel`,
  },
  analise: {
    label: "Analise",
    structure: `Analise {{objeto_de_analise}} considerando os seguintes criterios:

## Criterios de avaliacao
1. {{criterio_1}}
2. {{criterio_2}}
3. {{criterio_3}}

## Dados/Material para analise
{{dados}}

## Formato esperado
Apresente a analise em formato de relatorio com:
- Resumo executivo
- Pontos fortes
- Pontos de melhoria
- Recomendacoes`,
  },
  codigo: {
    label: "Codigo",
    structure: `Voce e um desenvolvedor senior especialista em {{tecnologia}}.

## Tarefa
{{tarefa}}

## Requisitos tecnicos
- Linguagem/Framework: {{stack}}
- {{requisito_1}}
- {{requisito_2}}

## Contexto do projeto
{{contexto}}

## Restricoes
- {{restricao_1}}
- Codigo limpo e bem documentado
- Sem dependencias desnecessarias`,
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
    result += `\n\n## Observacoes adicionais\n${extra}`;
  }

  return result;
}

export default function OtimizadorPromptsPage() {
  const [templateKey, setTemplateKey] = useState<TemplateKey>("geral");
  const [role, setRole] = useState("");
  const [task, setTask] = useState("");
  const [context, setContext] = useState("");
  const [extra, setExtra] = useState("");
  const [copied, setCopied] = useState(false);

  const prompt = buildPrompt(
    templates[templateKey].structure,
    role,
    task,
    context,
    extra
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setRole("");
    setTask("");
    setContext("");
    setExtra("");
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Link
        href="/ferramentas"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Botoes Magicos
      </Link>

      <h1 className="text-2xl font-semibold tracking-tight">Otimizador de Prompts</h1>
      <p className="mt-1 mb-8 text-muted-foreground">
        Estruture seus prompts para obter respostas melhores de qualquer IA.
      </p>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-5">
          <div className="space-y-2">
            <Label>Template</Label>
            <Select value={templateKey} onValueChange={(v) => setTemplateKey(v as TemplateKey)}>
              <SelectTrigger size="sm">
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
            <Label>Papel / Persona</Label>
            <Input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Ex: designer senior com 10 anos de experiencia"
              size="sm"
            />
          </div>

          <div className="space-y-2">
            <Label>Tarefa principal</Label>
            <Input
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="Ex: criar um sistema de design tokens"
              size="sm"
            />
          </div>

          <div className="space-y-2">
            <Label>Contexto</Label>
            <Textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Informacoes adicionais, restricoes, publico..."
              size="sm"
            />
          </div>

          <div className="space-y-2">
            <Label>Observacoes extras</Label>
            <Textarea
              value={extra}
              onChange={(e) => setExtra(e.target.value)}
              placeholder="Algo mais que voce queira adicionar ao prompt..."
              size="sm"
            />
          </div>

          <Button onClick={handleReset} variant="ghost" size="sm">
            <RotateCcw className="size-4" />
            <span>Limpar campos</span>
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Prompt gerado</Label>
            <Button onClick={handleCopy} variant="secondary" size="sm">
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              <span>{copied ? "Copiado!" : "Copiar"}</span>
            </Button>
          </div>
          <div className="rounded-xl border bg-accent/30 p-5">
            <pre className="whitespace-pre-wrap text-sm leading-relaxed font-body">
              {prompt}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
