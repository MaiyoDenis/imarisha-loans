from app.models import Visit, Member, User
from app import db
from datetime import datetime

class FieldService:
    @staticmethod
    def log_visit(officer_id, member_id, location_lat, location_lng, notes, photo_url=None):
        """
        Log a field visit
        """
        visit = Visit(
            officer_id=officer_id,
            member_id=member_id,
            location_lat=location_lat,
            location_lng=location_lng,
            notes=notes,
            photo_url=photo_url
        )
        
        db.session.add(visit)
        db.session.commit()
        
        return visit

    @staticmethod
    def get_officer_visits(officer_id, date=None):
        """
        Get visits for a specific officer, optionally filtered by date
        """
        query = Visit.query.filter_by(officer_id=officer_id)
        
        if date:
            # Filter by specific date (ignoring time)
            start_of_day = datetime.combine(date, datetime.min.time())
            end_of_day = datetime.combine(date, datetime.max.time())
            query = query.filter(Visit.visit_date.between(start_of_day, end_of_day))
            
        return query.order_by(Visit.visit_date.desc()).all()
