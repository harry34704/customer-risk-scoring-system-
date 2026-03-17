import pytest
from fastapi import HTTPException

from app.core import security


def test_password_hash_round_trip():
    password_hash = security.hash_password("Demo123!")

    assert password_hash != "Demo123!"
    assert security.verify_password("Demo123!", password_hash) is True
    assert security.verify_password("wrong-password", password_hash) is False


def test_access_token_round_trip(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setattr(security.settings, "auth_secret_key", "test-secret")
    monkeypatch.setattr(security.settings, "auth_token_ttl_minutes", 60)

    token, expires_at = security.issue_access_token(
        user_id="user-123",
        email="demo@riskscore.local",
        role="admin",
    )

    claims = security.decode_access_token(token)

    assert expires_at.tzinfo is not None
    assert claims["sub"] == "user-123"
    assert claims["email"] == "demo@riskscore.local"
    assert claims["role"] == "admin"


def test_tampered_access_token_is_rejected(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setattr(security.settings, "auth_secret_key", "test-secret")
    token, _ = security.issue_access_token(
        user_id="user-123",
        email="demo@riskscore.local",
        role="admin",
    )
    tampered_token = f"{token}tampered"

    with pytest.raises(HTTPException) as exc:
        security.decode_access_token(tampered_token)

    assert exc.value.status_code == 401
