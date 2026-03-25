import { DashboardSnapshot } from "../models";
import { repository } from "../data/db";
import { summarizeExpenses } from "./finance-service";
import { buildTaskPlan } from "./planner-service";

export function buildDashboard(userId: string): DashboardSnapshot | null {
  const user = repository.getUserById(userId);
  if (!user) {
    return null;
  }

  const userTasks = repository.getTasksByUserId(userId);
  const userExpenses = repository.getExpensesByUserId(userId);
  const userMood = repository.getLatestMoodByUserId(userId) ?? undefined;

  const plannedTasks = buildTaskPlan(user, userTasks);
  const expenseSummary = summarizeExpenses(user, userExpenses);

  const dailyFocus = plannedTasks[0]
    ? `先完成“${plannedTasks[0].title}”，这会显著减轻今天的压力。`
    : "今天没有待办任务，适合整理一下预算和生活计划。";

  return {
    user,
    plannedTasks,
    expenseSummary,
    latestMood: userMood,
    dailyFocus
  };
}
