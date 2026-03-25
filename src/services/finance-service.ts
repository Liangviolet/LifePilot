import { Expense, ExpenseSummary, UserProfile } from "../models";

function topCategories(expenses: Expense[]): Array<{ category: string; total: number }> {
  const totals = new Map<string, number>();

  for (const expense of expenses) {
    totals.set(expense.category, (totals.get(expense.category) ?? 0) + expense.amount);
  }

  return [...totals.entries()]
    .map(([category, total]) => ({ category, total }))
    .sort((left, right) => right.total - left.total)
    .slice(0, 3);
}

function buildSavingsTips(expenses: Expense[], topItems: Array<{ category: string; total: number }>): string[] {
  const tips: string[] = [];

  const takeawaySpent = expenses
    .filter((expense) => expense.category === "外卖")
    .reduce((total, expense) => total + expense.amount, 0);

  const coffeeSpent = expenses
    .filter((expense) => expense.category === "咖啡")
    .reduce((total, expense) => total + expense.amount, 0);

  if (takeawaySpent >= 30) {
    tips.push("这段时间外卖支出偏高，可以尝试每周至少准备 2 次简单餐食。");
  }

  if (coffeeSpent >= 20) {
    tips.push("咖啡消费开始累积了，可以把一部分替换成自带饮品。");
  }

  if (tips.length === 0 && topItems[0]) {
    tips.push(`目前支出主要集中在${topItems[0].category}，建议先观察这类消费是否有可替代方案。`);
  }

  if (tips.length === 0) {
    tips.push("本周消费比较平稳，继续保持现在的节奏就很好。");
  }

  return tips;
}

export function summarizeExpenses(user: UserProfile, expenses: Expense[]): ExpenseSummary {
  const totalSpent = expenses.reduce((total, expense) => total + expense.amount, 0);
  const budgetUsageRate = user.monthlyBudget > 0 ? Number(((totalSpent / user.monthlyBudget) * 100).toFixed(1)) : 0;
  const topItems = topCategories(expenses);

  return {
    totalSpent,
    budgetUsageRate,
    topCategories: topItems,
    savingsTips: buildSavingsTips(expenses, topItems)
  };
}
