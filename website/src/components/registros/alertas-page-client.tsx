"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { SmAlertLineIcon } from "@/components/icons";
import { notify } from "@/lib/notifications/toast";
import {
  ALERTA_TIPO_LABEL,
  ALERTA_STATUS_LABEL,
  ALERTA_STATUS_VARIANT,
  formatarData,
} from "@/lib/registros/types";
import type { AlertaRow, AlertaStatus } from "@/lib/registros/types";

export interface AlertaComContexto extends AlertaRow {
  marcaNome: string | null;
  processoNumero: string | null;
}

interface AlertasPageClientProps {
  alertas: AlertaComContexto[];
}

const NEXT_ACTIONS: { status: AlertaStatus; label: string; variant: "outline" | "ghost" | "default" }[] = [
  { status: "revisado", label: "Revisar", variant: "outline" },
  { status: "resolvido", label: "Resolver", variant: "default" },
  { status: "descartado", label: "Descartar", variant: "ghost" },
];

export function AlertasPageClient({ alertas }: AlertasPageClientProps) {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleScan() {
    setScanning(true);
    setMsg(null);
    try {
      const res = await fetch("/api/registros/alertas/scan", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao verificar prazos");
      setMsg(
        data.criados > 0
          ? `${data.criados} novo(s) alerta(s) gerado(s).`
          : "Nenhum novo alerta. Tudo em dia.",
      );
      router.refresh();
    } catch (err) {
      setMsg(null);
      notify.fromError(err, "Não foi possível verificar os prazos");
    } finally {
      setScanning(false);
    }
  }

  async function patchStatus(id: string, status: AlertaStatus) {
    const res = await fetch("/api/registros/alertas", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Erro ao atualizar");
    }
  }

  async function changeStatus(id: string, status: AlertaStatus, anterior: AlertaStatus) {
    setBusyId(id);
    try {
      await patchStatus(id, status);
      if (status === "descartado") {
        notify.success("Descartado", {
          action: {
            label: "Desfazer",
            onClick: () => {
              void patchStatus(id, anterior)
                .then(() => {
                  notify.success("Alerta restaurado");
                  router.refresh();
                })
                .catch((err) => notify.fromError(err, "Não foi possível desfazer"));
            },
          },
        });
      } else {
        notify.success("Alerta atualizado");
      }
      router.refresh();
    } catch (err) {
      notify.fromError(err, "Não foi possível atualizar o alerta");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          size="sm"
          onClick={handleScan}
          loading={scanning}
          loadingText="Verificando…"
        >
          Verificar prazos agora
        </Button>
        {msg && (
          <span className="text-sm text-muted-foreground" aria-live="polite">
            {msg}
          </span>
        )}
      </div>

      {alertas.length === 0 ? (
        <EmptyState
          icon={<SmAlertLineIcon />}
          title="Nenhum alerta"
          description="Verifique os prazos para gerar alertas de renovação, exigência e oposição a partir dos processos cadastrados."
          action={
            <Button onClick={handleScan} loading={scanning} loadingText="Verificando…">
              Verificar prazos agora
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-2">
          {alertas.map((a) => (
            <div key={a.id} className="flex flex-col gap-3 rounded-lg bg-surface-950 px-4 py-3 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{ALERTA_TIPO_LABEL[a.tipo]}</Badge>
                  <Badge variant={ALERTA_STATUS_VARIANT[a.status]}>
                    {ALERTA_STATUS_LABEL[a.status]}
                  </Badge>
                  <span className="truncate text-sm font-medium">{a.titulo}</span>
                </div>
                {a.descricao && (
                  <p className="text-xs text-muted-foreground">{a.descricao}</p>
                )}
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {a.marcaNome && <span>{a.marcaNome}</span>}
                  {a.processoNumero && <span>· {a.processoNumero}</span>}
                  {a.data_limite && <span>· prazo {formatarData(a.data_limite)}</span>}
                  <span>· {a.origem}</span>
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-1">
                {NEXT_ACTIONS.filter((act) => act.status !== a.status).map((act) => (
                  <Button
                    key={act.status}
                    variant={act.variant}
                    size="sm"
                    disabled={busyId === a.id}
                    onClick={() => changeStatus(a.id, act.status, a.status)}
                  >
                    {act.label}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
