export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "todo" | "done";
export type EmotionType = "positive" | "neutral" | "stressed" | "sad";

export interface UserProfile {
  id: string;
  nickname: string;
  city: string;
  monthlyBudget: number;
  wakeTime: string;
  sleepTime: string;
  preferredFocusWindow: "morning" | "afternoon" | "evening";
  habits: string[];
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  priority: TaskPriority;
  dueDate?: string;
  estimatedMinutes: number;
  status: TaskStatus;
}

export interface Expense {
  id: string;
  userId: string;
  amount: number;
  category: string;
  note?: string;
  createdAt: string;
}

export interface MoodLog {
  id: string;
  userId: string;
  message: string;
  emotion: EmotionType;
  score: number;
  advice: string[];
  createdAt: string;
}

export interface PlannedTask extends Task {
  recommendedSlot: "morning" | "afternoon" | "evening";
  reason: string;
}

export interface ExpenseSummary {
  totalSpent: number;
  budgetUsageRate: number;
  topCategories: Array<{ category: string; total: number }>;
  savingsTips: string[];
}

export interface MoodAnalysisResult {
  emotion: EmotionType;
  score: number;
  advice: string[];
}

export interface AiProviderStatus {
  configuredProvider: string;
  activeProvider: string;
  mode: "rules" | "llm-ready";
  ready: boolean;
  notes: string[];
}

export interface RecommendationItem {
  id: string;
  category: "food" | "relax" | "activity";
  title: string;
  subtitle: string;
  reason: string;
  budgetLabel: string;
}

export interface DashboardSnapshot {
  user: UserProfile;
  plannedTasks: PlannedTask[];
  expenseSummary: ExpenseSummary;
  latestMood?: MoodLog;
  dailyFocus: string;
  recommendations: RecommendationItem[];
}
