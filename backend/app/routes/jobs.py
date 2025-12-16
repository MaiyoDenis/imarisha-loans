from flask import Blueprint, jsonify
from app.services.loan_service import loan_service
from app.services.jwt_service import role_required

bp = Blueprint('jobs', __name__, url_prefix='/api/jobs')

@bp.route('/check-due-loans', methods=['POST'])
@role_required('admin')
def check_due_loans():
    result = loan_service.check_due_loans()
    return jsonify(result)
