export interface DataQualityDTO {
  review_count_total: number;
  review_count_eligible: number;
  confidence: number;
  flags: string[];
}

export interface SnapshotDriverDTO {
  type: string;
  category: string;
  strength: number;
}

export interface SnapshotSectionDTO {
  decision_label: string;
  decision_score: number;
  decision_confidence: number;
  key_drivers: SnapshotDriverDTO[];
}

export interface CategoryDistributionItemDTO {
  category: string;
  share: number;
  mentions: number;
}

export interface SentimentCategoryItemDTO {
  category: string;
  positive: number;
  negative: number;
  net: number;
  impact_rank: number;
}

export interface TopThemeItemDTO {
  theme_code: string;
  label: string;
  category: string;
  polarity: string;
  coverage: number;
  impact: number;
}

export interface EvidenceReviewMetaDTO {
  created_at: string | null;
  playtime_minutes: number;
  votes_up: number;
}

export interface EvidenceBlockDTO {
  id: string;
  category: string;
  theme_code: string | null;
  polarity: string;
  quote: string;
  review_meta: EvidenceReviewMetaDTO;
  evidence_score: number;
}

export interface TrendSummaryDTO {
  direction: string;
  up_categories: number;
  down_categories: number;
  flat_categories: number;
  limited_categories: number;
}

export interface TrendSpikeDTO {
  day: string | null;
  type: string | null;
  category: string | null;
  zscore_negative: number | null;
}

export interface TrendSectionDTO {
  summary: TrendSummaryDTO;
  spikes: TrendSpikeDTO[];
}

export interface ReviewerSegmentDTO {
  segment: string;
  segment_label: string;
  sample: number;
  net_sentiment: number;
  top_risk: string | null;
}

export interface FinalRecommendationInputsDTO {
  risk_index: number;
  confidence: number;
  trend_direction: string;
}

export interface FinalRecommendationSectionDTO {
  label: string;
  reason_summary: string;
  conditions_to_buy: string[];
  watch_items: string[];
  inputs: FinalRecommendationInputsDTO;
}

export interface ReportV1DTO {
  schema_version: string;
  app_id: number;
  snapshot_at: string;
  window_days: number;
  data_quality: DataQualityDTO;
  snapshot: SnapshotSectionDTO;
  category_distribution: CategoryDistributionItemDTO[];
  sentiment_x_category: SentimentCategoryItemDTO[];
  top_themes: TopThemeItemDTO[];
  evidence_blocks: EvidenceBlockDTO[];
  trend: TrendSectionDTO;
  reviewer_segment: ReviewerSegmentDTO[];
  final_recommendation: FinalRecommendationSectionDTO;
}
