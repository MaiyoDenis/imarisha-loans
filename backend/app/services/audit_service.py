
"""
Audit Service for Comprehensive Logging and Compliance
Enterprise-grade audit trail system
"""
import json
import logging
from datetime import datetime
from typing import Dict, Any, Optional, List
from dataclasses import dataclass, asdict
from enum import Enum
import redis
from flask import request, current_app
from collections import defaultdict
import hashlib

class AuditEventType(Enum):
    """Audit event types"""
    AUTH_LOGIN = "auth_login"
    AUTH_LOGOUT = "auth_logout"
    AUTH_FAILURE = "auth_failure"
    AUTH_MFA = "auth_mfa"
    USER_CREATED = "user_created"
    USER_UPDATED = "user_updated"
    USER_DELETED = "user_deleted"
    LOAN_CREATED = "loan_created"
    LOAN_APPROVED = "loan_approved"
    LOAN_REJECTED = "loan_rejected"
    LOAN_DISBURSED = "loan_disbursed"
    PAYMENT_PROCESSED = "payment_processed"
    PAYMENT_FAILED = "payment_failed"
    DATA_EXPORT = "data_export"
    DATA_IMPORT = "data_import"
    SYSTEM_CONFIG = "system_config"
    SECURITY_EVENT = "security_event"
    PERMISSION_DENIED = "permission_denied"
    API_ACCESS = "api_access"
    ERROR_OCCURRED = "error_occurred"

