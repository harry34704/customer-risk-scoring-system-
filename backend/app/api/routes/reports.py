from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models import User
from app.schemas.reports import ReportSummary
from app.services.reports import build_csv_export, build_pdf_export, build_report_summary

router = APIRouter()


@router.get("/summary", response_model=ReportSummary)
def read_report_summary(
    mode: str = "deterministic",
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_db),
) -> ReportSummary:
    return build_report_summary(session, mode, current_user.id)


@router.get("/export.csv")
def export_report_csv(
    mode: str = "deterministic",
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_db),
) -> Response:
    payload = build_csv_export(session, mode, current_user.id)
    return Response(
        content=payload,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="risk-report-{mode}.csv"'},
    )


@router.get("/export.pdf")
def export_report_pdf(
    mode: str = "deterministic",
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_db),
) -> Response:
    payload = build_pdf_export(session, mode, current_user.id)
    return Response(
        content=payload,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="risk-report-{mode}.pdf"'},
    )
