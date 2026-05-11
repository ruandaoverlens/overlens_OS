// Thin wrapper around sonner.
// Centraliza chamadas para que a equipe não precise importar sonner direto e para que
// possamos evoluir a camada efêmera (ex: adicionar haptics, logging, etc) num só lugar.

import { toast } from "sonner";

type Action = { label: string; onClick: () => void };

interface NotifyOptions {
  description?: string;
  action?: Action;
  cancel?: Action;
  duration?: number;
  id?: string | number;
}

export const notify = {
  success(title: string, opts?: NotifyOptions) {
    return toast.success(title, opts);
  },
  error(title: string, opts?: NotifyOptions) {
    return toast.error(title, opts);
  },
  warning(title: string, opts?: NotifyOptions) {
    return toast.warning(title, opts);
  },
  info(title: string, opts?: NotifyOptions) {
    return toast.info(title, opts);
  },
  loading(title: string, opts?: Omit<NotifyOptions, "action" | "cancel">) {
    return toast.loading(title, opts);
  },
  dismiss(id?: string | number) {
    toast.dismiss(id);
  },
  promise<T>(
    p: Promise<T>,
    msgs: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: unknown) => string);
    },
  ) {
    return toast.promise(p, msgs);
  },

  // ─── Presets (assets) ─────────────────────────────────
  uploadStarted(count: number) {
    return toast.loading(
      count === 1 ? "Enviando arquivo..." : `Enviando ${count} arquivos...`,
      { id: "upload-batch" },
    );
  },
  uploadSuccess(count: number, opts?: NotifyOptions) {
    return toast.success(
      count === 1 ? "Arquivo enviado" : `${count} arquivos enviados`,
      { id: "upload-batch", ...opts },
    );
  },
  uploadFailed(msg: string, opts?: NotifyOptions) {
    return toast.error("Falha no upload", { description: msg, id: "upload-batch", ...opts });
  },
  uploadPartial(ok: number, failed: number) {
    return toast.warning("Upload parcial", {
      description: `${ok} concluídos, ${failed} falharam.`,
      id: "upload-batch",
    });
  },
};

export type Notify = typeof notify;
