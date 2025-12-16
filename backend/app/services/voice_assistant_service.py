"""
Voice Assistant Service - Voice commands and natural language processing
"""
import logging
import json
import redis
from datetime import datetime
from typing import Dict, Any, Optional, List
from flask import current_app
import re

class VoiceAssistantService:
    def __init__(self, app=None):
        self.app = None
        self.redis_client = None
        self.nlp_engine = None
        self.commands = {}
        
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        self.app = app
        self.redis_client = redis.Redis(
            host=app.config.get('REDIS_HOST', 'localhost'),
            port=app.config.get('REDIS_PORT', 6379),
            db=app.config.get('REDIS_DB', 8),
            decode_responses=True
        )
        self._initialize_commands()
        logging.info("Voice Assistant initialized")
    
    def _initialize_commands(self):
        self.commands = {
            'loan_balance': {
                'patterns': ['what is my balance', 'check balance', 'loan balance'],
                'action': 'get_loan_balance',
                'requires_auth': True
            },
            'loan_due': {
                'patterns': ['when is my payment due', 'next payment date', 'due date'],
                'action': 'get_loan_due_date',
                'requires_auth': True
            },
            'apply_loan': {
                'patterns': ['apply for loan', 'new loan', 'get a loan'],
                'action': 'initiate_loan_application',
                'requires_auth': True
            },
            'make_payment': {
                'patterns': ['make payment', 'pay loan', 'send money'],
                'action': 'initiate_payment',
                'requires_auth': True
            },
            'loan_history': {
                'patterns': ['loan history', 'my loans', 'previous loans'],
                'action': 'get_loan_history',
                'requires_auth': True
            },
            'savings_info': {
                'patterns': ['my savings', 'savings balance', 'savings account'],
                'action': 'get_savings_info',
                'requires_auth': True
            },
            'rates_info': {
                'patterns': ['interest rates', 'loan rates', 'current rates'],
                'action': 'get_rates',
                'requires_auth': False
            },
            'support': {
                'patterns': ['help', 'support', 'contact support'],
                'action': 'get_support_info',
                'requires_auth': False
            }
        }
    
    def process_voice_command(self, user_id: int, transcript: str, language: str = 'en') -> Dict[str, Any]:
        try:
            result = {
                'user_id': user_id,
                'transcript': transcript,
                'language': language,
                'command_detected': None,
                'action': None,
                'response': None,
                'confidence': 0.0,
                'processed_at': datetime.utcnow().isoformat()
            }
            
            transcript_lower = transcript.lower().strip()
            
            detected_command = self._match_command(transcript_lower)
            
            if detected_command:
                result['command_detected'] = detected_command['name']
                result['action'] = detected_command['action']
                result['confidence'] = detected_command['confidence']
                result['response'] = self._execute_command(user_id, detected_command)
            else:
                result['response'] = "I didn't understand that command. Try 'help' for supported commands."
                result['confidence'] = 0.0
            
            self._log_command(user_id, result)
            logging.info(f"Voice command processed: user={user_id}, command={result['command_detected']}")
            
            return result
        
        except Exception as e:
            logging.error(f"Voice command error: {str(e)}")
            return {
                'user_id': user_id,
                'transcript': transcript,
                'error': str(e),
                'status': 'error'
            }
    
    def _match_command(self, text: str) -> Optional[Dict[str, Any]]:
        best_match = None
        best_score = 0.0
        
        for cmd_name, cmd_config in self.commands.items():
            for pattern in cmd_config['patterns']:
                if self._pattern_matches(text, pattern):
                    score = self._calculate_match_score(text, pattern)
                    if score > best_score:
                        best_score = score
                        best_match = {
                            'name': cmd_name,
                            'action': cmd_config['action'],
                            'requires_auth': cmd_config['requires_auth'],
                            'confidence': min(score, 1.0)
                        }
        
        return best_match if best_score > 0.5 else None
    
    def _pattern_matches(self, text: str, pattern: str) -> bool:
        pattern = pattern.lower()
        if pattern in text:
            return True
        
        pattern_words = pattern.split()
        text_words = text.split()
        
        matches = sum(1 for word in pattern_words if word in text)
        return matches >= len(pattern_words) * 0.6
    
    def _calculate_match_score(self, text: str, pattern: str) -> float:
        pattern_lower = pattern.lower()
        text_lower = text.lower()
        
        if pattern_lower == text_lower:
            return 1.0
        
        if pattern_lower in text_lower:
            return 0.9
        
        pattern_words = set(pattern_lower.split())
        text_words = set(text_lower.split())
        
        intersection = len(pattern_words & text_words)
        union = len(pattern_words | text_words)
        
        return intersection / union if union > 0 else 0.0
    
    def _execute_command(self, user_id: int, command: Dict) -> str:
        action = command['action']
        
        response_map = {
            'get_loan_balance': f"Your current loan balance is fetched successfully.",
            'get_loan_due_date': f"Your next payment is due on the specified date.",
            'initiate_loan_application': f"Starting new loan application process.",
            'initiate_payment': f"Initiating payment process.",
            'get_loan_history': f"Retrieving your loan history.",
            'get_savings_info': f"Your savings account information is ready.",
            'get_rates': f"Current interest rates are displayed.",
            'get_support_info': f"Contact our support team at support@imarisha.com or call +254-XXX-XXXX"
        }
        
        return response_map.get(action, "Command executed.")
    
    def _log_command(self, user_id: int, result: Dict):
        try:
            key = f"voice_command:{user_id}:{datetime.utcnow().timestamp()}"
            self.redis_client.setex(
                key,
                86400*30,
                json.dumps(result)
            )
        except Exception as e:
            logging.error(f"Logging error: {str(e)}")
    
    def get_supported_commands(self, language: str = 'en') -> Dict[str, Any]:
        try:
            commands = {
                'available_commands': [],
                'language': language,
                'total': len(self.commands)
            }
            
            for cmd_name, cmd_config in self.commands.items():
                commands['available_commands'].append({
                    'name': cmd_name,
                    'patterns': cmd_config['patterns'],
                    'action': cmd_config['action'],
                    'auth_required': cmd_config['requires_auth']
                })
            
            return commands
        except Exception as e:
            logging.error(f"Error getting commands: {str(e)}")
            return {'error': str(e)}


