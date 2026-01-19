from .database import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    address = db.Column(db.String(200), nullable=False)
    pincode = db.Column(db.String(20), nullable=False)
    type = db.Column(db.String(20), default='general')
    
    # Simple relationship without multiple foreign keys
    complaints = db.relationship('Complain', backref='user', lazy=True)

class Complain(db.Model):
    __tablename__ = 'complain'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    location = db.Column(db.String(200))
    department = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(20), default='Pending')
    date_created = db.Column(db.DateTime, default=datetime.utcnow)
    image_url = db.Column(db.String(200))
    
    # Foreign key for the user who created the complaint
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Add these new fields for verification
    is_verified = db.Column(db.Boolean, default=False)
    verified_at = db.Column(db.DateTime)
    verified_by = db.Column(db.Integer)  # Store admin user ID without foreign key for now
    forwarded_to = db.Column(db.String(200))  # Authority it was forwarded to
    verification_notes = db.Column(db.Text)   # Additional notes

class Media(db.Model):
    __tablename__ = 'media'
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(200), nullable=False)
    file_path = db.Column(db.String(300), nullable=False)
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    complain_id = db.Column(db.Integer, db.ForeignKey('complain.id'), nullable=False)