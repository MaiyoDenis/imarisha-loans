"""
Business Intelligence (BI) Integration Service
Integrates with Power BI, Tableau, and other BI tools
"""
import logging
import json
import csv
import io
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
from flask import current_app
import pandas as pd
import redis

class PowerBIConnector:
    """Power BI integration connector"""
    
    def __init__(self, app=None):
        self.app = None
        self.client_id = None
        self.client_secret = None
        self.tenant_id = None
        self.workspace_id = None
        self.dataset_id = None
        
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize Power BI connector"""
        self.app = app
        self.client_id = app.config.get('POWERBI_CLIENT_ID')
        self.client_secret = app.config.get('POWERBI_CLIENT_SECRET')
        self.tenant_id = app.config.get('POWERBI_TENANT_ID')
        self.workspace_id = app.config.get('POWERBI_WORKSPACE_ID')
        self.dataset_id = app.config.get('POWERBI_DATASET_ID')
        
        logging.info("Power BI Connector initialized")
    
    def get_embed_token(self, report_id: str) -> Optional[Dict[str, Any]]:
        """Get Power BI embed token for report"""
        try:
            import requests
            import msal
            
            authority = f"https://login.microsoftonline.com/{self.tenant_id}"
            
            app = msal.PublicClientApplication(
                self.client_id,
                authority=authority
            )
            
            token = app.acquire_token_for_client(
                scopes=["https://analysis.windows.net/powerbi/api/.default"]
            )
            
            if "error" in token:
                logging.error(f"Failed to get token: {token.get('error')}")
                return None
            
            return {
                'access_token': token.get('access_token'),
                'token_type': 'Bearer',
                'expires_in': token.get('expires_in'),
                'expires_at': datetime.utcnow() + timedelta(seconds=token.get('expires_in'))
            }
        
        except Exception as e:
            logging.error(f"Error getting Power BI embed token: {str(e)}")
            return None
    
    def push_data_to_powerbi(self, table_name: str, data: List[Dict[str, Any]]) -> bool:
        """Push data to Power BI dataset"""
        try:
            import requests
            
            token = self.get_embed_token("")
            if not token:
                return False
            
            headers = {
                "Authorization": f"Bearer {token.get('access_token')}",
                "Content-Type": "application/json"
            }
            
            url = f"https://api.powerbi.com/v1.0/myorg/groups/{self.workspace_id}/datasets/{self.dataset_id}/tables/{table_name}/rows"
            
            payload = {"rows": data}
            
            response = requests.post(url, headers=headers, json=payload, timeout=30)
            
            if response.status_code in [200, 201, 204]:
                logging.info(f"Successfully pushed {len(data)} rows to Power BI table: {table_name}")
                return True
            else:
                logging.error(f"Failed to push data to Power BI: {response.status_code} - {response.text}")
                return False
        
        except Exception as e:
            logging.error(f"Error pushing data to Power BI: {str(e)}")
            return False
    
    def get_report_config(self) -> Dict[str, Any]:
        """Get Power BI report configuration"""
        return {
            'provider': 'powerbi',
            'workspace_id': self.workspace_id,
            'dataset_id': self.dataset_id,
            'status': 'configured' if all([self.client_id, self.client_secret]) else 'not_configured'
        }


class TableauConnector:
    """Tableau integration connector"""
    
    def __init__(self, app=None):
        self.app = None
        self.server = None
        self.username = None
        self.password = None
        self.site_id = None
        self.project_id = None
        
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize Tableau connector"""
        self.app = app
        self.server = app.config.get('TABLEAU_SERVER')
        self.username = app.config.get('TABLEAU_USERNAME')
        self.password = app.config.get('TABLEAU_PASSWORD')
        self.site_id = app.config.get('TABLEAU_SITE_ID')
        self.project_id = app.config.get('TABLEAU_PROJECT_ID')
        
        logging.info("Tableau Connector initialized")
    
    def publish_datasource(self, datasource_name: str, file_path: str) -> bool:
        """Publish datasource to Tableau Server"""
        try:
            import tableauserverclient as TSC
            
            tableau_auth = TSC.Auth.basic_auth(self.username, self.password)
            server = TSC.Server(self.server)
            
            with server.auth.sign_in(tableau_auth):
                datasource_item = TSC.DatasourceItem(self.project_id)
                datasource = server.datasources.publish(
                    datasource_item,
                    file_path,
                    overwrite=True
                )
                
                logging.info(f"Successfully published datasource: {datasource_name}")
                return True
        
        except Exception as e:
            logging.error(f"Error publishing datasource to Tableau: {str(e)}")
            return False
    
    def create_view_config(self, view_name: str, data_source: str) -> Dict[str, Any]:
        """Create view configuration for Tableau"""
        return {
            'view_name': view_name,
            'data_source': data_source,
            'worksheets': [
                {
                    'name': 'Dashboard',
                    'type': 'dashboard',
                    'elements': []
                }
            ],
            'filters': [],
            'parameters': []
        }
    
    def get_report_config(self) -> Dict[str, Any]:
        """Get Tableau report configuration"""
        return {
            'provider': 'tableau',
            'server': self.server,
            'project_id': self.project_id,
            'status': 'configured' if all([self.server, self.username]) else 'not_configured'
        }


