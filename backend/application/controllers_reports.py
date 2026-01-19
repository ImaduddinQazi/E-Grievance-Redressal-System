from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import os
from datetime import datetime
from .models import Complain, Media, User
from .database import db

reports_bp = Blueprint('reports', __name__)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in {'png', 'jpg', 'jpeg', 'gif'}

def get_current_user():
    user_id = request.headers.get('X-User-ID')
    if user_id:
        return User.query.get(int(user_id))
    return None

@reports_bp.route('/reports', methods=['GET'])
def get_reports():
    try:
        user = get_current_user()
        if not user:
            return jsonify({"error": "Unauthorized"}), 401

        # Get query parameters for filtering
        department_filter = request.args.get('department')
        status_filter = request.args.get('status')
        
        # Start with base query
        query = Complain.query
        
        # Apply filters if provided
        if department_filter:
            query = query.filter(Complain.department == department_filter)
        if status_filter:
            query = query.filter(Complain.status == status_filter)
        
        # Get all reports (not just current user's)
        reports = query.order_by(Complain.date_created.desc()).all()
        
        return jsonify([{
            "id": r.id,
            "title": r.title,
            "description": r.description,
            "department": r.department,
            "status": r.status,
            "date_created": r.date_created.isoformat() if r.date_created else None,
            "image_url": r.image_url,
            "location": r.location,
            "code": f"CMP-{r.id:06d}",
            "user": {
                "name": r.user.name if r.user else "Unknown User",
                "email": r.user.email if r.user else "unknown@example.com"
            }
        } for r in reports]), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@reports_bp.route('/reports', methods=['POST'])
def create_report():
    try:
        user = get_current_user()
        if not user:
            return jsonify({"error": "Unauthorized"}), 401

        data = request.form
        report = Complain(
            title=data['title'],
            description=data['description'],
            department=data['department'],
            location=data.get('location', ''),
            user_id=user.id
        )

        db.session.add(report)
        db.session.flush()  # Get the report ID without committing

        # Handle file upload and save to media table
        if 'image' in request.files:
            file = request.files['image']
            if file and file.filename != '' and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                unique_name = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{filename}"
                filepath = os.path.join('uploads', unique_name)
                os.makedirs('uploads', exist_ok=True)
                file.save(filepath)
                
                # Save image URL in report
                report.image_url = f"http://localhost:5000/uploads/{unique_name}"
                
                # ALSO save in media table
                media = Media(
                    filename=filename,
                    file_path=filepath,
                    user_id=user.id,
                    complain_id=report.id
                )
                db.session.add(media)

        db.session.commit()

        return jsonify({
            "message": "Report created successfully",
            "id": report.id,
            "code": f"CMP-{report.id:06d}"
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
@reports_bp.route('/my-reports', methods=['GET'])
def get_my_reports():
    try:
        user = get_current_user()
        if not user:
            return jsonify({"error": "Unauthorized"}), 401

        # Get only current user's reports
        reports = Complain.query.filter_by(user_id=user.id).order_by(Complain.date_created.desc()).all()
        
        return jsonify([{
            "id": r.id,
            "title": r.title,
            "description": r.description,
            "department": r.department,
            "status": r.status,
            "date_created": r.date_created.isoformat() if r.date_created else None,
            "image_url": r.image_url,
            "location": r.location,
            "code": f"CMP-{r.id:06d}",
            "media_count": Media.query.filter_by(complain_id=r.id).count()
        } for r in reports]), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
@reports_bp.route('/heatmap/data', methods=['GET'])
def get_heatmap_data():
    try:
        # Get filter parameters
        department_filter = request.args.get('department')
        status_filter = request.args.get('status')
        
        # Build query with filters
        query = Complain.query
        
        if department_filter:
            query = query.filter(Complain.department == department_filter)
        if status_filter:
            query = query.filter(Complain.status == status_filter)
        
        reports = query.all()
        
        # Group by department and status for heatmap
        heatmap_data = {}
        
        for report in reports:
            if report.department not in heatmap_data:
                heatmap_data[report.department] = {
                    'total': 0,
                    'resolved': 0,
                    'in_progress': 0,
                    'pending': 0,
                    'color': get_department_color(report.department)
                }
            
            heatmap_data[report.department]['total'] += 1
            
            if report.status and report.status.lower() == 'resolved':
                heatmap_data[report.department]['resolved'] += 1
            elif report.status and report.status.lower() == 'in progress':
                heatmap_data[report.department]['in_progress'] += 1
            else:
                heatmap_data[report.department]['pending'] += 1
        
        return jsonify(heatmap_data), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def get_department_color(department):
    color_map = {
        'Road Maintenance': '#ff6b6b',
        'Sanitation': '#4ecdc4',
        'Electricity': '#45b7d1',
        'Water Supply': '#f9ca24',
        'Public Works': '#6c5ce7',
        'default': '#a29bfe'
    }
    return color_map.get(department, color_map['default'])

@reports_bp.route('/heatmap/locations', methods=['GET'])
def get_location_data():
    try:
        # Get reports with location data
        reports = Complain.query.filter(Complain.location.isnot(None)).all()
        
        location_data = []
        for report in reports:
            if report.location:
                location_data.append({
                    'location': report.location,
                    'department': report.department,
                    'status': report.status,
                    'title': report.title,
                    'count': 1
                })
        
        return jsonify(location_data), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500