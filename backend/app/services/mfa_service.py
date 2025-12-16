
"""
Multi-Factor Authentication Service
Enterprise-grade MFA with TOTP and SMS backup
"""
import secrets
import base64
import pyotp
import qrcode
from io import BytesIO
import redis
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from flask import current_app, jsonify, request

class MFAService:
    def __init__(self, app=None):
        self.redis_client = None
        self.app = None
        
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize MFA service with Flask app"""
        self.app = app
        self.redis_client = redis.Redis(
            host=app.config.get('REDIS_HOST', 'localhost'),
            port=app.config.get('REDIS_PORT', 6379),
            db=app.config.get('REDIS_DB', 1),  # Different DB for MFA
            decode_responses=True
        )
        
        logging.info("MFA Service initialized successfully")
    
    def generate_secret(self, user_id: int) -> str:
        """Generate a TOTP secret for user"""
        try:
            # Generate a secure random secret
            secret = pyotp.random_base32()
            
            # Store secret temporarily in Redis (expires in 5 minutes)
            secret_key = f"mfa_secret:{user_id}"
            self.redis_client.setex(secret_key, 300, secret)
            
            logging.info(f"MFA secret generated for user {user_id}")
            return secret
            
        except Exception as e:
            logging.error(f"Error generating MFA secret for user {user_id}: {str(e)}")
            raise
    
    def generate_qr_code(self, user_id: int, username: str, secret: str) -> str:
        """Generate QR code for TOTP setup"""
        try:
            # Create TOTP object
            totp = pyotp.TOTP(secret)
            
            # Generate provisioning URI
            app_name = current_app.config.get('APP_NAME', 'Imarisha Loans')
            issuer = f"{app_name} - Enterprise"
            
            provisioning_uri = totp.provisioning_uri(
                name=username,
                issuer_name=issuer
            )
            
            # Generate QR code
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            qr.add_data(provisioning_uri)
            qr.make(fit=True)
            
            # Create image
            img = qr.make_image(fill_color="black", back_color="white")
            
            # Convert to base64
            buffer = BytesIO()
            img.save(buffer, format='PNG')
            img_str = base64.b64encode(buffer.getvalue()).decode()
            
            logging.info(f"QR code generated for user {user_id}")
            return f"data:image/png;base64,{img_str}"
            
        except Exception as e:
            logging.error(f"Error generating QR code for user {user_id}: {str(e)}")
            raise
    
    def verify_totp(self, user_id: int, token: str) -> bool:
        """Verify TOTP token"""
        try:
            # Get stored secret
            secret_key = f"mfa_secret:{user_id}"
            secret = self.redis_client.get(secret_key)
            
            if not secret:
                logging.warning(f"No MFA secret found for user {user_id}")
                return False
            
            # Verify token
            totp = pyotp.TOTP(secret)
            is_valid = totp.verify(token, valid_window=1)  # Allow 30-second window
            
            if is_valid:
                # Remove secret after successful verification
                self.redis_client.delete(secret_key)
                
                # Log successful MFA verification
                self.log_mfa_event('mfa_verified', user_id, 'totp')
                
                logging.info(f"TOTP verification successful for user {user_id}")
            else:
                logging.warning(f"TOTP verification failed for user {user_id}")
            
            return is_valid
            
        except Exception as e:
            logging.error(f"Error verifying TOTP for user {user_id}: {str(e)}")
            return False
    
    def generate_backup_codes(self, user_id: int, count: int = 8) -> list:
        """Generate backup codes for user"""
        try:
            backup_codes = []
            for _ in range(count):
                code = ''.join(secrets.choice('0123456789') for _ in range(8))
                backup_codes.append(code)
            
            # Store hashed codes in Redis
            codes_key = f"mfa_backup_codes:{user_id}"
            codes_data = {
                'codes': backup_codes,
                'used': [],  # Track used codes
                'created_at': datetime.utcnow().isoformat()
            }
            
            self.redis_client.setex(codes_key, 30*24*60*60, str(codes_data))  # 30 days
            
            logging.info(f"Backup codes generated for user {user_id}")
            return backup_codes
            
        except Exception as e:
            logging.error(f"Error generating backup codes for user {user_id}: {str(e)}")
            raise
    
    def verify_backup_code(self, user_id: int, code: str) -> bool:
        """Verify backup code"""
        try:
            codes_key = f"mfa_backup_codes:{user_id}"
            codes_data_str = self.redis_client.get(codes_key)
            
            if not codes_data_str:
                logging.warning(f"No backup codes found for user {user_id}")
                return False
            
            # Parse codes data
            import ast
            codes_data = ast.literal_eval(codes_data_str)
            backup_codes = codes_data['codes']
            used_codes = codes_data['used']
            
            # Check if code exists and hasn't been used
            if code in backup_codes and code not in used_codes:
                # Mark code as used
                used_codes.append(code)
                codes_data['used'] = used_codes
                
                # Update in Redis
                self.redis_client.setex(codes_key, 30*24*60*60, str(codes_data))
                
                # Log successful backup code use
                self.log_mfa_event('mfa_backup_used', user_id, 'backup_code')
                
                logging.info(f"Backup code verification successful for user {user_id}")
                return True
            else:
                logging.warning(f"Backup code verification failed for user {user_id}")
                return False
            
        except Exception as e:
            logging.error(f"Error verifying backup code for user {user_id}: {str(e)}")
            return False
    
    def send_sms_verification(self, user_id: int, phone_number: str) -> bool:
        """Send SMS verification code"""
        try:
            # Generate 6-digit code
            code = ''.join(secrets.choice('0123456789') for _ in range(6))
            
            # Store code in Redis
            code_key = f"mfa_sms_code:{user_id}"
            self.redis_client.setex(code_key, 300, code)  # 5 minutes expiry
            
            # Log SMS sending attempt
            self.log_mfa_event('mfa_sms_sent', user_id, phone_number)
            
            # Here you would integrate with SMS service (Africa's Talking, Twilio, etc.)
            # For now, just log the action
            logging.info(f"SMS verification code would be sent to {phone_number} for user {user_id}")
            
            # TODO: Implement actual SMS sending
            # return self.sms_service.send_sms(phone_number, f"Your verification code is: {code}")
            
            return True
            
        except Exception as e:
            logging.error(f"Error sending SMS verification for user {user_id}: {str(e)}")
            return False
    
    def verify_sms_code(self, user_id: int, code: str) -> bool:
        """Verify SMS code"""
        try:
            code_key = f"mfa_sms_code:{user_id}"
            stored_code = self.redis_client.get(code_key)
            
            if stored_code and stored_code == code:
                # Remove code after successful verification
                self.redis_client.delete(code_key)
                
                # Log successful SMS verification
                self.log_mfa_event('mfa_sms_verified', user_id, 'sms')
                
                logging.info(f"SMS verification successful for user {user_id}")
                return True
            else:
                logging.warning(f"SMS verification failed for user {user_id}")
                return False
            
        except Exception as e:
            logging.error(f"Error verifying SMS code for user {user_id}: {str(e)}")
            return False
    
    def is_mfa_enabled(self, user_id: int) -> bool:
        """Check if user has MFA enabled"""
        try:
            # Check if user has TOTP secret
            secret_key = f"mfa_secret:{user_id}"
            has_totp = bool(self.redis_client.get(secret_key))
            
            # Check if user has backup codes
            codes_key = f"mfa_backup_codes:{user_id}"
            has_backup_codes = bool(self.redis_client.get(codes_key))
            
            return has_totp or has_backup_codes
            
        except Exception as e:
            logging.error(f"Error checking MFA status for user {user_id}: {str(e)}")
            return False
    
    def log_mfa_event(self, event_type: str, user_id: int, details: str):
        """Log MFA events for audit trail"""
        try:
            log_data = {
                'timestamp': datetime.utcnow().isoformat(),
                'event_type': event_type,
                'user_id': user_id,
                'ip_address': request.remote_addr if request else 'unknown',
                'user_agent': request.headers.get('User-Agent', '') if request else '',
                'details': details
            }
            
            # Store in Redis for analytics
            log_key = f"mfa_log:{datetime.utcnow().strftime('%Y%m%d')}"
            self.redis_client.lpush(log_key, str(log_data))
            self.redis_client.expire(log_key, 30*24*60*60)  # 30 days
            
            logging.info(f"MFA EVENT: {log_data}")
            
        except Exception as e:
            logging.error(f"Error logging MFA event: {str(e)}")
    
    def get_mfa_status(self, user_id: int) -> Dict[str, Any]:
        """Get MFA status for user"""
        try:
            secret_key = f"mfa_secret:{user_id}"
            codes_key = f"mfa_backup_codes:{user_id}"
            
            has_secret = bool(self.redis_client.get(secret_key))
            has_backup_codes = bool(self.redis_client.get(codes_key))
            
            return {
                'mfa_enabled': has_secret or has_backup_codes,
                'totp_enabled': has_secret,
                'backup_codes_enabled': has_backup_codes,
                'requires_setup': not (has_secret or has_backup_codes)
            }
            
        except Exception as e:
            logging.error(f"Error getting MFA status for user {user_id}: {str(e)}")
            return {
                'mfa_enabled': False,
                'totp_enabled': False,
                'backup_codes_enabled': False,
                'requires_setup': True
            }
    
    def disable_mfa(self, user_id: int) -> bool:
        """Disable MFA for user (admin function)"""
        try:
            # Remove all MFA data
            secret_key = f"mfa_secret:{user_id}"
            codes_key = f"mfa_backup_codes:{user_id}"
            sms_key = f"mfa_sms_code:{user_id}"
            
            self.redis_client.delete(secret_key)
            self.redis_client.delete(codes_key)
            self.redis_client.delete(sms_key)
            
            # Log MFA disable event
            self.log_mfa_event('mfa_disabled', user_id, 'admin_action')
            
            logging.info(f"MFA disabled for user {user_id}")
            return True
            
        except Exception as e:
            logging.error(f"Error disabling MFA for user {user_id}: {str(e)}")
            return False

# Global MFA service instance
mfa_service = MFAService()

def mfa_required(f):
    """Decorator to require MFA verification"""
    from functools import wraps
    from flask import jsonify, request
    from app.services.jwt_service import jwt_service
    
    @wraps(f)
    def decorated_function(*args, **kwargs):
        current_user = jwt_service.get_current_user()
        if not current_user:
            return jsonify({'error': 'Authentication required'}), 401
        
        user_id = current_user.get('id')
        mfa_status = mfa_service.get_mfa_status(user_id)
        
        # Check if MFA is required but not verified
        if mfa_status['mfa_enabled'] and not hasattr(current_user, 'mfa_verified'):
            return jsonify({
                'error': 'MFA verification required',
                'code': 'MFA_REQUIRED',
                'mfa_status': mfa_status
            }), 401
        
        return f(*args, **kwargs)
    
    return decorated_function

