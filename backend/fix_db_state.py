import os
from sqlalchemy import create_engine, text, inspect
from config import Config

def fix_db_state():
    print("Checking database state...")
    
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
        has_messages = 'messages' in tables
        has_system_subscriptions = 'system_subscriptions' in tables
        has_other_tables = len([t for t in tables if t != 'alembic_version']) > 0
        
        if has_alembic:
            with engine.connect() as conn:
                result = conn.execute(text("SELECT version_num FROM alembic_version LIMIT 1"))
                row = result.fetchone()
                if row:
                    current_revision = row[0]
                    print(f"Current revision in database: {current_revision}")
                    
                    migration_files = []
                    try:
                        versions_dir = os.path.join(os.path.dirname(__file__), 'migrations', 'versions')
                        if os.path.exists(versions_dir):
                            for file in os.listdir(versions_dir):
                                if file.endswith('.py') and file != '__init__.py':
                                    migration_files.append(file.split('_')[0])
                    except:
                        pass
                    
                    if current_revision not in migration_files:
                        print(f"Revision {current_revision} not found in migration files.")
                        print("This database has tables but incompatible migration history.")
                        
                        if has_other_tables:
                            print("Database has existing data. Will stamp to latest migration to preserve data.")
                            
                            # Find the head revision by following the chain
                            head_revision = None
                            all_revs = set()
                            try:
                                rev_map = {}
                                for file in os.listdir(versions_dir):
                                    if file.endswith('.py') and file != '__init__.py':
                                        with open(os.path.join(versions_dir, file), 'r') as f:
                                            content = f.read()
                                            rev = None
                                            down_rev = None
                                            for line in content.split('\n'):
                                                if line.startswith('revision ='):
                                                    rev = line.split('=')[1].strip().strip("'").strip('"')
                                                if line.startswith('down_revision ='):
                                                    down_rev = line.split('=')[1].strip().strip("'").strip('"')
                                                    if down_rev == 'None': down_rev = None
                                            if rev:
                                                rev_map[rev] = down_rev
                                
                                # The head is the one that is not a down_revision for anyone else
                                all_revs = set(rev_map.keys())
                                all_down_revs = set(rev_map.values())
                                heads = all_revs - all_down_revs
                                if heads:
                                    head_revision = list(heads)[0]
                            except Exception as e:
                                print(f"Error finding head revision: {e}")
                            
                            # Choose the best target revision based on tables
                            target_revision = head_revision
                            if not has_messages and has_system_subscriptions:
                                # We are likely at 0b3117ce2547 (before messages)
                                if '0b3117ce2547' in all_revs:
                                    target_revision = '0b3117ce2547'
                            elif not has_system_subscriptions and has_roles:
                                # We are likely at b4c36442d5cd
                                if 'b4c36442d5cd' in all_revs:
                                    target_revision = 'b4c36442d5cd'
                            
                            if target_revision:
                                try:
                                    conn.execute(text(f"UPDATE alembic_version SET version_num = '{target_revision}'"))
                                    conn.commit()
                                    print(f"Stamped database to revision {target_revision}")
                                except Exception as e:
                                    print(f"Failed to stamp: {e}")
                        else:
                            print("Dropping alembic_version to reset migration state...")
                            try:
                                conn.execute(text("DROP TABLE alembic_version"))
                                conn.commit()
                                print("alembic_version dropped. Migrations will run from scratch.")
                            except Exception as e:
                                print(f"Failed to drop alembic_version: {e}")
                    else:
                        print("Revision found in migration files. Database state is consistent.")
        elif not has_roles and not has_other_tables:
             print("Database is empty. Migrations should run normally.")
        else:
            print("Database has tables but no alembic_version.")
            if has_other_tables:
                print("Attempting to stamp database with latest migration...")
                versions_dir = os.path.join(os.path.dirname(__file__), 'migrations', 'versions')
                head_revision = None
                all_revs = set()
                try:
                    rev_map = {}
                    if os.path.exists(versions_dir):
                        for file in os.listdir(versions_dir):
                            if file.endswith('.py') and file != '__init__.py':
                                with open(os.path.join(versions_dir, file), 'r') as f:
                                    content = f.read()
                                    rev = None
                                    down_rev = None
                                    for line in content.split('\n'):
                                        if line.startswith('revision ='):
                                            rev = line.split('=')[1].strip().strip("'").strip('"')
                                        if line.startswith('down_revision ='):
                                            down_rev = line.split('=')[1].strip().strip("'").strip('"')
                                            if down_rev == 'None': down_rev = None
                                    if rev:
                                        rev_map[rev] = down_rev
                    
                    all_revs = set(rev_map.keys())
                    all_down_revs = set(rev_map.values())
                    heads = all_revs - all_down_revs
                    if heads:
                        head_revision = list(heads)[0]
                except Exception as e:
                    print(f"Error finding head revision: {e}")
                
                # Choose the best target revision based on tables
                target_revision = head_revision
                if not has_messages and has_system_subscriptions:
                    if '0b3117ce2547' in all_revs:
                        target_revision = '0b3117ce2547'
                elif not has_system_subscriptions and has_roles:
                    if 'b4c36442d5cd' in all_revs:
                        target_revision = 'b4c36442d5cd'
                
                if target_revision:
                    try:
                        with engine.connect() as conn:
                            # Create table if not exists
                            conn.execute(text("CREATE TABLE IF NOT EXISTS alembic_version (version_num VARCHAR(32) PRIMARY KEY)"))
                            conn.execute(text(f"INSERT INTO alembic_version (version_num) VALUES ('{target_revision}')"))
                            conn.commit()
                            print(f"Created alembic_version table and stamped to {target_revision}")
                    except Exception as e:
                        print(f"Failed to create alembic_version: {e}")
            
    except Exception as e:
        print(f"Error checking/fixing database state: {e}")

if __name__ == '__main__':
    fix_db_state()
