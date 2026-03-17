from __future__ import annotations

import random
from datetime import date, datetime, timedelta, timezone
from typing import Optional
from uuid import uuid4

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.models import Applicant, ApplicantFinancials, AuditLog, PaymentHistory, RiskScore, ScoringRule, User
from app.services.audit import record_audit_log
from app.services.features import build_feature_map
from app.services.logistic import train_synthetic_baseline_model, write_model_artifact
from app.services.scoring import build_score_records, ensure_default_rules

FIRST_NAMES = [
    "Aaliyah",
    "Marcus",
    "Thando",
    "Lerato",
    "Jaden",
    "Naledi",
    "Priya",
    "Michael",
    "Zinhle",
    "Noah",
    "Ava",
    "Kwame",
    "Sofia",
    "Daniel",
    "Fatima",
    "Ethan",
    "Chloe",
    "Sibusiso",
    "Maya",
    "Amara",
]

LAST_NAMES = [
    "Dlamini",
    "Meyer",
    "Patel",
    "Johnson",
    "Naidoo",
    "Smith",
    "Mokoena",
    "Nguyen",
    "Brown",
    "Khumalo",
    "Garcia",
    "Pillay",
    "Singh",
    "Taylor",
    "Williams",
    "Miller",
]

REGIONS = ["Gauteng", "Western Cape", "KwaZulu-Natal", "Texas", "California", "New York"]
EMPLOYMENT_STATUSES = ["Salaried", "Self-employed", "Contract", "Part-time"]
RESIDENTIAL_STATUSES = ["Tenant", "Owner", "Family home"]
LOAN_PURPOSES = ["Working capital", "Vehicle", "Home improvement", "Education", "Medical", "Debt consolidation"]
COMPANIES = ["Northstar Foods", "Atlas Commerce", "Blue Peak Energy", "Harbor Labs", "Crestline Health"]


def demo_credentials() -> list[dict]:
    return [
        {"email": "demo@riskscore.local", "password": "Demo123!", "role": "admin"},
        {"email": "analyst@riskscore.local", "password": "Demo123!", "role": "analyst"},
    ]


def reset_seed_data(session: Session) -> None:
    for model in [AuditLog, RiskScore, PaymentHistory, ApplicantFinancials, Applicant, ScoringRule]:
        session.execute(delete(model))
    session.commit()


def _risk_propensity(feature_map: dict[str, float]) -> float:
    value = (
        -1.6
        + (2.5 * feature_map["debt_to_income_ratio"])
        + (1.9 * feature_map["credit_utilization"])
        + (0.22 * feature_map["late_payments_12m"])
        + (0.35 * feature_map["open_delinquencies"])
        + (0.75 * feature_map["bankruptcies"])
        + (0.65 * feature_map["request_to_income_ratio"])
        - (0.16 * feature_map["savings_buffer_months"])
        - (0.008 * (feature_map["credit_score"] - 650))
        - (0.07 * feature_map["employment_tenure_years"])
    )
    return 1 / (1 + pow(2.718281828, -value))


def _subtract_months(anchor: date, months: int) -> date:
    year = anchor.year
    month = anchor.month - months
    while month <= 0:
        month += 12
        year -= 1
    return date(year, month, 1)


def seed_demo_users(session: Session) -> list[User]:
    users: list[User] = []
    for credential in demo_credentials():
        existing = session.scalar(select(User).where(User.email == credential["email"]))
        if existing is None:
            existing = User(
                id=str(uuid4()),
                email=credential["email"],
                full_name="Demo Admin" if credential["role"] == "admin" else "Risk Analyst",
                role=credential["role"],
                is_demo=True,
            )
            session.add(existing)
        users.append(existing)
    session.flush()
    return users


