from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from .models import Complain, Media, User
from .database import db
from datetime import datetime
import os

# Create blueprint
auth_bp = Blueprint('auth', __name__)

# Register route
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No JSON data received"}), 400

    required_fields = ['name', 'email', 'password', 'address', 'pincode']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

    try:
        new_user = User(
            name=data['name'],
            email=data['email'],
            password=generate_password_hash(data['password']),
            address=data['address'],
            pincode=data['pincode'],
            type='general'
        )
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Login route
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    # Add proper error handling
    if not data:
        return jsonify({"error": "No data provided"}), 400
        
    try:
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400
            
        user = User.query.filter_by(email=email).first()
        
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        if not check_password_hash(user.password, password):
            return jsonify({"error": "Invalid password"}), 401
            
        # Return user data needed for frontend
        return jsonify({
            "message": "Login successful",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "type": user.type
            }
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

# Create blueprint for complaints
complaint_bp = Blueprint('complaint', __name__)

# Configure upload folder
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg'}

def allowed_file(filename):
    if not filename or '.' not in filename:
        return False
    ext = filename.rsplit('.', 1)[1].lower()
    return ext in ALLOWED_EXTENSIONS

@complaint_bp.route('/submit-complain', methods=['POST', 'OPTIONS'])  # Add OPTIONS
def submit_complain():
    if request.method == 'OPTIONS':
        # Handle preflight requests
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        return response
    
    try:
        print("=== DEBUG: SUBMIT COMPLAIN CALLED ===")
        print(f"Method: {request.method}")
        print(f"Content-Type: {request.content_type}")
        print(f"Form data: {dict(request.form)}")
        print(f"Files: {dict(request.files)}")
        
        # Check if we're getting multipart form data
        if not request.content_type or 'multipart/form-data' not in request.content_type:
            print("ERROR: Not multipart form data")
            return jsonify({"error": "Expected multipart form data"}), 400
        
        # Get form data
        title = request.form.get('title')
        location_name = request.form.get('location_name')
        address = request.form.get('address')
        pincode = request.form.get('pincode')
        description = request.form.get('description')
        department = request.form.get('department')
        user_id = request.form.get('user_id', 1)
        
        print(f"Extracted data - Title: {title}, User ID: {user_id}")
        
        # Validate required fields
        required_fields = ['title', 'location_name', 'address', 'pincode', 'description']
        missing_fields = [field for field in required_fields if not request.form.get(field)]
        
        if missing_fields:
            print(f"Missing fields: {missing_fields}")
            return jsonify({"error": f"Missing fields: {', '.join(missing_fields)}"}), 400
        
        # Create new complaint
        new_complaint = Complain(
            title=title,
            location_name=location_name,
            address=address,
            pincode=int(pincode),
            description=description,
            department=department,
            user_id=int(user_id),
            date_created=datetime.utcnow()
        )
        
        db.session.add(new_complaint)
        db.session.commit()
        print(f"Complaint created with ID: {new_complaint.id}")
        
        # Handle file upload
        image_file = request.files.get('image')
        print(f"Image file received: {image_file is not None}")
        
        if image_file:
            print(f"File details: name={image_file.filename}, size={image_file.content_length}")
            print(f"Allowed file check: {allowed_file(image_file.filename)}")
            
            if allowed_file(image_file.filename):
                print("Processing image upload...")
                
                # Create uploads directory in the same folder as this script
                current_dir = os.path.dirname(os.path.abspath(__file__))
                upload_dir = os.path.join(current_dir, 'uploads')
                os.makedirs(upload_dir, exist_ok=True)
                
                filename = secure_filename(image_file.filename)
                unique_filename = f"{int(datetime.now().timestamp())}_{filename}"
                file_path = os.path.join(upload_dir, unique_filename)
                
                print(f"Saving to: {file_path}")
                image_file.save(file_path)
                
                # Verify file was saved
                if os.path.exists(file_path):
                    file_size = os.path.getsize(file_path)
                    print(f"File saved successfully! Size: {file_size} bytes")
                    
                    # Save media record
                    new_media = Media(
                        user_id=int(user_id),
                        image=unique_filename,  # Store just filename
                        complain_id=new_complaint.id
                    )
                    db.session.add(new_media)
                    db.session.commit()
                    print("Media record created successfully!")
                else:
                    print("ERROR: File was not saved to disk!")
            else:
                print("File type not allowed")
        else:
            print("No image file provided")
        
        response = jsonify({
            "message": "Complaint submitted successfully",
            "complain_id": new_complaint.id
        })
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response, 201
        
    except Exception as e:
        print(f"ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        db.session.rollback()
        response = jsonify({"error": str(e)})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response, 500

@complaint_bp.route('/user-complaints', methods=['GET'])
def get_user_complaints():
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({"error": "User ID is required"}), 400
        
        complaints = Complain.query.filter_by(user_id=user_id).order_by(Complain.date_created.desc()).all()
        
        complaints_data = []
        for complaint in complaints:
            complaints_data.append({
                'id': complaint.id,
                'title': complaint.title,
                'description': complaint.description,
                'location_name': complaint.location_name,
                'address': complaint.address,
                'pincode': complaint.pincode,
                'status': complaint.status,
                'department': complaint.department,
                'date_created': complaint.date_created.isoformat(),
                'user_id': complaint.user_id
            })
        
        return jsonify({"complaints": complaints_data}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@complaint_bp.route('/complaint-media', methods=['GET'])
def get_complaint_media():
    try:
        complain_id = request.args.get('complain_id')
        if not complain_id:
            return jsonify({"error": "Complaint ID is required"}), 400
        
        media_list = Media.query.filter_by(complain_id=complain_id).all()
        
        media_data = []
        for media_item in media_list:
            media_data.append({
                'id': media_item.id,
                'image': media_item.image,
                'complain_id': media_item.complain_id
            })
        
        return jsonify({"media": media_data}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# Route to get ALL complaints (for community view)
@complaint_bp.route('/all-complaints', methods=['GET'])
def get_all_complaints():
    try:
        # Get all complaints with user information
        complaints = Complain.query.order_by(Complain.date_created.desc()).all()
        
        complaints_data = []
        for complaint in complaints:
            # Get user info for each complaint
            user = User.query.get(complaint.user_id)
            user_name = user.name if user else 'Unknown User'
            
            complaints_data.append({
                'id': complaint.id,
                'title': complaint.title,
                'description': complaint.description,
                'location_name': complaint.location_name,
                'address': complaint.address,
                'pincode': complaint.pincode,
                'status': complaint.status,
                'department': complaint.department,
                'date_created': complaint.date_created.isoformat(),
                'user_id': complaint.user_id,
                'user_name': user_name  # Add user name for display
            })
        
        return jsonify({"complaints": complaints_data}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Temporary district coordinates for Maharashtra
MAHARASHTRA_DISTRICTS = {
    # Mumbai Division
    'Mumbai': [18.987074, 72.830007],
    'Palghar': [19.696, 72.765],  # Approximate center
    'Raigad': [18.646539, 72.875994],
    'Ratnagiri': [16.990597, 73.297537],
    'Sindhudurg': [16.107985, 73.714977],
    
    # Pune Division  
    'Pune': [18.525994, 73.862602],
    'Ahmednagar': [19.093412, 74.746855],
    'Satara': [17.690393, 74.010744],
    'Sangli': [16.860757, 74.57878], 
    'Solapur': [17.672099, 75.907906],
    'Kolhapur': [16.694394, 74.22406],
    
    # Nashik Division
    'Nashik': [20.006006, 73.795878],
    'Dhule': [20.90441, 74.781243],
    'Nandurbar': [21.36675, 74.244736],
    'Jalgaon': [21.009559, 75.570044],
    'Ahmednagar': [19.093412, 74.746855], # Note: Ahmednagar is listed in both divisions
    
    # Aurangabad Division
    'Aurangabad': [19.885543, 75.333441],
    'Jalna': [19.848844, 75.901627],
    'Beed': [18.987824, 75.763809],
    'Hingoli': [19.713154, 77.153409],
    'Parbhani': [19.268358, 76.777025],
    'Nanded': [19.159314, 77.313188],
    'Latur': [18.401122, 76.576955],
    'Osmanabad': [18.181663, 76.041686],
    
    # Nagpur Division
    'Nagpur': [21.148204, 79.096814],
    'Wardha': [20.735221, 78.604456], 
    'Bhandara': [21.169245, 79.657152],
    'Gondia': [21.448734, 80.1972],
    'Chandrapur': [19.951685, 79.295823],
    'Gadchiroli': [20.184794, 80.007887],
    
    # Amravati Division  
    'Amravati': [20.937346, 77.760249],
    'Akola': [20.710576, 77.00373],
    'Washim': [20.108935, 77.142117],
    'Buldhana': [20.532223, 76.181689],
    'Yavatmal': [20.3876, 78.131472]
}


@complaint_bp.route('/heatmap-data', methods=['GET'], endpoint='get_heatmap_data_endpoint')
def get_heatmap_data():
    try:
        # Group complaints by location (city/district)
        complaints = Complain.query.all()
        
        location_counts = {}
        for complaint in complaints:
            # Use location_name or try to extract city from address
            location = complaint.location_name # or complaint.address
            if location in MAHARASHTRA_DISTRICTS:
                coords = MAHARASHTRA_DISTRICTS[location]
                loc_key = f"{coords[0]},{coords[1]}"
                location_counts[loc_key] = location_counts.get(loc_key, 0) + 1
        
        heatmap_data = []
        for loc_key, count in location_counts.items():
            lat, lng = map(float, loc_key.split(','))
            
            # Manual intensity mapping
            if count >= 8:
                intensity = 0.9  # Red
            elif count >= 5:
                intensity = 0.7  # Yellow
            elif count >= 3:
                intensity = 0.5  # Lime
            elif count >= 2:
                intensity = 0.3  # Cyan
            else:
                intensity = 0.1  # Blue (for single complaints)
            
            heatmap_data.append([lat, lng, intensity])
            print(f"DEBUG: {loc_key} - Count: {count}, Intensity: {intensity}")  # Debug output
        
        return jsonify({"heatmapData": heatmap_data}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

# admin pages starting
# Create blueprint for admin routes
admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/admin/dashboard', methods=['GET'])
def admin_dashboard():
    # Get user from session/token (you'll need to implement proper auth)
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
        
    user = User.query.get(user_id)
    if not user or user.type != 'admin':
        return jsonify({"error": "Admin access required"}), 403
        
    # Add admin-specific data here
    return jsonify({"message": "Welcome to admin dashboard", "user": user.name}), 200


# admin reports pages routes
@complaint_bp.route('/admin/reports/<int:report_id>', methods=['PUT'])
def update_report(report_id):
    try:
        data = request.get_json()
        
        complaint = Complain.query.get(report_id)
        if not complaint:
            return jsonify({"error": "Report not found"}), 404
        
        # Update fields if they exist in the model
        if 'status' in data and hasattr(complaint, 'status'):
            complaint.status = data['status']
        if 'department' in data and hasattr(complaint, 'department'):
            complaint.department = data['department']
        if 'assigned_to' in data and hasattr(complaint, 'assigned_to'):
            complaint.assigned_to = data['assigned_to']
        
        db.session.commit()
        return jsonify({"message": "Report updated successfully"}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@complaint_bp.route('/admin/reports/<int:report_id>', methods=['DELETE'])
def delete_report(report_id):
    try:
        complaint = Complain.query.get(report_id)
        if not complaint:
            return jsonify({"error": "Report not found"}), 404
        
        # First delete related media files
        media_files = Media.query.filter_by(complain_id=report_id).all()
        for media in media_files:
            # Delete the actual file from storage
            try:
                file_path = os.path.join(UPLOAD_FOLDER, media.image)
                if os.path.exists(file_path):
                    os.remove(file_path)
            except:
                pass
            db.session.delete(media)
        
        # Then delete the complaint
        db.session.delete(complaint)
        db.session.commit()
        
        return jsonify({"message": "Report deleted successfully"}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
# Add this route for admin to get all reports
@complaint_bp.route('/admin/reports', methods=['GET'])
def get_all_reports():
    try:
        # Get all complaints
        complaints = Complain.query.order_by(Complain.date_created.desc()).all()
        
        reports_data = []
        for complaint in complaints:
            reports_data.append({
                'id': complaint.id,
                'title': complaint.title,
                'description': complaint.description,
                'location_name': complaint.location_name,
                'address': complaint.address,
                'pincode': complaint.pincode,
                'status': complaint.status,
                'department': complaint.department,
                'date_created': complaint.date_created.isoformat(),
                'user_id': complaint.user_id
            })
        
        return jsonify({"reports": reports_data}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500