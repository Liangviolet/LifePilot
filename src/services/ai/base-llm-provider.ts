import { AiProviderStatus, Expense, ExpenseSummary, MoodAnalysisResult, MoodLog, PlannedTask, Task, UserProfile } from "../../models";
import { AiProvider } from "./provider";
import { RulesAiProvider } from "./rules-provider";

export abstract class BaseLlmAiProvider implements AiProvider {
  protected readonly fallbackProvider = new RulesAiProvider();
  abstract readonly name: string;

  abstract getStatus(): AiProviderStatus;

  protected abstract planTasksWithModel(user: UserProfile, tasks: Task[]): Promise<PlannedTask[]>;
  protected abstract summarizeExpensesWithModel(user: UserProfile, expenses: Expense[]): Promise<ExpenseSummary>;
  protected abstract analyzeMoodWithModel(message: string): Promise<MoodAnalysisResult>;
  protected abstract generateDailyFocusWithModel(
    user: UserProfile,
    plannedTasks: PlannedTask[],
    expenseSummary: ExpenseSummary,
    latestMood?: MoodLog
  ): Promise<string>;

  async planTasks(user: UserProfile, tasks: Task[]): Promise<PlannedTask[]> {
    try {
      return await this.planTasksWithModel(user, tasks);
    } catch {
      return this.fallbackProvider.planTasks(user, tasks);
    }
  }

  async summarizeExpenses(user: UserProfile, expenses: Expense[]): Promise<ExpenseSummary> {
    try {
      return await this.summarizeExpensesWithModel(user, expenses);
    } catch {
      return this.fallbackProvider.summarizeExpenses(user, expenses);
    }
  }

  async analyzeMood(message: string): Promise<MoodAnalysisResult> {
    try {
      return await this.analyzeMoodWithModel(message);
    } catch {
      return this.fallbackProvider.analyzeMood(message);
    }
  }

  async generateDailyFocus(
    user: UserProfile,
    plannedTasks: PlannedTask[],
    expenseSummary: ExpenseSummary,
    latestMood?: MoodLog
  ): Promise<string> {
    try {
      return await this.generateDailyFocusWithModel(user, plannedTasks, expenseSummary, latestMood);
    } catch {
      return this.fallbackProvider.generateDailyFocus(user, plannedTasks, expenseSummary, latestMood);
    }
  }
}
