import { MoodLog, RecommendationItem, UserProfile } from "../models";

function getTimeBucket(date: Date): "morning" | "afternoon" | "evening" {
  const hour = date.getHours();
  if (hour < 11) {
    return "morning";
  }

  if (hour < 18) {
    return "afternoon";
  }

  return "evening";
}

function getBudgetLabel(monthlyBudget: number): "light" | "balanced" | "flexible" {
  if (monthlyBudget <= 2500) {
    return "light";
  }

  if (monthlyBudget <= 6000) {
    return "balanced";
  }

  return "flexible";
}

function buildFoodRecommendation(
  user: UserProfile,
  budgetLabel: "light" | "balanced" | "flexible",
  timeBucket: "morning" | "afternoon" | "evening",
  latestMood?: MoodLog
): RecommendationItem {
  const mood = latestMood?.emotion;

  if (timeBucket === "morning") {
    return {
      id: "food-breakfast",
      category: "food",
      title: `${user.city} breakfast reset`,
      subtitle: budgetLabel === "light" ? "Simple soy milk + bun combo" : "Warm breakfast cafe stop",
      reason: mood === "stressed"
        ? "A simple, predictable breakfast helps you start with lower decision fatigue."
        : "Starting with a steady breakfast makes your morning plan easier to hold.",
      budgetLabel
    };
  }

  if (budgetLabel === "light") {
    return {
      id: "food-light",
      category: "food",
      title: `${user.city} budget-friendly meal`,
      subtitle: "Look for a quick noodle, rice bowl, or neighborhood set meal",
      reason: "This keeps spending under control while still giving you a solid energy reset.",
      budgetLabel
    };
  }

  if (budgetLabel === "flexible") {
    return {
      id: "food-flexible",
      category: "food",
      title: `${user.city} comfort dinner pick`,
      subtitle: "Choose one place you already trust instead of scrolling endlessly",
      reason: "A reliable favorite saves time and protects your mental bandwidth.",
      budgetLabel
    };
  }

  return {
    id: "food-balanced",
    category: "food",
    title: `${user.city} balanced meal idea`,
    subtitle: "Pick a sit-down spot with vegetables + protein instead of pure convenience food",
    reason: "It balances mood, cost, and energy better than an impulse order.",
    budgetLabel
  };
}

function buildRelaxRecommendation(
  user: UserProfile,
  timeBucket: "morning" | "afternoon" | "evening",
  latestMood?: MoodLog
): RecommendationItem {
  const mood = latestMood?.emotion;

  if (mood === "stressed") {
    return {
      id: "relax-stressed",
      category: "relax",
      title: `${user.city} low-pressure break`,
      subtitle: timeBucket === "evening" ? "Take a short neighborhood walk without headphones" : "Step out for a 10-minute quiet reset",
      reason: "Your recent mood suggests recovery matters more than stimulation right now.",
      budgetLabel: "mostly free"
    };
  }

  if (mood === "sad") {
    return {
      id: "relax-sad",
      category: "relax",
      title: `${user.city} gentle mood lift`,
      subtitle: "Choose a bright cafe corner, bookstore, or riverside route for a short change of scene",
      reason: "A small environment shift often helps more than staying in the same emotional space.",
      budgetLabel: "low"
    };
  }

  return {
    id: "relax-neutral",
    category: "relax",
    title: `${user.city} reset window`,
    subtitle: timeBucket === "evening" ? "Do one easy ritual before bed" : "Add a short break between your focus blocks",
    reason: "A lighter reset now will help the rest of your day feel less crowded.",
    budgetLabel: "free"
  };
}

function buildActivityRecommendation(
  user: UserProfile,
  timeBucket: "morning" | "afternoon" | "evening",
  latestMood?: MoodLog
): RecommendationItem {
  const mood = latestMood?.emotion;
  const habitHint = user.habits[0] ?? "one small routine";

  if (mood === "positive") {
    return {
      id: "activity-positive",
      category: "activity",
      title: `${user.city} momentum activity`,
      subtitle: timeBucket === "evening" ? "Use the good energy for a short social or outdoor plan" : "Schedule one meaningful task outside your usual loop",
      reason: "Your recent mood suggests this is a good window to convert energy into momentum.",
      budgetLabel: "optional spend"
    };
  }

  return {
    id: "activity-routine",
    category: "activity",
    title: `${user.city} steady routine move`,
    subtitle: `Anchor today with ${habitHint}`,
    reason: "A familiar routine is often the easiest way to keep the day from drifting.",
    budgetLabel: "free"
  };
}

export function buildLocalRecommendations(user: UserProfile, latestMood?: MoodLog): RecommendationItem[] {
  const now = new Date();
  const timeBucket = getTimeBucket(now);
  const budgetLabel = getBudgetLabel(user.monthlyBudget);

  return [
    buildFoodRecommendation(user, budgetLabel, timeBucket, latestMood),
    buildRelaxRecommendation(user, timeBucket, latestMood),
    buildActivityRecommendation(user, timeBucket, latestMood)
  ];
}
