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


class WorkspaceSummary(BaseModel):
    applicant_count: int
    rule_count: int
    payment_count: int
    is_empty: bool
    can_bootstrap_demo: bool


class WorkspaceBootstrapRead(BaseModel):
    bootstrapped: bool
    workspace_summary: WorkspaceSummary
    message: str


class SettingsRead(BaseModel):
    app_name: str
    frontend_url: str
    demo_credentials: list[dict]
    workspace_summary: WorkspaceSummary
    expected_applicant_csv_headers: list[str]
    expected_payment_csv_headers: list[str]
    scoring_modes: list[dict]
