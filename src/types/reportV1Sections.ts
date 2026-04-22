import type {
  CategoryDistributionItemDTO,
  EvidenceBlockDTO,
  FinalRecommendationSectionDTO,
  ReviewerSegmentDTO,
  SentimentCategoryItemDTO,
  SnapshotSectionDTO,
  TopThemeItemDTO,
  TrendSectionDTO,
} from "./reportV1";

export type ReportV1SectionName =
  | "snapshot"
  | "category_distribution"
  | "sentiment_x_category"
  | "top_themes"
  | "evidence_blocks"
  | "trend"
  | "reviewer_segment"
  | "final_recommendation";

export interface ReportV1SectionEnvelope<TData> {
  schema_version: string;
  app_id: number;
  snapshot_at: string;
  section: ReportV1SectionName;
  data: TData;
}

export type SnapshotSectionEnvelope = ReportV1SectionEnvelope<SnapshotSectionDTO>;
export type CategoryDistributionSectionEnvelope = ReportV1SectionEnvelope<CategoryDistributionItemDTO[]>;
export type SentimentByCategorySectionEnvelope = ReportV1SectionEnvelope<SentimentCategoryItemDTO[]>;
export type TopThemesSectionEnvelope = ReportV1SectionEnvelope<TopThemeItemDTO[]>;
export type EvidenceBlocksSectionEnvelope = ReportV1SectionEnvelope<EvidenceBlockDTO[]>;
export type TrendSectionEnvelope = ReportV1SectionEnvelope<TrendSectionDTO>;
export type ReviewerSegmentSectionEnvelope = ReportV1SectionEnvelope<ReviewerSegmentDTO[]>;
export type FinalRecommendationSectionEnvelope = ReportV1SectionEnvelope<FinalRecommendationSectionDTO>;

