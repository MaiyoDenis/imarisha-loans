from flask import Blueprint, Response, request, jsonify
from app.services.report_service import ReportService
from datetime import datetime, timedelta
from app.utils.decorators import admin_required, staff_required
from flask_jwt_extended import jwt_required

bp = Blueprint('reports', __name__, url_prefix='/api/reports')

@bp.route('/portfolio/export', methods=['GET'])
@jwt_required()
@staff_required
def export_portfolio():
    try:
        csv_content = ReportService.generate_loan_portfolio_report()
        
        return Response(
            csv_content,
            mimetype="text/csv",
            headers={"Content-disposition": "attachment; filename=loan_portfolio.csv"}
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/transactions/export', methods=['GET'])
@jwt_required()
@staff_required
def export_transactions():
    try:
        start_date_str = request.args.get('startDate')
        end_date_str = request.args.get('endDate')
        
        if start_date_str and end_date_str:
            start_date = datetime.fromisoformat(start_date_str.replace('Z', '+00:00'))
            end_date = datetime.fromisoformat(end_date_str.replace('Z', '+00:00'))
        else:
            # Default to last 30 days
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=30)
            
        csv_content = ReportService.generate_transaction_report(start_date, end_date)
        
        filename = f"transactions_{start_date.strftime('%Y%m%d')}_{end_date.strftime('%Y%m%d')}.csv"
        
        return Response(
            csv_content,
            mimetype="text/csv",
            headers={"Content-disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/arrears/export', methods=['GET'])
@jwt_required()
@staff_required
def export_arrears():
    try:
        csv_content = ReportService.generate_arrears_report()
        
        return Response(
            csv_content,
            mimetype="text/csv",
            headers={"Content-disposition": "attachment; filename=arrears_report.csv"}
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500
