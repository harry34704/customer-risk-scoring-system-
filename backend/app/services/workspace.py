from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import Applicant, PaymentHistory, ScoringRule, User
from app.schemas.reports import WorkspaceBootstrapRead, WorkspaceSummary
from app.services.demo_data import demo_credentials, seed_demo_dataset
from app.services.scoring import ensure_default_rules

DEMO_WORKSPACE_APPLICANT_COUNT = 500


def build_workspace_summary(session: Session, owner_user_id: str) -> WorkspaceSummary:
    applicant_count = session.scalar(
        select(func.count()).select_from(Applicant).where(Applicant.owner_user_id == owner_user_id)
    ) or 0
    rule_count = session.scalar(
        select(func.count()).select_from(ScoringRule).where(ScoringRule.created_by_user_id == owner_user_id)
    ) or 0
    payment_count = session.scalar(
        select(func.count())
        .select_from(PaymentHistory)
        .join(Applicant, Applicant.id == PaymentHistory.applicant_id)
        .where(Applicant.owner_user_id == owner_user_id)
    ) or 0
    return WorkspaceSummary(
        applicant_count=applicant_count,
        rule_count=rule_count,
        payment_count=payment_count,
        is_empty=applicant_count == 0,
        can_bootstrap_demo=True,
    )


def seeded_demo_credentials(session: Session) -> list[dict]:
    expected_credentials = demo_credentials(settings.seed_demo_password)
    expected_emails = {credential["email"] for credential in expected_credentials}
    seeded_emails = {
        row[0]
        for row in session.execute(
            select(User.email).where(User.email.in_(expected_emails), User.is_demo.is_(True))
        )
    }
    if seeded_emails != expected_emails:
        return []
    return expected_credentials


def bootstrap_demo_workspace(session: Session, current_user: User) -> WorkspaceBootstrapRead:
    ensure_default_rules(session, owner_user_id=current_user.id, actor_user_id=current_user.id)
    existing_summary = build_workspace_summary(session, current_user.id)
    if existing_summary.applicant_count > 0:
        return WorkspaceBootstrapRead(
            bootstrapped=False,
            workspace_summary=existing_summary,
            message="Workspace already has applicant data. Add records manually or import CSVs to expand it.",
        )

    seed_demo_dataset(
        session,
        applicant_count=DEMO_WORKSPACE_APPLICANT_COUNT,
        owner_user_id=current_user.id,
        actor_user_id=current_user.id,
    )
    refreshed_summary = build_workspace_summary(session, current_user.id)
    return WorkspaceBootstrapRead(
        bootstrapped=True,
        workspace_summary=refreshed_summary,
        message=f"Loaded {refreshed_summary.applicant_count} demo applicants into your workspace.",
    )