class BIExportService:
    """Export data in formats compatible with BI tools"""
    
    @staticmethod
    def export_to_csv(data: List[Dict[str, Any]], filename: str = 'export.csv') -> bytes:
        """Export data to CSV format"""
        try:
            if not data:
                return b''
            
            df = pd.DataFrame(data)
            
            output = io.StringIO()
            df.to_csv(output, index=False)
            
            return output.getvalue().encode('utf-8')
        
        except Exception as e:
            logging.error(f"Error exporting to CSV: {str(e)}")
            return b''
    
    @staticmethod
    def export_to_json(data: List[Dict[str, Any]], filename: str = 'export.json') -> bytes:
        """Export data to JSON format"""
        try:
            output = json.dumps(data, indent=2, default=str)
            return output.encode('utf-8')
        
        except Exception as e:
            logging.error(f"Error exporting to JSON: {str(e)}")
            return b''
    
    @staticmethod
    def export_to_excel(data: List[Dict[str, Any]], filename: str = 'export.xlsx') -> bytes:
        """Export data to Excel format"""
        try:
            if not data:
                return b''
            
            df = pd.DataFrame(data)
            
            output = io.BytesIO()
            with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
                df.to_excel(writer, index=False, sheet_name='Data')
            
            output.seek(0)
            return output.getvalue()
        
        except Exception as e:
            logging.error(f"Error exporting to Excel: {str(e)}")
            return b''
    
    @staticmethod
    def export_to_parquet(data: List[Dict[str, Any]], filename: str = 'export.parquet') -> bytes:
        """Export data to Parquet format (optimized for BI tools)"""
        try:
            if not data:
                return b''
            
            df = pd.DataFrame(data)
            
            output = io.BytesIO()
            df.to_parquet(output, index=False, compression='snappy')
            
            output.seek(0)
            return output.getvalue()
        
        except Exception as e:
            logging.error(f"Error exporting to Parquet: {str(e)}")
            return b''


