import { Expense, ExpenseSummary, MoodAnalysisResult, MoodLog, PlannedTask, Task, UserProfile } from "../../models";

function summarizeTasks(tasks: Task[]): string {
  if (!tasks.length) {
    return "No pending tasks.";
  }

  return tasks.map((task) => `${task.title} [${task.priority}, ${task.estimatedMinutes}m]`).join("; ");
}

function summarizeHabits(user: UserProfile): string {
  return user.habits.length ? user.habits.join(", ") : "No habits set.";
}

export function buildTaskPlanningPrompt(user: UserProfile, tasks: Task[]): string {
  return [
    `You are LifePilot, an assistant that helps users decide what to do today.`,
    `User: ${user.nickname}, city: ${user.city}, focus window: ${user.preferredFocusWindow}.`,
    `Wake time: ${user.wakeTime}, sleep time: ${user.sleepTime}.`,
    `Habits: ${summarizeHabits(user)}.`,
    `Pending tasks: ${summarizeTasks(tasks)}.`,
    `Return a prioritized task plan with recommended time slots and short reasons.`
  ].join(" ");
}

export function buildExpensePrompt(user: UserProfile, expenses: Expense[], summary: ExpenseSummary): string {
  const topCategories = summary.topCategories.length
    ? summary.topCategories.map((item) => `${item.category}: ${item.total}`).join(", ")
    : "No expense categories yet.";

  return [
    `You are LifePilot, an assistant that helps users manage everyday spending.`,
    `User monthly budget: ${user.monthlyBudget}.`,
    `Logged expenses count: ${expenses.length}.`,
    `Total spent: ${summary.totalSpent}, budget usage: ${summary.budgetUsageRate}%.`,
    `Top categories: ${topCategories}.`,
    `Return 1-3 practical savings suggestions grounded in small daily actions.`
  ].join(" ");
}

export function buildMoodPrompt(message: string): string {
  return [
    `You are LifePilot, a supportive everyday assistant.`,
    `Analyze the emotional tone of this user message without making medical claims.`,
    `Message: ${message}`,
    `Return emotion, confidence, and two short gentle suggestions.`
  ].join(" ");
}

export function buildDailyFocusPrompt(
  user: UserProfile,
  plannedTasks: PlannedTask[],
  expenseSummary: ExpenseSummary,
  latestMood?: MoodLog
): string {
  const topTask = plannedTasks[0]?.title ?? "No pending task";
  const mood = latestMood ? `${latestMood.emotion} (${latestMood.score})` : "No recent mood check-in";

  return [
    `You are LifePilot, helping the user focus on the next best action for today.`,
    `User: ${user.nickname}.`,
    `Top task: ${topTask}.`,
    `Budget usage: ${expenseSummary.budgetUsageRate}%.`,
    `Latest mood: ${mood}.`,
    `Return one sentence describing the most useful focus for today.`
  ].join(" ");
}

export function buildMoodLog(userId: string, message: string, analysis: MoodAnalysisResult): MoodLog {
  return {
    id: `mood-${Date.now()}`,
    userId,
    message,
    emotion: analysis.emotion,
    score: analysis.score,
    advice: analysis.advice,
    createdAt: new Date().toISOString()
  };
}
