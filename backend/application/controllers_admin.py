from flask import Blueprint, request, jsonify
from .models import Complain, User
from .database import db
from functools import wraps

admin_bp = Blueprint('admin', __name__)

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_id = request.headers.get('X-User-ID')
        if not user_id:
            return jsonify({"error": "Authentication required"}), 401
            
        user = User.query.get(int(user_id))
        if not user or user.type != 'admin':
            return jsonify({"error": "Admin access required"}), 403
            
        return f(*args, **kwargs)
    return decorated_function

@admin_bp.route('/admin/reports', methods=['GET'])
def get_all_reports():  # Removed @admin_required temporarily for testing
    try:
        print("Admin reports endpoint hit")  # Debug
        reports = Complain.query.order_by(Complain.date_created.desc()).all()
        print(f"Found {len(reports)} reports")  # Debug
        
        reports_data = []
        for report in reports:
            reports_data.append({
                "id": report.id,
                "code": f"CMP-{report.id:06d}",
                "title": report.title,
                "description": report.description,
                "department": report.department,
                "status": report.status,
                "location": report.location,
                "date_created": report.date_created.isoformat() if report.date_created else None,
                "image_url": report.image_url,
                "user": {
                    "id": report.user.id,
                    "name": report.user.name,
                    "email": report.user.email
                } if report.user else None
            })
        
        return jsonify(reports_data), 200
        
    except Exception as e:
        print(f"Error in admin reports: {str(e)}")  # Debug
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/admin/reports/<int:report_id>', methods=['PUT'])
def update_report(report_id):  # Removed @admin_required temporarily
    try:
        print(f"Update report endpoint hit for ID: {report_id}")  # Debug
        data = request.get_json()
        print(f"Update data: {data}")  # Debug
        
        report = Complain.query.get_or_404(report_id)
        
        # Update fields if provided
        if 'status' in data:
            report.status = data['status']
        if 'department' in data:
            report.department = data['department']
        if 'title' in data:
            report.title = data['title']
        if 'description' in data:
            report.description = data['description']
        
        db.session.commit()
        print("Report updated successfully")  # Debug
        
        return jsonify({
            "message": "Report updated successfully",
            "report": {
                "id": report.id,
                "code": f"CMP-{report.id:06d}",
                "status": report.status,
                "department": report.department,
                "title": report.title
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error updating report: {str(e)}")  # Debug
        return jsonify({"error": str(e)}), 500