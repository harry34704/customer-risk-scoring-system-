from __future__ import annotations

from uuid import uuid4

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.models import User
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
