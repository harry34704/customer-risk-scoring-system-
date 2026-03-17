from __future__ import annotations

from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.security import hash_password, issue_access_token, verify_password
from app.db.session import get_db
from app.models import User
from app.schemas.auth import AuthSessionRead, LoginRequest, RegisterRequest
from app.schemas.common import UserProfileRead
from app.services.scoring import ensure_default_rules

router = APIRouter(prefix="/auth")


def _build_session_response(user: User) -> AuthSessionRead:
    access_token, expires_at = issue_access_token(user_id=user.id, email=user.email, role=user.role)
    return AuthSessionRead(
        access_token=access_token,
        expires_at=expires_at,
        user=UserProfileRead.model_validate(user),
    )


@router.post("/login", response_model=AuthSessionRead)
def login(payload: LoginRequest, session: Session = Depends(get_db)) -> AuthSessionRead:
    user = session.scalar(select(User).where(User.email == payload.email.lower()))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    return _build_session_response(user)


@router.post("/register", response_model=AuthSessionRead, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, session: Session = Depends(get_db)) -> AuthSessionRead:
    normalized_email = payload.email.lower()
    full_name = payload.full_name.strip()

    if len(full_name) < 2:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Full name is too short")

    existing_user = session.scalar(select(User).where(User.email == normalized_email))
    if existing_user is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with that email already exists")

    user = User(
        id=str(uuid4()),
        email=normalized_email,
        password_hash=hash_password(payload.password),
        full_name=full_name,
        role="analyst",
        is_demo=False,
    )
    session.add(user)
    ensure_default_rules(session, owner_user_id=user.id, actor_user_id=user.id)
    session.commit()
    session.refresh(user)
    return _build_session_response(user)


@router.get("/session", response_model=UserProfileRead)
def read_session(current_user: User = Depends(get_current_user)) -> UserProfileRead:
    return UserProfileRead.model_validate(current_user)
