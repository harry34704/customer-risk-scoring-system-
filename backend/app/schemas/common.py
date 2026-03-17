from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class FactorExplanation(BaseModel):
    label: str
    feature_key: str
    feature_value: float
    threshold_value: Optional[float] = None
    operator: Optional[str] = None
    impact: float
    direction: str
    narrative: str


class PaymentHistoryRead(ORMModel):
    id: str
    payment_month: date
    amount_due: float
    amount_paid: float
    days_late: int
    status: str


class RiskScoreRead(ORMModel):
    id: str
    mode: str
    raw_score: float
    probability_default: float
    band: str
    explanation: dict
    factors: list[FactorExplanation]
    model_version: str
    scored_at: datetime


class AuditLogRead(ORMModel):
    id: str
    entity_type: str
    entity_id: Optional[str] = None
    action: str
    metadata_json: dict
    created_at: datetime


class UserProfileRead(ORMModel):
    id: str
    email: str
    full_name: str
    role: str
    is_demo: bool
