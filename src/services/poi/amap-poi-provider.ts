import { MoodLog, RecommendationItem, UserProfile } from "../../models";
import { PoiProvider } from "./provider";

interface AmapPoiItem {
  id: string;
  name: string;
  address?: string;
  type?: string;
}

function getTimeBucket(): "morning" | "afternoon" | "evening" {
  const hour = new Date().getHours();
  if (hour < 11) {
    return "morning";
  }

  if (hour < 18) {
    return "afternoon";
  }

  return "evening";
}

function getKeywordPlan(user: UserProfile, latestMood?: MoodLog): Array<{ category: RecommendationItem["category"]; keyword: string; reason: string; budgetLabel: string }> {
  const timeBucket = getTimeBucket();
  const mood = latestMood?.emotion;

  const foodKeyword = timeBucket === "morning"
    ? "早餐 咖啡 简餐"
    : user.monthlyBudget <= 2500
      ? "简餐 面馆 家常菜"
      : "餐厅 轻食 家常菜";

  const relaxKeyword = mood === "stressed"
    ? "公园 绿地 江边"
    : mood === "sad"
      ? "书店 咖啡馆 公园"
      : "咖啡馆 书店 公园";

  const activityKeyword = timeBucket === "evening"
    ? "步道 夜跑 商场 展览"
    : "公园 展览 书店";

  return [
    {
      category: "food",
      keyword: foodKeyword,
      reason: "Picked to match your city, time of day, and current budget rhythm.",
      budgetLabel: user.monthlyBudget <= 2500 ? "light" : user.monthlyBudget <= 6000 ? "balanced" : "flexible"
    },
    {
      category: "relax",
      keyword: relaxKeyword,
      reason: "Picked to give you a lower-pressure nearby option for a short reset.",
      budgetLabel: "free to low"
    },
    {
      category: "activity",
      keyword: activityKeyword,
      reason: "Picked to help you shift scenes without overcomplicating the day.",
      budgetLabel: "free to optional"
    }
  ];
}

export class AmapPoiProvider implements PoiProvider {
  readonly name = "amap";

  constructor(private readonly apiKey?: string, private readonly baseUrl = "https://restapi.amap.com") {}

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  getNotes(): string[] {
    if (!this.apiKey) {
      return ["Amap key missing. Falling back to local recommendation rules."];
    }

    return ["Using Amap text search to fetch real places by city and intent keywords."];
  }

  private async search(city: string, keywords: string): Promise<AmapPoiItem[]> {
    const url = new URL("/v3/place/text", this.baseUrl);
    url.searchParams.set("key", this.apiKey ?? "");
    url.searchParams.set("keywords", keywords);
    url.searchParams.set("city", city);
    url.searchParams.set("citylimit", "true");
    url.searchParams.set("offset", "3");
    url.searchParams.set("page", "1");
    url.searchParams.set("extensions", "base");

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Amap POI request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as {
      status?: string;
      pois?: Array<{ id?: string; name?: string; address?: string; type?: string }>;
    };

    if (payload.status !== "1" || !payload.pois) {
      throw new Error("Amap POI request did not return a valid result.");
    }

    return payload.pois
      .filter((poi) => poi.id && poi.name)
      .map((poi) => ({
        id: poi.id as string,
        name: poi.name as string,
        address: poi.address,
        type: poi.type
      }));
  }

  async getRecommendations(user: UserProfile, latestMood?: MoodLog): Promise<RecommendationItem[]> {
    if (!this.apiKey) {
      throw new Error("Amap key missing.");
    }

    const plans = getKeywordPlan(user, latestMood);
    const results = await Promise.all(plans.map((plan) => this.search(user.city, plan.keyword)));

    return plans.map((plan, index) => {
      const poi = results[index][0];
      if (!poi) {
        throw new Error(`No POI found for ${plan.category}`);
      }

      return {
        id: poi.id,
        category: plan.category,
        title: poi.name,
        subtitle: poi.type || `${user.city} local pick`,
        reason: plan.reason,
        budgetLabel: plan.budgetLabel,
        source: "amap-poi",
        address: poi.address || undefined,
        mapQuery: `${user.city} ${poi.name}`
      } satisfies RecommendationItem;
    });
  }
}
