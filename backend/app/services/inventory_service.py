from app.models import LoanProduct, LoanProductItem, Loan
from app import db
from sqlalchemy import func
from datetime import datetime, timedelta
import pandas as pd
import numpy as np

class InventoryService:
    @staticmethod
    def check_stock_levels():
        """
        Check for products with low stock
        """
        low_stock_products = LoanProduct.query.filter(
            LoanProduct.stock_quantity <= LoanProduct.low_stock_threshold
        ).all()
        
        alerts = []
        for product in low_stock_products:
            status = 'critical' if product.stock_quantity <= product.critical_stock_threshold else 'low'
            alerts.append({
                'product_id': product.id,
                'name': product.name,
                'current_stock': product.stock_quantity,
                'threshold': product.low_stock_threshold,
                'status': status
            })
            
        return alerts

    @staticmethod
    def predict_demand(product_id: int, days=30):
        """
        Predict demand for a product for the next N days
        """
        # Get historical usage
        start_date = datetime.utcnow() - timedelta(days=90)
        usage = db.session.query(
            func.date(Loan.created_at).label('date'),
            func.sum(LoanProductItem.quantity).label('quantity')
        ).join(LoanProductItem.loan)\
         .filter(
             LoanProductItem.product_id == product_id,
             Loan.created_at >= start_date
         ).group_by(func.date(Loan.created_at)).all()
         
        if not usage:
            return {'forecast': 0, 'confidence': 'low'}
            
        df = pd.DataFrame(usage, columns=['date', 'quantity'])
        df['date'] = pd.to_datetime(df['date'])
        
        # Calculate daily average
        # Fill missing days with 0 for accurate average
        full_range = pd.date_range(start=df['date'].min(), end=df['date'].max())
        df = df.set_index('date').reindex(full_range).fillna(0).reset_index()
        
        daily_avg = df['quantity'].mean()
        
        # Simple forecast
        forecast = daily_avg * days
        
        return {
            'forecast': int(np.ceil(forecast)),
            'daily_average': round(float(daily_avg), 2),
            'confidence': 'medium'
        }
