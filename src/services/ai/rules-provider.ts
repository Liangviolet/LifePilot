import { Expense, ExpenseSummary, MoodAnalysisResult, MoodLog, PlannedTask, Task, UserProfile } from "../../models";
import { summarizeExpenses as summarizeExpensesWithRules } from "../finance-service";
import { analyzeMood as analyzeMoodWithRules } from "../mood-service";
import { buildTaskPlan } from "../planner-service";
import {
  buildDailyFocusPrompt,
  buildExpensePrompt,
  buildMoodPrompt,
  buildTaskPlanningPrompt
} from "./prompt-builder";
import { AiProvider } from "./provider";

function generateRuleBasedDailyFocus(
  user: UserProfile,
  plannedTasks: PlannedTask[],
  expenseSummary: ExpenseSummary,
  latestMood?: MoodLog
): string {
  const topTask = plannedTasks[0];

  if (latestMood?.emotion === "stressed") {
    return topTask
      ? `Focus on just one essential task first: “${topTask.title}”. Keep the rest intentionally lighter today.`
      : `${user.nickname}, keep today light and give yourself more recovery room than usual.`;
  }

  if (expenseSummary.budgetUsageRate >= 80) {
    return `Your spending is running hot, so keep today simple and avoid impulse costs while you finish key tasks.`;
  }

  if (topTask) {
    return `Start with “${topTask.title}” during your ${topTask.recommendedSlot} focus window to create momentum early.`;
  }

  return `You have room today to reset routines, review your budget, and prepare a calmer plan for tomorrow.`;
}

export class RulesAiProvider implements AiProvider {
  readonly name = "rules";

  getStatus() {
    const configuredProvider = process.env.LIFEPILOT_AI_PROVIDER ?? "rules";
    return {
      configuredProvider,
      activeProvider: this.name,
      mode: "llm-ready" as const,
      ready: true,
      notes: [
        "Using deterministic rule-based generation.",
        "Prompt builders are in place for future LLM provider integration.",
        "Set LIFEPILOT_AI_PROVIDER in the future to switch providers without changing business routes."
      ]
    };
  }

  planTasks(user: UserProfile, tasks: Task[]): PlannedTask[] {
    buildTaskPlanningPrompt(user, tasks);
    return buildTaskPlan(user, tasks);
  }

  summarizeExpenses(user: UserProfile, expenses: Expense[]): ExpenseSummary {
    const summary = summarizeExpensesWithRules(user, expenses);
    buildExpensePrompt(user, expenses, summary);
    return summary;
  }

  analyzeMood(message: string): MoodAnalysisResult {
    buildMoodPrompt(message);
    return analyzeMoodWithRules(message);
  }

  generateDailyFocus(
    user: UserProfile,
    plannedTasks: PlannedTask[],
    expenseSummary: ExpenseSummary,
    latestMood?: MoodLog
  ): string {
    buildDailyFocusPrompt(user, plannedTasks, expenseSummary, latestMood);
    return generateRuleBasedDailyFocus(user, plannedTasks, expenseSummary, latestMood);
  }
}
