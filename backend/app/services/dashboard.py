from __future__ import annotations

from collections import defaultdict
from datetime import date
from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models import Applicant
from app.schemas.applicant import ApplicantListItem
from app.schemas.dashboard import DashboardOverview, LossExposureItem, MetricCard, SeriesPoint


def _month_label(value: date) -> str:
    return value.strftime("%b %Y")


def _latest_score(applicant: Applicant, mode: str):
    for score in applicant.risk_scores:
        if score.mode == mode:
            return score
    return None


def _serialize_applicant_summary(applicant: Applicant, mode: str) -> Optional[ApplicantListItem]:
    latest_score = _latest_score(applicant, mode)
    if latest_score is None or applicant.financials is None:
        return None
    return ApplicantListItem(
        id=applicant.id,
        external_id=applicant.external_id,
        full_name=f"{applicant.first_name} {applicant.last_name}",
        email=applicant.email,
        region=applicant.region,
        employment_status=applicant.employment_status,
        requested_amount=applicant.financials.requested_amount,
        annual_income=applicant.financials.annual_income,
        latest_band=latest_score.band,
        latest_score=latest_score.raw_score,
        latest_probability_default=latest_score.probability_default,
        created_at=applicant.created_at,
    )


def fetch_dashboard_overview(session: Session, mode: str, owner_user_id: str) -> DashboardOverview:
    applicants = list(
        session.scalars(
            select(Applicant)
            .where(Applicant.owner_user_id == owner_user_id)
            .options(
                selectinload(Applicant.financials),
                selectinload(Applicant.payment_history),
                selectinload(Applicant.risk_scores),
            )
        )
    )

    summaries = [
        summary
        for applicant in applicants
        if (summary := _serialize_applicant_summary(applicant, mode)) is not None
    ]
    summaries.sort(key=lambda item: item.created_at, reverse=True)

    total = len(summaries)
    average_score = (sum(item.latest_score for item in summaries) / total) if total else 0.0
    high_risk_count = sum(1 for item in summaries if item.latest_band == "high")
    all_payments = [payment for applicant in applicants for payment in applicant.payment_history]
    recovery_ratio = (
        sum(payment.amount_paid for payment in all_payments) / sum(payment.amount_due for payment in all_payments)
        if all_payments and sum(payment.amount_due for payment in all_payments)
        else 0.0
    )

    risk_distribution = defaultdict(float)
    for summary in summaries:
        risk_distribution[summary.latest_band.title()] += 1

    defaults_by_month = defaultdict(float)
    for payment in all_payments:
        if payment.status == "defaulted":
            defaults_by_month[payment.payment_month.replace(day=1)] += 1

    recovery_by_segment = defaultdict(lambda: {"paid": 0.0, "due": 0.0})
    for applicant in applicants:
        for payment in applicant.payment_history:
            recovery_by_segment[applicant.region]["paid"] += payment.amount_paid
            recovery_by_segment[applicant.region]["due"] += payment.amount_due

    score_trend = defaultdict(list)
    for summary in summaries:
        cohort_month = summary.created_at.date().replace(day=1)
        score_trend[cohort_month].append(summary.latest_score)

    loss_watchlist: list[LossExposureItem] = []
    for applicant in applicants:
        summary = _serialize_applicant_summary(applicant, mode)
        if summary is None:
            continue
        amount_lost = round(
            sum(max(payment.amount_due - payment.amount_paid, 0.0) for payment in applicant.payment_history),
            2,
        )
        if amount_lost <= 0:
            continue
        loss_watchlist.append(
            LossExposureItem(
                applicant_id=applicant.id,
                full_name=summary.full_name,
                region=summary.region,
                employment_status=summary.employment_status,
                amount_lost=amount_lost,
                latest_band=summary.latest_band,
                latest_score=summary.latest_score,
            )
        )
    loss_watchlist.sort(key=lambda item: item.amount_lost, reverse=True)

    return DashboardOverview(
        is_empty=total == 0,
        summary_cards=[
            MetricCard(
                label="Applicants",
                value=str(total),
                delta="Load demo data or create records" if total == 0 else "Current workspace",
            ),
            MetricCard(
                label="Average score",
                value=f"{average_score:.1f}",
                delta="Awaiting first scored applicant" if total == 0 else "Portfolio-wide",
            ),
            MetricCard(
                label="High risk share",
                value=f"{((high_risk_count / total) * 100) if total else 0:.1f}%",
                delta="No scored portfolio yet" if total == 0 else "Latest mode",
            ),
            MetricCard(
                label="Recovery ratio",
                value=f"{recovery_ratio * 100:.1f}%",
                delta="No payment history yet" if not all_payments else "Collected vs due",
            ),
        ],
        risk_distribution=[
            SeriesPoint(label=label, value=value)
            for label, value in sorted(risk_distribution.items())
        ],
        defaults_by_month=[
            SeriesPoint(label=_month_label(label), value=value)
            for label, value in sorted(defaults_by_month.items())[-6:]
        ],
        recovery_by_segment=[
            SeriesPoint(
                label=label,
                value=round((values["paid"] / values["due"]) * 100, 2) if values["due"] else 0.0,
            )
            for label, values in sorted(recovery_by_segment.items())
        ],
        score_trend=[
            SeriesPoint(label=_month_label(label), value=round(sum(values) / len(values), 2))
            for label, values in sorted(score_trend.items())[-6:]
        ],
        recent_applicants=summaries[:8],
        loss_watchlist=loss_watchlist[:6],
    )
