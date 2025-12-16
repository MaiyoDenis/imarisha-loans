from functools import wraps
from flask import jsonify
from app.services.jwt_service import jwt_required_api, role_required as jwt_role_required

def login_required(f):
    return jwt_required_api(f)

def role_required(roles):
    """
    Decorator for role-based access control.
    Supports passing a list of roles or a single role.
    """
    if isinstance(roles, list):
        return jwt_role_required(*roles)
    return jwt_role_required(roles)

def admin_required(f):
    """
    Decorator for admin-only endpoints.
    """
    return jwt_role_required('admin')(f)

def staff_required(f):
    """
    Decorator for staff-only endpoints.
    Allows both admin and staff roles.
    """
    return jwt_role_required('admin', 'staff', 'loan_officer', 'branch_manager')(f)