class BIIntegrationService:
    """Main BI Integration Service"""
    
    def __init__(self, app=None):
        self.app = None
        self.powerbi = PowerBIConnector(app)
        self.tableau = TableauConnector(app)
        self.export_service = BIExportService()
        self.redis_client = None
        
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize BI Integration Service"""
        self.app = app
        
        try:
            self.redis_client = redis.Redis(
                host=app.config.get('REDIS_HOST', 'localhost'),
                port=app.config.get('REDIS_PORT', 6379),
                db=app.config.get('REDIS_DB', 7),
                decode_responses=True
            )
        except Exception as e:
            logging.warning(f"Failed to initialize Redis for BI: {str(e)}")
        
        logging.info("BI Integration Service initialized")
    
    def get_available_tools(self) -> List[Dict[str, Any]]:
        """Get available BI tools"""
        return [
            {
                'name': 'Power BI',
                'code': 'powerbi',
                'description': 'Microsoft Power BI for enterprise analytics',
                'features': ['Real-time dashboards', 'Advanced analytics', 'Mobile support'],
                'status': self.powerbi.get_report_config()['status']
            },
            {
                'name': 'Tableau',
                'code': 'tableau',
                'description': 'Tableau for sophisticated data visualization',
                'features': ['Interactive dashboards', 'Data blending', 'Story telling'],
                'status': self.tableau.get_report_config()['status']
            },
            {
                'name': 'Google Data Studio',
                'code': 'google_data_studio',
                'description': 'Google Data Studio for business analytics',
                'features': ['Free platform', 'Easy setup', 'Google integration'],
                'status': 'available'
            },
            {
                'name': 'Metabase',
                'code': 'metabase',
                'description': 'Open-source analytics platform',
                'features': ['Self-hosted', 'SQL queries', 'Data exploration'],
                'status': 'available'
            }
        ]
    
    def export_member_data(self, format: str = 'csv', **filters) -> Dict[str, Any]:
        """Export member data in specified format"""
        try:
            from app.models import Member
            
            query = Member.query
            
            if filters.get('branch_id'):
                query = query.filter_by(branch_id=filters['branch_id'])
            
            members = query.all()
            
            data = [{
                'id': m.id,
                'name': m.name,
                'phone': m.phone,
                'email': m.email,
                'status': m.status,
                'created_at': m.created_at.isoformat() if m.created_at else None,
                'updated_at': m.updated_at.isoformat() if m.updated_at else None
            } for m in members]
            
            if format == 'csv':
                content = self.export_service.export_to_csv(data)
                content_type = 'text/csv'
                filename = 'members.csv'
            elif format == 'json':
                content = self.export_service.export_to_json(data)
                content_type = 'application/json'
                filename = 'members.json'
            elif format == 'excel':
                content = self.export_service.export_to_excel(data)
                content_type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                filename = 'members.xlsx'
            elif format == 'parquet':
                content = self.export_service.export_to_parquet(data)
                content_type = 'application/octet-stream'
                filename = 'members.parquet'
            else:
                return {'error': 'Unsupported format'}
            
            return {
                'success': True,
                'content': content,
                'content_type': content_type,
                'filename': filename,
                'rows': len(data)
            }
        
        except Exception as e:
            logging.error(f"Error exporting member data: {str(e)}")
            return {'error': str(e)}
    
    def export_loan_data(self, format: str = 'csv', **filters) -> Dict[str, Any]:
        """Export loan data in specified format"""
        try:
            from app.models import Loan
            
            query = Loan.query
            
            if filters.get('branch_id'):
                query = query.join(Loan.member).filter_by(branch_id=filters['branch_id'])
            
            if filters.get('status'):
                query = query.filter_by(status=filters['status'])
            
            loans = query.all()
            
            data = [{
                'id': l.id,
                'member_id': l.member_id,
                'loan_type_id': l.loan_type_id,
                'amount': float(l.amount),
                'interest_rate': float(l.interest_rate),
                'status': l.status,
                'disbursement_date': l.disbursement_date.isoformat() if l.disbursement_date else None,
                'maturity_date': l.maturity_date.isoformat() if l.maturity_date else None,
                'created_at': l.created_at.isoformat() if l.created_at else None
            } for l in loans]
            
            if format == 'csv':
                content = self.export_service.export_to_csv(data)
                content_type = 'text/csv'
                filename = 'loans.csv'
            elif format == 'json':
                content = self.export_service.export_to_json(data)
                content_type = 'application/json'
                filename = 'loans.json'
            elif format == 'excel':
                content = self.export_service.export_to_excel(data)
                content_type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                filename = 'loans.xlsx'
            elif format == 'parquet':
                content = self.export_service.export_to_parquet(data)
                content_type = 'application/octet-stream'
                filename = 'loans.parquet'
            else:
                return {'error': 'Unsupported format'}
            
            return {
                'success': True,
                'content': content,
                'content_type': content_type,
                'filename': filename,
                'rows': len(data)
            }
        
        except Exception as e:
            logging.error(f"Error exporting loan data: {str(e)}")
            return {'error': str(e)}


# Initialize BI service
bi_service = BIIntegrationService()
