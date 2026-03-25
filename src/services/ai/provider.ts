import { AiProviderStatus, Expense, ExpenseSummary, MoodAnalysisResult, MoodLog, PlannedTask, Task, UserProfile } from "../../models";

export interface AiProvider {
  readonly name: string;
  getStatus(): AiProviderStatus;
  planTasks(user: UserProfile, tasks: Task[]): PlannedTask[];
  summarizeExpenses(user: UserProfile, expenses: Expense[]): ExpenseSummary;
  analyzeMood(message: string): MoodAnalysisResult;
  generateDailyFocus(user: UserProfile, plannedTasks: PlannedTask[], expenseSummary: ExpenseSummary, latestMood?: MoodLog): string;
}
