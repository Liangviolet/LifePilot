import { ExpenseSummary, MoodAnalysisResult, PlannedTask } from "../../models";

export interface TaskPlanResponse {
  plannedTasks: PlannedTask[];
}

export interface ExpenseSummaryResponse {
  expenseSummary: ExpenseSummary;
}

export interface MoodResponse {
  analysis: MoodAnalysisResult;
}

export interface DailyFocusResponse {
  dailyFocus: string;
}
