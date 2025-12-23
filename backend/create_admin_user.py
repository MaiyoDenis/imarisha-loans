#!/usr/bin/env python3
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db, bcrypt
from app.models import User, Role

def create_admin():
    app = create_app()
    
    with app.app_context():
        # Check if admin user already exists
        existing = User.query.filter_by(username='admin').first()
        if existing:
            print(f"Admin user already exists (ID: {existing.id})")
            return False
        
        # Get admin role
        admin_role = Role.query.filter_by(name='admin').first()
        if not admin_role:
            print("Admin role not found")
            return False
        
        # Create admin user
        user = User(
            username='admin',
            phone='+254700000000',
            password=bcrypt.generate_password_hash('admin123').decode('utf-8'),
            role_id=admin_role.id,
            first_name='System',
            last_name='Admin',
            is_active=True
        )
        
        db.session.add(user)
        db.session.commit()
        
        print("Admin user created!")
        print(f"Username: admin")
        print(f"Password: admin123")
        return True

if __name__ == '__main__':
    create_admin()
