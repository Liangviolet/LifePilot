import { DashboardSnapshot } from "../models";
import { repository } from "../data/db";
import { generateDailyFocus, generateExpenseSummary, generateTaskPlan } from "./ai/service";

export function buildDashboard(userId: string): DashboardSnapshot | null {
  const user = repository.getUserById(userId);
  if (!user) {
    return null;
  }

  const userTasks = repository.getTasksByUserId(userId);
  const userExpenses = repository.getExpensesByUserId(userId);
  const userMood = repository.getLatestMoodByUserId(userId) ?? undefined;

  const plannedTasks = generateTaskPlan(user, userTasks);
  const expenseSummary = generateExpenseSummary(user, userExpenses);
  const dailyFocus = generateDailyFocus(user, plannedTasks, expenseSummary, userMood);

  return {
    user,
    plannedTasks,
    expenseSummary,
    latestMood: userMood,
    dailyFocus
  };
}
