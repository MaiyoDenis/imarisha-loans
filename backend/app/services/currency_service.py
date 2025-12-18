"""
Currency Service - Multi-Currency Support
Handles currency management, conversion, and exchange rates
"""
import json
import logging
import requests
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
import redis
from flask import current_app

class CurrencyService:
    def __init__(self, app=None):
        self.redis_client = None
        self.app = None
        self.supported_currencies = {}
        
        if app:
            self.init_app(app)
    

    def init_app(self, app):
        """Initialize currency service with Flask app"""
        self.app = app
        
        # Initialize Redis client with graceful failure handling
        try:
            self.redis_client = redis.Redis(
                host=app.config.get('REDIS_HOST', 'localhost'),
                port=app.config.get('REDIS_PORT', 6379),
                db=app.config.get('REDIS_DB', 5),
                decode_responses=True
            )
            # Test connection
            self.redis_client.ping()
            logging.info("Currency Service: Redis connection established")
        except Exception as e:
            logging.warning(f"Currency Service: Redis not available - {str(e)}")
            self.redis_client = None
        
        self._initialize_currencies()
        logging.info("Currency Service initialized successfully")
    
    def _initialize_currencies(self):
        """Initialize supported currencies"""
        self.supported_currencies = {
            'KES': {
                'code': 'KES',
                'name': 'Kenyan Shilling',
                'symbol': 'KES',
                'decimal_places': 2,
                'is_base': True,
                'enabled': True,
                'country': 'Kenya'
            },
            'USD': {
                'code': 'USD',
                'name': 'US Dollar',
                'symbol': '$',
                'decimal_places': 2,
                'is_base': False,
                'enabled': True,
                'country': 'United States'
            },
            'EUR': {
                'code': 'EUR',
                'name': 'Euro',
                'symbol': '€',
                'decimal_places': 2,
                'is_base': False,
                'enabled': True,
                'country': 'European Union'
            },
            'GBP': {
                'code': 'GBP',
                'name': 'British Pound',
                'symbol': '£',
                'decimal_places': 2,
                'is_base': False,
                'enabled': True,
                'country': 'United Kingdom'
            },
            'UGX': {
                'code': 'UGX',
                'name': 'Ugandan Shilling',
                'symbol': 'USh',
                'decimal_places': 0,
                'is_base': False,
                'enabled': True,
                'country': 'Uganda'
            },
            'TZS': {
                'code': 'TZS',
                'name': 'Tanzanian Shilling',
                'symbol': 'TSh',
                'decimal_places': 2,
                'is_base': False,
                'enabled': True,
                'country': 'Tanzania'
            },
            'RWF': {
                'code': 'RWF',
                'name': 'Rwandan Franc',
                'symbol': 'FRw',
                'decimal_places': 0,
                'is_base': False,
                'enabled': True,
                'country': 'Rwanda'
            },
            'XOF': {
                'code': 'XOF',
                'name': 'West African CFA franc',
                'symbol': 'FCFA',
                'decimal_places': 0,
                'is_base': False,
                'enabled': True,
                'country': 'West Africa'
            }
        }
    
    def get_supported_currencies(self) -> List[Dict[str, Any]]:
        """Get list of supported currencies"""
        try:
            currencies = []
            for code, details in self.supported_currencies.items():
                if details['enabled']:
                    rate = self.get_exchange_rate(code)
                    details['exchange_rate'] = rate
                    currencies.append(details)
            return currencies
        except Exception as e:
            logging.error(f"Error getting supported currencies: {str(e)}")
            return []
    
    def get_currency_info(self, currency_code: str) -> Optional[Dict[str, Any]]:
        """Get information for a specific currency"""
        try:
            if currency_code not in self.supported_currencies:
                return None
            
            currency = self.supported_currencies[currency_code].copy()
            currency['exchange_rate'] = self.get_exchange_rate(currency_code)
            return currency
        except Exception as e:
            logging.error(f"Error getting currency info: {str(e)}")
            return None
    

    def get_exchange_rate(self, from_currency: str, to_currency: str = 'KES', cached: bool = True) -> float:
        """Get exchange rate between two currencies"""
        try:
            if from_currency == to_currency:
                return 1.0
            
            cache_key = f"exchange_rate:{from_currency}:{to_currency}"
            
            if cached and self.redis_client:
                cached_rate = self.redis_client.get(cache_key)
                if cached_rate:
                    return float(cached_rate)
            
            rate = self._fetch_exchange_rate(from_currency, to_currency)
            
            if rate and self.redis_client:
                self.redis_client.setex(cache_key, 3600, str(rate))  # Cache for 1 hour
                return rate
            else:
                logging.warning(f"Could not fetch rate for {from_currency} to {to_currency}")
                return self._get_fallback_rate(from_currency, to_currency)
        
        except Exception as e:
            logging.error(f"Error getting exchange rate: {str(e)}")
            return self._get_fallback_rate(from_currency, to_currency)
    
    def _fetch_exchange_rate(self, from_currency: str, to_currency: str) -> Optional[float]:
        """Fetch exchange rate from external API"""
        try:
            api_key = self.app.config.get('EXCHANGE_RATE_API_KEY')
            
            if not api_key:
                return None
            
            url = f"https://api.exchangerate-api.com/v4/latest/{from_currency}"
            
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if 'rates' in data and to_currency in data['rates']:
                    return data['rates'][to_currency]
            
            return None
        
        except Exception as e:
            logging.error(f"Error fetching exchange rate from API: {str(e)}")
            return None
    
    def _get_fallback_rate(self, from_currency: str, to_currency: str) -> float:
        """Get fallback exchange rate for offline mode"""
        fallback_rates = {
            ('USD', 'KES'): 130.0,
            ('KES', 'USD'): 0.0077,
            ('EUR', 'KES'): 142.0,
            ('KES', 'EUR'): 0.0070,
            ('GBP', 'KES'): 165.0,
            ('KES', 'GBP'): 0.0061,
            ('UGX', 'KES'): 0.034,
            ('KES', 'UGX'): 29.4,
            ('TZS', 'KES'): 0.051,
            ('KES', 'TZS'): 19.6,
            ('RWF', 'KES'): 0.0091,
            ('KES', 'RWF'): 110,
        }
        
        if (from_currency, to_currency) in fallback_rates:
            return fallback_rates[(from_currency, to_currency)]
        
        return 1.0
    
    def convert(self, amount: float, from_currency: str, to_currency: str = 'KES') -> Dict[str, Any]:
        """Convert amount from one currency to another"""
        try:
            if not amount or amount < 0:
                return {'error': 'Invalid amount'}
            
            if from_currency not in self.supported_currencies or to_currency not in self.supported_currencies:
                return {'error': 'Unsupported currency'}
            
            rate = self.get_exchange_rate(from_currency, to_currency)
            converted_amount = amount * rate
            
            return {
                'original_amount': amount,
                'original_currency': from_currency,
                'converted_amount': round(converted_amount, 2),
                'target_currency': to_currency,
                'exchange_rate': rate,
                'timestamp': datetime.utcnow().isoformat()
            }
        
        except Exception as e:
            logging.error(f"Error converting currency: {str(e)}")
            return {'error': str(e)}
    
    def convert_to_base(self, amount: float, from_currency: str) -> Dict[str, Any]:
        """Convert amount to base currency (KES)"""
        return self.convert(amount, from_currency, 'KES')
    
    def convert_from_base(self, amount: float, to_currency: str) -> Dict[str, Any]:
        """Convert amount from base currency (KES) to another currency"""
        return self.convert(amount, 'KES', to_currency)
    

    def update_exchange_rates(self) -> bool:
        """Manually update all exchange rates"""
        try:
            major_currencies = ['USD', 'EUR', 'GBP', 'UGX', 'TZS']
            
            for currency in major_currencies:
                rate = self._fetch_exchange_rate(currency, 'KES')
                if rate and self.redis_client:
                    cache_key = f"exchange_rate:{currency}:KES"
                    self.redis_client.setex(cache_key, 3600, str(rate))
                    logging.info(f"Updated {currency}/KES rate: {rate}")
            
            if self.redis_client:
                self.redis_client.set('exchange_rates_updated', datetime.utcnow().isoformat())
            return True
        
        except Exception as e:
            logging.error(f"Error updating exchange rates: {str(e)}")
            return False
    

    def get_rate_history(self, from_currency: str, to_currency: str, days: int = 30) -> Optional[List[Dict[str, Any]]]:
        """Get historical exchange rates"""
        try:
            if not self.redis_client:
                return []
                
            key = f"rate_history:{from_currency}:{to_currency}"
            history_json = self.redis_client.get(key)
            
            if history_json:
                return json.loads(history_json)
            
            return []
        
        except Exception as e:
            logging.error(f"Error getting rate history: {str(e)}")
            return None
    
    def format_amount(self, amount: float, currency_code: str) -> str:
        """Format amount in currency-specific format"""
        try:
            if currency_code not in self.supported_currencies:
                return f"{amount:.2f}"
            
            currency = self.supported_currencies[currency_code]
            symbol = currency.get('symbol', currency_code)
            decimal_places = currency.get('decimal_places', 2)
            
            if decimal_places == 0:
                return f"{symbol} {int(amount):,}"
            else:
                return f"{symbol} {amount:,.{decimal_places}f}"
        
        except Exception as e:
            logging.error(f"Error formatting amount: {str(e)}")
            return f"{amount:.2f} {currency_code}"
    

    def create_multicurrency_account(self, user_id: int, primary_currency: str = 'KES', secondary_currencies: List[str] = None) -> Dict[str, Any]:
        """Create multicurrency account for user"""
        try:
            if primary_currency not in self.supported_currencies:
                return {'error': 'Invalid primary currency'}
            
            if secondary_currencies is None:
                secondary_currencies = ['USD', 'EUR']
            
            account_data = {
                'user_id': user_id,
                'primary_currency': primary_currency,
                'secondary_currencies': secondary_currencies,
                'balances': {primary_currency: 0.0},
                'created_at': datetime.utcnow().isoformat()
            }
            
            for currency in secondary_currencies:
                if currency in self.supported_currencies:
                    account_data['balances'][currency] = 0.0
            
            if self.redis_client:
                key = f"multicurrency_account:{user_id}"
                self.redis_client.setex(key, 30*24*60*60, json.dumps(account_data))
            
            logging.info(f"Created multicurrency account for user {user_id}")
            return account_data
        
        except Exception as e:
            logging.error(f"Error creating multicurrency account: {str(e)}")
            return {'error': str(e)}
    
    def get_multicurrency_balance(self, user_id: int) -> Dict[str, Any]:
        """Get user multicurrency balances"""
        try:
            key = f"multicurrency_account:{user_id}"
            account_json = self.redis_client.get(key)
            
            if not account_json:
                return {'error': 'Account not found'}
            
            return json.loads(account_json)
        
        except Exception as e:
            logging.error(f"Error getting multicurrency balance: {str(e)}")
            return {'error': str(e)}


# Initialize service
currency_service = CurrencyService()
