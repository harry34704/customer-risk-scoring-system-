from __future__ import annotations

import re
from datetime import date, datetime, timezone

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def safe_text(value: object, fallback: str) -> str:
    if isinstance(value, str):
        candidate = value.strip()
        if candidate:
            return candidate
    return fallback


def safe_email(value: object) -> str:
    candidate = safe_text(value, "")
    return candidate if EMAIL_RE.match(candidate) else "unknown@example.com"


def safe_float(value: object, default: float = 0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def safe_datetime(value: object) -> datetime:
    if isinstance(value, datetime):
        return value
    if isinstance(value, date):
        return datetime(value.year, value.month, value.day, tzinfo=timezone.utc)
    return datetime.now(timezone.utc)


def safe_date(value: object) -> date | None:
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    return None


def safe_band(value: object) -> str:
    candidate = safe_text(value, "medium").lower()
    return candidate if candidate in {"low", "medium", "high"} else "medium"
