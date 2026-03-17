from __future__ import annotations

from collections.abc import Iterable

from app.models import Applicant, ApplicantFinancials, PaymentHistory

FEATURE_LABELS = {
    "annual_income": "Annual income",
    "monthly_expenses": "Monthly expenses",
    "debt_to_income_ratio": "Debt-to-income ratio",
    "savings_balance": "Savings balance",
    "savings_buffer_months": "Savings buffer",
    "existing_credit_lines": "Existing credit lines",
    "credit_utilization": "Credit utilization",
    "bankruptcies": "Bankruptcy history",
    "open_delinquencies": "Open delinquencies",
    "credit_score": "Credit score",
    "requested_amount": "Requested amount",
    "request_to_income_ratio": "Request-to-income ratio",
    "late_payments_12m": "Late payments (12m)",
    "defaulted_payments_12m": "Defaulted payments (12m)",
    "on_time_payment_ratio": "On-time payment ratio",
    "avg_days_late": "Average days late",
    "employment_tenure_years": "Employment tenure",
    "monthly_income_surplus": "Monthly cash surplus",
    "payment_recovery_ratio": "Payment recovery ratio",
}

APPLICANT_IMPORT_HEADERS = [
    "external_id",
    "first_name",
    "last_name",
    "email",
    "phone",
    "date_of_birth",
    "employment_status",
    "company_name",
    "years_employed",
    "residential_status",
    "region",
    "status",
    "annual_income",
    "monthly_expenses",
    "debt_to_income_ratio",
    "savings_balance",
    "existing_credit_lines",
    "credit_utilization",
    "bankruptcies",
    "open_delinquencies",
    "credit_score",
    "requested_amount",
    "loan_purpose",
]

PAYMENT_IMPORT_HEADERS = [
    "applicant_external_id",
    "applicant_email",
    "payment_month",
    "amount_due",
    "amount_paid",
    "days_late",
    "status",
]


def safe_ratio(numerator: float, denominator: float, default: float = 0.0) -> float:
    if denominator == 0:
        return default
    return numerator / denominator


def label_for_feature(feature_key: str) -> str:
    return FEATURE_LABELS.get(feature_key, feature_key.replace("_", " ").title())


def summarize_payments(payments: Iterable[PaymentHistory]) -> dict[str, float]:
    payment_rows = list(payments)
    total_rows = len(payment_rows)
    late_payments = sum(1 for row in payment_rows if row.days_late > 0 or row.status in {"late", "defaulted"})
    defaulted_payments = sum(1 for row in payment_rows if row.status == "defaulted")
    amount_due = sum(row.amount_due for row in payment_rows)
    amount_paid = sum(row.amount_paid for row in payment_rows)
    on_time_ratio = safe_ratio(total_rows - late_payments, total_rows, default=1.0)
    avg_days_late = safe_ratio(sum(row.days_late for row in payment_rows), total_rows, default=0.0)
    recovery_ratio = safe_ratio(amount_paid, amount_due, default=1.0)
    return {
        "late_payments_12m": float(late_payments),
        "defaulted_payments_12m": float(defaulted_payments),
        "on_time_payment_ratio": round(on_time_ratio, 4),
        "avg_days_late": round(avg_days_late, 2),
        "payment_recovery_ratio": round(recovery_ratio, 4),
    }


def build_feature_map(
    applicant: Applicant,
    financials: ApplicantFinancials,
    payments: Iterable[PaymentHistory],
) -> dict[str, float]:
    payment_metrics = summarize_payments(payments)
    monthly_income = safe_ratio(financials.annual_income, 12, default=0.0)
    monthly_surplus = monthly_income - financials.monthly_expenses
    return {
        "annual_income": round(financials.annual_income, 2),
        "monthly_expenses": round(financials.monthly_expenses, 2),
        "debt_to_income_ratio": round(financials.debt_to_income_ratio, 4),
        "savings_balance": round(financials.savings_balance, 2),
        "savings_buffer_months": round(
            safe_ratio(financials.savings_balance, financials.monthly_expenses, default=0.0),
            4,
        ),
        "existing_credit_lines": float(financials.existing_credit_lines),
        "credit_utilization": round(financials.credit_utilization, 4),
        "bankruptcies": float(financials.bankruptcies),
        "open_delinquencies": float(financials.open_delinquencies),
        "credit_score": float(financials.credit_score),
        "requested_amount": round(financials.requested_amount, 2),
        "request_to_income_ratio": round(
            safe_ratio(financials.requested_amount, financials.annual_income, default=0.0),
            4,
        ),
        "employment_tenure_years": round(applicant.years_employed, 2),
        "monthly_income_surplus": round(monthly_surplus, 2),
        **payment_metrics,
    }

