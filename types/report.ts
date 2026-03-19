export interface ThreatReport {
  _id: string;
  report_id: string;
  log_ids: string[];
  risk_score: number;
  threat_category: string;
  ai_insights: string;
  recommendations: string[];
  is_true_positive: boolean;
  created_at: string;
  source_ip: string;
}
