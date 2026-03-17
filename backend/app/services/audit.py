from typing import Optional

from sqlalchemy.orm import Session

from app.models import AuditLog


def record_audit_log(
    session: Session,
    *,
    actor_user_id: Optional[str],
    entity_type: str,
    entity_id: Optional[str],
    action: str,
    metadata: Optional[dict] = None,
) -> AuditLog:
    audit_log = AuditLog(
        actor_user_id=actor_user_id,
        entity_type=entity_type,
        entity_id=entity_id,
        action=action,
        metadata_json=metadata or {},
    )
    session.add(audit_log)
    return audit_log
