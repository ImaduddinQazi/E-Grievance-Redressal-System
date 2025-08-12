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
    app.debug = True
    app.config['SQLALCHEMY_DATABASE_URI'] = r"sqlite:///E:/e_greviance/E-Grievance-Redressal-System/backend/instance/complain.sqlite3"

    
    print("DB Path:", app.config['SQLALCHEMY_DATABASE_URI'])
    print("Exists?", os.path.exists(r"E:\e_greviance\E-Grievance-Redressal-System\backend\instance\complain.sqlite3"))
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    
    CORS(app)
    CORS(app, resources={
    r"/login": {
        "origins": "http://localhost:3000",
        "methods": ["POST"],
        "allow_headers": ["Content-Type"],
        "supports_credentials": True
    }
})  
    db.init_app(app)
    migrate = Migrate(app, db)

    
    from application.controllers import auth_bp
    app.register_blueprint(auth_bp)

    app.app_context().push()
    return app

app = create_app()

if __name__ == '__main__':
    app.run()
