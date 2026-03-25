import { Expense, MoodLog, Task, UserProfile } from "../models";

const now = new Date().toISOString();

export const users = new Map<string, UserProfile>([
  [
    "demo-user",
    {
      id: "demo-user",
      nickname: "Pilot",
      city: "Shanghai",
      monthlyBudget: 4000,
      wakeTime: "07:30",
      sleepTime: "23:30",
      preferredFocusWindow: "morning",
      habits: ["晨间整理", "晚间散步"]
    }
  ]
]);

export const tasks: Task[] = [
  {
    id: "task-1",
    userId: "demo-user",
    title: "完成产品首页草图",
    priority: "high",
    dueDate: now,
    estimatedMinutes: 90,
    status: "todo"
  },
  {
    id: "task-2",
    userId: "demo-user",
    title: "整理本周采购清单",
    priority: "medium",
    estimatedMinutes: 30,
    status: "todo"
  },
  {
    id: "task-3",
    userId: "demo-user",
    title: "晚间散步 30 分钟",
    priority: "low",
    estimatedMinutes: 30,
    status: "todo"
  }
];

export const expenses: Expense[] = [
  {
    id: "expense-1",
    userId: "demo-user",
    amount: 38,
    category: "外卖",
    note: "午餐",
    createdAt: now
  },
  {
    id: "expense-2",
    userId: "demo-user",
    amount: 22,
    category: "咖啡",
    note: "下午提神",
    createdAt: now
  },
  {
    id: "expense-3",
    userId: "demo-user",
    amount: 56,
    category: "出行",
    note: "打车",
    createdAt: now
  }
];

export const moods: MoodLog[] = [];
