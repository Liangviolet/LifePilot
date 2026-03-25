import { AiProviderStatus, Expense, ExpenseSummary, MoodAnalysisResult, MoodLog, PlannedTask, Task, UserProfile } from "../../models";

export interface AiProvider {
  readonly name: string;
  getStatus(): AiProviderStatus;
  planTasks(user: UserProfile, tasks: Task[]): Promise<PlannedTask[]>;
  summarizeExpenses(user: UserProfile, expenses: Expense[]): Promise<ExpenseSummary>;
  analyzeMood(message: string): Promise<MoodAnalysisResult>;
  generateDailyFocus(
    user: UserProfile,
    plannedTasks: PlannedTask[],
    expenseSummary: ExpenseSummary,
    latestMood?: MoodLog
  ): Promise<string>;
}
