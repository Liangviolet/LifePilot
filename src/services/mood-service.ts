import { EmotionType, MoodLog } from "../models";

interface MoodAnalysisResult {
  emotion: EmotionType;
  score: number;
  advice: string[];
}

const stressedKeywords = ["累", "压力", "烦", "赶", "焦虑", "崩"];
const sadKeywords = ["难过", "低落", "委屈", "失眠", "没动力"];
const positiveKeywords = ["开心", "轻松", "满足", "顺利", "有成就"];

function includesAny(message: string, keywords: string[]): boolean {
  return keywords.some((keyword) => message.includes(keyword));
}

export function analyzeMood(message: string): MoodAnalysisResult {
  const normalized = message.trim();

  if (includesAny(normalized, stressedKeywords)) {
    return {
      emotion: "stressed",
      score: 0.78,
      advice: [
        "先把今天必须完成的事缩减到 1 到 2 件，给自己留一点缓冲。",
        "如果方便，安排 10 分钟离开屏幕，做一次短暂走动或呼吸调整。"
      ]
    };
  }

  if (includesAny(normalized, sadKeywords)) {
    return {
      emotion: "sad",
      score: 0.72,
      advice: [
        "今天先不要给自己安排太多高压任务，优先做一件最容易开始的小事。",
        "如果这种状态持续很久，可以考虑联系信任的人聊一聊。"
      ]
    };
  }

  if (includesAny(normalized, positiveKeywords)) {
    return {
      emotion: "positive",
      score: 0.82,
      advice: [
        "状态不错，可以顺手推进一件重要但一直拖着的任务。",
        "把今天让你感觉好的原因记下来，后面会很有参考价值。"
      ]
    };
  }

  return {
    emotion: "neutral",
    score: 0.58,
    advice: [
      "你的状态整体比较平稳，适合按计划推进今天的安排。",
      "如果晚上还有精力，可以做一个轻量复盘，看看今天最满意的部分是什么。"
    ]
  };
}

export function toMoodLog(userId: string, message: string): MoodLog {
  const result = analyzeMood(message);
  return {
    id: `mood-${Date.now()}`,
    userId,
    message,
    emotion: result.emotion,
    score: result.score,
    advice: result.advice,
    createdAt: new Date().toISOString()
  };
}
