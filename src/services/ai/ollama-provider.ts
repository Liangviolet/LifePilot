import { AiProviderStatus, Expense, ExpenseSummary, MoodAnalysisResult, MoodLog, PlannedTask, Task, UserProfile } from "../../models";
import {
  buildDailyFocusPrompt,
  buildExpensePrompt,
  buildMoodPrompt,
  buildTaskPlanningPrompt
} from "./prompt-builder";
import { parseJsonResponse } from "./json";
import { BaseLlmAiProvider } from "./base-llm-provider";
import { DailyFocusResponse, ExpenseSummaryResponse, MoodResponse, TaskPlanResponse } from "./types";

export class OllamaProvider extends BaseLlmAiProvider {
  readonly name = "ollama";

  constructor(
    private readonly config: {
      configuredProvider: string;
      baseUrl: string;
      model: string;
    }
  ) {
    super();
  }

  getStatus(): AiProviderStatus {
    return {
      configuredProvider: this.config.configuredProvider,
      activeProvider: this.name,
      mode: "llm-ready",
      ready: Boolean(this.config.baseUrl && this.config.model),
      notes: [
        `Using Ollama endpoint: ${this.config.baseUrl}`,
        `Model: ${this.config.model}`,
        "Suitable for local models served by Ollama."
      ]
    };
  }

  private async callJson<T>(prompt: string, schemaHint: string): Promise<T> {
    const response = await fetch(`${this.config.baseUrl.replace(/\/$/, "")}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: this.config.model,
        stream: false,
        prompt: `Return only valid JSON. ${schemaHint}\n\n${prompt}`
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama provider failed with status ${response.status}`);
    }

    const payload = (await response.json()) as { response?: string };
    if (!payload.response) {
      throw new Error("No content returned from Ollama provider.");
    }

    return parseJsonResponse<T>(payload.response);
  }

  async planTasksWithModel(user: UserProfile, tasks: Task[]): Promise<PlannedTask[]> {
    const prompt = buildTaskPlanningPrompt(user, tasks);
    const result = await this.callJson<TaskPlanResponse>(
      prompt,
      'Schema: {"plannedTasks":[{"id":"string","userId":"string","title":"string","priority":"low|medium|high","dueDate":"string|optional","estimatedMinutes":30,"status":"todo|done","recommendedSlot":"morning|afternoon|evening","reason":"string"}]}'
    );
    return result.plannedTasks;
  }

  async summarizeExpensesWithModel(user: UserProfile, expenses: Expense[]): Promise<ExpenseSummary> {
    const fallbackSummary = await this.fallbackProvider.summarizeExpenses(user, expenses);
    const prompt = buildExpensePrompt(user, expenses, fallbackSummary);
    const result = await this.callJson<ExpenseSummaryResponse>(
      prompt,
      'Schema: {"expenseSummary":{"totalSpent":123,"budgetUsageRate":12.3,"topCategories":[{"category":"string","total":12}],"savingsTips":["string"]}}'
    );
    return result.expenseSummary;
  }

  async analyzeMoodWithModel(message: string): Promise<MoodAnalysisResult> {
    const prompt = buildMoodPrompt(message);
    const result = await this.callJson<MoodResponse>(
      prompt,
      'Schema: {"analysis":{"emotion":"positive|neutral|stressed|sad","score":0.8,"advice":["string","string"]}}'
    );
    return result.analysis;
  }

  async generateDailyFocusWithModel(
    user: UserProfile,
    plannedTasks: PlannedTask[],
    expenseSummary: ExpenseSummary,
    latestMood?: MoodLog
  ): Promise<string> {
    const prompt = buildDailyFocusPrompt(user, plannedTasks, expenseSummary, latestMood);
    const result = await this.callJson<DailyFocusResponse>(prompt, 'Schema: {"dailyFocus":"string"}');
    return result.dailyFocus;
  }
}
