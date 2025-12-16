from flask import Blueprint, request, jsonify
from app.services.field_service import FieldService
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

bp = Blueprint('field', __name__, url_prefix='/api/field')

@bp.route('/visits', methods=['POST'])
@jwt_required()
def log_visit():
    data = request.get_json()
    current_user_id = get_jwt_identity()
    
    required = ['memberId', 'locationLat', 'locationLng']
    if not all(k in data for k in required):
        return jsonify({'error': 'Missing required fields'}), 400
        
    visit = FieldService.log_visit(
        officer_id=current_user_id,
        member_id=data['memberId'],
        location_lat=data['locationLat'],
        location_lng=data['locationLng'],
        notes=data.get('notes'),
        photo_url=data.get('photoUrl')
    )
    
    return jsonify(visit.to_dict()), 201

@bp.route('/visits', methods=['GET'])
@jwt_required()
def get_visits():
    current_user_id = get_jwt_identity()
    date_str = request.args.get('date')
    
    date = None
    if date_str:
        try:
            date = datetime.fromisoformat(date_str.replace('Z', '+00:00')).date()
        except ValueError:
            pass
            
    visits = FieldService.get_officer_visits(current_user_id, date)
    return jsonify([v.to_dict() for v in visits])
