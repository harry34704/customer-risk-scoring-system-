from __future__ import annotations

from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models import User

bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_claims(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> dict:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    if not settings.supabase_url or not settings.supabase_anon_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Supabase environment variables are not configured",
        )

    async with AsyncClient(timeout=10.0) as client:
        response = await client.get(
            f"{settings.supabase_url}/auth/v1/user",
            headers={
                "Authorization": f"Bearer {credentials.credentials}",
                "apikey": settings.supabase_anon_key,
            },
        )
    if response.status_code != status.HTTP_200_OK:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Supabase access token")
    return response.json()


async def get_current_user(
    claims: dict = Depends(get_current_claims),
    session: Session = Depends(get_db),
) -> User:
    auth_user_id = claims["id"]
    user = session.get(User, auth_user_id)
    if user is not None:
        return user

    user_metadata = claims.get("user_metadata") or {}
    full_name = user_metadata.get("full_name") or user_metadata.get("name") or claims["email"].split("@")[0].title()
    user = User(
        id=auth_user_id,
        email=claims["email"],
        full_name=full_name,
        role="analyst",
        is_demo=claims["email"].endswith("@riskscore.local"),
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def get_rules(session: Session):
    from app.models import ScoringRule
    from app.services.scoring import ensure_default_rules

    rules = list(session.scalars(select(ScoringRule).order_by(ScoringRule.sort_order)))
    if rules:
        return rules
    return ensure_default_rules(session)
