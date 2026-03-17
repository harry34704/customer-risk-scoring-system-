from pydantic import BaseModel

from app.schemas.applicant import ApplicantListItem


class MetricCard(BaseModel):
    label: str
    value: str
    delta: str


class SeriesPoint(BaseModel):
    label: str
    value: float


class DashboardOverview(BaseModel):
    is_empty: bool
    summary_cards: list[MetricCard]
    risk_distribution: list[SeriesPoint]
    defaults_by_month: list[SeriesPoint]
    recovery_by_segment: list[SeriesPoint]
    score_trend: list[SeriesPoint]
    recent_applicants: list[ApplicantListItem]
