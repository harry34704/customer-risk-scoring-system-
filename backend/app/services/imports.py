from __future__ import annotations

import csv
from datetime import date
from io import StringIO
from typing import Optional
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models import Applicant, ApplicantFinancials, PaymentHistory, ScoringRule
from app.schemas.reports import ImportResult
from app.services.audit import record_audit_log
from app.services.scoring import build_score_records, get_rules_for_user


def _parse_date(raw_value: Optional[str]) -> Optional[date]:
    if not raw_value:
        return None
    return date.fromisoformat(raw_value)


def _parse_float(raw_value: Optional[str], default: float = 0.0) -> float:
    if raw_value in {None, ""}:
        return default
    return float(raw_value)


def _parse_int(raw_value: Optional[str], default: int = 0) -> int:
    if raw_value in {None, ""}:
        return default
    return int(float(raw_value))


def _load_rules(session: Session, owner_user_id: Optional[str]) -> list[ScoringRule]:
    return get_rules_for_user(session, owner_user_id=owner_user_id, actor_user_id=owner_user_id)


def import_applicants_csv(session: Session, actor_user_id: Optional[str], content: bytes) -> ImportResult:
    reader = csv.DictReader(StringIO(content.decode("utf-8")))
    rules = _load_rules(session, actor_user_id)
    imported = 0
    updated = 0
    skipped = 0
    errors: list[str] = []

    for line_number, row in enumerate(reader, start=2):
        try:
            external_id = row.get("external_id") or f"APP-{uuid4().hex[:8].upper()}"
            applicant = session.scalar(
                select(Applicant)
                .where(Applicant.owner_user_id == actor_user_id)
                .where(Applicant.external_id == external_id)
                .options(
                    selectinload(Applicant.financials),
                    selectinload(Applicant.payment_history),
                    selectinload(Applicant.risk_scores),
                )
            )
            is_new = applicant is None
            if applicant is None:
                applicant = Applicant(
                    external_id=external_id,
                    first_name=row["first_name"],
                    last_name=row["last_name"],
                    email=row["email"],
                    phone=row.get("phone"),
                    date_of_birth=_parse_date(row.get("date_of_birth")),
                    employment_status=row["employment_status"],
                    company_name=row.get("company_name"),
                    years_employed=_parse_float(row.get("years_employed")),
                    residential_status=row.get("residential_status") or "tenant",
                    region=row["region"],
                    status=row.get("status") or "active",
                    owner_user_id=actor_user_id,
                )
                applicant.financials = ApplicantFinancials(
                    annual_income=_parse_float(row.get("annual_income")),
                    monthly_expenses=_parse_float(row.get("monthly_expenses")),
                    debt_to_income_ratio=_parse_float(row.get("debt_to_income_ratio")),
                    savings_balance=_parse_float(row.get("savings_balance")),
                    existing_credit_lines=_parse_int(row.get("existing_credit_lines")),
                    credit_utilization=_parse_float(row.get("credit_utilization")),
                    bankruptcies=_parse_int(row.get("bankruptcies")),
                    open_delinquencies=_parse_int(row.get("open_delinquencies")),
                    credit_score=_parse_int(row.get("credit_score")),
                    requested_amount=_parse_float(row.get("requested_amount")),
                    loan_purpose=row.get("loan_purpose") or "Working capital",
                )
                session.add(applicant)
            else:
                applicant.first_name = row["first_name"]
                applicant.last_name = row["last_name"]
                applicant.email = row["email"]
                applicant.phone = row.get("phone")
                applicant.date_of_birth = _parse_date(row.get("date_of_birth"))
                applicant.employment_status = row["employment_status"]
                applicant.company_name = row.get("company_name")
                applicant.years_employed = _parse_float(row.get("years_employed"))
                applicant.residential_status = row.get("residential_status") or "tenant"
                applicant.region = row["region"]
                applicant.status = row.get("status") or "active"
                if applicant.financials is None:
                    applicant.financials = ApplicantFinancials(
                        annual_income=0,
                        monthly_expenses=0,
                        debt_to_income_ratio=0,
                        savings_balance=0,
                        existing_credit_lines=0,
                        credit_utilization=0,
                        bankruptcies=0,
                        open_delinquencies=0,
                        credit_score=0,
                        requested_amount=0,
                        loan_purpose="Working capital",
                    )
                applicant.financials.annual_income = _parse_float(row.get("annual_income"))
                applicant.financials.monthly_expenses = _parse_float(row.get("monthly_expenses"))
                applicant.financials.debt_to_income_ratio = _parse_float(row.get("debt_to_income_ratio"))
                applicant.financials.savings_balance = _parse_float(row.get("savings_balance"))
                applicant.financials.existing_credit_lines = _parse_int(row.get("existing_credit_lines"))
                applicant.financials.credit_utilization = _parse_float(row.get("credit_utilization"))
                applicant.financials.bankruptcies = _parse_int(row.get("bankruptcies"))
                applicant.financials.open_delinquencies = _parse_int(row.get("open_delinquencies"))
                applicant.financials.credit_score = _parse_int(row.get("credit_score"))
                applicant.financials.requested_amount = _parse_float(row.get("requested_amount"))
                applicant.financials.loan_purpose = row.get("loan_purpose") or "Working capital"

            session.flush()
            session.add_all(build_score_records(applicant, rules))
            record_audit_log(
                session,
                actor_user_id=actor_user_id,
                entity_type="applicant",
                entity_id=applicant.id,
                action="imported" if is_new else "updated_from_csv",
                metadata={"source": "applicants_csv", "external_id": external_id},
            )
            imported += 1 if is_new else 0
            updated += 0 if is_new else 1
        except Exception as exc:  # pragma: no cover - defensive import path
            skipped += 1
            errors.append(f"Line {line_number}: {exc}")

    return ImportResult(imported=imported, updated=updated, skipped=skipped, errors=errors)


