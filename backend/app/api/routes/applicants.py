from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models import Applicant, ApplicantFinancials, User
from app.schemas.applicant import (
    ApplicantCreate,
    ApplicantDetailResponse,
    ApplicantListItem,
    ApplicantListResponse,
    ApplicantRead,
)
from app.schemas.common import AuditLogRead, PaymentHistoryRead, RiskScoreRead
from app.services.audit import record_audit_log
from app.services.scoring import build_score_records, get_rules_for_user

router = APIRouter()


def _serialize_applicant_list_item(applicant: Applicant, mode: str) -> Optional[ApplicantListItem]:
    if applicant.financials is None:
        return None
    latest_score = next((score for score in applicant.risk_scores if score.mode == mode), None)
    if latest_score is None:
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


def _get_applicant_or_404(session: Session, owner_user_id: str, applicant_id: str) -> Applicant:
    applicant = session.scalar(
        select(Applicant)
        .where(Applicant.id == applicant_id, Applicant.owner_user_id == owner_user_id)
        .options(
            selectinload(Applicant.financials),
            selectinload(Applicant.payment_history),
            selectinload(Applicant.risk_scores),
        )
    )
    if applicant is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Applicant not found")
    return applicant


def _serialize_applicant_detail(applicant: Applicant) -> ApplicantDetailResponse:
    return ApplicantDetailResponse(
        applicant=ApplicantRead.model_validate(applicant),
        scores=[RiskScoreRead.model_validate(score) for score in applicant.risk_scores[:6]],
        payment_history=[PaymentHistoryRead.model_validate(payment) for payment in applicant.payment_history[:12]],
        audit_logs=[
            AuditLogRead.model_validate(log)
            for log in sorted(getattr(applicant, "audit_log_rows", []), key=lambda item: item.created_at, reverse=True)
        ],
    )


@router.get("", response_model=ApplicantListResponse)
def list_applicants(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    search: str = Query(default=""),
    band: Optional[str] = Query(default=None),
    mode: str = Query(default="deterministic"),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_db),
) -> ApplicantListResponse:
    applicants = list(
        session.scalars(
            select(Applicant)
            .where(Applicant.owner_user_id == current_user.id)
            .options(
                selectinload(Applicant.financials),
                selectinload(Applicant.risk_scores),
            )
        )
    )
    items = []
    search_normalized = search.strip().lower()
    workspace_total = len(
        [
            applicant
            for applicant in applicants
            if _serialize_applicant_list_item(applicant, mode) is not None
        ]
    )
    for applicant in applicants:
        serialized = _serialize_applicant_list_item(applicant, mode)
        if serialized is None:
            continue
        if (
            search_normalized
            and search_normalized not in serialized.full_name.lower()
            and search_normalized not in serialized.email.lower()
            and search_normalized not in serialized.external_id.lower()
        ):
            continue
        if band and serialized.latest_band != band:
            continue
        items.append(serialized)

    items.sort(key=lambda item: item.created_at, reverse=True)
    start = (page - 1) * page_size
    end = start + page_size
    return ApplicantListResponse(
        items=items[start:end],
        total=len(items),
        workspace_total=workspace_total,
        page=page,
        page_size=page_size,
    )


@router.post("", response_model=ApplicantDetailResponse, status_code=status.HTTP_201_CREATED)
def create_applicant(
    payload: ApplicantCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_db),
) -> ApplicantDetailResponse:
    total_count = session.scalar(
        select(func.count()).select_from(Applicant).where(Applicant.owner_user_id == current_user.id)
    ) or 0
    applicant = Applicant(
        external_id=f"APP-{total_count + 1:04d}",
        owner_user_id=current_user.id,
        first_name=payload.first_name,
        last_name=payload.last_name,
        email=payload.email,
        phone=payload.phone,
        date_of_birth=payload.date_of_birth,
        employment_status=payload.employment_status,
        company_name=payload.company_name,
        years_employed=payload.years_employed,
        residential_status=payload.residential_status,
        region=payload.region,
        status=payload.status,
    )
    applicant.financials = ApplicantFinancials(**payload.financials.model_dump())
    session.add(applicant)
    session.flush()
    session.add_all(build_score_records(applicant, get_rules_for_user(session, current_user.id, actor_user_id=current_user.id)))
    record_audit_log(
        session,
        actor_user_id=current_user.id,
        entity_type="applicant",
        entity_id=applicant.id,
        action="created_manual_entry",
        metadata={"source": "manual_form"},
    )
    session.commit()
    session.refresh(applicant)
    applicant = _get_applicant_or_404(session, current_user.id, applicant.id)
    from app.models import AuditLog

    applicant.audit_log_rows = list(
        session.scalars(
            select(AuditLog).where(AuditLog.entity_id == applicant.id).order_by(AuditLog.created_at.desc())
        )
    )
    return _serialize_applicant_detail(applicant)


@router.get("/{applicant_id}", response_model=ApplicantDetailResponse)
def read_applicant_detail(
    applicant_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_db),
) -> ApplicantDetailResponse:
    applicant = _get_applicant_or_404(session, current_user.id, applicant_id)
    from app.models import AuditLog

    applicant.audit_log_rows = list(
        session.scalars(
            select(AuditLog).where(AuditLog.entity_id == applicant_id).order_by(AuditLog.created_at.desc())
        )
    )
    return _serialize_applicant_detail(applicant)


@router.post("/{applicant_id}/rescore", response_model=ApplicantDetailResponse)
def rescore_applicant(
    applicant_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_db),
) -> ApplicantDetailResponse:
    applicant = _get_applicant_or_404(session, current_user.id, applicant_id)
    rules = get_rules_for_user(session, current_user.id, actor_user_id=current_user.id)
    session.add_all(build_score_records(applicant, rules))
    record_audit_log(
        session,
        actor_user_id=current_user.id,
        entity_type="applicant",
        entity_id=applicant.id,
        action="rescored",
        metadata={"modes": ["deterministic", "logistic"]},
    )
    session.commit()
    refreshed = _get_applicant_or_404(session, current_user.id, applicant_id)
    from app.models import AuditLog

    refreshed.audit_log_rows = list(
        session.scalars(
            select(AuditLog).where(AuditLog.entity_id == applicant_id).order_by(AuditLog.created_at.desc())
        )
    )
    return _serialize_applicant_detail(refreshed)