def seed_demo_dataset(session: Session, applicant_count: int = 500, actor_user_id: Optional[str] = None) -> None:
    rng = random.Random(42)
    rules = ensure_default_rules(session, actor_user_id)
    now = datetime.now(timezone.utc)

    for index in range(applicant_count):
        created_at = now - timedelta(days=rng.randint(0, 360))
        annual_income = round(rng.uniform(28000, 180000), 2)
        monthly_income = annual_income / 12
        monthly_expenses = round(monthly_income * rng.uniform(0.28, 0.84), 2)
        savings_balance = round(monthly_expenses * rng.uniform(0.5, 8.5), 2)
        requested_amount = round(annual_income * rng.uniform(0.08, 0.78), 2)
        credit_score = int(max(430, min(840, rng.gauss(650, 95))))
        open_delinquencies = max(0, int(round(rng.gauss(1.5, 1.4))))
        late_payments_proxy = max(0, int(round(rng.gauss(2.3, 1.8))))
        bankruptcies = 1 if rng.random() < 0.18 else 0

        applicant = Applicant(
            id=str(uuid4()),
            external_id=f"APP-{index + 1:04d}",
            owner_user_id=actor_user_id,
            first_name=rng.choice(FIRST_NAMES),
            last_name=rng.choice(LAST_NAMES),
            email=f"applicant{index + 1:04d}@example.com",
            phone=f"+1-555-{1000 + index:04d}",
            date_of_birth=date.today() - timedelta(days=365 * rng.randint(22, 61)),
            employment_status=rng.choice(EMPLOYMENT_STATUSES),
            company_name=rng.choice(COMPANIES),
            years_employed=round(max(0.0, rng.gauss(4.4, 3.0)), 1),
            residential_status=rng.choice(RESIDENTIAL_STATUSES),
            region=rng.choice(REGIONS),
            status="active",
            created_at=created_at,
            updated_at=created_at,
        )
        financials = ApplicantFinancials(
            applicant=applicant,
            annual_income=annual_income,
            monthly_expenses=monthly_expenses,
            debt_to_income_ratio=round(max(0.05, min(0.92, rng.gauss(0.41, 0.17))), 4),
            savings_balance=savings_balance,
            existing_credit_lines=max(1, int(round(rng.gauss(4.5, 1.8)))),
            credit_utilization=round(max(0.02, min(0.99, rng.gauss(0.53, 0.22))), 4),
            bankruptcies=bankruptcies,
            open_delinquencies=open_delinquencies,
            credit_score=credit_score,
            requested_amount=requested_amount,
            loan_purpose=rng.choice(LOAN_PURPOSES),
            created_at=created_at,
            updated_at=created_at,
        )
        applicant.financials = financials

        base_feature_map = build_feature_map(applicant, financials, [])
        payment_rows: list[PaymentHistory] = []
        for month_offset in range(12):
            payment_month = _subtract_months(date.today().replace(day=1), month_offset)
            amount_due = round(requested_amount / 18 + rng.uniform(80, 260), 2)
            risk_noise = late_payments_proxy / 12 + financials.debt_to_income_ratio + financials.credit_utilization
            default_threshold = 0.11 + (_risk_propensity(base_feature_map) * 0.28)
            late_threshold = 0.24 + (risk_noise * 0.12)
            roll = rng.random()
            if roll < default_threshold:
                status = "defaulted"
                amount_paid = round(amount_due * rng.uniform(0.05, 0.45), 2)
                days_late = rng.randint(45, 120)
            elif roll < late_threshold:
                status = "late"
                amount_paid = round(amount_due * rng.uniform(0.55, 1.0), 2)
                days_late = rng.randint(5, 35)
            else:
                status = "paid"
                amount_paid = amount_due
                days_late = 0
            payment_rows.append(
                PaymentHistory(
                    id=str(uuid4()),
                    applicant=applicant,
                    payment_month=payment_month,
                    amount_due=amount_due,
                    amount_paid=amount_paid,
                    days_late=days_late,
                    status=status,
                    created_at=created_at,
                    updated_at=created_at,
                )
            )
        session.add(applicant)
        session.flush()
        session.add_all(build_score_records(applicant, rules))
        record_audit_log(
            session,
            actor_user_id=actor_user_id,
            entity_type="applicant",
            entity_id=applicant.id,
            action="seeded_demo_record",
            metadata={"external_id": applicant.external_id, "region": applicant.region},
        )

    session.flush()


def refresh_logistic_artifact(path: str) -> dict:
    artifact = train_synthetic_baseline_model()
    write_model_artifact(path, artifact)
    return artifact
