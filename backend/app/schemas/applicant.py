from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, EmailStr

from app.schemas.common import AuditLogRead, ORMModel, PaymentHistoryRead, RiskScoreRead


class ApplicantFinancialsBase(BaseModel):
    annual_income: float
    monthly_expenses: float
    debt_to_income_ratio: float
    savings_balance: float
    existing_credit_lines: int
    credit_utilization: float
    bankruptcies: int
    open_delinquencies: int
    credit_score: int
    requested_amount: float
    loan_purpose: str


class ApplicantFinancialsCreate(ApplicantFinancialsBase):
    pass


class ApplicantFinancialsRead(ORMModel, ApplicantFinancialsBase):
    applicant_id: str
    created_at: datetime
    updated_at: datetime


class ApplicantBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    employment_status: str
    company_name: Optional[str] = None
    years_employed: float
    residential_status: str
    region: str
    status: str = "active"


class ApplicantCreate(ApplicantBase):
    financials: ApplicantFinancialsCreate


class ApplicantRead(ORMModel, ApplicantBase):
    id: str
    external_id: str
    owner_user_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    financials: ApplicantFinancialsRead


class ApplicantListItem(BaseModel):
    id: str
    external_id: str
    full_name: str
    email: EmailStr
    region: str
    employment_status: str
    requested_amount: float
    annual_income: float
    latest_band: str
    latest_score: float
    latest_probability_default: float
    created_at: datetime


class ApplicantListResponse(BaseModel):
    items: list[ApplicantListItem]
    total: int
    page: int
    page_size: int


class ApplicantDetailResponse(BaseModel):
    applicant: ApplicantRead
    scores: list[RiskScoreRead]
    payment_history: list[PaymentHistoryRead]
    audit_logs: list[AuditLogRead]
