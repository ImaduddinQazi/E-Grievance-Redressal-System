from flask import Blueprint, request, jsonify
from .models import Complain, User
from .database import db
from datetime import datetime  # ADD THIS IMPORT
import traceback  # ADD THIS IMPORT

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/admin/reports', methods=['GET'])
def get_all_reports():
    try:
        print("Admin reports endpoint hit")
        reports = Complain.query.order_by(Complain.date_created.desc()).all()
        print(f"Found {len(reports)} reports")
        
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
                "is_verified": report.is_verified,
                "forwarded_to": report.forwarded_to,
                "verified_at": report.verified_at.isoformat() if report.verified_at else None,
                "user": {
                    "id": report.user.id,
                    "name": report.user.name,
                    "email": report.user.email
                } if report.user else None
            })
        
        return jsonify(reports_data), 200
        
    except Exception as e:
        print(f"Error in admin reports: {str(e)}")
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/admin/reports/<int:report_id>', methods=['PUT'])
def update_report(report_id):
    try:
        print(f"Update report endpoint hit for ID: {report_id}")
        data = request.get_json()
        print(f"Update data: {data}")
        
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
        print("Report updated successfully")
        
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
        print(f"Error updating report: {str(e)}")
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/admin/reports/<int:report_id>/verify', methods=['POST'])
def verify_and_forward_report(report_id):
    try:
        print(f"🔍 Verification endpoint called for report ID: {report_id}")
        
        data = request.get_json()
        user_id = request.headers.get('X-User-ID')
        
        print(f"Request data: {data}")
        print(f"User ID from headers: {user_id}")
        
        if not user_id:
            print("❌ No user ID in headers")
            return jsonify({"error": "Authentication required"}), 401
            
        # Get the report
        report = Complain.query.get(report_id)
        if not report:
            print(f"❌ Report {report_id} not found")
            return jsonify({"error": "Report not found"}), 404
            
        print(f"📋 Found report: {report.title}, Current status: {report.status}")
        
        # Update report with verification data
        report.is_verified = True
        report.verified_at = datetime.utcnow()
        report.verified_by = int(user_id)
        report.forwarded_to = data.get('authority_name', 'Unknown Authority')
        report.verification_notes = data.get('notes', '')
        report.status = 'Forwarded'
        
        print(f"✅ Updating report: forwarded_to={report.forwarded_to}, status={report.status}")
        
        db.session.commit()
        
        print("✅ Report verified and forwarded successfully!")
        
        return jsonify({
            "message": f"Report verified and forwarded to {report.forwarded_to}",
            "report": {
                "id": report.id,
                "code": f"CMP-{report.id:06d}",
                "status": report.status,
                "forwarded_to": report.forwarded_to,
                "is_verified": report.is_verified
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error in verify_and_forward_report: {str(e)}")
        print("Stack trace:")
        traceback.print_exc()
        return jsonify({"error": f"Failed to verify and forward report: {str(e)}"}), 500

# Add a simple endpoint to test if admin routes are working
@admin_bp.route('/admin/test')
def admin_test():
    return jsonify({"message": "Admin routes are working!"})