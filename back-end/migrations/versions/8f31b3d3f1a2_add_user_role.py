"""add user role

Revision ID: 8f31b3d3f1a2
Revises: e382deafbd7a
Create Date: 2026-07-07 15:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "8f31b3d3f1a2"
down_revision = "e382deafbd7a"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("users", sa.Column("role", sa.String(length=20), nullable=True))
    op.execute("UPDATE users SET role = 'user' WHERE role IS NULL")
    op.alter_column("users", "role", existing_type=sa.String(length=20), nullable=False, server_default="user")


def downgrade():
    op.drop_column("users", "role")
