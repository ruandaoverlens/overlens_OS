export const AVAILABLE_MODELS = [
  { id: "google/gemma-4-31b-it:free", label: "Gemma 4 31B (free)", context: 262_000, default: true },
  { id: "google/gemma-4-26b-a4b-it:free", label: "Gemma 4 26B MoE (free)", context: 262_000 },
  { id: "nvidia/nemotron-3-super-120b-a12b:free", label: "Nemotron 3 Super 120B (free)", context: 262_000 },
  { id: "anthropic/claude-haiku-4.5", label: "Claude Haiku 4.5 (pago)", context: 200_000 },
  { id: "anthropic/claude-sonnet-4.5", label: "Claude Sonnet 4.5 (pago)", context: 200_000 },
] as const;

export type ModelId = (typeof AVAILABLE_MODELS)[number]["id"];
export const DEFAULT_MODEL: ModelId = "google/gemma-4-31b-it:free";
export const ROUTER_MODEL: ModelId = "google/gemma-4-31b-it:free";
