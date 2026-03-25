import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { Expense, MoodLog, Task, UserProfile } from "../models";

const dataDir = path.resolve(process.cwd(), "data");
const dbPath = path.join(dataDir, "lifepilot.db");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new Database(dbPath);

db.pragma("journal_mode = WAL");

export function initializeDatabase(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      nickname TEXT NOT NULL,
      city TEXT NOT NULL,
      monthly_budget REAL NOT NULL,
      wake_time TEXT NOT NULL,
      sleep_time TEXT NOT NULL,
      preferred_focus_window TEXT NOT NULL,
      habits_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      priority TEXT NOT NULL,
      due_date TEXT,
      estimated_minutes INTEGER NOT NULL,
      status TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      note TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS moods (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      message TEXT NOT NULL,
      emotion TEXT NOT NULL,
      score REAL NOT NULL,
      advice_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `);

  seedDatabase();
}

function seedDatabase(): void {
  const existing = db.prepare("SELECT COUNT(1) AS count FROM users").get() as { count: number };
  if (existing.count > 0) {
    return;
  }

  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO users (
      id, nickname, city, monthly_budget, wake_time, sleep_time, preferred_focus_window, habits_json
    ) VALUES (
      @id, @nickname, @city, @monthlyBudget, @wakeTime, @sleepTime, @preferredFocusWindow, @habitsJson
    )
  `).run({
    id: "demo-user",
    nickname: "Pilot",
    city: "Shanghai",
    monthlyBudget: 4000,
    wakeTime: "07:30",
    sleepTime: "23:30",
    preferredFocusWindow: "morning",
    habitsJson: JSON.stringify(["晨间整理", "晚间散步"])
  });

  const insertTask = db.prepare(`
    INSERT INTO tasks (id, user_id, title, priority, due_date, estimated_minutes, status)
    VALUES (@id, @userId, @title, @priority, @dueDate, @estimatedMinutes, @status)
  `);

  insertTask.run({
    id: "task-1",
    userId: "demo-user",
    title: "完成产品首页草图",
    priority: "high",
    dueDate: now,
    estimatedMinutes: 90,
    status: "todo"
  });

  insertTask.run({
    id: "task-2",
    userId: "demo-user",
    title: "整理本周采购清单",
    priority: "medium",
    dueDate: null,
    estimatedMinutes: 30,
    status: "todo"
  });

  insertTask.run({
    id: "task-3",
    userId: "demo-user",
    title: "晚间散步 30 分钟",
    priority: "low",
    dueDate: null,
    estimatedMinutes: 30,
    status: "todo"
  });

  const insertExpense = db.prepare(`
    INSERT INTO expenses (id, user_id, amount, category, note, created_at)
    VALUES (@id, @userId, @amount, @category, @note, @createdAt)
  `);

  insertExpense.run({
    id: "expense-1",
    userId: "demo-user",
    amount: 38,
    category: "外卖",
    note: "午餐",
    createdAt: now
  });

  insertExpense.run({
    id: "expense-2",
    userId: "demo-user",
    amount: 22,
    category: "咖啡",
    note: "下午提神",
    createdAt: now
  });

  insertExpense.run({
    id: "expense-3",
    userId: "demo-user",
    amount: 56,
    category: "出行",
    note: "打车",
    createdAt: now
  });
}

function mapUser(row: {
  id: string;
  nickname: string;
  city: string;
  monthly_budget: number;
  wake_time: string;
  sleep_time: string;
  preferred_focus_window: UserProfile["preferredFocusWindow"];
  habits_json: string;
}): UserProfile {
  return {
    id: row.id,
    nickname: row.nickname,
    city: row.city,
    monthlyBudget: row.monthly_budget,
    wakeTime: row.wake_time,
    sleepTime: row.sleep_time,
    preferredFocusWindow: row.preferred_focus_window,
    habits: JSON.parse(row.habits_json) as string[]
  };
}

