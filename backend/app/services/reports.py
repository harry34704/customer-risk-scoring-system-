from __future__ import annotations

import csv
from collections import defaultdict
from io import BytesIO, StringIO

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models import Applicant
from app.schemas.reports import ReportSummary


def _latest_score(applicant: Applicant, mode: str):
    for score in applicant.risk_scores:
        if score.mode == mode:
            return score
    return None


def _report_rows(session: Session, mode: str) -> list[dict]:
    applicants = list(
        session.scalars(
            select(Applicant).options(
                selectinload(Applicant.financials),
                selectinload(Applicant.payment_history),
                selectinload(Applicant.risk_scores),
            )
        )
    )
    rows = []
    for applicant in applicants:
        latest_score = _latest_score(applicant, mode)
        if latest_score is None or applicant.financials is None:
            continue
        rows.append(
            {
                "external_id": applicant.external_id,
                "name": f"{applicant.first_name} {applicant.last_name}",
                "email": applicant.email,
                "region": applicant.region,
                "employment_status": applicant.employment_status,
                "annual_income": applicant.financials.annual_income,
                "requested_amount": applicant.financials.requested_amount,
                "score": latest_score.raw_score,
                "band": latest_score.band,
                "probability_default": latest_score.probability_default,
                "created_at": applicant.created_at.strftime("%Y-%m-%d"),
            }
        )
    rows.sort(key=lambda item: item["score"], reverse=True)
    return rows


def build_report_summary(session: Session, mode: str) -> ReportSummary:
    rows = _report_rows(session, mode)
    total = len(rows) or 1
    average_score = sum(row["score"] for row in rows) / total
    average_probability_default = sum(row["probability_default"] for row in rows) / total
    high_risk_share = sum(1 for row in rows if row["band"] == "high") / total

    top_regions_map = defaultdict(lambda: {"count": 0, "score_total": 0.0})
    cohort_trend_map = defaultdict(list)
    for row in rows:
        top_regions_map[row["region"]]["count"] += 1
        top_regions_map[row["region"]]["score_total"] += row["score"]
        cohort_trend_map[row["created_at"][:7]].append(row["score"])

    top_regions = [
        {
            "region": region,
            "volume": payload["count"],
            "average_score": round(payload["score_total"] / payload["count"], 2),
        }
        for region, payload in sorted(top_regions_map.items(), key=lambda item: item[1]["count"], reverse=True)[:5]
    ]
    cohort_trends = [
        {"month": month, "average_score": round(sum(values) / len(values), 2)}
        for month, values in sorted(cohort_trend_map.items())[-6:]
    ]

    return ReportSummary(
        mode=mode,
        total_applicants=len(rows),
        average_score=round(average_score, 2),
        high_risk_share=round(high_risk_share, 4),
        average_probability_default=round(average_probability_default, 4),
        top_regions=top_regions,
        cohort_trends=cohort_trends,
    )


def build_csv_export(session: Session, mode: str) -> str:
    rows = _report_rows(session, mode)
    buffer = StringIO()
    writer = csv.DictWriter(
        buffer,
        fieldnames=[
            "external_id",
            "name",
            "email",
            "region",
            "employment_status",
            "annual_income",
            "requested_amount",
            "score",
            "band",
            "probability_default",
            "created_at",
        ],
    )
    writer.writeheader()
    writer.writerows(rows)
    return buffer.getvalue()


def build_pdf_export(session: Session, mode: str) -> bytes:
    report = build_report_summary(session, mode)
    buffer = BytesIO()
    document = SimpleDocTemplate(buffer, pagesize=A4, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    styles = getSampleStyleSheet()

    top_regions_data = [["Region", "Volume", "Average score"]]
    for row in report.top_regions:
        top_regions_data.append([row["region"], str(row["volume"]), f'{row["average_score"]:.2f}'])

    story = [
        Paragraph("Customer Risk Scoring System", styles["Title"]),
        Spacer(1, 12),
        Paragraph(f"Mode: {mode.title()}", styles["Heading2"]),
        Paragraph(f"Total applicants: {report.total_applicants}", styles["BodyText"]),
        Paragraph(f"Average score: {report.average_score}", styles["BodyText"]),
        Paragraph(f"High risk share: {report.high_risk_share * 100:.1f}%", styles["BodyText"]),
        Paragraph(
            f"Average probability of default: {report.average_probability_default * 100:.1f}%",
            styles["BodyText"],
        ),
        Spacer(1, 12),
        Paragraph("Top regions", styles["Heading2"]),
        Table(top_regions_data),
    ]

    region_table = story[-1]
    region_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0F172A")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
                ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#F8FAFC")),
                ("PADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    document.build(story)
    return buffer.getvalue()

