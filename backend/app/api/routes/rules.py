from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models import Applicant, ScoringRule, User
from app.schemas.rules import ScoringRuleRead, ScoringRuleUpdateRequest
from app.services.audit import record_audit_log
from app.services.scoring import build_score_records, get_rules_for_user

router = APIRouter()


@router.get("", response_model=list[ScoringRuleRead])
def list_rules(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_db),
) -> list[ScoringRule]:
    rules = get_rules_for_user(session, current_user.id, actor_user_id=current_user.id)
    session.commit()
    return rules


@router.put("", response_model=list[ScoringRuleRead])
def update_rules(
    payload: ScoringRuleUpdateRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_db),
) -> list[ScoringRule]:
    rules = {
        rule.id: rule
        for rule in get_rules_for_user(session, current_user.id, actor_user_id=current_user.id)
    }
    for item in payload.rules:
        if item.id not in rules:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rule not found in this workspace")
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
            select(Applicant)
            .where(Applicant.owner_user_id == current_user.id)
            .options(
                selectinload(Applicant.financials),
                selectinload(Applicant.payment_history),
                selectinload(Applicant.risk_scores),
            )
        )
    )
    ordered_rules = list(
        session.scalars(
            select(ScoringRule)
            .where(ScoringRule.created_by_user_id == current_user.id)
            .order_by(ScoringRule.sort_order)
        )
    )
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
