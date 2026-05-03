import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

if (!process.env.OPENROUTER_API_KEY) {
  // Não faz throw em build/import — só na chamada. Server-only.
}

export const openrouter = createOpenAICompatible({
  name: "openrouter",
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY ?? "",
  headers: {
    "HTTP-Referer": process.env.OPENROUTER_SITE_URL ?? "https://overlens-os.vercel.app",
    "X-Title": process.env.OPENROUTER_APP_NAME ?? "Overlens OS",
  },
});
