"""
Alternative Payment Service - Airtel Money, Flutterwave, and other providers
Extends payment capabilities beyond M-Pesa
"""
import requests
import json
import logging
from datetime import datetime
from typing import Dict, Any, Optional, List
from flask import current_app
import redis

class AirtelmoneeyService:
    """Airtel Money Payment Gateway Integration"""
    
    def __init__(self, app=None):
        self.app = None
        self.api_key = None
        self.client_id = None
        self.client_secret = None
        self.base_url = "https://api.airtelmoney.com"
        self.redis_client = None
        
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize Airtel Money service"""
        self.app = app
        self.api_key = app.config.get('AIRTEL_API_KEY')
        self.client_id = app.config.get('AIRTEL_CLIENT_ID')
        self.client_secret = app.config.get('AIRTEL_CLIENT_SECRET')
        self.base_url = app.config.get('AIRTEL_BASE_URL', 'https://api.airtelmoney.com')
        
        try:
            self.redis_client = redis.Redis(
                host=app.config.get('REDIS_HOST', 'localhost'),
                port=app.config.get('REDIS_PORT', 6379),
                db=app.config.get('REDIS_DB', 3),
                decode_responses=True
            )
        except Exception as e:
            logging.warning(f"Failed to initialize Redis for Airtel Money: {str(e)}")
        
        logging.info("Airtel Money Service initialized")
    
    def initiate_payment(self, phone_number: str, amount: float, 
                        reference: str, merchant_id: str = None) -> Dict[str, Any]:
        """Initiate Airtel Money payment"""
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "merchantUid": merchant_id or "imarisha",
                "msisdn": phone_number,
                "amount": str(amount),
                "transactionRef": reference,
                "description": f"Loan payment - {reference}",
                "callbackUrl": current_app.config.get('AIRTEL_CALLBACK_URL'),
                "currency": "KES"
            }
            
            response = requests.post(
                f"{self.base_url}/merchants/paymentInitiation",
                headers=headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code in [200, 201]:
                result = response.json()
                
                transaction_data = {
                    'provider': 'airtel_money',
                    'phone_number': phone_number,
                    'amount': amount,
                    'reference': reference,
                    'transaction_id': result.get('transactionId'),
                    'status': 'initiated',
                    'timestamp': datetime.utcnow().isoformat()
                }
                
                if self.redis_client:
                    self.redis_client.setex(
                        f"airtel:{reference}",
                        3600,
                        json.dumps(transaction_data)
                    )
                
                logging.info(f"Airtel Money payment initiated: {reference}")
                
                return {
                    'success': True,
                    'transaction_id': result.get('transactionId'),
                    'reference': reference,
                    'provider': 'airtel_money'
                }
            else:
                logging.error(f"Airtel Money error: {response.status_code} - {response.text}")
                return {
                    'success': False,
                    'error': response.json().get('message', 'Payment initiation failed')
                }
        
        except Exception as e:
            logging.error(f"Error initiating Airtel Money payment: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def check_transaction_status(self, transaction_id: str) -> Dict[str, Any]:
        """Check Airtel Money transaction status"""
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            response = requests.get(
                f"{self.base_url}/merchants/transactionStatus/{transaction_id}",
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                return {
                    'transaction_id': transaction_id,
                    'status': result.get('status'),
                    'amount': result.get('amount'),
                    'timestamp': datetime.utcnow().isoformat()
                }
            else:
                logging.error(f"Failed to check Airtel Money status: {response.status_code}")
                return {'error': 'Could not retrieve transaction status'}
        
        except Exception as e:
            logging.error(f"Error checking Airtel Money transaction status: {str(e)}")
            return {'error': str(e)}


class FlutterwaveService:
    """Flutterwave Payment Gateway Integration"""
    
    def __init__(self, app=None):
        self.app = None
        self.secret_key = None
        self.public_key = None
        self.base_url = "https://api.flutterwave.com/v3"
        self.redis_client = None
        
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize Flutterwave service"""
        self.app = app
        self.secret_key = app.config.get('FLUTTERWAVE_SECRET_KEY')
        self.public_key = app.config.get('FLUTTERWAVE_PUBLIC_KEY')
        self.base_url = app.config.get('FLUTTERWAVE_BASE_URL', 'https://api.flutterwave.com/v3')
        
        try:
            self.redis_client = redis.Redis(
                host=app.config.get('REDIS_HOST', 'localhost'),
                port=app.config.get('REDIS_PORT', 6379),
                db=app.config.get('REDIS_DB', 3),
                decode_responses=True
            )
        except Exception as e:
            logging.warning(f"Failed to initialize Redis for Flutterwave: {str(e)}")
        
        logging.info("Flutterwave Service initialized")
    
    def initiate_payment(self, phone_number: str, amount: float, 
                        reference: str, email: str = None) -> Dict[str, Any]:
        """Initiate Flutterwave payment"""
        try:
            headers = {
                "Authorization": f"Bearer {self.secret_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "tx_ref": reference,
                "amount": str(amount),
                "currency": "KES",
                "payment_options": "mobilemoney",
                "customer": {
                    "email": email or f"{phone_number}@imarisha.local",
                    "phonenumber": phone_number,
                    "name": f"Customer {reference}"
                },
                "meta": {
                    "source": "imarisha_loan",
                    "loan_type": "microfinance"
                },
                "redirect_url": current_app.config.get('FLUTTERWAVE_CALLBACK_URL'),
                "customizations": {
                    "title": "Imarisha Loan",
                    "description": f"Loan payment - {reference}",
                    "logo": current_app.config.get('APP_LOGO_URL')
                }
            }
            
            response = requests.post(
                f"{self.base_url}/charges?type=mobile_money_uganda",
                headers=headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code in [200, 201]:
                result = response.json()
                
                if result.get('status') == 'success':
                    transaction_data = {
                        'provider': 'flutterwave',
                        'phone_number': phone_number,
                        'amount': amount,
                        'reference': reference,
                        'transaction_id': result.get('data', {}).get('id'),
                        'status': 'initiated',
                        'timestamp': datetime.utcnow().isoformat()
                    }
                    
                    if self.redis_client:
                        self.redis_client.setex(
                            f"flutterwave:{reference}",
                            3600,
                            json.dumps(transaction_data)
                        )
                    
                    logging.info(f"Flutterwave payment initiated: {reference}")
                    
                    return {
                        'success': True,
                        'transaction_id': result.get('data', {}).get('id'),
                        'reference': reference,
                        'provider': 'flutterwave',
                        'payment_link': result.get('data', {}).get('link')
                    }
                else:
                    return {
                        'success': False,
                        'error': result.get('message', 'Payment initiation failed')
                    }
            else:
                logging.error(f"Flutterwave error: {response.status_code} - {response.text}")
                return {
                    'success': False,
                    'error': 'Payment initiation failed'
                }
        
        except Exception as e:
            logging.error(f"Error initiating Flutterwave payment: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def verify_payment(self, transaction_id: str) -> Dict[str, Any]:
        """Verify Flutterwave transaction"""
        try:
            headers = {
                "Authorization": f"Bearer {self.secret_key}",
                "Content-Type": "application/json"
            }
            
            response = requests.get(
                f"{self.base_url}/transactions/{transaction_id}/verify",
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                data = result.get('data', {})
                
                return {
                    'transaction_id': transaction_id,
                    'status': data.get('status'),
                    'amount': data.get('amount'),
                    'phone': data.get('customer', {}).get('phonenumber'),
                    'timestamp': datetime.utcnow().isoformat()
                }
            else:
                logging.error(f"Failed to verify Flutterwave transaction: {response.status_code}")
                return {'error': 'Could not verify transaction'}
        
        except Exception as e:
            logging.error(f"Error verifying Flutterwave transaction: {str(e)}")
            return {'error': str(e)}


class PaymentProviderRouter:
    """Route payments to appropriate provider"""
    
    def __init__(self, app=None):
        self.app = None
        self.mpesa_service = None
        self.airtel_service = AirtelmoneeyService(app)
        self.flutterwave_service = FlutterwaveService(app)
        
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize payment router"""
        self.app = app
        logging.info("Payment Provider Router initialized")
    
    def initiate_payment(self, provider: str, phone_number: str, amount: float, 
                        reference: str, **kwargs) -> Dict[str, Any]:
        """Route payment initiation to appropriate provider"""
        try:
            provider = provider.lower()
            
            if provider == 'mpesa':
                # Use existing M-Pesa service
                if self.mpesa_service:
                    return self.mpesa_service.initiate_stk_push(
                        phone_number, amount, reference, **kwargs
                    )
                else:
                    return {'error': 'M-Pesa service not available'}
            
            elif provider == 'airtel':
                return self.airtel_service.initiate_payment(
                    phone_number, amount, reference, **kwargs
                )
            
            elif provider == 'flutterwave':
                return self.flutterwave_service.initiate_payment(
                    phone_number, amount, reference, **kwargs
                )
            
            else:
                return {'error': f'Unsupported payment provider: {provider}'}
        
        except Exception as e:
            logging.error(f"Error routing payment: {str(e)}")
            return {'error': str(e)}
    
    def get_available_providers(self, country: str = 'KE') -> List[Dict[str, Any]]:
        """Get available payment providers for country"""
        providers = {
            'KE': [
                {
                    'code': 'mpesa',
                    'name': 'M-Pesa',
                    'logo': 'https://upload.wikimedia.org/wikipedia/commons/6/6f/M-PESA_LOGO.png',
                    'description': 'SafariCom mobile money service'
                },
                {
                    'code': 'airtel',
                    'name': 'Airtel Money',
                    'logo': 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Airtel_logo.svg',
                    'description': 'Airtel mobile money service'
                },
                {
                    'code': 'flutterwave',
                    'name': 'Flutterwave',
                    'logo': 'https://www.flutterwave.com/images/logo-colored.svg',
                    'description': 'Multi-currency payment platform'
                }
            ],
            'UG': [
                {
                    'code': 'airtel',
                    'name': 'Airtel Money',
                    'logo': 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Airtel_logo.svg',
                    'description': 'Airtel mobile money service'
                },
                {
                    'code': 'flutterwave',
                    'name': 'Flutterwave',
                    'logo': 'https://www.flutterwave.com/images/logo-colored.svg',
                    'description': 'Multi-currency payment platform'
                }
            ],
            'TZ': [
                {
                    'code': 'flutterwave',
                    'name': 'Flutterwave',
                    'logo': 'https://www.flutterwave.com/images/logo-colored.svg',
                    'description': 'Multi-currency payment platform'
                }
            ]
        }
        
        return providers.get(country, [])


# Initialize services
airtel_service = AirtelmoneeyService()
flutterwave_service = FlutterwaveService()
payment_router = PaymentProviderRouter()
