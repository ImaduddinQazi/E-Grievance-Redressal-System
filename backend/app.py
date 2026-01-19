from flask import Flask, send_from_directory
from flask_cors import CORS
from application.database import db
from werkzeug.security import generate_password_hash
from application.models import User, Complain
import os
from datetime import datetime

def create_app():
    app = Flask(__name__)
    app.secret_key = 'secret'
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    app.config['SESSION_COOKIE_SECURE'] = False 
    app.debug = True
    
    # Database configuration
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(BASE_DIR, "complain.db")}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Enhanced CORS configuration
    CORS(app, resources={
        r"/*": {
            "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
            "allow_headers": ["Content-Type", "X-User-ID", "Authorization", "Accept"],
            "expose_headers": ["Content-Type", "X-User-ID"],
            "supports_credentials": True,
            "max_age": 600
        }
    })
    
    # Initialize database
    db.init_app(app)
    
    # Create tables and default data within app context
    with app.app_context():
        try:
            # Drop all existing tables and recreate
            db.drop_all()
            db.create_all()
            
            print("✅ Database tables recreated successfully!")
            
            # Create default admin user
            admin_password = generate_password_hash('admin123', method='pbkdf2:sha256', salt_length=8)
            admin_user = User(
                name='System Administrator',
                email='admin@example.com',
                password=admin_password,
                address='System Headquarters',
                pincode='000000',
                type='admin'
            )
            
            # Create default test user
            test_password = generate_password_hash('user123', method='pbkdf2:sha256', salt_length=8)
            test_user = User(
                name='Test User',
                email='user@example.com',
                password=test_password,
                address='Test Address, Test City',
                pincode='560001',
                type='general'
            )
            
            db.session.add(admin_user)
            db.session.add(test_user)
            
            # Create a test report for verification testing
            test_report = Complain(
                title='Test Report for Verification',
                description='This is a test report to verify the forwarding functionality',
                location='Test Location',
                department='Road Maintenance',
                status='Pending',
                user_id=2,  # test user
                date_created=datetime.utcnow()
            )
            
            db.session.add(test_report)
            db.session.commit()
            
            print(" Default users and test report created successfully!")
            print(" Admin - Email: admin@example.com, Password: admin123")
            print(" User - Email: user@example.com, Password: user123")
            print(" Test Report ID: 1 (for verification testing)")
            
        except Exception as e:
            print(f" Error creating database: {e}")
            import traceback
            traceback.print_exc()
    
    # Register blueprints
    from application.controllers import auth_bp
    from application.controllers_reports import reports_bp
    from application.controllers_admin import admin_bp
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(reports_bp, url_prefix='/api') 
    app.register_blueprint(admin_bp, url_prefix='/api')
    
    # Create uploads directory
    os.makedirs('uploads', exist_ok=True)

    return app

app = create_app()

@app.route('/uploads/<filename>')
def serve_uploaded_file(filename):
    return send_from_directory('uploads', filename)

# Add a simple health check endpoint
@app.route('/health')
def health_check():
    return jsonify({"status": "healthy", "message": "Backend server is running"})

if __name__ == '__main__':
    print(" Starting Flask server on http://localhost:5000")
    print(" Make sure React app is running on http://localhost:3000")
    app.run(debug=True, host='0.0.0.0', port=5000)