"""initial schema

Revision ID: 0001_initial_schema
Revises:
Create Date: 2026-03-17 12:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "0001_initial_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("full_name", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=50), nullable=False),
        sa.Column("is_demo", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)

    op.create_table(
        "applicants",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("external_id", sa.String(length=40), nullable=False),
        sa.Column("owner_user_id", sa.String(length=36), nullable=True),
        sa.Column("first_name", sa.String(length=120), nullable=False),
        sa.Column("last_name", sa.String(length=120), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("phone", sa.String(length=32), nullable=True),
        sa.Column("date_of_birth", sa.Date(), nullable=True),
        sa.Column("employment_status", sa.String(length=80), nullable=False),
        sa.Column("company_name", sa.String(length=160), nullable=True),
        sa.Column("years_employed", sa.Float(), nullable=False),
        sa.Column("residential_status", sa.String(length=80), nullable=False),
        sa.Column("region", sa.String(length=80), nullable=False),
        sa.Column("status", sa.String(length=40), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["owner_user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("external_id"),
    )
    op.create_index(op.f("ix_applicants_email"), "applicants", ["email"], unique=False)
    op.create_index(op.f("ix_applicants_external_id"), "applicants", ["external_id"], unique=True)
    op.create_index(op.f("ix_applicants_owner_user_id"), "applicants", ["owner_user_id"], unique=False)
    op.create_index(op.f("ix_applicants_status"), "applicants", ["status"], unique=False)

    op.create_table(
        "applicant_financials",
        sa.Column("applicant_id", sa.String(length=36), nullable=False),
        sa.Column("annual_income", sa.Float(), nullable=False),
        sa.Column("monthly_expenses", sa.Float(), nullable=False),
        sa.Column("debt_to_income_ratio", sa.Float(), nullable=False),
        sa.Column("savings_balance", sa.Float(), nullable=False),
        sa.Column("existing_credit_lines", sa.Integer(), nullable=False),
        sa.Column("credit_utilization", sa.Float(), nullable=False),
        sa.Column("bankruptcies", sa.Integer(), nullable=False),
        sa.Column("open_delinquencies", sa.Integer(), nullable=False),
        sa.Column("credit_score", sa.Integer(), nullable=False),
        sa.Column("requested_amount", sa.Float(), nullable=False),
        sa.Column("loan_purpose", sa.String(length=120), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["applicant_id"], ["applicants.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("applicant_id"),
    )

    op.create_table(
        "payment_history",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("applicant_id", sa.String(length=36), nullable=False),
        sa.Column("payment_month", sa.Date(), nullable=False),
        sa.Column("amount_due", sa.Float(), nullable=False),
        sa.Column("amount_paid", sa.Float(), nullable=False),
        sa.Column("days_late", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=40), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["applicant_id"], ["applicants.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("applicant_id", "payment_month", name="uq_payment_history_applicant_month"),
    )
    op.create_index(op.f("ix_payment_history_payment_month"), "payment_history", ["payment_month"], unique=False)
    op.create_index(op.f("ix_payment_history_status"), "payment_history", ["status"], unique=False)

    op.create_table(
        "scoring_rules",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("factor_key", sa.String(length=80), nullable=False),
        sa.Column("description", sa.String(length=400), nullable=False),
        sa.Column("weight", sa.Float(), nullable=False),
        sa.Column("threshold_operator", sa.String(length=8), nullable=False),
        sa.Column("threshold_value", sa.Float(), nullable=False),
        sa.Column("enabled", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.Column("created_by_user_id", sa.String(length=36), nullable=True),
        sa.Column("updated_by_user_id", sa.String(length=36), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["created_by_user_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["updated_by_user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_scoring_rules_factor_key"), "scoring_rules", ["factor_key"], unique=False)

    op.create_table(
        "risk_scores",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("applicant_id", sa.String(length=36), nullable=False),
        sa.Column("mode", sa.String(length=32), nullable=False),
        sa.Column("raw_score", sa.Float(), nullable=False),
        sa.Column("probability_default", sa.Float(), nullable=False),
        sa.Column("band", sa.String(length=16), nullable=False),
        sa.Column("explanation", sa.JSON(), nullable=False),
        sa.Column("factors", sa.JSON(), nullable=False),
        sa.Column("model_version", sa.String(length=80), nullable=False),
        sa.Column("scored_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["applicant_id"], ["applicants.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_risk_scores_applicant_id"), "risk_scores", ["applicant_id"], unique=False)
    op.create_index(op.f("ix_risk_scores_band"), "risk_scores", ["band"], unique=False)
    op.create_index(op.f("ix_risk_scores_mode"), "risk_scores", ["mode"], unique=False)
    op.create_index(op.f("ix_risk_scores_scored_at"), "risk_scores", ["scored_at"], unique=False)

    op.create_table(
        "audit_logs",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("actor_user_id", sa.String(length=36), nullable=True),
        sa.Column("entity_type", sa.String(length=80), nullable=False),
        sa.Column("entity_id", sa.String(length=36), nullable=True),
        sa.Column("action", sa.String(length=120), nullable=False),
        sa.Column("metadata", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["actor_user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_audit_logs_action"), "audit_logs", ["action"], unique=False)
    op.create_index(op.f("ix_audit_logs_actor_user_id"), "audit_logs", ["actor_user_id"], unique=False)
    op.create_index(op.f("ix_audit_logs_entity_id"), "audit_logs", ["entity_id"], unique=False)
    op.create_index(op.f("ix_audit_logs_entity_type"), "audit_logs", ["entity_type"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_audit_logs_entity_type"), table_name="audit_logs")
    op.drop_index(op.f("ix_audit_logs_entity_id"), table_name="audit_logs")
    op.drop_index(op.f("ix_audit_logs_actor_user_id"), table_name="audit_logs")
    op.drop_index(op.f("ix_audit_logs_action"), table_name="audit_logs")
    op.drop_table("audit_logs")
    op.drop_index(op.f("ix_risk_scores_scored_at"), table_name="risk_scores")
    op.drop_index(op.f("ix_risk_scores_mode"), table_name="risk_scores")
    op.drop_index(op.f("ix_risk_scores_band"), table_name="risk_scores")
    op.drop_index(op.f("ix_risk_scores_applicant_id"), table_name="risk_scores")
    op.drop_table("risk_scores")
    op.drop_index(op.f("ix_scoring_rules_factor_key"), table_name="scoring_rules")
    op.drop_table("scoring_rules")
    op.drop_index(op.f("ix_payment_history_status"), table_name="payment_history")
    op.drop_index(op.f("ix_payment_history_payment_month"), table_name="payment_history")
    op.drop_table("payment_history")
    op.drop_table("applicant_financials")
    op.drop_index(op.f("ix_applicants_status"), table_name="applicants")
    op.drop_index(op.f("ix_applicants_owner_user_id"), table_name="applicants")
    op.drop_index(op.f("ix_applicants_external_id"), table_name="applicants")
    op.drop_index(op.f("ix_applicants_email"), table_name="applicants")
    op.drop_table("applicants")
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")

