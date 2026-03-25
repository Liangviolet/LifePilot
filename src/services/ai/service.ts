import { AiProviderStatus, Expense, ExpenseSummary, MoodAnalysisResult, MoodLog, PlannedTask, Task, UserProfile } from "../../models";
import { buildMoodLog } from "./prompt-builder";
import { loadAiProviderConfig } from "./config";
import { AiProvider } from "./provider";
import { RulesAiProvider } from "./rules-provider";
import { OpenAiCompatibleProvider } from "./openai-compatible-provider";
import { OllamaProvider } from "./ollama-provider";

function createProvider(): AiProvider {
  const config = loadAiProviderConfig();

  if (config.provider === "openai-compatible" && config.baseUrl && config.model) {
    return new OpenAiCompatibleProvider({
      configuredProvider: config.provider,
      baseUrl: config.baseUrl,
      apiKey: config.apiKey,
      model: config.model
    });
  }

  if (config.provider === "ollama" && config.baseUrl && config.ollamaModel) {
    return new OllamaProvider({
      configuredProvider: config.provider,
      baseUrl: config.baseUrl,
      model: config.ollamaModel
    });
  }

  return new RulesAiProvider();
}

const provider: AiProvider = createProvider();

export function getAiStatus(): AiProviderStatus {
  return provider.getStatus();
}

export async function generateTaskPlan(user: UserProfile, tasks: Task[]): Promise<PlannedTask[]> {
  return provider.planTasks(user, tasks);
}

export async function generateExpenseSummary(user: UserProfile, expenses: Expense[]): Promise<ExpenseSummary> {
  return provider.summarizeExpenses(user, expenses);
}

export async function analyzeMoodWithProvider(message: string): Promise<MoodAnalysisResult> {
  return provider.analyzeMood(message);
}

export async function createMoodLog(userId: string, message: string): Promise<MoodLog> {
  const analysis = await provider.analyzeMood(message);
  return buildMoodLog(userId, message, analysis);
}

export async function generateDailyFocus(
  user: UserProfile,
  plannedTasks: PlannedTask[],
  expenseSummary: ExpenseSummary,
  latestMood?: MoodLog
): Promise<string> {
  return provider.generateDailyFocus(user, plannedTasks, expenseSummary, latestMood);
}
