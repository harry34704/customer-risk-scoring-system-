from __future__ import annotations

import operator
from dataclasses import dataclass
from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Applicant, RiskScore, ScoringRule
from app.services.features import build_feature_map, label_for_feature
from app.services.logistic import FEATURE_ORDER, load_model_artifact, sigmoid, standardized_feature_value

RISK_MODE_DETERMINISTIC = "deterministic"
RISK_MODE_LOGISTIC = "logistic"

BAND_LOW_MAX = 35.0
BAND_MEDIUM_MAX = 65.0

DEFAULT_RULE_DEFINITIONS = [
    {
        "name": "Debt burden exceeds policy",
        "factor_key": "debt_to_income_ratio",
        "description": "Debt-to-income above 45% is strongly associated with repayment stress.",
        "weight": 16.0,
        "threshold_operator": "gt",
        "threshold_value": 0.45,
        "sort_order": 1,
    },
    {
        "name": "Credit utilization is stretched",
        "factor_key": "credit_utilization",
        "description": "Revolving utilization above 70% signals constrained available liquidity.",
        "weight": 13.0,
        "threshold_operator": "gt",
        "threshold_value": 0.70,
        "sort_order": 2,
    },
    {
        "name": "Credit score below portfolio floor",
        "factor_key": "credit_score",
        "description": "Credit scores below 580 need additional caution and manual review.",
        "weight": 17.0,
        "threshold_operator": "lt",
        "threshold_value": 580,
        "sort_order": 3,
    },
    {
        "name": "Open delinquencies present",
        "factor_key": "open_delinquencies",
        "description": "Any active delinquency on file is treated as a major near-term risk signal.",
        "weight": 11.0,
        "threshold_operator": "gt",
        "threshold_value": 0,
        "sort_order": 4,
    },
    {
        "name": "Prior bankruptcy event",
        "factor_key": "bankruptcies",
        "description": "Past bankruptcy events materially increase expected default severity.",
        "weight": 15.0,
        "threshold_operator": "gt",
        "threshold_value": 0,
        "sort_order": 5,
    },
    {
        "name": "Limited savings cushion",
        "factor_key": "savings_buffer_months",
        "description": "Savings covering fewer than 3 months of expenses weakens resilience to shocks.",
        "weight": 10.0,
        "threshold_operator": "lt",
        "threshold_value": 3.0,
        "sort_order": 6,
    },
    {
        "name": "Recent repayment friction",
        "factor_key": "late_payments_12m",
        "description": "More than 2 late payments in the last year indicate deteriorating repayment behavior.",
        "weight": 10.0,
        "threshold_operator": "gt",
        "threshold_value": 2.0,
        "sort_order": 7,
    },
    {
        "name": "Request size is aggressive",
        "factor_key": "request_to_income_ratio",
        "description": "Requested exposure above 55% of annual income stretches affordability.",
        "weight": 8.0,
        "threshold_operator": "gt",
        "threshold_value": 0.55,
        "sort_order": 8,
    },
    {
        "name": "Short employment tenure",
        "factor_key": "employment_tenure_years",
        "description": "Tenure below 1.5 years adds uncertainty to income continuity.",
        "weight": 6.0,
        "threshold_operator": "lt",
        "threshold_value": 1.5,
        "sort_order": 9,
    },
]

OPERATORS = {
    "gt": operator.gt,
    "gte": operator.ge,
    "lt": operator.lt,
    "lte": operator.le,
    "eq": operator.eq,
}


@dataclass
class ScorePayload:
    mode: str
    raw_score: float
    probability_default: float
    band: str
    explanation: dict
    factors: list[dict]
    model_version: str


def band_from_score(score: float) -> str:
    if score < BAND_LOW_MAX:
        return "low"
    if score < BAND_MEDIUM_MAX:
        return "medium"
    return "high"


def ensure_default_rules(session: Session, actor_user_id: Optional[str] = None) -> list[ScoringRule]:
    existing_rules = list(session.scalars(select(ScoringRule).order_by(ScoringRule.sort_order)))
    if existing_rules:
        return existing_rules

    rules: list[ScoringRule] = []
    for item in DEFAULT_RULE_DEFINITIONS:
        rules.append(
            ScoringRule(
                **item,
                enabled=True,
                created_by_user_id=actor_user_id,
                updated_by_user_id=actor_user_id,
            )
        )
    session.add_all(rules)
    session.flush()
    return rules


def _format_value(value: float) -> str:
    numeric_value = float(value)
    if numeric_value >= 1000 or numeric_value <= -1000:
        return f"{numeric_value:,.0f}"
    if numeric_value.is_integer():
        return f"{int(numeric_value)}"
    return f"{numeric_value:.2f}"


