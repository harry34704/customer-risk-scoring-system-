from __future__ import annotations

from datetime import date
from uuid import uuid4

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.models import Applicant, ApplicantFinancials, PaymentHistory, RiskScore, User
from app.models.base import Base
from app.services.dashboard import fetch_dashboard_overview
from app.services.demo_data import seed_demo_dataset
from app.services.reports import build_report_summary
from app.services.scoring import ensure_default_rules
from app.services.workspace import bootstrap_demo_workspace


def make_session() -> Session:
    engine = create_engine("sqlite+pysqlite:///:memory:", future=True)
    Base.metadata.create_all(engine)
    return sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)()


def make_user(session: Session, email: str) -> User:
    user = User(
        id=str(uuid4()),
        email=email,
        password_hash="hashed-password",
        full_name=email.split("@", 1)[0].title(),
        role="analyst",
        is_demo=False,
    )
    session.add(user)
    session.flush()
    return user


def test_default_rules_are_created_per_user_workspace():
    session = make_session()
    user_one = make_user(session, "one@example.com")
    user_two = make_user(session, "two@example.com")

    rules_one = ensure_default_rules(session, owner_user_id=user_one.id, actor_user_id=user_one.id)
    rules_two = ensure_default_rules(session, owner_user_id=user_two.id, actor_user_id=user_two.id)

    assert len(rules_one) == 9
    assert len(rules_two) == 9
    assert {rule.id for rule in rules_one}.isdisjoint({rule.id for rule in rules_two})
    assert {rule.created_by_user_id for rule in rules_one} == {user_one.id}
    assert {rule.created_by_user_id for rule in rules_two} == {user_two.id}


def test_dashboard_and_reports_only_include_current_users_applicants():
    session = make_session()
    owner_one = make_user(session, "owner-one@example.com")
    owner_two = make_user(session, "owner-two@example.com")

    seed_demo_dataset(session, applicant_count=4, owner_user_id=owner_one.id, actor_user_id=owner_one.id)
    seed_demo_dataset(session, applicant_count=2, owner_user_id=owner_two.id, actor_user_id=owner_two.id)
    session.commit()

    owner_one_dashboard = fetch_dashboard_overview(session, "deterministic", owner_one.id)
    owner_two_report = build_report_summary(session, "deterministic", owner_two.id)

    assert owner_one_dashboard.is_empty is False
    assert owner_one_dashboard.summary_cards[0].value == "4"
    assert len(owner_one_dashboard.recent_applicants) == 4
    assert all(item.amount_lost >= 0 for item in owner_one_dashboard.loss_watchlist)
    assert owner_two_report.total_applicants == 2


def test_bootstrap_demo_workspace_populates_empty_user_once(monkeypatch):
    session = make_session()
    user = make_user(session, "bootstrap@example.com")

    monkeypatch.setattr("app.services.workspace.DEMO_WORKSPACE_APPLICANT_COUNT", 6)

    first_result = bootstrap_demo_workspace(session, user)
    session.commit()
    second_result = bootstrap_demo_workspace(session, user)

    assert first_result.bootstrapped is True
    assert first_result.workspace_summary.applicant_count == 6
    assert second_result.bootstrapped is False
    assert second_result.workspace_summary.applicant_count == 6


def test_dashboard_and_reports_normalize_malformed_records_instead_of_failing():
    session = make_session()
    owner = make_user(session, "resilient@example.com")

    seed_demo_dataset(session, applicant_count=1, owner_user_id=owner.id, actor_user_id=owner.id)

    bad_applicant = Applicant(
        id=str(uuid4()),
        external_id="bad-record-1",
        owner_user_id=owner.id,
        first_name="Broken",
        last_name="Record",
        email="not-an-email",
        employment_status="Salaried",
        years_employed=1,
        residential_status="tenant",
        region="Gauteng",
        status="active",
    )
    session.add(bad_applicant)
    session.flush()

    session.add(
        ApplicantFinancials(
            applicant_id=bad_applicant.id,
            annual_income=120000,
            monthly_expenses=9000,
            debt_to_income_ratio=0.4,
            savings_balance=1000,
            existing_credit_lines=2,
            credit_utilization=0.6,
            bankruptcies=0,
            open_delinquencies=0,
            credit_score=620,
            requested_amount=15000,
            loan_purpose="Test",
        )
    )
    session.add(
        RiskScore(
            applicant_id=bad_applicant.id,
            mode="deterministic",
            raw_score=41.2,
            probability_default=0.31,
            band="medium",
            explanation={"summary": "Malformed record"},
            factors=[],
            model_version="test",
        )
    )
    session.add(
        PaymentHistory(
            applicant_id=bad_applicant.id,
            payment_month=date(2024, 1, 1),
            amount_due=1000,
            amount_paid=200,
            days_late=12,
            status="partial",
        )
    )
    session.commit()

    dashboard = fetch_dashboard_overview(session, "deterministic", owner.id)
    report = build_report_summary(session, "deterministic", owner.id)

    assert dashboard.summary_cards[0].value == "2"
    assert len(dashboard.recent_applicants) == 2
    assert any(item.email == "unknown@example.com" for item in dashboard.recent_applicants)
    assert report.total_applicants == 2
