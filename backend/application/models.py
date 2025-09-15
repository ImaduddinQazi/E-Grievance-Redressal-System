from .database import db
from datetime import datetime
from sqlalchemy import Enum

class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(80), nullable=False)
    address = db.Column(db.String(200), nullable=False)
    pincode = db.Column(db.Integer(), nullable=False)
    type = db.Column(db.String(20), default='general')

class Complain(db.Model):
    __tablename__ = 'complain'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    location_name = db.Column(db.String(200), nullable=False)
    address = db.Column(db.String(300), nullable=False)
    pincode = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(50), default='Pending')
    department = db.Column(db.String(100), nullable=True)
    assigned_to = db.Column(db.String(100), nullable=True)
    date_created = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Relationship - use unique backref name
    user = db.relationship('User', backref=db.backref('user_complaints', lazy=True))
    # Remove the media relationship to avoid circular reference

class Media(db.Model):
    __tablename__ = 'media'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    image = db.Column(db.String(200), nullable=False)
    complain_id = db.Column(db.Integer, db.ForeignKey('complain.id'), nullable=False)
    date_created = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships with unique backref names
    user = db.relationship('User', backref=db.backref('user_media_files', lazy=True))
    complain = db.relationship('Complain', backref=db.backref('complain_media_files', lazy=True, cascade='all, delete-orphan'))