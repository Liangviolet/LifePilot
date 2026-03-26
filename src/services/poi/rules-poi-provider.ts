import { MoodLog, RecommendationItem, UserProfile } from "../../models";
import { buildRuleRecommendations } from "../recommendation-service";
import { PoiProvider } from "./provider";

export class RulesPoiProvider implements PoiProvider {
  readonly name = "rules";

  isConfigured(): boolean {
    return true;
  }

  getNotes(): string[] {
    return ["Using local rule-based recommendations."];
  }

  async getRecommendations(user: UserProfile, latestMood?: MoodLog): Promise<RecommendationItem[]> {
    return buildRuleRecommendations(user, latestMood);
  }
}
