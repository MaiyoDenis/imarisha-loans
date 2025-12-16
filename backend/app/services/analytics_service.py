from app import db
from app.models import Loan, Transaction, Member, SavingsAccount
from sqlalchemy import func, case
from datetime import datetime, timedelta
import pandas as pd
import numpy as np

class AnalyticsService:
    @staticmethod
    def get_portfolio_metrics():
        """
        Get key portfolio metrics including PAR (Portfolio at Risk)
        """
        total_loans = Loan.query.count()
        active_loans = Loan.query.filter_by(status='active').count()
        
        total_outstanding = db.session.query(func.sum(Loan.outstanding_balance))\
            .filter(Loan.status == 'active').scalar() or 0
            
        total_disbursed = db.session.query(func.sum(Loan.principle_amount))\
            .filter(Loan.status.in_(['active', 'completed'])).scalar() or 0

        # PAR Calculation (Portfolio at Risk)
        now = datetime.utcnow()
        par_30_date = now - timedelta(days=30)
        par_90_date = now - timedelta(days=90)
        
        par_30_amount = db.session.query(func.sum(Loan.outstanding_balance))\
            .filter(Loan.status == 'active', Loan.due_date < par_30_date).scalar() or 0
            
        par_90_amount = db.session.query(func.sum(Loan.outstanding_balance))\
            .filter(Loan.status == 'active', Loan.due_date < par_90_date).scalar() or 0
            
        par_30_ratio = (float(par_30_amount) / float(total_outstanding)) * 100 if total_outstanding > 0 else 0
        par_90_ratio = (float(par_90_amount) / float(total_outstanding)) * 100 if total_outstanding > 0 else 0
        
        return {
            'total_loans': total_loans,
            'active_loans': active_loans,
            'total_outstanding': float(total_outstanding),
            'total_disbursed': float(total_disbursed),
            'par_30_amount': float(par_30_amount),
            'par_90_amount': float(par_90_amount),
            'par_30_ratio': round(par_30_ratio, 2),
            'par_90_ratio': round(par_90_ratio, 2)
        }

    @staticmethod
    def get_repayment_forecast(days=30):
        """
        Predict future repayments using historical data (Simple Linear Regression)
        """
        # Get last 90 days of repayments
        start_date = datetime.utcnow() - timedelta(days=90)
        repayments = db.session.query(
            func.date(Transaction.created_at).label('date'),
            func.sum(Transaction.amount).label('amount')
        ).filter(
            Transaction.transaction_type == 'loan_repayment',
            Transaction.created_at >= start_date
        ).group_by(func.date(Transaction.created_at)).all()
        
        if not repayments:
            return {'forecast': 0, 'trend': 'insufficient_data'}
            
        df = pd.DataFrame(repayments, columns=['date', 'amount'])
        df['date'] = pd.to_datetime(df['date'])
        df['days_since_start'] = (df['date'] - df['date'].min()).dt.days
        
        # Simple Linear Regression
        X = df['days_since_start'].values.reshape(-1, 1)
        y = df['amount'].astype(float).values
        
        # Calculate slope and intercept manually to avoid scikit-learn dependency if needed
        # But since we have numpy:
        A = np.vstack([X.flatten(), np.ones(len(X))]).T
        m, c = np.linalg.lstsq(A, y, rcond=None)[0]
        
        # Predict next 'days'
        last_day = df['days_since_start'].max()
        future_days = np.arange(last_day + 1, last_day + days + 1)
        predictions = m * future_days + c
        
        total_forecast = np.sum(predictions)
        
        return {
            'forecast_amount': round(max(0, total_forecast), 2),
            'trend': 'up' if m > 0 else 'down',
            'daily_average': round(float(np.mean(y)), 2)
        }

    @staticmethod
    def get_customer_segments():
        """
        Segment customers based on risk score and activity
        """
        # High Risk: Risk Score < 50
        high_risk = Member.query.filter(Member.risk_score < 50).count()
        
        # Medium Risk: Risk Score 50-75
        medium_risk = Member.query.filter(Member.risk_score >= 50, Member.risk_score < 75).count()
        
        # Low Risk: Risk Score >= 75
        low_risk = Member.query.filter(Member.risk_score >= 75).count()
        
        # Active vs Inactive (No transaction in last 30 days)
        last_month = datetime.utcnow() - timedelta(days=30)
        active_members = db.session.query(Transaction.member_id).distinct()\
            .filter(Transaction.created_at >= last_month).count()
            
        total_members = Member.query.count()
        inactive_members = total_members - active_members
        
        return {
            'risk_segments': {
                'high_risk': high_risk,
                'medium_risk': medium_risk,
                'low_risk': low_risk
            },
            'activity_segments': {
                'active': active_members,
                'inactive': inactive_members
            }
        }
