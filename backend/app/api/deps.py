from __future__ import annotations

from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.session import get_db
from app.models import User

bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_claims(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> dict:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    return decode_access_token(credentials.credentials)


async def get_current_user(
    claims: dict = Depends(get_current_claims),
    session: Session = Depends(get_db),
) -> User:
    user = session.get(User, claims["sub"])
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User account no longer exists")
    return user


def get_rules(session: Session):
    from app.models import ScoringRule
    from app.services.scoring import ensure_default_rules

    rules = list(session.scalars(select(ScoringRule).order_by(ScoringRule.sort_order)))
    if rules:
        return rules
    return ensure_default_rules(session)
