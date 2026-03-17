from __future__ import annotations

import json
import math
import random
from pathlib import Path
from typing import Optional

from app.core.config import settings

FEATURE_ORDER = [
    "debt_to_income_ratio",
    "credit_utilization",
    "open_delinquencies",
    "bankruptcies",
    "late_payments_12m",
    "on_time_payment_ratio",
    "request_to_income_ratio",
    "savings_buffer_months",
    "credit_score",
    "employment_tenure_years",
    "monthly_income_surplus",
]

DEFAULT_MODEL_ARTIFACT = {
    "version": "synthetic-v1",
    "feature_order": FEATURE_ORDER,
    "intercept": -0.6912,
    "coefficients": {
        "debt_to_income_ratio": 1.2184,
        "credit_utilization": 1.0418,
        "open_delinquencies": 0.6241,
        "bankruptcies": 0.7126,
        "late_payments_12m": 0.8579,
        "on_time_payment_ratio": -0.9821,
        "request_to_income_ratio": 0.6638,
        "savings_buffer_months": -0.7764,
        "credit_score": -1.3322,
        "employment_tenure_years": -0.4417,
        "monthly_income_surplus": -0.5925,
    },
    "means": {
        "debt_to_income_ratio": 0.4177,
        "credit_utilization": 0.5344,
        "open_delinquencies": 1.522,
        "bankruptcies": 0.192,
        "late_payments_12m": 2.381,
        "on_time_payment_ratio": 0.801,
        "request_to_income_ratio": 0.3278,
        "savings_buffer_months": 4.123,
        "credit_score": 655.17,
        "employment_tenure_years": 4.231,
        "monthly_income_surplus": 1215.46,
    },
    "stds": {
        "debt_to_income_ratio": 0.1672,
        "credit_utilization": 0.2136,
        "open_delinquencies": 1.298,
        "bankruptcies": 0.512,
        "late_payments_12m": 1.914,
        "on_time_payment_ratio": 0.142,
        "request_to_income_ratio": 0.152,
        "savings_buffer_months": 2.881,
        "credit_score": 93.81,
        "employment_tenure_years": 3.107,
        "monthly_income_surplus": 1398.44,
    },
}


def sigmoid(value: float) -> float:
    if value >= 0:
        exp_neg = math.exp(-value)
        return 1.0 / (1.0 + exp_neg)
    exp_pos = math.exp(value)
    return exp_pos / (1.0 + exp_pos)


def _sample_feature_row(rng: random.Random) -> tuple[dict[str, float], int]:
    annual_income = rng.uniform(24000, 180000)
    monthly_income = annual_income / 12
    monthly_expenses = monthly_income * rng.uniform(0.28, 0.86)
    debt_to_income_ratio = min(0.92, max(0.05, rng.gauss(0.42, 0.16)))
    savings_buffer_months = max(0.0, rng.gauss(4.1, 2.6))
    savings_balance = savings_buffer_months * monthly_expenses
    credit_utilization = min(0.99, max(0.02, rng.gauss(0.53, 0.22)))
    open_delinquencies = max(0, int(round(rng.gauss(1.5, 1.3))))
    bankruptcies = 1 if rng.random() < 0.18 else 0
    late_payments_12m = min(12, max(0, int(round(rng.gauss(2.4, 1.9)))))
    on_time_payment_ratio = min(1.0, max(0.0, 1 - (late_payments_12m / 12) + rng.uniform(-0.08, 0.08)))
    request_to_income_ratio = min(1.1, max(0.03, rng.gauss(0.33, 0.15)))
    credit_score = min(840, max(430, int(round(rng.gauss(655, 94)))))
    employment_tenure_years = max(0.0, rng.gauss(4.2, 3.1))
    monthly_income_surplus = monthly_income - monthly_expenses

    feature_row = {
        "debt_to_income_ratio": debt_to_income_ratio,
        "credit_utilization": credit_utilization,
        "open_delinquencies": float(open_delinquencies),
        "bankruptcies": float(bankruptcies),
        "late_payments_12m": float(late_payments_12m),
        "on_time_payment_ratio": on_time_payment_ratio,
        "request_to_income_ratio": request_to_income_ratio,
        "savings_buffer_months": savings_buffer_months,
        "credit_score": float(credit_score),
        "employment_tenure_years": employment_tenure_years,
        "monthly_income_surplus": monthly_income_surplus,
    }

    latent = (
        -1.95
        + (2.7 * debt_to_income_ratio)
        + (2.1 * credit_utilization)
        + (0.32 * open_delinquencies)
        + (0.9 * bankruptcies)
        + (0.21 * late_payments_12m)
        + (0.85 * request_to_income_ratio)
        - (0.18 * savings_buffer_months)
        - (0.009 * (credit_score - 650))
        - (0.08 * employment_tenure_years)
        - (0.00035 * monthly_income_surplus)
        - (1.4 * on_time_payment_ratio)
        + rng.uniform(-0.55, 0.55)
    )
    label = 1 if rng.random() < sigmoid(latent) else 0
    return feature_row, label


