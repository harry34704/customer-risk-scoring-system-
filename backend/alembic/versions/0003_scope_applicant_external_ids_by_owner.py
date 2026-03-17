"""scope applicant external ids by owner

Revision ID: 0003_scope_owner_ext_ids
Revises: 0002_add_password_hash_to_users
Create Date: 2026-03-17 18:40:00.000000
"""

from alembic import op


revision = "0003_scope_owner_ext_ids"
down_revision = "0002_add_password_hash_to_users"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("applicants") as batch_op:
        batch_op.drop_constraint("applicants_external_id_key", type_="unique")
        batch_op.drop_index("ix_applicants_external_id")
        batch_op.create_index("ix_applicants_external_id", ["external_id"], unique=False)
        batch_op.create_unique_constraint("uq_applicants_owner_external_id", ["owner_user_id", "external_id"])


def downgrade() -> None:
    with op.batch_alter_table("applicants") as batch_op:
        batch_op.drop_constraint("uq_applicants_owner_external_id", type_="unique")
        batch_op.drop_index("ix_applicants_external_id")
        batch_op.create_index("ix_applicants_external_id", ["external_id"], unique=True)
        batch_op.create_unique_constraint("applicants_external_id_key", ["external_id"])
