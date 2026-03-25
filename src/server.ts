import cors from "cors";
import express from "express";
import { expenses, moods, tasks, users } from "./data/store";
import { Expense, Task, UserProfile } from "./models";
import { buildDashboard } from "./services/dashboard-service";
import { summarizeExpenses } from "./services/finance-service";
import { toMoodLog } from "./services/mood-service";
import { buildTaskPlan } from "./services/planner-service";
import { createId } from "./utils/id";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_request, response) => {
  response.json({ ok: true, service: "LifePilot API" });
});

app.get("/api/users/:userId", (request, response) => {
  const user = users.get(request.params.userId);
  if (!user) {
    response.status(404).json({ message: "User not found" });
    return;
  }

  response.json(user);
});

app.post("/api/users", (request, response) => {
  const payload = request.body as Partial<UserProfile>;
  const user: UserProfile = {
    id: payload.id ?? createId("user"),
    nickname: payload.nickname ?? "New Pilot",
    city: payload.city ?? "Shanghai",
    monthlyBudget: payload.monthlyBudget ?? 3000,
    wakeTime: payload.wakeTime ?? "07:30",
    sleepTime: payload.sleepTime ?? "23:30",
    preferredFocusWindow: payload.preferredFocusWindow ?? "morning",
    habits: payload.habits ?? []
  };

  users.set(user.id, user);
  response.status(201).json(user);
});

app.post("/api/tasks", (request, response) => {
  const payload = request.body as Partial<Task>;

  if (!payload.userId || !users.has(payload.userId) || !payload.title) {
    response.status(400).json({ message: "userId and title are required" });
    return;
  }

  const task: Task = {
    id: createId("task"),
    userId: payload.userId,
    title: payload.title,
    priority: payload.priority ?? "medium",
    dueDate: payload.dueDate,
    estimatedMinutes: payload.estimatedMinutes ?? 30,
    status: payload.status ?? "todo"
  };

  tasks.push(task);
  response.status(201).json(task);
});

app.get("/api/tasks/:userId/plan", (request, response) => {
  const user = users.get(request.params.userId);
  if (!user) {
    response.status(404).json({ message: "User not found" });
    return;
  }

  const userTasks = tasks.filter((task) => task.userId === user.id);
  response.json(buildTaskPlan(user, userTasks));
});

app.post("/api/expenses", (request, response) => {
  const payload = request.body as Partial<Expense>;

  if (!payload.userId || !users.has(payload.userId) || payload.amount === undefined || !payload.category) {
    response.status(400).json({ message: "userId, amount and category are required" });
    return;
  }

  const expense: Expense = {
    id: createId("expense"),
    userId: payload.userId,
    amount: payload.amount,
    category: payload.category,
    note: payload.note,
    createdAt: payload.createdAt ?? new Date().toISOString()
  };

  expenses.push(expense);
  response.status(201).json(expense);
});

app.get("/api/expenses/:userId/summary", (request, response) => {
  const user = users.get(request.params.userId);
  if (!user) {
    response.status(404).json({ message: "User not found" });
    return;
  }

  const userExpenses = expenses.filter((expense) => expense.userId === user.id);
  response.json(summarizeExpenses(user, userExpenses));
});

app.post("/api/moods/analyze", (request, response) => {
  const payload = request.body as { userId?: string; message?: string };

  if (!payload.userId || !users.has(payload.userId) || !payload.message) {
    response.status(400).json({ message: "userId and message are required" });
    return;
  }

  const moodLog = toMoodLog(payload.userId, payload.message);
  moods.push(moodLog);
  response.status(201).json(moodLog);
});

app.get("/api/dashboard/:userId", (request, response) => {
  const dashboard = buildDashboard(request.params.userId);
  if (!dashboard) {
    response.status(404).json({ message: "User not found" });
    return;
  }

  response.json(dashboard);
});

const port = Number(process.env.PORT ?? 3000);

app.listen(port, () => {
  console.log(`LifePilot API running on http://localhost:${port}`);
});
