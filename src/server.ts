import cors from "cors";
import express from "express";
import path from "node:path";
import { initializeDatabase, repository } from "./data/db";
import { Expense, Task, UserProfile } from "./models";
import { buildDashboard } from "./services/dashboard-service";
import { createMoodLog, generateExpenseSummary, generateTaskPlan, getAiStatus } from "./services/ai/service";
import { createId } from "./utils/id";

const app = express();
const publicDir = path.resolve(process.cwd(), "public");

initializeDatabase();

app.use(cors());
app.use(express.json());
app.use(express.static(publicDir));

app.get("/health", (_request, response) => {
  response.json({ ok: true, service: "LifePilot API" });
});

app.get("/api/ai/status", (_request, response) => {
  response.json(getAiStatus());
});

app.get("/api/users/:userId", (request, response) => {
  const user = repository.getUserById(request.params.userId);
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

  response.status(201).json(repository.createUser(user));
});

app.put("/api/users/:userId", (request, response) => {
  const existingUser = repository.getUserById(request.params.userId);
  if (!existingUser) {
    response.status(404).json({ message: "User not found" });
    return;
  }

  const payload = request.body as Partial<UserProfile>;
  const updatedUser: UserProfile = {
    ...existingUser,
    nickname: payload.nickname ?? existingUser.nickname,
    city: payload.city ?? existingUser.city,
    monthlyBudget: payload.monthlyBudget ?? existingUser.monthlyBudget,
    wakeTime: payload.wakeTime ?? existingUser.wakeTime,
    sleepTime: payload.sleepTime ?? existingUser.sleepTime,
    preferredFocusWindow: payload.preferredFocusWindow ?? existingUser.preferredFocusWindow,
    habits: payload.habits ?? existingUser.habits
  };

  response.json(repository.updateUser(updatedUser));
});

app.post("/api/tasks", (request, response) => {
  const payload = request.body as Partial<Task>;

  if (!payload.userId || !repository.getUserById(payload.userId) || !payload.title) {
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

  response.status(201).json(repository.createTask(task));
});

app.get("/api/tasks/:userId/plan", async (request, response) => {
  const user = repository.getUserById(request.params.userId);
  if (!user) {
    response.status(404).json({ message: "User not found" });
    return;
  }

  const userTasks = repository.getTasksByUserId(user.id);
  response.json(await generateTaskPlan(user, userTasks));
});

app.post("/api/expenses", (request, response) => {
  const payload = request.body as Partial<Expense>;

  if (!payload.userId || !repository.getUserById(payload.userId) || payload.amount === undefined || !payload.category) {
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

  response.status(201).json(repository.createExpense(expense));
});

app.get("/api/expenses/:userId/summary", async (request, response) => {
  const user = repository.getUserById(request.params.userId);
  if (!user) {
    response.status(404).json({ message: "User not found" });
    return;
  }

  const userExpenses = repository.getExpensesByUserId(user.id);
  response.json(await generateExpenseSummary(user, userExpenses));
});

app.post("/api/moods/analyze", async (request, response) => {
  const payload = request.body as { userId?: string; message?: string };

  if (!payload.userId || !repository.getUserById(payload.userId) || !payload.message) {
    response.status(400).json({ message: "userId and message are required" });
    return;
  }

  const moodLog = await createMoodLog(payload.userId, payload.message);
  response.status(201).json(repository.createMoodLog(moodLog));
});

app.get("/api/dashboard/:userId", async (request, response) => {
  const dashboard = await buildDashboard(request.params.userId);
  if (!dashboard) {
    response.status(404).json({ message: "User not found" });
    return;
  }

  response.json(dashboard);
});

app.get("*", (_request, response) => {
  response.sendFile(path.join(publicDir, "index.html"));
});

const port = Number(process.env.PORT ?? 3000);

app.listen(port, () => {
  console.log(`LifePilot API running on http://localhost:${port}`);
});
