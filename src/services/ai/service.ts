import { AiProviderStatus, Expense, ExpenseSummary, MoodAnalysisResult, MoodLog, PlannedTask, Task, UserProfile } from "../../models";
import { buildMoodLog } from "./prompt-builder";
import { AiProvider } from "./provider";
import { RulesAiProvider } from "./rules-provider";

const provider: AiProvider = new RulesAiProvider();

export function getAiStatus(): AiProviderStatus {
  return provider.getStatus();
}

export function generateTaskPlan(user: UserProfile, tasks: Task[]): PlannedTask[] {
  return provider.planTasks(user, tasks);
}

export function generateExpenseSummary(user: UserProfile, expenses: Expense[]): ExpenseSummary {
  return provider.summarizeExpenses(user, expenses);
}

export function analyzeMoodWithProvider(message: string): MoodAnalysisResult {
  return provider.analyzeMood(message);
}

export function createMoodLog(userId: string, message: string): MoodLog {
  const analysis = provider.analyzeMood(message);
  return buildMoodLog(userId, message, analysis);
}

export function generateDailyFocus(
  user: UserProfile,
  plannedTasks: PlannedTask[],
  expenseSummary: ExpenseSummary,
  latestMood?: MoodLog
): string {
  return provider.generateDailyFocus(user, plannedTasks, expenseSummary, latestMood);
}
