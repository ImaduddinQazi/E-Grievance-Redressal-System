from flask import Flask
from flask_cors import CORS
from application.database import db
from flask_migrate import Migrate
import os
from flask_sqlalchemy import SQLAlchemy

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DB_PATH = os.path.join(BASE_DIR, 'complain.sqlite3')





app = None

def create_app():
    app = Flask(__name__)
    app.secret_key = 'secret'
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    app.config['SESSION_COOKIE_SECURE'] = False
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
    app.debug = True
    app.config['SQLALCHEMY_DATABASE_URI'] = r"sqlite:///D:/E-Grievance-Redressal-System/backend/instance/complain.sqlite3"

    
    print("DB Path:", app.config['SQLALCHEMY_DATABASE_URI'])
    print("Exists?", os.path.exists(r"D:\E-Grievance-Redressal-System\backend\instance\complain.sqlite3"))
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    
    CORS(app, origins="http://localhost:3000", supports_credentials=True)


    db.init_app(app)
    migrate = Migrate(app, db)

    
    from application.controllers import auth_bp
    app.register_blueprint(auth_bp)

    from application.controllers import complaint_bp  # Import both blueprints
    app.register_blueprint(complaint_bp)

    from application.controllers import admin_bp  # Add this import
    app.register_blueprint(admin_bp)  # Add this line after other blueprint registrations

    # from application.controllers import admin_bp
    # app.register_blueprint(admin_bp)



    app.app_context().push()
    
    with app.app_context():
        # THIS IS THE CRITICAL LINE THAT CREATES THE DATABASE
        db.create_all()
        
    return app

app = create_app()

if __name__ == '__main__':
    app.run()
