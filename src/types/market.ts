export interface MarketAnalysisRequest {
  playerName: string;
  year?: string;
  cardSet?: string;
  variation?: string;
  cardNumber?: string;
  condition: string;
}

export interface MarketAnalysisResponse {
  trend: "Upward" | "Downward" | "Stable" | "Insufficient Data";
  volatility: number | null;
  liquidity: number | null;
  investment_rating: "Strong Buy" | "Buy" | "Hold" | "Avoid" | "Speculative" | "Unknown";
  last_updated: string;
} 