function mapTask(row: {
  id: string;
  user_id: string;
  title: string;
  priority: Task["priority"];
  due_date: string | null;
  estimated_minutes: number;
  status: Task["status"];
}): Task {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    priority: row.priority,
    dueDate: row.due_date ?? undefined,
    estimatedMinutes: row.estimated_minutes,
    status: row.status
  };
}

function mapExpense(row: {
  id: string;
  user_id: string;
  amount: number;
  category: string;
  note: string | null;
  created_at: string;
}): Expense {
  return {
    id: row.id,
    userId: row.user_id,
    amount: row.amount,
    category: row.category,
    note: row.note ?? undefined,
    createdAt: row.created_at
  };
}

function mapMood(row: {
  id: string;
  user_id: string;
  message: string;
  emotion: MoodLog["emotion"];
  score: number;
  advice_json: string;
  created_at: string;
}): MoodLog {
  return {
    id: row.id,
    userId: row.user_id,
    message: row.message,
    emotion: row.emotion,
    score: row.score,
    advice: JSON.parse(row.advice_json) as string[],
    createdAt: row.created_at
  };
}

export const repository = {
  getUserById(userId: string): UserProfile | null {
    const row = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as
      | Parameters<typeof mapUser>[0]
      | undefined;
    return row ? mapUser(row) : null;
  },

  createUser(user: UserProfile): UserProfile {
    db.prepare(`
      INSERT INTO users (
        id, nickname, city, monthly_budget, wake_time, sleep_time, preferred_focus_window, habits_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      user.id,
      user.nickname,
      user.city,
      user.monthlyBudget,
      user.wakeTime,
      user.sleepTime,
      user.preferredFocusWindow,
      JSON.stringify(user.habits)
    );
    return user;
  },

  updateUser(user: UserProfile): UserProfile {
    db.prepare(`
      UPDATE users
      SET nickname = ?, city = ?, monthly_budget = ?, wake_time = ?, sleep_time = ?, preferred_focus_window = ?, habits_json = ?
      WHERE id = ?
    `).run(
      user.nickname,
      user.city,
      user.monthlyBudget,
      user.wakeTime,
      user.sleepTime,
      user.preferredFocusWindow,
      JSON.stringify(user.habits),
      user.id
    );
    return user;
  },

  getTasksByUserId(userId: string): Task[] {
    const rows = db.prepare("SELECT * FROM tasks WHERE user_id = ? ORDER BY rowid ASC").all(userId) as Array<
      Parameters<typeof mapTask>[0]
    >;
    return rows.map(mapTask);
  },

  createTask(task: Task): Task {
    db.prepare(`
      INSERT INTO tasks (id, user_id, title, priority, due_date, estimated_minutes, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(task.id, task.userId, task.title, task.priority, task.dueDate ?? null, task.estimatedMinutes, task.status);
    return task;
  },

  getExpensesByUserId(userId: string): Expense[] {
    const rows = db
      .prepare("SELECT * FROM expenses WHERE user_id = ? ORDER BY datetime(created_at) DESC")
      .all(userId) as Array<Parameters<typeof mapExpense>[0]>;
    return rows.map(mapExpense);
  },

  createExpense(expense: Expense): Expense {
    db.prepare(`
      INSERT INTO expenses (id, user_id, amount, category, note, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(expense.id, expense.userId, expense.amount, expense.category, expense.note ?? null, expense.createdAt);
    return expense;
  },

  createMoodLog(mood: MoodLog): MoodLog {
    db.prepare(`
      INSERT INTO moods (id, user_id, message, emotion, score, advice_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(mood.id, mood.userId, mood.message, mood.emotion, mood.score, JSON.stringify(mood.advice), mood.createdAt);
    return mood;
  },

  getLatestMoodByUserId(userId: string): MoodLog | null {
    const row = db
      .prepare("SELECT * FROM moods WHERE user_id = ? ORDER BY datetime(created_at) DESC LIMIT 1")
      .get(userId) as Parameters<typeof mapMood>[0] | undefined;
    return row ? mapMood(row) : null;
  }
};
