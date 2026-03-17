from pydantic import BaseModel

from app.schemas.applicant import ApplicantListItem


class MetricCard(BaseModel):
    label: str
    value: str
    delta: str


class SeriesPoint(BaseModel):
    label: str
    value: float


class LossExposureItem(BaseModel):
    applicant_id: str
    full_name: str
    region: str
    employment_status: str
    amount_lost: float
    latest_band: str
    latest_score: float


class DashboardOverview(BaseModel):
    is_empty: bool
    summary_cards: list[MetricCard]
    risk_distribution: list[SeriesPoint]
    defaults_by_month: list[SeriesPoint]
    recovery_by_segment: list[SeriesPoint]
    score_trend: list[SeriesPoint]
    recent_applicants: list[ApplicantListItem]
    loss_watchlist: list[LossExposureItem]
