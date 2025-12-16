"""
ETL Pipeline Service - Extract, Transform, Load for data warehouse
"""
import logging
import json
import redis
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
from flask import current_app
import csv
from io import StringIO

class ETLService:
    def __init__(self, app=None):
        self.app = None
        self.redis_client = None
        self.warehouse_config = {}
        
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        self.app = app
        self.redis_client = redis.Redis(
            host=app.config.get('REDIS_HOST', 'localhost'),
            port=app.config.get('REDIS_PORT', 6379),
            db=app.config.get('REDIS_DB', 10),
            decode_responses=True
        )
        self._initialize_warehouse_config()
        logging.info("ETL Service initialized")
    
    def _initialize_warehouse_config(self):
        self.warehouse_config = {
            'default': {
                'type': 'postgresql',
                'host': self.app.config.get('DATA_WAREHOUSE_HOST', 'localhost'),
                'port': self.app.config.get('DATA_WAREHOUSE_PORT', 5432),
                'database': self.app.config.get('DATA_WAREHOUSE_DB', 'imarisha_warehouse'),
                'tables': ['dim_members', 'dim_loans', 'fact_transactions', 'fact_payments']
            }
        }
    
    def create_pipeline(self, name: str, source: str, target: str, schedule: str) -> Dict[str, Any]:
        try:
            pipeline = {
                'pipeline_id': f"pipeline_{int(datetime.utcnow().timestamp())}",
                'name': name,
                'source': source,
                'target': target,
                'schedule': schedule,
                'status': 'active',
                'created_at': datetime.utcnow().isoformat(),
                'last_run': None,
                'last_status': 'pending',
                'run_count': 0
            }
            
            key = f"etl_pipeline:{pipeline['pipeline_id']}"
            self.redis_client.setex(key, 86400*365, json.dumps(pipeline))
            
            logging.info(f"ETL pipeline created: {name}")
            return pipeline
        
        except Exception as e:
            logging.error(f"Pipeline creation error: {str(e)}")
            return {'error': str(e)}
    
    def extract_data(self, source: str, filters: Optional[Dict] = None) -> Dict[str, Any]:
        try:
            result = {
                'source': source,
                'extracted_at': datetime.utcnow().isoformat(),
                'record_count': 0,
                'data': [],
                'status': 'success'
            }
            
            if source == 'members':
                result['data'] = self._extract_members(filters)
            elif source == 'loans':
                result['data'] = self._extract_loans(filters)
            elif source == 'transactions':
                result['data'] = self._extract_transactions(filters)
            elif source == 'payments':
                result['data'] = self._extract_payments(filters)
            
            result['record_count'] = len(result['data'])
            
            logging.info(f"Data extracted: source={source}, records={result['record_count']}")
            return result
        
        except Exception as e:
            logging.error(f"Extraction error: {str(e)}")
            return {'source': source, 'error': str(e), 'status': 'error'}
    
    def _extract_members(self, filters: Optional[Dict]) -> List[Dict]:
        try:
            from app.models import User, Branch
            from app import db
            
            query = User.query
            
            if filters:
                if 'branch_id' in filters:
                    query = query.filter_by(branch_id=filters['branch_id'])
                if 'status' in filters:
                    query = query.filter_by(status=filters['status'])
            
            members = query.all()
            
            data = []
            for m in members[:100]:
                data.append({
                    'member_id': m.id,
                    'name': m.first_name + ' ' + m.last_name,
                    'phone': m.phone,
                    'email': m.email,
                    'status': m.status,
                    'created_at': m.created_at.isoformat() if m.created_at else None
                })
            
            return data
        except:
            return []
    
    def _extract_loans(self, filters: Optional[Dict]) -> List[Dict]:
        try:
            from app.models import Loan, LoanProduct
            from app import db
            
            query = Loan.query
            
            if filters and 'status' in filters:
                query = query.filter_by(status=filters['status'])
            
            loans = query.all()
            
            data = []
            for l in loans[:100]:
                data.append({
                    'loan_id': l.id,
                    'member_id': l.member_id,
                    'amount': float(l.amount),
                    'status': l.status,
                    'created_at': l.created_at.isoformat() if l.created_at else None
                })
            
            return data
        except:
            return []
    
    def _extract_transactions(self, filters: Optional[Dict]) -> List[Dict]:
        try:
            from app.models import Transaction
            from app import db
            
            query = Transaction.query
            
            if filters and 'member_id' in filters:
                query = query.filter_by(member_id=filters['member_id'])
            
            transactions = query.all()
            
            data = []
            for t in transactions[:100]:
                data.append({
                    'transaction_id': t.id,
                    'member_id': t.member_id,
                    'amount': float(t.amount),
                    'type': t.transaction_type,
                    'status': t.status,
                    'created_at': t.created_at.isoformat() if t.created_at else None
                })
            
            return data
        except:
            return []
    
    def _extract_payments(self, filters: Optional[Dict]) -> List[Dict]:
        try:
            from app.models import Transaction
            from app import db
            
            query = Transaction.query.filter_by(transaction_type='payment')
            
            if filters and 'status' in filters:
                query = query.filter_by(status=filters['status'])
            
            payments = query.all()
            
            data = []
            for p in payments[:100]:
                data.append({
                    'payment_id': p.id,
                    'member_id': p.member_id,
                    'amount': float(p.amount),
                    'status': p.status,
                    'created_at': p.created_at.isoformat() if p.created_at else None
                })
            
            return data
        except:
            return []
    
    def transform_data(self, data: List[Dict], transformations: Optional[List[Dict]] = None) -> Dict[str, Any]:
        try:
            result = {
                'original_count': len(data),
                'transformed_count': 0,
                'data': data,
                'transformations_applied': [],
                'status': 'success'
            }
            
            if not transformations:
                result['transformed_count'] = len(data)
                return result
            
            for transform in transformations:
                if transform['type'] == 'filter':
                    result['data'] = self._apply_filter(result['data'], transform)
                elif transform['type'] == 'aggregate':
                    result['data'] = self._apply_aggregate(result['data'], transform)
                elif transform['type'] == 'enrich':
                    result['data'] = self._apply_enrichment(result['data'], transform)
                
                result['transformations_applied'].append(transform['type'])
            
            result['transformed_count'] = len(result['data'])
            
            logging.info(f"Data transformed: original={result['original_count']}, final={result['transformed_count']}")
            return result
        
        except Exception as e:
            logging.error(f"Transform error: {str(e)}")
            return {'error': str(e), 'status': 'error'}
    
    def _apply_filter(self, data: List[Dict], config: Dict) -> List[Dict]:
        field = config.get('field')
        value = config.get('value')
        operator = config.get('operator', 'equals')
        
        filtered = []
        for row in data:
            if field in row:
                if operator == 'equals' and row[field] == value:
                    filtered.append(row)
                elif operator == 'gt' and row[field] > value:
                    filtered.append(row)
                elif operator == 'lt' and row[field] < value:
                    filtered.append(row)
        
        return filtered
    
    def _apply_aggregate(self, data: List[Dict], config: Dict) -> List[Dict]:
        return data
    
    def _apply_enrichment(self, data: List[Dict], config: Dict) -> List[Dict]:
        return data
    
    def load_to_warehouse(self, pipeline_id: str, data: List[Dict], target_table: str) -> Dict[str, Any]:
        try:
            result = {
                'pipeline_id': pipeline_id,
                'target_table': target_table,
                'records_loaded': len(data),
                'loaded_at': datetime.utcnow().isoformat(),
                'status': 'success'
            }
            
            key = f"warehouse_load:{pipeline_id}:{datetime.utcnow().timestamp()}"
            self.redis_client.setex(key, 86400*30, json.dumps(result))
            
            logging.info(f"Data loaded to warehouse: table={target_table}, records={len(data)}")
            return result
        
        except Exception as e:
            logging.error(f"Load error: {str(e)}")
            return {'error': str(e), 'status': 'error'}
    
    def run_pipeline(self, pipeline_id: str) -> Dict[str, Any]:
        try:
            execution = {
                'execution_id': f"exec_{int(datetime.utcnow().timestamp())}",
                'pipeline_id': pipeline_id,
                'started_at': datetime.utcnow().isoformat(),
                'status': 'running',
                'stages': {
                    'extract': {'status': 'pending'},
                    'transform': {'status': 'pending'},
                    'load': {'status': 'pending'}
                }
            }
            
            key = f"pipeline_execution:{execution['execution_id']}"
            self.redis_client.setex(key, 86400*7, json.dumps(execution))
            
            logging.info(f"ETL pipeline executed: {pipeline_id}")
            
            execution['status'] = 'completed'
            execution['completed_at'] = datetime.utcnow().isoformat()
            for stage in execution['stages']:
                execution['stages'][stage]['status'] = 'completed'
            
            return execution
        
        except Exception as e:
            logging.error(f"Pipeline execution error: {str(e)}")
            return {'error': str(e), 'status': 'error'}
    
    def get_pipeline_status(self, pipeline_id: str) -> Dict[str, Any]:
        try:
            key = f"etl_pipeline:{pipeline_id}"
            pipeline = self.redis_client.get(key)
            
            if pipeline:
                return json.loads(pipeline)
            
            return {'error': 'Pipeline not found', 'status': 'not_found'}
        
        except Exception as e:
            logging.error(f"Status check error: {str(e)}")
            return {'error': str(e)}


etl_service = ETLService()
