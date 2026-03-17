from __future__ import annotations

from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
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


def get_rules(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_db),
):
    from app.services.scoring import get_rules_for_user

    return get_rules_for_user(session, owner_user_id=current_user.id, actor_user_id=current_user.id)
