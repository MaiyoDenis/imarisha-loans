from app.models import Member, Loan, SavingsAccount, Transaction
from app import db
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from decimal import Decimal
import redis
import json

class RiskService:
    def __init__(self, app=None):
        self.redis_client = None
        self.app = None
        
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize risk service with Flask app"""
        self.app = app
        try:
            self.redis_client = redis.Redis(
                host=app.config.get('REDIS_HOST', 'localhost'),
                port=app.config.get('REDIS_PORT', 6379),
                db=app.config.get('REDIS_DB', 4),
                decode_responses=True
            )
        except Exception as e:
            logging.warning(f"Failed to initialize Redis for risk service: {str(e)}")
        
        logging.info("Risk Service initialized successfully")
    
    def calculate_risk_score(self, member_id: int) -> dict:
        """
        Calculate risk score based on 5-factor model
        Returns score (0-100) and breakdown
        """
        try:
            member = Member.query.get(member_id)
            if not member:
                return {'score': 0, 'category': 'Unknown', 'factors': {}}
                
            score = 50 # Base score
            factors = {}
            
            # 1. Repayment History (Max 35 points)
            repayment_score = self._calculate_repayment_score(member)
            score += repayment_score
            factors['repayment_history'] = repayment_score
            
            # 2. Savings History (Max 25 points)
            savings_score = self._calculate_savings_score(member)
            score += savings_score
            factors['savings_history'] = savings_score
            
            # 3. Loan Utilization (Max 15 points)
            utilization_score = self._calculate_utilization_score(member)
            score += utilization_score
            factors['loan_utilization'] = utilization_score
            
            # 4. Group Performance (Max 15 points)
            group_score = self._calculate_group_score(member)
            score += group_score
            factors['group_performance'] = group_score
            
            # 5. Demographics/Stability (Max 10 points)
            demographic_score = self._calculate_demographic_score(member)
            score += demographic_score
            factors['demographics'] = demographic_score
            
            # Normalize score to 0-100
            final_score = min(max(int(score), 0), 100)
            category = self.get_risk_category(final_score)
            
            # Update member profile
            member.risk_score = final_score
            member.risk_category = category
            db.session.commit()
            
            return {
                'score': final_score,
                'category': category,
                'factors': factors
            }
            
        except Exception as e:
            logging.error(f"Error calculating risk score: {str(e)}")
            return {'score': 0, 'category': 'Error', 'factors': {}}

    def get_risk_category(self, score: int) -> str:
        if score >= 80: return 'Low Risk'
        if score >= 60: return 'Medium Risk'
        if score >= 40: return 'High Risk'
        return 'Critical Risk'

    def _calculate_repayment_score(self, member: Member) -> int:
        """Calculate repayment history score (Max 35 points)"""
        loans = Loan.query.filter_by(member_id=member.id).all()
        if not loans:
            return 0
            
        score = 0
        completed = 0
        defaulted = 0
        on_time = 0
        overdue = 0
        
        for loan in loans:
            if loan.status == 'completed':
                completed += 1
                score += 5  # Base points for completion
                
                # Check if completed on time
                if loan.paid_date and loan.due_date and loan.paid_date <= loan.due_date:
                    on_time += 1
                    score += 3  # Bonus for on-time payment
            elif loan.status == 'defaulted':
                defaulted += 1
                score -= 20
            elif loan.status == 'disbursed':
                # Check for overdue status
                if loan.due_date and datetime.utcnow() > loan.due_date and loan.outstanding_balance > 0:
                    overdue += 1
                    days_overdue = (datetime.utcnow() - loan.due_date).days
                    score -= min(10, 2 + (days_overdue // 10))
        
        # Completion rate bonus
        if len(loans) > 0:
            completion_rate = completed / len(loans)
            if completion_rate >= 0.8:
                score += 5
            elif completion_rate >= 0.5:
                score += 2
        
        return min(max(score, -35), 35)

    def _calculate_savings_score(self, member: Member) -> int:
        """Calculate savings history score (Max 25 points)"""
        savings = SavingsAccount.query.filter_by(
            member_id=member.id,
            account_type='savings'
        ).first()
        
        if not savings:
            return 0
            
        balance = float(savings.balance)
        score = 0
        
        # Balance-based points
        if balance > 100000:
            score += 25
        elif balance > 50000:
            score += 20
        elif balance > 20000:
            score += 15
        elif balance > 10000:
            score += 10
        elif balance > 5000:
            score += 7
        elif balance > 1000:
            score += 4
        else:
            score += 0
        
        # Savings consistency (based on transaction history)
        deposits = Transaction.query.filter(
            Transaction.member_id == member.id,
            Transaction.account_type == 'savings',
            Transaction.transaction_type.in_(['deposit', 'credit']),
            Transaction.created_at >= datetime.utcnow() - timedelta(days=90)
        ).count()
        
        if deposits >= 12:  # At least monthly deposits
            score += 5
        elif deposits >= 6:
            score += 3
        
        return min(max(score, -25), 25)

    def _calculate_utilization_score(self, member: Member) -> int:
        # Logic: Frequency of loans
        loan_count = Loan.query.filter_by(member_id=member.id).count()
        if loan_count > 10: return 15
        if loan_count > 5: return 10
        if loan_count > 2: return 5
        return 0

    def _calculate_group_score(self, member: Member) -> int:
        # Logic: Average score of group members
        if not member.group_id:
            return 0
            
        # This could be expensive, simplified for now
        return 5

    def _calculate_demographic_score(self, member: Member) -> int:
        # Logic: Age, location stability (placeholder)
        return 5

    def detect_fraud(self, member_id: int) -> Dict[str, Any]:
        """Check for potential fraud indicators"""
        flags = []
        risk_score = 0
        
        # Check 1: Multiple loan applications in short time
        last_24h = datetime.utcnow() - timedelta(hours=24)
        recent_applications = Loan.query.filter(
            Loan.member_id == member_id,
            Loan.created_at >= last_24h
        ).count()
        
        if recent_applications >= 3:
            flags.append('Multiple loan applications in 24 hours')
            risk_score += 25
        
        # Check 2: Rapid withdrawal after large deposit
        large_deposit = Transaction.query.filter(
            Transaction.member_id == member_id,
            Transaction.transaction_type.in_(['deposit', 'credit']),
            Transaction.amount > 50000,
            Transaction.created_at >= datetime.utcnow() - timedelta(hours=1)
        ).first()
        
        if large_deposit:
            rapid_withdrawal = Transaction.query.filter(
                Transaction.member_id == member_id,
                Transaction.transaction_type.in_(['withdrawal', 'debit']),
                Transaction.amount > large_deposit.amount * 0.8,
                Transaction.created_at >= large_deposit.created_at,
                Transaction.created_at <= large_deposit.created_at + timedelta(hours=1)
            ).first()
            
            if rapid_withdrawal:
                flags.append('Suspicious rapid withdrawal after large deposit')
                risk_score += 30
        
        # Check 3: Pattern deviation (significantly different behavior)
        # Compare current month vs average of last 3 months
        current_month_total = Transaction.query.filter(
            Transaction.member_id == member_id,
            Transaction.created_at >= datetime.utcnow() - timedelta(days=30)
        ).count()
        
        three_month_avg = Transaction.query.filter(
            Transaction.member_id == member_id,
            Transaction.created_at >= datetime.utcnow() - timedelta(days=90)
        ).count() / 3
        
        if three_month_avg > 0 and current_month_total > three_month_avg * 3:
            flags.append('Unusual transaction volume increase')
            risk_score += 15
        
        # Determine risk level
        if risk_score >= 50:
            risk_level = 'critical'
        elif risk_score >= 30:
            risk_level = 'high'
        elif risk_score >= 15:
            risk_level = 'medium'
        else:
            risk_level = 'low'
        
        if risk_level in ['high', 'critical']:
            logging.warning(f"Fraud alert for member {member_id}: {flags}")
        
        return {
            'risk_level': risk_level,
            'risk_score': risk_score,
            'flags': flags
        }

    def predict_default_probability(self, member_id: int, loan_id: int = None) -> Dict[str, Any]:
        """Predict probability of loan default using risk factors"""
        member = Member.query.get(member_id)
        if not member:
            return {'probability': 0, 'confidence': 0}
        
        risk_score = member.risk_score or 0
        
        # Get relevant loan
        if loan_id:
            loan = Loan.query.get(loan_id)
        else:
            # Get most recent active loan
            loan = Loan.query.filter_by(
                member_id=member_id,
                status='disbursed'
            ).order_by(Loan.created_at.desc()).first()
        
        if not loan:
            return {'probability': 0, 'confidence': 0}
        
        # Calculate default probability based on:
        # 1. Risk score (inverse relationship)
        # 2. Loan amount vs savings ratio
        # 3. Current loan count
        # 4. Payment history
        
        probability = 0
        
        # Factor 1: Risk score (max 40 points contribution)
        if risk_score >= 80:
            probability += 5
        elif risk_score >= 60:
            probability += 15
        elif risk_score >= 40:
            probability += 30
        else:
            probability += 50
        
        # Factor 2: Loan-to-Savings ratio
        savings = SavingsAccount.query.filter_by(
            member_id=member_id,
            account_type='savings'
        ).first()
        
        if savings and savings.balance > 0:
            ratio = float(loan.approved_amount) / savings.balance
            if ratio > 4:
                probability += 25
            elif ratio > 2:
                probability += 15
            elif ratio > 1:
                probability += 5
        else:
            probability += 30
        
        # Factor 3: Multiple active loans
        active_loans = Loan.query.filter_by(
            member_id=member_id,
            status='disbursed'
        ).count()
        
        if active_loans >= 3:
            probability += 10
        elif active_loans >= 2:
            probability += 5
        
        # Normalize to 0-100
        probability = min(max(probability, 0), 100)
        
        return {
            'member_id': member_id,
            'loan_id': loan_id,
            'default_probability': probability,
            'risk_level': 'high' if probability > 60 else 'medium' if probability > 30 else 'low',
            'confidence': 75  # Confidence in the prediction
        }
    
    def check_early_warnings(self, member_id: int) -> Dict[str, Any]:
        """Check for early warning signs of financial distress"""
        member = Member.query.get(member_id)
        if not member:
            return {'warnings': []}
        
        warnings = []
        alerts = []
        
        # Warning 1: Multiple overdue loans
        overdue_loans = Loan.query.filter(
            Loan.member_id == member_id,
            Loan.status == 'disbursed',
            Loan.due_date < datetime.utcnow()
        ).all()
        
        if len(overdue_loans) >= 2:
            warnings.append({
                'type': 'multiple_overdue_loans',
                'message': f'{len(overdue_loans)} loans are overdue',
                'severity': 'high'
            })
            alerts.append('send_sms')
        
        # Warning 2: Declining savings
        savings = SavingsAccount.query.filter_by(
            member_id=member_id,
            account_type='savings'
        ).first()
        
        if savings:
            month_ago = datetime.utcnow() - timedelta(days=30)
            # Check if withdrawals exceed deposits in last month
            withdrawals = Transaction.query.filter(
                Transaction.member_id == member_id,
                Transaction.account_type == 'savings',
                Transaction.transaction_type.in_(['withdrawal', 'debit']),
                Transaction.created_at >= month_ago
            ).with_entities(db.func.sum(Transaction.amount)).scalar() or 0
            
            deposits = Transaction.query.filter(
                Transaction.member_id == member_id,
                Transaction.account_type == 'savings',
                Transaction.transaction_type.in_(['deposit', 'credit']),
                Transaction.created_at >= month_ago
            ).with_entities(db.func.sum(Transaction.amount)).scalar() or 0
            
            if withdrawals > deposits * 1.5:
                warnings.append({
                    'type': 'declining_savings',
                    'message': 'Savings declining rapidly',
                    'severity': 'medium'
                })
                if withdrawals > deposits * 2:
                    alerts.append('send_sms')
        
        # Warning 3: Missed minimum savings requirements
        if savings and float(savings.balance) < 1000:
            warnings.append({
                'type': 'low_savings',
                'message': 'Savings below minimum recommended level',
                'severity': 'low'
            })
        
        # Store warnings in Redis if available
        if self.redis_client and warnings:
            warning_key = f"warnings:{member_id}:{datetime.utcnow().strftime('%Y%m%d')}"
            self.redis_client.setex(
                warning_key,
                7*24*60*60,
                json.dumps(warnings)
            )
        
        return {
            'member_id': member_id,
            'warnings': warnings,
            'recommended_actions': alerts
        }
    
    def get_interest_rate_recommendation(self, risk_score: int, base_rate: float) -> float:
        """
        Suggest interest rate based on risk score
        """
        if risk_score >= 80: return float(base_rate) # Low risk, best rate
        if risk_score >= 60: return float(base_rate) * 1.1 # Medium risk
        if risk_score >= 40: return float(base_rate) * 1.25 # High risk
        return float(base_rate) * 1.5 # Critical risk

# Global Risk service instance
risk_service = RiskService()
