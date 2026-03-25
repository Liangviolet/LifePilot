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

export class OpenAiCompatibleProvider extends BaseLlmAiProvider {
  readonly name = "openai-compatible";

  constructor(
    private readonly config: {
      configuredProvider: string;
      baseUrl: string;
      apiKey?: string;
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
        `Using OpenAI-compatible endpoint: ${this.config.baseUrl}`,
        `Model: ${this.config.model}`,
        "Compatible with providers such as OpenAI, OpenRouter, DeepSeek-compatible gateways, and self-hosted OpenAI-style APIs."
      ]
    };
  }

  private async callJson<T>(prompt: string, schemaHint: string): Promise<T> {
    const response = await fetch(`${this.config.baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(this.config.apiKey ? { Authorization: `Bearer ${this.config.apiKey}` } : {})
      },
      body: JSON.stringify({
        model: this.config.model,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: `Return only valid JSON. ${schemaHint}`
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI-compatible provider failed with status ${response.status}`);
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("No content returned from OpenAI-compatible provider.");
    }

    return parseJsonResponse<T>(content);
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