def _standardize_rows(rows: list[list[float]]) -> tuple[list[list[float]], list[float], list[float]]:
    transposed = list(zip(*rows))
    means = [sum(column) / len(column) for column in transposed]
    stds = []
    standardized_rows: list[list[float]] = []
    for index, column in enumerate(transposed):
        variance = sum((value - means[index]) ** 2 for value in column) / len(column)
        std = math.sqrt(variance) or 1.0
        stds.append(std)
    for row in rows:
        standardized_rows.append([(value - means[index]) / stds[index] for index, value in enumerate(row)])
    return standardized_rows, means, stds


def train_synthetic_baseline_model(
    seed: int = 42,
    samples: int = 3000,
    epochs: int = 2200,
    learning_rate: float = 0.06,
) -> dict:
    rng = random.Random(seed)
    raw_rows: list[list[float]] = []
    labels: list[int] = []
    for _ in range(samples):
        row, label = _sample_feature_row(rng)
        raw_rows.append([row[key] for key in FEATURE_ORDER])
        labels.append(label)

    rows, means, stds = _standardize_rows(raw_rows)
    weights = [0.0 for _ in FEATURE_ORDER]
    intercept = 0.0
    sample_count = len(rows)

    for _ in range(epochs):
        grad_bias = 0.0
        grad_weights = [0.0 for _ in FEATURE_ORDER]
        for row, label in zip(rows, labels):
            logit = intercept + sum(weight * value for weight, value in zip(weights, row))
            prediction = sigmoid(logit)
            error = prediction - label
            grad_bias += error
            for index, value in enumerate(row):
                grad_weights[index] += error * value
        intercept -= learning_rate * grad_bias / sample_count
        for index in range(len(weights)):
            weights[index] -= learning_rate * grad_weights[index] / sample_count

    return {
        "version": "synthetic-v1",
        "feature_order": FEATURE_ORDER,
        "intercept": round(intercept, 4),
        "coefficients": {
            feature: round(weight, 4)
            for feature, weight in zip(FEATURE_ORDER, weights)
        },
        "means": {
            feature: round(value, 4)
            for feature, value in zip(FEATURE_ORDER, means)
        },
        "stds": {
            feature: round(value, 4)
            for feature, value in zip(FEATURE_ORDER, stds)
        },
    }


def write_model_artifact(path: str | Path, artifact: dict) -> None:
    artifact_path = Path(path)
    artifact_path.parent.mkdir(parents=True, exist_ok=True)
    artifact_path.write_text(json.dumps(artifact, indent=2), encoding="utf-8")


def load_model_artifact(path: Optional[str] = None) -> dict:
    artifact_path = Path(path or settings.logistic_model_path)
    if artifact_path.exists():
        return json.loads(artifact_path.read_text(encoding="utf-8"))
    return DEFAULT_MODEL_ARTIFACT


def standardized_feature_value(feature_key: str, raw_value: float, artifact: dict) -> float:
    mean = artifact["means"].get(feature_key, 0.0)
    std = artifact["stds"].get(feature_key, 1.0) or 1.0
    return (raw_value - mean) / std
