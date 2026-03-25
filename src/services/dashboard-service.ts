import { expenses, moods, tasks, users } from "../data/store";
import { DashboardSnapshot } from "../models";
import { summarizeExpenses } from "./finance-service";
import { buildTaskPlan } from "./planner-service";

export function buildDashboard(userId: string): DashboardSnapshot | null {
  const user = users.get(userId);
  if (!user) {
    return null;
  }

  const userTasks = tasks.filter((task) => task.userId === userId);
  const userExpenses = expenses.filter((expense) => expense.userId === userId);
  const userMood = moods.filter((mood) => mood.userId === userId).at(-1);

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