class RiskLevel(Enum):
    """Risk levels for audit events"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

@dataclass
class AuditEvent:
    """Audit event data structure"""
    event_id: str
    event_type: AuditEventType
    user_id: Optional[int]
    user_role: Optional[str]
    ip_address: str
    user_agent: str
    resource: str
    action: str
    details: Dict[str, Any]
    risk_level: RiskLevel
    timestamp: str
    session_id: Optional[str]
    request_id: Optional[str]
    outcome: str  # success, failure, pending
    additional_context: Dict[str, Any] = None

class AuditService:
    def __init__(self, app=None):
        self.redis_client = None
        self.app = None
        self.event_buffer = []
        self.buffer_size = 100
        self.flush_interval = 60  # seconds
        
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize audit service with Flask app"""
        self.app = app
        self.redis_client = redis.Redis(
            host=app.config.get('REDIS_HOST', 'localhost'),
            port=app.config.get('REDIS_PORT', 6379),
            db=app.config.get('REDIS_DB', 2),  # Different DB for audit logs
            decode_responses=False  # Store as bytes for audit logs
        )
        
        # Setup logging
        self.logger = logging.getLogger('audit')
        handler = logging.FileHandler('logs/audit.log')
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        self.logger.addHandler(handler)
        self.logger.setLevel(logging.INFO)
        
        logging.info("Audit Service initialized successfully")
    
    def log_event(
        self,
        event_type: AuditEventType,
        user_id: Optional[int] = None,
        resource: str = "",
        action: str = "",
        details: Dict[str, Any] = None,
        risk_level: RiskLevel = RiskLevel.LOW,
        outcome: str = "success",
        additional_context: Dict[str, Any] = None
    ) -> str:
        """Log an audit event"""
        try:
            # Generate unique event ID
            event_id = self._generate_event_id(event_type, user_id)
            
            # Get current request context
            ip_address = request.remote_addr if request else "unknown"
            user_agent = request.headers.get('User-Agent', '') if request else ""
            session_id = request.cookies.get('session') if request else None
            request_id = getattr(request, 'request_id', None) if request else None
            
            # Get user context from JWT if available
            user_role = None
            try:
                from app.services.jwt_service import jwt_service
                current_user = jwt_service.get_current_user()
                if current_user:
                    user_role = current_user.get('role')
            except:
                pass
            
            # Create audit event
            audit_event = AuditEvent(
                event_id=event_id,
                event_type=event_type,
                user_id=user_id,
                user_role=user_role,
                ip_address=ip_address,
                user_agent=user_agent,
                resource=resource,
                action=action,
                details=details or {},
                risk_level=risk_level,
                timestamp=datetime.utcnow().isoformat(),
                session_id=session_id,
                request_id=request_id,
                outcome=outcome,
                additional_context=additional_context or {}
            )
            
            # Store event
            self._store_event(audit_event)
            
            # Log to file for immediate access
            self._log_to_file(audit_event)
            
            # Check if immediate attention needed
            if risk_level in [RiskLevel.HIGH, RiskLevel.CRITICAL]:
                self._trigger_alert(audit_event)
            
            return event_id
            
        except Exception as e:
            logging.error(f"Error logging audit event: {str(e)}")
            return ""
    
    def _generate_event_id(self, event_type: AuditEventType, user_id: Optional[int]) -> str:
        """Generate unique event ID"""
        timestamp = datetime.utcnow().strftime('%Y%m%d%H%M%S%f')
        unique_str = f"{event_type.value}:{user_id}:{timestamp}"
        return hashlib.md5(unique_str.encode()).hexdigest()[:16]
    
    def _store_event(self, audit_event: AuditEvent):
        """Store audit event in Redis"""
        try:
            # Convert to dictionary
            event_dict = asdict(audit_event)
            event_dict['event_type'] = audit_event.event_type.value
            event_dict['risk_level'] = audit_event.risk_level.value
            
            # Store in time-series pattern
            date_key = datetime.utcnow().strftime('%Y%m%d')
            hourly_key = datetime.utcnow().strftime('%Y%m%d%H')
            
            # Store in daily log
            daily_key = f"audit:daily:{date_key}"
            self.redis_client.lpush(daily_key, json.dumps(event_dict))
            self.redis_client.expire(daily_key, 365*24*60*60)  # 1 year retention
            
            # Store in hourly log
            hourly_key = f"audit:hourly:{hourly_key}"
            self.redis_client.lpush(hourly_key, json.dumps(event_dict))
            self.redis_client.expire(hourly_key, 30*24*60*60)  # 30 days retention
            
            # Store in user-specific log
            if audit_event.user_id:
                user_key = f"audit:user:{audit_event.user_id}:{date_key}"
                self.redis_client.lpush(user_key, json.dumps(event_dict))
                self.redis_client.expire(user_key, 365*24*60*60)  # 1 year retention
            
            # Store critical events separately
            if audit_event.risk_level in [RiskLevel.HIGH, RiskLevel.CRITICAL]:
                critical_key = f"audit:critical:{date_key}"
                self.redis_client.lpush(critical_key, json.dumps(event_dict))
                self.redis_client.expire(critical_key, 7*365*24*60*60)  # 7 years retention
            
        except Exception as e:
            logging.error(f"Error storing audit event: {str(e)}")
    
    def _log_to_file(self, audit_event: AuditEvent):
        """Log audit event to file"""
        try:
            event_dict = asdict(audit_event)
            self.logger.info(f"AUDIT: {json.dumps(event_dict, default=str)}")
        except Exception as e:
            logging.error(f"Error logging to file: {str(e)}")
    
    def _trigger_alert(self, audit_event: AuditEvent):
        """Trigger alert for high-risk events"""
        try:
            # Log critical event
            self.logger.critical(f"HIGH RISK AUDIT EVENT: {audit_event.event_id}")
            
            # Store in alerts collection
            alert_key = f"audit:alerts:{datetime.utcnow().strftime('%Y%m%d')}"
            alert_data = {
                'event_id': audit_event.event_id,
                'event_type': audit_event.event_type.value,
                'risk_level': audit_event.risk_level.value,
                'user_id': audit_event.user_id,
                'timestamp': audit_event.timestamp,
                'resource': audit_event.resource,
                'action': audit_event.action,
                'outcome': audit_event.outcome
            }
            
            self.redis_client.lpush(alert_key, json.dumps(alert_data))
            self.redis_client.expire(alert_key, 90*24*60*60)  # 90 days retention
            
        except Exception as e:
            logging.error(f"Error triggering alert: {str(e)}")
    
    def get_events(
        self,
        user_id: Optional[int] = None,
        event_type: Optional[AuditEventType] = None,
        risk_level: Optional[RiskLevel] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Retrieve audit events with filtering"""
        try:
            events = []
            date_pattern = "%Y%m%d"
            
            # Determine date range
            if start_date and end_date:
                date_range = self._get_date_range(start_date, end_date, date_pattern)
            else:
                # Default to last 7 days
                end_date = datetime.utcnow().strftime(date_pattern)
                start_date = (datetime.utcnow() - timedelta(days=7)).strftime(date_pattern)
                date_range = self._get_date_range(start_date, end_date, date_pattern)
            
            # Retrieve events
            for date_key in date_range:
                if user_id:
                    key = f"audit:user:{user_id}:{date_key}"
                else:
                    key = f"audit:daily:{date_key}"
                
                stored_events = self.redis_client.lrange(key, 0, limit)
                
                for event_data in stored_events:
                    try:
                        event = json.loads(event_data.decode())
                        
                        # Apply filters
                        if event_type and event.get('event_type') != event_type.value:
                            continue
                        
                        if risk_level and event.get('risk_level') != risk_level.value:
                            continue
                        
                        events.append(event)
                        
                        if len(events) >= limit:
                            break
                            
                    except (json.JSONDecodeError, KeyError):
                        continue
                
                if len(events) >= limit:
                    break
            
            # Sort by timestamp (newest first)
            events.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
            
            return events[:limit]
            
        except Exception as e:
            logging.error(f"Error retrieving audit events: {str(e)}")
            return []
    
    def _get_date_range(self, start_date: str, end_date: str, date_format: str) -> List[str]:
        """Get list of dates in range"""
        try:
            from datetime import datetime, timedelta
            
            start = datetime.strptime(start_date, date_format)
            end = datetime.strptime(end_date, date_format)
            
            date_list = []
            current = start
            
            while current <= end:
                date_list.append(current.strftime(date_format))
                current += timedelta(days=1)
            
            return date_list
            
        except Exception as e:
            logging.error(f"Error generating date range: {str(e)}")
            return [datetime.utcnow().strftime(date_format)]
    
    def get_security_summary(self, days: int = 30) -> Dict[str, Any]:
        """Get security summary statistics"""
        try:
            summary = {
                'total_events': 0,
                'failed_logins': 0,
                'mfa_events': 0,
                'high_risk_events': 0,
                'critical_events': 0,
                'unique_users': set(),
                'top_ips': defaultdict(int),
                'event_types': defaultdict(int),
                'daily_counts': defaultdict(int)
            }
            
            date_pattern = "%Y%m%d"
            end_date = datetime.utcnow().strftime(date_pattern)
            start_date = (datetime.utcnow() - timedelta(days=days)).strftime(date_pattern)
            date_range = self._get_date_range(start_date, end_date, date_pattern)
            
            for date_key in date_range:
                key = f"audit:daily:{date_key}"
                stored_events = self.redis_client.lrange(key, 0, 1000)  # Limit per day
                
                for event_data in stored_events:
                    try:
                        event = json.loads(event_data.decode())
                        summary['total_events'] += 1
                        summary['unique_users'].add(event.get('user_id'))
                        summary['top_ips'][event.get('ip_address', 'unknown')] += 1
                        summary['event_types'][event.get('event_type', 'unknown')] += 1
                        summary['daily_counts'][date_key] += 1
                        
                        # Count specific events
                        event_type = event.get('event_type', '')
                        if event_type == 'auth_failure':
                            summary['failed_logins'] += 1
                        elif event_type == 'auth_mfa':
                            summary['mfa_events'] += 1
                        
                        risk_level = event.get('risk_level', '')
                        if risk_level == 'high':
                            summary['high_risk_events'] += 1
                        elif risk_level == 'critical':
                            summary['critical_events'] += 1
                            
                    except (json.JSONDecodeError, KeyError):
                        continue
            
            # Convert sets to counts
            summary['unique_users'] = len(summary['unique_users'])
            summary['top_ips'] = dict(summary['top_ips'])
            summary['event_types'] = dict(summary['event_types'])
            summary['daily_counts'] = dict(summary['daily_counts'])
            
            return summary
            
        except Exception as e:
            logging.error(f"Error generating security summary: {str(e)}")
            return {}
    
    def export_audit_logs(self, start_date: str, end_date: str, format: str = 'json') -> bytes:
        """Export audit logs in specified format"""
        try:
            events = self.get_events(
                start_date=start_date,
                end_date=end_date,
                limit=10000
            )
            
            if format.lower() == 'json':
                return json.dumps(events, indent=2).encode('utf-8')
            elif format.lower() == 'csv':
                import csv
                from io import StringIO
                
                output = StringIO()
                writer = csv.writer(output)
                
                # Write header
                if events:
                    header = list(events[0].keys())
                    writer.writerow(header)
                    
                    # Write data
                    for event in events:
                        writer.writerow([event.get(col, '') for col in header])
                
                return output.getvalue().encode('utf-8')
            
            return b''
            
        except Exception as e:
            logging.error(f"Error exporting audit logs: {str(e)}")
            return b''

# Global Audit service instance
audit_service = AuditService()

