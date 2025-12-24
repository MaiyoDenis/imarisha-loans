import os
from sqlalchemy import create_engine, text, inspect
from config import Config

def fix_db_state():
    print("Checking database state...")
    
    # Get database URL
    db_url = Config.SQLALCHEMY_DATABASE_URI
    if not db_url:
        print("No database URL found.")
        return

    try:
        engine = create_engine(db_url)
        inspector = inspect(engine)
        
        tables = inspector.get_table_names()
        print(f"Existing tables: {tables}")
        
        has_alembic = 'alembic_version' in tables
        has_roles = 'roles' in tables
        
        if has_alembic and not has_roles:
            print("Detected inconsistent state: alembic_version exists but roles table is missing.")
            print("This prevents migrations from running. Dropping alembic_version table...")
            
            with engine.connect() as conn:
                conn.execute(text("DROP TABLE alembic_version"))
                conn.commit()
            
            print("alembic_version dropped. Migrations should now run from scratch.")
        elif not has_alembic and not has_roles:
             print("Database is empty. Migrations should run normally.")
        elif has_roles:
            print("Roles table exists. Database seems initialized.")
            
    except Exception as e:
        print(f"Error checking/fixing database state: {e}")

if __name__ == '__main__':
    fix_db_state()
