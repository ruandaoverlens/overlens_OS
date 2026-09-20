"use client";

import { useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { SmLanguageLineIcon } from "@/components/icons";
import { DominioDialog } from "./dominio-dialog";
import { formatarData } from "@/lib/registros/types";
import type { DominioRow } from "@/lib/registros/types";
import { contem, useBuscaUrl } from "./_use-busca-url";
import { useSlashFocus } from "@/lib/use-slash-focus";
import { cn } from "@/lib/utils";

function diasParaExpirar(dominio: DominioRow): number | null {
  if (!dominio.data_expiracao) return null;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const expira = new Date(dominio.data_expiracao.slice(0, 10) + "T00:00:00");
  return Math.round((expira.getTime() - hoje.getTime()) / 86_400_000);
}

function expiracaoLabel(dominio: DominioRow): string | null {
  const dias = diasParaExpirar(dominio);
  if (dias === null) return null;
  if (dias < 0) return "Expirado";
  if (dias <= 60 && !dominio.renovacao_automatica)
    return `Expira em ${dias} ${dias === 1 ? "dia" : "dias"}`;
  return null;
}

function expiracaoBadge(dominio: DominioRow) {
  const label = expiracaoLabel(dominio);
  if (!label) return null;
  return <Badge variant={label === "Expirado" ? "destructive" : "warning"}>{label}</Badge>;
}

export function DominiosListClient({ dominios }: { dominios: DominioRow[] }) {
  const { search, setSearch, query, clear, pendente } = useBuscaUrl();
  const searchRef = useRef<HTMLInputElement>(null);
  useSlashFocus(searchRef);

  const filtrados = dominios.filter((d) =>
    contem(
      query,
      d.dominio,
      d.registrador,
      d.titular,
      d.renovacao_automatica ? "Renovação automática" : "Renovação manual",
      expiracaoLabel(d),
    ),
  );

  if (dominios.length === 0) {
    return (
      <EmptyState
        icon={<SmLanguageLineIcon />}
        title="Nenhum domínio cadastrado"
        description="Cadastre os domínios da Overlens para acompanhar registrador, datas de expiração e renovação em um só lugar."
        action={<DominioDialog />}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative max-w-sm">
        <Input
          ref={searchRef}
          type="search"
          size="sm"
          className="pr-10"
          aria-label="Buscar domínios"
          aria-keyshortcuts="/"
          placeholder="Buscar por domínio, registrador ou status…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <kbd
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-border/60 bg-surface-900 px-1.5 text-caption font-mono text-muted-foreground sm:block"
        >
          /
        </kbd>
      </div>

      <span className="text-xs text-muted-foreground" aria-live="polite">
        {filtrados.length} {filtrados.length === 1 ? "domínio" : "domínios"}
      </span>

      {filtrados.length === 0 ? (
        <EmptyState
          icon={<SmLanguageLineIcon />}
          title="Nenhum domínio encontrado"
          description={`Nenhum domínio corresponde a “${search.trim()}”.`}
          variant="filtered"
          onClear={clear}
        />
      ) : (
        <ul
          aria-busy={pendente || undefined}
          className={cn(
            "flex flex-col gap-3 transition-opacity",
            pendente && "opacity-60",
          )}
        >
          {filtrados.map((d) => (
            <li key={d.id}>
              <Card className="flex-row items-center justify-between gap-4">
                <div className="flex min-w-0 flex-col gap-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-lg font-medium">{d.dominio}</span>
                    {d.renovacao_automatica ? (
                      <Badge variant="success">Renovação automática</Badge>
                    ) : (
                      <Badge variant="secondary">Renovação manual</Badge>
                    )}
                    {expiracaoBadge(d)}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    <span>{d.registrador ?? "Registrador não informado"}</span>
                    <span>Expira em {formatarData(d.data_expiracao)}</span>
                  </div>
                  {d.observacoes && (
                    <p className="text-xs text-muted-foreground">{d.observacoes}</p>
                  )}
                </div>
                <DominioDialog dominio={d} />
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
