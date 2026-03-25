export type AiProviderKind = "rules" | "openai-compatible" | "ollama";

export interface AiProviderConfig {
  provider: AiProviderKind;
  model?: string;
  baseUrl?: string;
  apiKey?: string;
  ollamaModel?: string;
}

export function loadAiProviderConfig(): AiProviderConfig {
  const provider = (process.env.LIFEPILOT_AI_PROVIDER ?? "rules") as AiProviderKind;

  return {
    provider,
    model: process.env.LIFEPILOT_AI_MODEL,
    baseUrl: process.env.LIFEPILOT_AI_BASE_URL,
    apiKey: process.env.LIFEPILOT_AI_API_KEY,
    ollamaModel: process.env.LIFEPILOT_OLLAMA_MODEL ?? process.env.LIFEPILOT_AI_MODEL
  };
}
