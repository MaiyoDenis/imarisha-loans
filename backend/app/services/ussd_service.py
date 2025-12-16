"""
USSD Service - Unstructured Supplementary Service Data
Enables feature phone users to access loan services via USSD codes
"""
import logging
import json
from datetime import datetime
from typing import Dict, Any, Optional, List
from flask import current_app
import redis

class USSDService:
    """USSD menu system for feature phone users"""
    
    def __init__(self, app=None):
        self.app = None
        self.redis_client = None
        self.ussd_code = "*123#"
        self.provider = "africastalking"  # or "twilio"
        
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize USSD service"""
        self.app = app
        self.ussd_code = app.config.get('USSD_CODE', '*123#')
        self.provider = app.config.get('USSD_PROVIDER', 'africastalking')
        
        try:
            self.redis_client = redis.Redis(
                host=app.config.get('REDIS_HOST', 'localhost'),
                port=app.config.get('REDIS_PORT', 6379),
                db=app.config.get('REDIS_DB', 6),
                decode_responses=True
            )
        except Exception as e:
            logging.warning(f"Failed to initialize Redis for USSD: {str(e)}")
        
        logging.info(f"USSD Service initialized with code: {self.ussd_code}")
    
    def handle_ussd_request(self, phone_number: str, user_input: str, 
                           session_id: str) -> Dict[str, Any]:
        """Handle incoming USSD request"""
        try:
            session = self._get_session(session_id)
            
            if not session:
                session = {
                    'phone_number': phone_number,
                    'session_id': session_id,
                    'state': 'main_menu',
                    'created_at': datetime.utcnow().isoformat(),
                    'interactions': 0
                }
            
            session['interactions'] += 1
            session['last_input'] = user_input
            session['last_interaction'] = datetime.utcnow().isoformat()
            
            response = self._process_input(session, user_input)
            
            self._save_session(session_id, session)
            
            return response
        
        except Exception as e:
            logging.error(f"Error handling USSD request: {str(e)}")
            return self._error_response("System error. Please try again.")
    
    def _get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get USSD session"""
        try:
            if self.redis_client:
                session_json = self.redis_client.get(f"ussd_session:{session_id}")
                if session_json:
                    return json.loads(session_json)
            return None
        except Exception as e:
            logging.error(f"Error getting USSD session: {str(e)}")
            return None
    
    def _save_session(self, session_id: str, session: Dict[str, Any]) -> bool:
        """Save USSD session"""
        try:
            if self.redis_client:
                self.redis_client.setex(
                    f"ussd_session:{session_id}",
                    600,  # 10 minutes session timeout
                    json.dumps(session)
                )
                return True
            return False
        except Exception as e:
            logging.error(f"Error saving USSD session: {str(e)}")
            return False
    
    def _process_input(self, session: Dict[str, Any], user_input: str) -> Dict[str, Any]:
        """Process USSD user input based on current state"""
        state = session.get('state', 'main_menu')
        
        if state == 'main_menu':
            if user_input == '1':
                session['state'] = 'check_balance'
                return self._check_balance_menu(session)
            elif user_input == '2':
                session['state'] = 'loan_info'
                return self._loan_info_menu(session)
            elif user_input == '3':
                session['state'] = 'quick_loan'
                return self._quick_loan_menu(session)
            elif user_input == '4':
                session['state'] = 'make_payment'
                return self._make_payment_menu(session)
            elif user_input == '5':
                session['state'] = 'contact_support'
                return self._contact_support_menu(session)
            elif user_input == '0':
                return self._exit_response()
            else:
                return self._main_menu()
        
        elif state == 'check_balance':
            if user_input == '0':
                return self._main_menu_with_prev(session)
            return self._check_balance_info(session)
        
        elif state == 'loan_info':
            if user_input == '0':
                return self._main_menu_with_prev(session)
            return self._loan_info_detail(session, user_input)
        
        elif state == 'quick_loan':
            if user_input == '0':
                return self._main_menu_with_prev(session)
            return self._quick_loan_process(session, user_input)
        
        elif state == 'make_payment':
            if user_input == '0':
                return self._main_menu_with_prev(session)
            return self._make_payment_process(session, user_input)
        
        elif state == 'contact_support':
            if user_input == '0':
                return self._main_menu_with_prev(session)
            return self._support_response(session)
        
        else:
            return self._main_menu()
    
    def _main_menu(self) -> Dict[str, Any]:
        """Main menu"""
        return {
            'response': "Welcome to Imarisha Loans!\n"
                       "1. Check Balance\n"
                       "2. Loan Information\n"
                       "3. Quick Loan\n"
                       "4. Make Payment\n"
                       "5. Contact Support\n"
                       "0. Exit",
            'continue_session': True
        }
    
    def _main_menu_with_prev(self, session: Dict[str, Any]) -> Dict[str, Any]:
        """Main menu after previous selection"""
        session['state'] = 'main_menu'
        return self._main_menu()
    
    def _check_balance_menu(self, session: Dict[str, Any]) -> Dict[str, Any]:
        """Check balance submenu"""
        return {
            'response': "Check Balance\n"
                       "1. Savings Balance\n"
                       "2. Loan Balance\n"
                       "3. Total Assets\n"
                       "0. Back to Menu",
            'continue_session': True
        }
    
    def _check_balance_info(self, session: Dict[str, Any]) -> Dict[str, Any]:
        """Get balance information"""
        phone = session.get('phone_number')
        
        balance_response = "Your Balance:\n"
        balance_response += "Savings: KES 15,000\n"
        balance_response += "Loan Balance: KES 8,500\n"
        balance_response += "Status: Active\n\n"
        balance_response += "0. Back to Menu"
        
        return {
            'response': balance_response,
            'continue_session': True
        }
    
    def _loan_info_menu(self, session: Dict[str, Any]) -> Dict[str, Any]:
        """Loan information submenu"""
        return {
            'response': "Loan Information\n"
                       "1. My Loans\n"
                       "2. Apply for Loan\n"
                       "3. Loan Rates\n"
                       "0. Back to Menu",
            'continue_session': True
        }
    
    def _loan_info_detail(self, session: Dict[str, Any], user_input: str) -> Dict[str, Any]:
        """Get loan information detail"""
        if user_input == '1':
            response = "Your Loans:\n"
            response += "1. Standard Loan (KES 50,000) - Due: 15 Jan\n"
            response += "2. Emergency Loan (KES 20,000) - Due: 30 Jan\n"
            response += "3. Check another loan\n"
            response += "0. Back to Menu"
        elif user_input == '3':
            response = "Loan Rates:\n"
            response += "Standard: 2% monthly\n"
            response += "Emergency: 3% monthly\n"
            response += "Savings: 0.5% monthly\n\n"
            response += "0. Back to Menu"
        else:
            response = "Enter amount to borrow (max KES 100,000):\n"
            response += "0. Cancel"
            session['state'] = 'entering_loan_amount'
        
        return {
            'response': response,
            'continue_session': True
        }
    
    def _quick_loan_menu(self, session: Dict[str, Any]) -> Dict[str, Any]:
        """Quick loan menu"""
        return {
            'response': "Quick Loan Amounts:\n"
                       "1. KES 10,000 (Pay KES 10,200)\n"
                       "2. KES 20,000 (Pay KES 20,400)\n"
                       "3. KES 30,000 (Pay KES 30,900)\n"
                       "4. Custom Amount\n"
                       "0. Back to Menu",
            'continue_session': True
        }
    
    def _quick_loan_process(self, session: Dict[str, Any], user_input: str) -> Dict[str, Any]:
        """Process quick loan request"""
        loan_amounts = {
            '1': 10000,
            '2': 20000,
            '3': 30000
        }
        
        if user_input in loan_amounts:
            amount = loan_amounts[user_input]
            response = f"Quick Loan Approved!\n"
            response += f"Amount: KES {amount:,}\n"
            response += f"Repayment: KES {amount * 1.02:,.0f}\n"
            response += f"Term: 30 days\n"
            response += f"Funds sent to {session.get('phone_number')}\n\n"
            response += "0. Back to Menu"
        else:
            response = "Enter custom amount:\n" \
                      "0. Cancel"
            session['state'] = 'entering_custom_loan'
        
        return {
            'response': response,
            'continue_session': True
        }
    
    def _make_payment_menu(self, session: Dict[str, Any]) -> Dict[str, Any]:
        """Make payment submenu"""
        return {
            'response': "Make Payment\n"
                       "1. Pay via M-Pesa\n"
                       "2. Pay via Airtel Money\n"
                       "3. Payment History\n"
                       "0. Back to Menu",
            'continue_session': True
        }
    
    def _make_payment_process(self, session: Dict[str, Any], user_input: str) -> Dict[str, Any]:
        """Process payment"""
        if user_input == '1':
            response = "Pay via M-Pesa\n"
            response += "Dial *141*1# and enter:\n"
            response += f"Amount: Amount owed\n"
            response += f"Account: Imarisha Loans\n"
            response += "Ref: " + session.get('phone_number') + "\n\n"
            response += "0. Back to Menu"
        elif user_input == '3':
            response = "Recent Payments:\n"
            response += "1. KES 5,000 - 10 Jan\n"
            response += "2. KES 3,000 - 05 Jan\n"
            response += "3. KES 2,500 - 28 Dec\n\n"
            response += "0. Back to Menu"
        else:
            response = "Payment amount: KES 5,000\n"
            response += "Confirm payment?\n"
            response += "1. Yes\n"
            response += "2. No\n"
            response += "0. Cancel"
        
        return {
            'response': response,
            'continue_session': True
        }
    
    def _contact_support_menu(self, session: Dict[str, Any]) -> Dict[str, Any]:
        """Contact support submenu"""
        return {
            'response': "Contact Support\n"
                       "1. Call Support\n"
                       "2. Support Info\n"
                       "3. Report Problem\n"
                       "0. Back to Menu",
            'continue_session': True
        }
    
    def _support_response(self, session: Dict[str, Any]) -> Dict[str, Any]:
        """Support response"""
        response = "Support Team:\n"
        response += "Phone: +254700123456\n"
        response += "Hours: Mon-Fri 9AM-5PM\n"
        response += "Email: support@imarisha.com\n\n"
        response += "0. Back to Menu"
        
        return {
            'response': response,
            'continue_session': True
        }
    
    def _error_response(self, message: str) -> Dict[str, Any]:
        """Error response"""
        response = message + "\n\n"
        response += "0. Back to Menu"
        
        return {
            'response': response,
            'continue_session': True
        }
    
    def _exit_response(self) -> Dict[str, Any]:
        """Exit response"""
        return {
            'response': "Thank you for using Imarisha Loans!\n"
                       "Visit: www.imarisha.com",
            'continue_session': False
        }
    
    def get_ussd_code(self) -> str:
        """Get USSD code"""
        return self.ussd_code
    
    def get_ussd_status(self) -> Dict[str, Any]:
        """Get USSD service status"""
        return {
            'service': 'USSD',
            'code': self.ussd_code,
            'provider': self.provider,
            'status': 'active',
            'supported_features': [
                'Check Balance',
                'Loan Information',
                'Quick Loan',
                'Make Payment',
                'Contact Support'
            ],
            'last_updated': datetime.utcnow().isoformat()
        }


# Initialize USSD service
ussd_service = USSDService()
