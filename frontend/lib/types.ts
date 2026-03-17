export type RiskBand = "low" | "medium" | "high";
export type RiskMode = "deterministic" | "logistic";

export interface FactorExplanation {
  label: string;
  feature_key: string;
  feature_value: number;
  threshold_value: number | null;
  operator: string | null;
  impact: number;
  direction: "up" | "down";
  narrative: string;
}

export interface RiskScore {
  id: string;
  mode: RiskMode;
  raw_score: number;
  probability_default: number;
  band: RiskBand;
  explanation: {
    summary: string;
  };
  factors: FactorExplanation[];
  model_version: string;
  scored_at: string;
}

export interface ApplicantFinancials {
  applicant_id?: string;
  annual_income: number;
  monthly_expenses: number;
  debt_to_income_ratio: number;
  savings_balance: number;
  existing_credit_lines: number;
  credit_utilization: number;
  bankruptcies: number;
  open_delinquencies: number;
  credit_score: number;
  requested_amount: number;
  loan_purpose: string;
}

export interface Applicant {
  id: string;
  external_id: string;
  owner_user_id: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  date_of_birth: string | null;
  employment_status: string;
  company_name: string | null;
  years_employed: number;
  residential_status: string;
  region: string;
  status: string;
  created_at: string;
  updated_at: string;
  financials: ApplicantFinancials;
}

export interface ApplicantListItem {
  id: string;
  external_id: string;
  full_name: string;
  email: string;
  region: string;
  employment_status: string;
  requested_amount: number;
  annual_income: number;
  latest_band: RiskBand;
  latest_score: number;
  latest_probability_default: number;
  created_at: string;
}

export interface ApplicantListResponse {
  items: ApplicantListItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface PaymentHistoryRow {
  id: string;
  payment_month: string;
  amount_due: number;
  amount_paid: number;
  days_late: number;
  status: string;
}

export interface AuditLog {
  id: string;
  entity_type: string;
  entity_id: string | null;
  action: string;
  metadata_json: Record<string, unknown>;
  created_at: string;
}

export interface ApplicantDetailResponse {
  applicant: Applicant;
  scores: RiskScore[];
  payment_history: PaymentHistoryRow[];
  audit_logs: AuditLog[];
}

export interface ScoringRule {
  id: string;
  name: string;
  factor_key: string;
  description: string;
  weight: number;
  threshold_operator: string;
  threshold_value: number;
  enabled: boolean;
  sort_order: number;
}

export interface DashboardOverview {
  summary_cards: {
    label: string;
    value: string;
    delta: string;
  }[];
  risk_distribution: { label: string; value: number }[];
  defaults_by_month: { label: string; value: number }[];
  recovery_by_segment: { label: string; value: number }[];
  score_trend: { label: string; value: number }[];
  recent_applicants: ApplicantListItem[];
}

export interface ReportSummary {
  mode: RiskMode;
  total_applicants: number;
  average_score: number;
  high_risk_share: number;
  average_probability_default: number;
  top_regions: {
    region: string;
    volume: number;
    average_score: number;
  }[];
  cohort_trends: {
    month: string;
    average_score: number;
  }[];
}

export interface ImportResult {
  imported: number;
  updated: number;
  skipped: number;
  errors: string[];
}

export interface SettingsResponse {
  app_name: string;
  frontend_url: string;
  demo_credentials: {
    email: string;
    password: string;
    role: string;
  }[];
  expected_applicant_csv_headers: string[];
  expected_payment_csv_headers: string[];
  scoring_modes: {
    id: RiskMode;
    label: string;
    description: string;
  }[];
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_demo: boolean;
}