def import_payment_histories_csv(session: Session, actor_user_id: Optional[str], content: bytes) -> ImportResult:
    reader = csv.DictReader(StringIO(content.decode("utf-8")))
    rules = _load_rules(session, actor_user_id)
    imported = 0
    updated = 0
    skipped = 0
    errors: list[str] = []

    for line_number, row in enumerate(reader, start=2):
        try:
            applicant = None
            external_id = row.get("applicant_external_id")
            applicant_email = row.get("applicant_email")
            if external_id:
                applicant = session.scalar(
                    select(Applicant)
                    .where(Applicant.owner_user_id == actor_user_id)
                    .where(Applicant.external_id == external_id)
                    .options(
                        selectinload(Applicant.financials),
                        selectinload(Applicant.payment_history),
                        selectinload(Applicant.risk_scores),
                    )
                )
            if applicant is None and applicant_email:
                applicant = session.scalar(
                    select(Applicant)
                    .where(Applicant.owner_user_id == actor_user_id)
                    .where(Applicant.email == applicant_email)
                    .options(
                        selectinload(Applicant.financials),
                        selectinload(Applicant.payment_history),
                        selectinload(Applicant.risk_scores),
                    )
                )
            if applicant is None:
                raise ValueError("Applicant not found for payment history row")

            payment_month = _parse_date(row.get("payment_month"))
            if payment_month is None:
                raise ValueError("payment_month is required")

            existing = next(
                (
                    payment
                    for payment in applicant.payment_history
                    if payment.payment_month == payment_month
                ),
                None,
            )
            is_new = existing is None
            payment = existing or PaymentHistory(
                applicant=applicant,
                payment_month=payment_month,
                amount_due=0.0,
                amount_paid=0.0,
                days_late=0,
                status="paid",
            )
            payment.amount_due = _parse_float(row.get("amount_due"))
            payment.amount_paid = _parse_float(row.get("amount_paid"))
            payment.days_late = _parse_int(row.get("days_late"))
            payment.status = row.get("status") or "paid"
            session.flush()
            session.add_all(build_score_records(applicant, rules))
            record_audit_log(
                session,
                actor_user_id=actor_user_id,
                entity_type="payment_history",
                entity_id=payment.id,
                action="imported" if is_new else "updated_from_csv",
                metadata={"source": "payment_csv", "applicant_id": applicant.id},
            )
            imported += 1 if is_new else 0
            updated += 0 if is_new else 1
        except Exception as exc:  # pragma: no cover - defensive import path
            skipped += 1
            errors.append(f"Line {line_number}: {exc}")

    return ImportResult(imported=imported, updated=updated, skipped=skipped, errors=errors)
