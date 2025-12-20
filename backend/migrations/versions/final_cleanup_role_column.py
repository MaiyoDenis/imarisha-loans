"""Final cleanup - drop role column using raw SQL

Revision ID: final_cleanup_role_column
Revises: force_drop_role_column
Create Date: 2025-12-20 20:46:00.000000

"""
from alembic import op
from sqlalchemy import text


revision = 'final_cleanup_role_column'
down_revision = 'force_drop_role_column'
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    
    try:
        conn.execute(text('ALTER TABLE users DROP COLUMN role'))
        conn.commit()
        print("Dropped role column")
    except Exception as e:
        print(f"Note: {e}")
        conn.rollback()


def downgrade():
    pass
