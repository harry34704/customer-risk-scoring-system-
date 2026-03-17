"""add password hash to users

Revision ID: 0002_add_password_hash_to_users
Revises: 0001_initial_schema
Create Date: 2026-03-17 16:45:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "0002_add_password_hash_to_users"
down_revision = "0001_initial_schema"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("password_hash", sa.String(length=255), nullable=False, server_default=""))
    op.alter_column("users", "password_hash", server_default=None)


def downgrade() -> None:
    op.drop_column("users", "password_hash")
