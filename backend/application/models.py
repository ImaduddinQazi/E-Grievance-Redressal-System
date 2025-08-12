from .database import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(80), nullable=False)
    address = db.Column(db.String(200), nullable=False)
    pincode = db.Column(db.Integer(), nullable=False)
    type = db.Column(db.String(20), default='general')

class Complain(db.Model):
    __tablename__ = 'complain'
    id = db.Column(db.Integer, primary_key=True)
    location_name = db.Column(db.String(100), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    address = db.Column(db.String(200), nullable=False)
    pincode = db.Column(db.Integer(), nullable=False)
    description = db.Column(db.String(), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', name='fk_complain_user_id'), nullable=False)
    date_created=db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(1), default='Unresolved')  

class Media(db.Model):
    __tablename__ = 'media'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', name='fk_media_user_id'), nullable=False)
    image=db.Column(db.String(200), nullable=False)
    complain_id=db.Column(db.Integer, db.ForeignKey('complain.id', name='fk_media_complain_id'), nullable=False)
    
    
   
    user = db.relationship('User', backref='media')
    complain = db.relationship('Complain', backref='media')
