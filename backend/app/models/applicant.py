from __future__ import annotations

from typing import Optional
from uuid import uuid4

from sqlalchemy import Date, Float, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class Applicant(TimestampMixin, Base):
    __tablename__ = "applicants"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    external_id: Mapped[str] = mapped_column(String(40), unique=True, nullable=False, index=True)
    owner_user_id: Mapped[Optional[str]] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    first_name: Mapped[str] = mapped_column(String(120), nullable=False)
    last_name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    phone: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    date_of_birth: Mapped[Optional[Date]] = mapped_column(Date, nullable=True)
    employment_status: Mapped[str] = mapped_column(String(80), nullable=False)
    company_name: Mapped[Optional[str]] = mapped_column(String(160), nullable=True)
    years_employed: Mapped[float] = mapped_column(Float, default=0, nullable=False)
    residential_status: Mapped[str] = mapped_column(String(80), default="tenant", nullable=False)
    region: Mapped[str] = mapped_column(String(80), nullable=False)
    status: Mapped[str] = mapped_column(String(40), default="active", nullable=False, index=True)

    owner = relationship("User", back_populates="applicants")
    financials = relationship(
        "ApplicantFinancials",
        back_populates="applicant",
        cascade="all, delete-orphan",
        uselist=False,
    )
    payment_history = relationship(
        "PaymentHistory",
        back_populates="applicant",
        cascade="all, delete-orphan",
        order_by="desc(PaymentHistory.payment_month)",
    )
    risk_scores = relationship(
        "RiskScore",
        back_populates="applicant",
        cascade="all, delete-orphan",
        order_by="desc(RiskScore.scored_at)",
    )


class ApplicantFinancials(TimestampMixin, Base):
    __tablename__ = "applicant_financials"

    applicant_id: Mapped[str] = mapped_column(
        ForeignKey("applicants.id", ondelete="CASCADE"),
        primary_key=True,
    )
    annual_income: Mapped[float] = mapped_column(Float, nullable=False)
    monthly_expenses: Mapped[float] = mapped_column(Float, nullable=False)
    debt_to_income_ratio: Mapped[float] = mapped_column(Float, nullable=False)
    savings_balance: Mapped[float] = mapped_column(Float, nullable=False)
    existing_credit_lines: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    credit_utilization: Mapped[float] = mapped_column(Float, nullable=False)
    bankruptcies: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    open_delinquencies: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    credit_score: Mapped[int] = mapped_column(Integer, nullable=False)
    requested_amount: Mapped[float] = mapped_column(Float, nullable=False)
    loan_purpose: Mapped[str] = mapped_column(String(120), nullable=False)

    applicant = relationship("Applicant", back_populates="financials")


class PaymentHistory(TimestampMixin, Base):
    __tablename__ = "payment_history"
    __table_args__ = (
        UniqueConstraint("applicant_id", "payment_month", name="uq_payment_history_applicant_month"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    applicant_id: Mapped[str] = mapped_column(ForeignKey("applicants.id", ondelete="CASCADE"), nullable=False)
    payment_month: Mapped[Date] = mapped_column(Date, nullable=False, index=True)
    amount_due: Mapped[float] = mapped_column(Float, nullable=False)
    amount_paid: Mapped[float] = mapped_column(Float, nullable=False)
    days_late: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    status: Mapped[str] = mapped_column(String(40), nullable=False, index=True)

    applicant = relationship("Applicant", back_populates="payment_history")