def score_rule_based(feature_map: dict[str, float], rules: list[ScoringRule]) -> ScorePayload:
    enabled_rules = [rule for rule in rules if rule.enabled]
    max_weight = sum(rule.weight for rule in enabled_rules) or 1.0
    triggered_weight = 0.0
    factors: list[dict] = []

    for rule in enabled_rules:
        feature_value = feature_map.get(rule.factor_key, 0.0)
        comparison = OPERATORS[rule.threshold_operator]
        triggered = comparison(feature_value, rule.threshold_value)
        if triggered:
            triggered_weight += rule.weight
            impact = round((rule.weight / max_weight) * 100, 2)
            factors.append(
                {
                    "label": rule.name,
                    "feature_key": rule.factor_key,
                    "feature_value": feature_value,
                    "threshold_value": rule.threshold_value,
                    "operator": rule.threshold_operator,
                    "impact": impact,
                    "direction": "up",
                    "narrative": (
                        f"{label_for_feature(rule.factor_key)} is {_format_value(feature_value)} "
                        f"against a rule threshold of {_format_value(rule.threshold_value)}."
                    ),
                }
            )

    factors.sort(key=lambda item: item["impact"], reverse=True)
    raw_score = round((triggered_weight / max_weight) * 100, 2)
    probability_default = round(raw_score / 100, 4)
    top_labels = ", ".join(item["label"] for item in factors[:3]) or "no material rule triggers"
    return ScorePayload(
        mode=RISK_MODE_DETERMINISTIC,
        raw_score=raw_score,
        probability_default=probability_default,
        band=band_from_score(raw_score),
        explanation={
            "summary": (
                f"Rule engine triggered {len(factors)} weighted signals. "
                f"Primary contributors: {top_labels}."
            )
        },
        factors=factors[:5],
        model_version="rules-v1",
    )


def score_logistic(feature_map: dict[str, float], artifact: Optional[dict] = None) -> ScorePayload:
    model_artifact = artifact or load_model_artifact()
    coefficients = model_artifact["coefficients"]
    intercept = model_artifact["intercept"]
    contributions: list[tuple[str, float, float]] = []
    logit = intercept

    for feature_key in FEATURE_ORDER:
        raw_value = feature_map.get(feature_key, 0.0)
        standardized = standardized_feature_value(feature_key, raw_value, model_artifact)
        coefficient = coefficients[feature_key]
        contribution = standardized * coefficient
        logit += contribution
        contributions.append((feature_key, raw_value, contribution))

    probability_default = round(sigmoid(logit), 4)
    raw_score = round(probability_default * 100, 2)
    total_abs_contribution = sum(abs(item[2]) for item in contributions) or 1.0

    sorted_factors = sorted(contributions, key=lambda item: abs(item[2]), reverse=True)[:5]
    factor_entries = []
    for feature_key, raw_value, contribution in sorted_factors:
        direction = "up" if contribution >= 0 else "down"
        impact = round((abs(contribution) / total_abs_contribution) * 100, 2)
        factor_entries.append(
            {
                "label": label_for_feature(feature_key),
                "feature_key": feature_key,
                "feature_value": raw_value,
                "threshold_value": None,
                "operator": None,
                "impact": impact,
                "direction": direction,
                "narrative": (
                    f"{label_for_feature(feature_key)} {'raised' if direction == 'up' else 'reduced'} "
                    f"baseline risk with a standardized contribution of {contribution:.2f}."
                ),
            }
        )

    top_labels = ", ".join(item["label"] for item in factor_entries[:3]) or "balanced profile factors"
    return ScorePayload(
        mode=RISK_MODE_LOGISTIC,
        raw_score=raw_score,
        probability_default=probability_default,
        band=band_from_score(raw_score),
        explanation={
            "summary": (
                f"Baseline model predicts {round(probability_default * 100, 1)}% default probability. "
                f"Strongest influences: {top_labels}."
            )
        },
        factors=factor_entries,
        model_version=model_artifact.get("version", "synthetic-v1"),
    )


def build_score_records(applicant: Applicant, rules: list[ScoringRule], artifact: Optional[dict] = None) -> list[RiskScore]:
    if applicant.financials is None:
        return []

    feature_map = build_feature_map(applicant, applicant.financials, applicant.payment_history)
    deterministic_score = score_rule_based(feature_map, rules)
    logistic_score = score_logistic(feature_map, artifact=artifact)
    results = [deterministic_score, logistic_score]
    return [
        RiskScore(
            applicant=applicant,
            mode=payload.mode,
            raw_score=payload.raw_score,
            probability_default=payload.probability_default,
            band=payload.band,
            explanation=payload.explanation,
            factors=payload.factors,
            model_version=payload.model_version,
        )
        for payload in results
    ]
