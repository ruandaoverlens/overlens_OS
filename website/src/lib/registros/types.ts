// Tipos e mapas de rótulo/variante do módulo "Registros".
// As tabelas do Supabase não têm tipos gerados no repo, então modelamos aqui
// o formato das linhas que consumimos (queries retornam `unknown`/`any` e são
// convertidas para estas interfaces nas páginas server-side).

// ─── Linhas do banco ──────────────────────────────────────────

export interface MarcaRow {
  id: string;
  nome: string;
  apresentacao: string;
  titular: string;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export type ProcessoStatus =
  | "requerida"
  | "registrada"
  | "indeferida"
  | "arquivada"
  | "em_oposicao"
  | "em_exigencia";

export interface ProcessoRow {
  id: string;
  marca_id: string;
  numero: string;
  classe: string;
  edicao_ncl: string | null;
  classe_descricao: string | null;
  status: ProcessoStatus;
  situacao: string | null;
  data_deposito: string | null;
  data_concessao: string | null;
  proxima_renovacao: string | null;
  observacoes: string | null;
  updated_at: string;
}

export type EventoTipo =
  | "deposito"
  | "publicacao"
  | "exame"
  | "exigencia"
  | "resposta"
  | "concessao"
  | "renovacao"
  | "oposicao"
  | "outro";

export interface EventoRow {
  id: string;
  processo_id: string;
  tipo: EventoTipo;
  titulo: string;
  descricao: string | null;
  data: string;
  rpi_numero: string | null;
  created_at: string;
}

export type DocumentoTipo =
  | "certificado"
  | "protocolo"
  | "despacho"
  | "oposicao"
  | "exigencia"
  | "procuracao"
  | "comprovante"
  | "outro";

export interface DocumentoRow {
  id: string;
  marca_id: string | null;
  processo_id: string | null;
  tipo: DocumentoTipo;
  titulo: string;
  storage_path: string;
  mime_type: string | null;
  tamanho: number | null;
  sensivel: boolean;
  uploaded_by: string | null;
  created_at: string;
}

export type AlertaTipo = "renovacao" | "exigencia" | "oposicao" | "prazo" | "radar";
export type AlertaStatus = "pendente" | "revisado" | "resolvido" | "descartado";
export type AlertaOrigem = "sistema" | "radar" | "manual";

export interface AlertaRow {
  id: string;
  processo_id: string | null;
  tipo: AlertaTipo;
  titulo: string;
  descricao: string | null;
  data_limite: string | null;
  status: AlertaStatus;
  origem: AlertaOrigem;
  metadata: Record<string, unknown>;
  resolved_at: string | null;
  created_at: string;
}

export interface DominioRow {
  id: string;
  dominio: string;
  registrador: string | null;
  titular: string | null;
  data_expiracao: string | null;
  renovacao_automatica: boolean;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Rótulos e variantes ──────────────────────────────────────

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

export const PROCESSO_STATUS_LABEL: Record<ProcessoStatus, string> = {
  requerida: "Requerida",
  registrada: "Registrada",
  indeferida: "Indeferida",
  arquivada: "Arquivada",
  em_oposicao: "Em oposição",
  em_exigencia: "Em exigência",
};

export const PROCESSO_STATUS_VARIANT: Record<ProcessoStatus, BadgeVariant> = {
  requerida: "info",
  registrada: "success",
  indeferida: "destructive",
  arquivada: "secondary",
  em_oposicao: "warning",
  em_exigencia: "warning",
};

export const PROCESSO_STATUS_OPTIONS: ProcessoStatus[] = [
  "requerida",
  "registrada",
  "indeferida",
  "arquivada",
  "em_oposicao",
  "em_exigencia",
];

export const EVENTO_TIPO_LABEL: Record<EventoTipo, string> = {
  deposito: "Depósito",
  publicacao: "Publicação",
  exame: "Exame",
  exigencia: "Exigência",
  resposta: "Resposta",
  concessao: "Concessão",
  renovacao: "Renovação",
  oposicao: "Oposição",
  outro: "Outro",
};

export const EVENTO_TIPO_OPTIONS: EventoTipo[] = [
  "deposito",
  "publicacao",
  "exame",
  "exigencia",
  "resposta",
  "concessao",
  "renovacao",
  "oposicao",
  "outro",
];

export const DOCUMENTO_TIPO_LABEL: Record<DocumentoTipo, string> = {
  certificado: "Certificado",
  protocolo: "Protocolo",
  despacho: "Despacho",
  oposicao: "Oposição",
  exigencia: "Exigência",
  procuracao: "Procuração",
  comprovante: "Comprovante",
  outro: "Outro",
};

export const DOCUMENTO_TIPO_OPTIONS: DocumentoTipo[] = [
  "certificado",
  "protocolo",
  "despacho",
  "oposicao",
  "exigencia",
  "procuracao",
  "comprovante",
  "outro",
];

export const ALERTA_TIPO_LABEL: Record<AlertaTipo, string> = {
  renovacao: "Renovação",
  exigencia: "Exigência",
  oposicao: "Oposição",
  prazo: "Prazo",
  radar: "Radar",
};

export const ALERTA_STATUS_LABEL: Record<AlertaStatus, string> = {
  pendente: "Pendente",
  revisado: "Revisado",
  resolvido: "Resolvido",
  descartado: "Descartado",
};

export const ALERTA_STATUS_VARIANT: Record<AlertaStatus, BadgeVariant> = {
  pendente: "warning",
  revisado: "info",
  resolvido: "success",
  descartado: "secondary",
};

// ─── Helpers ──────────────────────────────────────────────────

export function formatarData(data: string | null): string {
  if (!data) return "—";
  // Datas do tipo `date` chegam como "YYYY-MM-DD"; evitamos timezone.
  const [ano, mes, dia] = data.slice(0, 10).split("-");
  if (!ano || !mes || !dia) return data;
  return `${dia}/${mes}/${ano}`;
}

export function formatarTamanho(bytes: number | null): string {
  if (!bytes || bytes <= 0) return "—";
  const unidades = ["B", "KB", "MB", "GB"];
  let valor = bytes;
  let i = 0;
  while (valor >= 1024 && i < unidades.length - 1) {
    valor /= 1024;
    i++;
  }
  return `${valor.toFixed(i === 0 ? 0 : 1)} ${unidades[i]}`;
}
