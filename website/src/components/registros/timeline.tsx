import { Badge } from "@/components/ui/badge";
import { EVENTO_TIPO_LABEL, formatarData } from "@/lib/registros/types";
import type { EventoRow } from "@/lib/registros/types";

export interface TimelineEvento extends EventoRow {
  processoNumero: string | null;
}

/**
 * Timeline vertical agregada dos eventos dos processos de uma marca.
 * Componente puramente apresentacional (renderizado no server).
 */
export function Timeline({ eventos }: { eventos: TimelineEvento[] }) {
  if (eventos.length === 0) {
    return (
      <p className="px-1 text-sm text-muted-foreground">
        Nenhum evento registrado ainda.
      </p>
    );
  }

  return (
    <ol className="relative flex flex-col gap-6 pl-6">
      <span
        aria-hidden="true"
        className="absolute left-[5px] top-2 bottom-2 w-px bg-border"
      />
      {eventos.map((ev) => (
        <li key={ev.id} className="relative flex flex-col gap-1">
          <span
            aria-hidden="true"
            className="absolute -left-6 top-1.5 size-[11px] rounded-full border-2 border-background bg-[var(--surface-400)]"
          />
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground">
              {formatarData(ev.data)}
            </span>
            <Badge variant="outline">{EVENTO_TIPO_LABEL[ev.tipo]}</Badge>
            {ev.processoNumero && (
              <span className="text-xs text-muted-foreground">{ev.processoNumero}</span>
            )}
            {ev.rpi_numero && (
              <span className="text-xs text-muted-foreground">RPI {ev.rpi_numero}</span>
            )}
          </div>
          <span className="text-sm font-medium">{ev.titulo}</span>
          {ev.descricao && (
            <p className="text-sm text-muted-foreground">{ev.descricao}</p>
          )}
        </li>
      ))}
    </ol>
  );
}
