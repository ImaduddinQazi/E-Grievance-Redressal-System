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
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

class Media(db.Model):
    __tablename__ = 'media'
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(200), nullable=False)
    file_path = db.Column(db.String(300), nullable=False)
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    complain_id = db.Column(db.Integer, db.ForeignKey('complain.id'), nullable=False)