from flask import Flask, send_from_directory
from flask import Flask
from flask_cors import CORS
from application.database import db
from flask_migrate import Migrate
import os
from application.controllers_reports import reports_bp
from flask_sqlalchemy import SQLAlchemy

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DB_PATH = os.path.join(BASE_DIR, 'complain.sqlite3')

app = None

def create_app():
    app = Flask(__name__)
    app.secret_key = 'secret'
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    app.config['SESSION_COOKIE_SECURE'] = False 
    app.debug = True
    # Create uploads directory
    
    # FIXED DATABASE PATH - Use relative path
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(BASE_DIR, "complain.db")}'
    
    # Create database directory if needed
    db_path = app.config['SQLALCHEMY_DATABASE_URI'].replace('sqlite:///', '')
    db_dir = os.path.dirname(db_path)
    if db_dir:
        os.makedirs(db_dir, exist_ok=True)
    
    print("DB Path:", app.config['SQLALCHEMY_DATABASE_URI'])
    print("Exists?", os.path.exists(db_path))
    
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    CORS(app)
    CORS(app, resources={
    r"/*": {  # ← Changed from r"/login" to r"/*" to allow all endpoints
        "origins": "http://localhost:3000",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "X-User-ID"],
        "supports_credentials": True
    }
}) 
    
    # Initialize database
    db.init_app(app)
    migrate = Migrate(app, db)
    
    # ▼▼▼ ADD THIS CODE TO CREATE TABLES ▼▼▼
    with app.app_context():
        try:
            # Import models to ensure they are registered with SQLAlchemy
            from application.models import User, Complain, Media
            # Create all tables
            db.create_all()
            print("✅ Database tables created successfully!")
            
            # Optional: Check if tables exist
            from sqlalchemy import inspect
            inspector = inspect(db.engine)
            tables = inspector.get_table_names()
            print("📊 Database tables:", tables)
            
        except Exception as e:
            print(f"❌ Error creating database tables: {e}")
    # ▲▲▲ END OF ADDED CODE ▲▲▲
    
    from application.controllers import auth_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(reports_bp, url_prefix='/api') 
    os.makedirs('uploads', exist_ok=True)


    app.app_context().push()
    return app
app = create_app()

if __name__ == '__main__':
    @app.route('/uploads/<filename>')
    def serve_uploaded_file(filename):
        return send_from_directory('uploads', filename)

# Make sure the uploads directory exists
    os.makedirs('uploads', exist_ok=True)
    print(f"✅ Uploads directory: {os.path.abspath('uploads')}")
    app.run()