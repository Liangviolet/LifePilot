import { MoodLog, RecommendationItem, UserProfile } from "../../models";
import { AmapPoiProvider } from "./amap-poi-provider";
import { RulesPoiProvider } from "./rules-poi-provider";
import { PoiProvider } from "./provider";

function createPoiProvider(): PoiProvider {
  const configured = process.env.LIFEPILOT_POI_PROVIDER ?? "rules";

  if (configured === "amap") {
    return new AmapPoiProvider(process.env.LIFEPILOT_AMAP_API_KEY, process.env.LIFEPILOT_AMAP_BASE_URL);
  }

  return new RulesPoiProvider();
}

const provider = createPoiProvider();
const fallback = new RulesPoiProvider();

export function getPoiStatus() {
  const configuredProvider = process.env.LIFEPILOT_POI_PROVIDER ?? "rules";
  return {
    configuredProvider,
    activeProvider: provider.isConfigured() ? provider.name : fallback.name,
    ready: provider.isConfigured(),
    notes: provider.getNotes()
  };
}

export async function getRecommendations(user: UserProfile, latestMood?: MoodLog): Promise<RecommendationItem[]> {
  if (!provider.isConfigured()) {
    return fallback.getRecommendations(user, latestMood);
  }

  try {
    return await provider.getRecommendations(user, latestMood);
  } catch {
    return fallback.getRecommendations(user, latestMood);
  }
}
