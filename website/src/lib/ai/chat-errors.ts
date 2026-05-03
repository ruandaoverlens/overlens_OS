export type ChatErrorKind =
  | "credits"
  | "rate_limit"
  | "auth"
  | "network"
  | "unknown";

export type ChatErrorInfo = {
  kind: ChatErrorKind;
  message: string;
};

const FALLBACK_MESSAGE = "Algo deu errado ao gerar a resposta. Tente novamente.";

function extractRaw(error: unknown): {
  text: string;
  status: number | undefined;
} {
  if (error == null) return { text: "", status: undefined };
  if (typeof error === "string") return { text: error, status: undefined };
  if (error instanceof Error) {
    const anyErr = error as Error & {
      statusCode?: number;
      status?: number;
      cause?: { statusCode?: number; status?: number };
      responseBody?: string;
    };
    const status =
      anyErr.statusCode ??
      anyErr.status ??
      anyErr.cause?.statusCode ??
      anyErr.cause?.status;
    const body = anyErr.responseBody ?? "";
    return { text: `${error.message} ${body}`.trim(), status };
  }
  try {
    return { text: JSON.stringify(error), status: undefined };
  } catch {
    return { text: String(error), status: undefined };
  }
}

export function classifyChatError(error: unknown): ChatErrorInfo {
  const { text, status } = extractRaw(error);
  const lower = text.toLowerCase();

  if (
    status === 402 ||
    lower.includes("insufficient credits") ||
    lower.includes("insufficient_credits") ||
    lower.includes("payment required") ||
    lower.includes("out of credits") ||
    lower.includes("quota exceeded") ||
    lower.includes("billing")
  ) {
    return {
      kind: "credits",
      message:
        "Os créditos da Overlens acabaram. Avise um administrador para recarregar e tente novamente.",
    };
  }

  if (
    status === 429 ||
    lower.includes("rate limit") ||
    lower.includes("rate_limit") ||
    lower.includes("too many requests")
  ) {
    return {
      kind: "rate_limit",
      message:
        "Limite de requisições atingido. Aguarde alguns segundos e tente de novo.",
    };
  }

  if (
    status === 401 ||
    status === 403 ||
    lower.includes("unauthorized") ||
    lower.includes("forbidden") ||
    lower.includes("invalid api key")
  ) {
    return {
      kind: "auth",
      message:
        "Não foi possível autenticar com o provedor da IA. Avise um administrador.",
    };
  }

  if (
    lower.includes("fetch failed") ||
    lower.includes("network") ||
    lower.includes("timeout") ||
    lower.includes("aborted") ||
    lower.includes("econnreset")
  ) {
    return {
      kind: "network",
      message:
        "Falha de conexão com o servidor. Verifique sua internet e tente novamente.",
    };
  }

  return {
    kind: "unknown",
    message: text || FALLBACK_MESSAGE,
  };
}

export function classifyClientError(error: unknown): ChatErrorInfo {
  const info = classifyChatError(error);
  if (info.kind === "unknown") {
    const trimmed = info.message.trim();
    if (!trimmed || trimmed === "An error occurred." || /^\{?".*"\}?$/.test(trimmed)) {
      return { kind: "unknown", message: FALLBACK_MESSAGE };
    }
  }
  return info;
}
