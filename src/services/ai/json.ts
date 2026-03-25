export function extractJsonBlock(content: string): string {
  const trimmed = content.trim();
  const fenceMatch = trimmed.match(/```json\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    return fenceMatch[1].trim();
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  throw new Error("Model response did not contain JSON.");
}

export function parseJsonResponse<T>(content: string): T {
  return JSON.parse(extractJsonBlock(content)) as T;
}
