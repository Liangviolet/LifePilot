import { DashboardSnapshot } from "../models";
import { repository } from "../data/db";
import { generateDailyFocus, generateExpenseSummary, generateTaskPlan } from "./ai/service";
import { buildLocalRecommendations } from "./recommendation-service";

export async function buildDashboard(userId: string): Promise<DashboardSnapshot | null> {
  const user = repository.getUserById(userId);
  if (!user) {
    return null;
  }

  const userTasks = repository.getTasksByUserId(userId);
  const userExpenses = repository.getExpensesByUserId(userId);
  const userMood = repository.getLatestMoodByUserId(userId) ?? undefined;

  const plannedTasks = await generateTaskPlan(user, userTasks);
  const expenseSummary = await generateExpenseSummary(user, userExpenses);
  const dailyFocus = await generateDailyFocus(user, plannedTasks, expenseSummary, userMood);
  const recommendations = buildLocalRecommendations(user, userMood);

  return {
    user,
    plannedTasks,
    expenseSummary,
    latestMood: userMood,
    dailyFocus,
    recommendations
  };
}
