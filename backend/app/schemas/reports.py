from pydantic import BaseModel


class ReportSummary(BaseModel):
    mode: str
    total_applicants: int
    average_score: float
    high_risk_share: float
    average_probability_default: float
    top_regions: list[dict]
    cohort_trends: list[dict]


class ImportResult(BaseModel):
    imported: int
    updated: int
    skipped: int
    errors: list[str]


class SettingsRead(BaseModel):
    app_name: str
    frontend_url: str
    demo_credentials: list[dict]
    expected_applicant_csv_headers: list[str]
    expected_payment_csv_headers: list[str]
    scoring_modes: list[dict]
