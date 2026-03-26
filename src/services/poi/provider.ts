import { MoodLog, RecommendationItem, UserProfile } from "../../models";

export interface PoiProvider {
  readonly name: string;
  isConfigured(): boolean;
  getNotes(): string[];
  getRecommendations(user: UserProfile, latestMood?: MoodLog): Promise<RecommendationItem[]>;
}
