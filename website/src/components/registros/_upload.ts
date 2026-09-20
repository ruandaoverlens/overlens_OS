/**
 * Helpers de upload direto ao Supabase Storage usados pelo módulo Registros.
 *
 * `putToSignedUrl` em `@/lib/direct-upload` não é exportado, então a lógica
 * mínima de PUT via XHR (com progresso por byte e cancelamento) vive aqui.
 */

/** Limite espelhado do servidor (`sign-upload` recusa acima de 100 MB). */
export const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;

/** Tempo máximo de um PUT antes de `ontimeout` disparar (2 min). */
export const UPLOAD_TIMEOUT_MS = 120_000;

/** Tipos aceitos nos campos de arquivo do módulo. */
export const UPLOAD_ACCEPT = ".pdf,.png,.jpg,.jpeg,.webp";

const ACCEPTED_EXTENSIONS = UPLOAD_ACCEPT.split(",");

/**
 * MIMEs aceitos. O browser informa o tipo real do conteúdo escolhido, então um
 * binário renomeado para `.pdf` é barrado aqui — a extensão sozinha não basta.
 * Quando o browser não informa tipo (alguns casos de drag & drop), caímos na
 * checagem por extensão.
 */
const ACCEPTED_MIMES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
]);

function formatarMB(bytes: number): string {
  return `${Math.round(bytes / (1024 * 1024))} MB`;
}

/** Tamanho legível para exibir ao lado do nome do arquivo escolhido. */
export function formatarTamanho(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} MB`;
}

/**
 * Valida um arquivo no cliente antes de pedir a URL assinada.
 * Retorna a mensagem de erro ou `null` quando o arquivo é aceitável.
 */
export function validarArquivo(file: File): string | null {
  const nome = file.name.toLowerCase();
  const extOk = ACCEPTED_EXTENSIONS.some((ext) => nome.endsWith(ext));
  const mime = file.type.toLowerCase();
  const tipoOk = mime ? ACCEPTED_MIMES.has(mime) && extOk : extOk;
  if (!tipoOk) {
    return `Formato não suportado. Envie PDF, PNG, JPG ou WEBP.`;
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return `Arquivo excede o limite de ${formatarMB(MAX_UPLOAD_BYTES)}.`;
  }
  if (file.size === 0) {
    return "O arquivo está vazio.";
  }
  return null;
}

export interface PutToSignedUrlArgs {
  uploadUrl: string;
  token: string;
  file: File;
  signal?: AbortSignal;
  /** Progresso em porcentagem inteira (0–100). */
  onProgress?: (percent: number) => void;
}

/**
 * PUT do arquivo para uma URL assinada do Supabase usando XHR, para expor
 * progresso por byte e permitir cancelamento via `AbortSignal`.
 */
export function putToSignedUrl({
  uploadUrl,
  token,
  file,
  signal,
  onProgress,
}: PutToSignedUrlArgs): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason ?? new DOMException("Aborted", "AbortError"));
      return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl, true);
    xhr.timeout = UPLOAD_TIMEOUT_MS;
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("x-upsert", "false");
    if (file.type) xhr.setRequestHeader("Content-Type", file.type);

    const onAbort = () => {
      try {
        xhr.abort();
      } catch {
        // ignore
      }
    };
    const cleanup = () => signal?.removeEventListener("abort", onAbort);

    xhr.upload.onprogress = (event: ProgressEvent) => {
      const total = event.lengthComputable ? event.total : file.size;
      if (total > 0) {
        onProgress?.(Math.min(100, Math.round((event.loaded / total) * 100)));
      }
    };

    xhr.onload = () => {
      cleanup();
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve();
      } else {
        reject(new Error(`Falha no upload (HTTP ${xhr.status})`));
      }
    };
    xhr.onerror = () => {
      cleanup();
      reject(new Error("Falha de rede durante o upload"));
    };
    xhr.onabort = () => {
      cleanup();
      reject(signal?.reason ?? new DOMException("Aborted", "AbortError"));
    };
    xhr.ontimeout = () => {
      cleanup();
      reject(new Error("O upload excedeu o tempo limite"));
    };

    signal?.addEventListener("abort", onAbort, { once: true });
    xhr.send(file);
  });
}

/** `true` quando o erro veio de um cancelamento (não deve virar toast). */
export function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === "AbortError";
}
