// Tipos e rótulos do Radar RPI (monitoramento de publicações do INPI).
// Mantidos aqui, separados de `types.ts`, para não conflitar com outra frente
// de trabalho que edita `types.ts`.

import type { TipoMatch } from "./matching";

export type RadarExecucaoStatus = "ok" | "erro" | "parcial";
export type RadarCandidatoStatus = "pendente" | "descartado" | "alerta";

export interface RadarExecucaoRow {
  id: string;
  rpi_numero: string;
  executado_em: string;
  status: RadarExecucaoStatus;
  total_publicacoes: number | null;
  total_candidatos: number | null;
  erro: string | null;
}

export interface RadarCandidatoRow {
  id: string;
  execucao_id: string;
  marca_id: string | null;
  processo_numero: string | null;
  marca_texto: string | null;
  classe: string | null;
  titular: string | null;
  tipo_match: TipoMatch;
  score: number | null;
  status: RadarCandidatoStatus;
  resumo_ia: string | null;
  created_at: string;
}

type BadgeVariant =
  | "default"
  | "primary"
  | "destructive"
  | "success"
  | "warning"
  | "info"
  | "outline"
  | "secondary"
  | "ghost";

export const RADAR_EXECUCAO_STATUS_LABEL: Record<RadarExecucaoStatus, string> = {
  ok: "OK",
  erro: "Erro",
  parcial: "Parcial",
};

export const RADAR_EXECUCAO_STATUS_VARIANT: Record<RadarExecucaoStatus, BadgeVariant> = {
  ok: "success",
  erro: "destructive",
  parcial: "warning",
};

export const RADAR_CANDIDATO_STATUS_LABEL: Record<RadarCandidatoStatus, string> = {
  pendente: "Pendente",
  descartado: "Descartado",
  alerta: "Alerta",
};

export const RADAR_CANDIDATO_STATUS_VARIANT: Record<RadarCandidatoStatus, BadgeVariant> = {
  pendente: "warning",
  descartado: "secondary",
  alerta: "destructive",
};

export const TIPO_MATCH_LABEL: Record<TipoMatch, string> = {
  exato: "Exato",
  fonetico: "Fonético",
  edicao: "Edição",
};

export const TIPO_MATCH_VARIANT: Record<TipoMatch, BadgeVariant> = {
  exato: "destructive",
  fonetico: "warning",
  edicao: "info",
};