class VoiceAnalyticsService:
    def __init__(self, app=None):
        self.app = None
        self.redis_client = None
        
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        self.app = app
        self.redis_client = redis.Redis(
            host=app.config.get('REDIS_HOST', 'localhost'),
            port=app.config.get('REDIS_PORT', 6379),
            db=app.config.get('REDIS_DB', 8),
            decode_responses=True
        )
        logging.info("Voice Analytics initialized")
    
    def track_interaction(self, user_id: int, command: str, success: bool, duration: float):
        try:
            interaction = {
                'user_id': user_id,
                'command': command,
                'success': success,
                'duration_seconds': duration,
                'timestamp': datetime.utcnow().isoformat()
            }
            
            key = f"voice_interaction:{user_id}:{int(datetime.utcnow().timestamp())}"
            self.redis_client.setex(
                key,
                86400*90,
                json.dumps(interaction)
            )
            
            logging.info(f"Voice interaction tracked: user={user_id}, cmd={command}, success={success}")
        except Exception as e:
            logging.error(f"Analytics error: {str(e)}")
    
    def get_usage_stats(self, user_id: int, days: int = 30) -> Dict[str, Any]:
        try:
            stats = {
                'user_id': user_id,
                'period_days': days,
                'total_interactions': 0,
                'successful_commands': 0,
                'failed_commands': 0,
                'avg_command_duration': 0.0,
                'most_used_commands': []
            }
            
            return stats
        except Exception as e:
            logging.error(f"Stats error: {str(e)}")
            return {'error': str(e)}


voice_assistant = VoiceAssistantService()
voice_analytics = VoiceAnalyticsService()
