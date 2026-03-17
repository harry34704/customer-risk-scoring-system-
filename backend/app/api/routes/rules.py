from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models import Applicant, ScoringRule, User
from app.schemas.rules import ScoringRuleRead, ScoringRuleUpdateRequest
from app.services.audit import record_audit_log
from app.services.scoring import build_score_records, ensure_default_rules

router = APIRouter()


@router.get("", response_model=list[ScoringRuleRead])
def list_rules(
    _: User = Depends(get_current_user),
    session: Session = Depends(get_db),
) -> list[ScoringRule]:
    rules = ensure_default_rules(session)
    session.commit()
    return list(session.scalars(select(ScoringRule).order_by(ScoringRule.sort_order)))


@router.put("", response_model=list[ScoringRuleRead])
def update_rules(
    payload: ScoringRuleUpdateRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_db),
) -> list[ScoringRule]:
    rules = {rule.id: rule for rule in session.scalars(select(ScoringRule))}
    for item in payload.rules:
        rule = rules[item.id]
        rule.name = item.name
        rule.description = item.description
        rule.weight = item.weight
        rule.threshold_operator = item.threshold_operator
        rule.threshold_value = item.threshold_value
        rule.enabled = item.enabled
        rule.sort_order = item.sort_order
        rule.updated_by_user_id = current_user.id

    applicants = list(
        session.scalars(
            select(Applicant).options(
                selectinload(Applicant.financials),
                selectinload(Applicant.payment_history),
                selectinload(Applicant.risk_scores),
            )
        )
    )
    ordered_rules = list(session.scalars(select(ScoringRule).order_by(ScoringRule.sort_order)))
    for applicant in applicants:
        session.add_all(build_score_records(applicant, ordered_rules))
    record_audit_log(
        session,
        actor_user_id=current_user.id,
        entity_type="scoring_rules",
        entity_id=None,
        action="bulk_updated",
        metadata={"rule_count": len(payload.rules)},
    )
    session.commit()
    return ordered_rules
