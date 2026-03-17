from __future__ import annotations

import base64
import binascii
import hashlib
import hmac
import json
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import HTTPException, status

from app.core.config import settings

PBKDF2_ITERATIONS = 390_000
PBKDF2_ALGORITHM = "sha256"


def _authentication_error(detail: str = "Authentication required") -> HTTPException:
    return HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)


def _b64url_encode(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).rstrip(b"=").decode("utf-8")


def _b64url_decode(value: str) -> bytes:
    padding = "=" * (-len(value) % 4)
    return base64.urlsafe_b64decode(f"{value}{padding}")


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac(
        PBKDF2_ALGORITHM,
        password.encode("utf-8"),
        salt,
        PBKDF2_ITERATIONS,
    )
    return f"pbkdf2_{PBKDF2_ALGORITHM}${PBKDF2_ITERATIONS}${salt.hex()}${digest.hex()}"


def verify_password(password: str, password_hash: str) -> bool:
    try:
        algorithm, iterations, salt_hex, digest_hex = password_hash.split("$", maxsplit=3)
        if algorithm != f"pbkdf2_{PBKDF2_ALGORITHM}":
            return False
        salt = bytes.fromhex(salt_hex)
        expected_digest = bytes.fromhex(digest_hex)
        candidate_digest = hashlib.pbkdf2_hmac(
            PBKDF2_ALGORITHM,
            password.encode("utf-8"),
            salt,
            int(iterations),
        )
    except (TypeError, ValueError, binascii.Error):
        return False

    return hmac.compare_digest(candidate_digest, expected_digest)


def issue_access_token(*, user_id: str, email: str, role: str) -> tuple[str, datetime]:
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.auth_token_ttl_minutes)
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": int(expires_at.timestamp()),
    }
    encoded_payload = _b64url_encode(json.dumps(payload, separators=(",", ":"), sort_keys=True).encode("utf-8"))
    signature = hmac.new(
        settings.auth_secret_key.encode("utf-8"),
        encoded_payload.encode("utf-8"),
        hashlib.sha256,
    ).digest()
    return f"{encoded_payload}.{_b64url_encode(signature)}", expires_at


def decode_access_token(token: str) -> dict[str, Any]:
    try:
        encoded_payload, encoded_signature = token.split(".", maxsplit=1)
    except ValueError as exc:
        raise _authentication_error("Invalid access token") from exc

    expected_signature = hmac.new(
        settings.auth_secret_key.encode("utf-8"),
        encoded_payload.encode("utf-8"),
        hashlib.sha256,
    ).digest()

    try:
        provided_signature = _b64url_decode(encoded_signature)
    except (ValueError, binascii.Error) as exc:
        raise _authentication_error("Invalid access token") from exc

    if not hmac.compare_digest(expected_signature, provided_signature):
        raise _authentication_error("Invalid access token")

    try:
        payload = json.loads(_b64url_decode(encoded_payload))
    except (json.JSONDecodeError, ValueError, binascii.Error) as exc:
        raise _authentication_error("Invalid access token") from exc

    expires_at = payload.get("exp")
    if not isinstance(expires_at, int):
        raise _authentication_error("Invalid access token")
    if expires_at < int(datetime.now(timezone.utc).timestamp()):
        raise _authentication_error("Access token expired")

    return payload
