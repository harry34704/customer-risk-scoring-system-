from datetime import date
from types import SimpleNamespace

from app.services.features import build_feature_map
from app.services.logistic import load_model_artifact, train_synthetic_baseline_model
from app.services.scoring import DEFAULT_RULE_DEFINITIONS, band_from_score, score_logistic, score_rule_based


def make_sample_applicant():
    applicant = SimpleNamespace(
        years_employed=0.8,
    )
    financials = SimpleNamespace(
        annual_income=36000.0,
        monthly_expenses=2500.0,
        debt_to_income_ratio=0.62,
        savings_balance=1200.0,
        existing_credit_lines=5,
        credit_utilization=0.86,
        bankruptcies=1,
        open_delinquencies=2,
        credit_score=540,
        requested_amount=24000.0,
        loan_purpose="Debt consolidation",
    )
    payments = [
        SimpleNamespace(payment_month=date(2026, 3, 1), amount_due=900.0, amount_paid=450.0, days_late=75, status="defaulted"),
        SimpleNamespace(payment_month=date(2026, 2, 1), amount_due=900.0, amount_paid=810.0, days_late=12, status="late"),
        SimpleNamespace(payment_month=date(2026, 1, 1), amount_due=900.0, amount_paid=900.0, days_late=0, status="paid"),
    ]
    return applicant, financials, payments


class RuleStub:
    def __init__(self, **kwargs):
        self.enabled = kwargs.get("enabled", True)
        self.name = kwargs["name"]
        self.factor_key = kwargs["factor_key"]
        self.description = kwargs["description"]
        self.weight = kwargs["weight"]
        self.threshold_operator = kwargs["threshold_operator"]
        self.threshold_value = kwargs["threshold_value"]
        self.sort_order = kwargs["sort_order"]


def test_rule_based_scoring_yields_high_risk_for_clear_signals():
    applicant, financials, payments = make_sample_applicant()
    feature_map = build_feature_map(applicant, financials, payments)
    rules = [RuleStub(**definition) for definition in DEFAULT_RULE_DEFINITIONS]

    payload = score_rule_based(feature_map, rules)

    assert payload.band == "high"
    assert payload.raw_score > 65
    assert len(payload.factors) >= 4
    assert "Rule engine triggered" in payload.explanation["summary"]


def test_logistic_scoring_returns_probability_and_explanations():
    applicant, financials, payments = make_sample_applicant()
    feature_map = build_feature_map(applicant, financials, payments)

    payload = score_logistic(feature_map, artifact=load_model_artifact())

    assert 0 <= payload.probability_default <= 1
    assert payload.raw_score == round(payload.probability_default * 100, 2)
    assert len(payload.factors) == 5
    assert payload.band in {"medium", "high"}


def test_synthetic_training_produces_complete_artifact():
    artifact = train_synthetic_baseline_model(samples=300, epochs=50, learning_rate=0.05)

    assert artifact["version"] == "synthetic-v1"
    assert len(artifact["feature_order"]) == len(artifact["coefficients"])
    assert len(artifact["means"]) == len(artifact["stds"])


def test_band_boundaries_are_stable():
    assert band_from_score(20) == "low"
    assert band_from_score(35) == "medium"
    assert band_from_score(65) == "high"

