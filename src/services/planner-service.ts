import { PlannedTask, Task, UserProfile } from "../models";

function scoreTask(task: Task): number {
  const priorityScore = {
    high: 100,
    medium: 60,
    low: 30
  }[task.priority];

  const dueScore = task.dueDate ? 25 : 0;
  const quickWinScore = task.estimatedMinutes <= 30 ? 10 : 0;

  return priorityScore + dueScore + quickWinScore;
}

function determineSlot(task: Task, user: UserProfile): "morning" | "afternoon" | "evening" {
  if (task.priority === "high") {
    return user.preferredFocusWindow;
  }

  if (task.title.includes("晚") || task.title.includes("散步")) {
    return "evening";
  }

  return "afternoon";
}

function slotReason(slot: "morning" | "afternoon" | "evening", task: Task): string {
  if (slot === "morning") {
    return `优先在精力最好的时间完成“${task.title}”。`;
  }

  if (slot === "evening") {
    return `这个任务更适合放在收尾时段，执行压力较小。`;
  }

  return `安排在中段更容易和其他事项衔接。`;
}

export function buildTaskPlan(user: UserProfile, tasks: Task[]): PlannedTask[] {
  return tasks
    .filter((task) => task.status === "todo")
    .sort((left, right) => scoreTask(right) - scoreTask(left))
    .map((task) => {
      const recommendedSlot = determineSlot(task, user);
      return {
        ...task,
        recommendedSlot,
        reason: slotReason(recommendedSlot, task)
      };
    });
}
