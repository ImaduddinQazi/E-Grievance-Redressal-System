from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from .models import User
from .database import db
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
import logging
import traceback

# Create blueprint
auth_bp = Blueprint('auth', __name__)
logger = logging.getLogger(__name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        print("Registration endpoint called")
        
        data = request.get_json()
        print(f"Received data: {data}")

        if not data:
            return jsonify({"error": "No JSON data received"}), 400

        required_fields = ['name', 'email', 'password', 'address', 'pincode']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing field: {field}"}), 400

        # Check if user already exists
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            return jsonify({"error": "Email already registered"}), 400

        # Create new user WITH PASSWORD HASHING
        new_user = User(
            name=data['name'],
            email=data['email'],
            password=generate_password_hash(data['password']),  # ← FIXED THIS LINE
            address=data['address'],
            pincode=data['pincode'],
            type='general'
        )

        db.session.add(new_user)
        db.session.commit()
        print(f"User created successfully with ID: {new_user.id}")
        
        return jsonify({
            "message": "User registered successfully",
            "user": {
                "id": new_user.id,
                "name": new_user.name,
                "email": new_user.email
            }
        }), 201

    except Exception as e:
        print(f"Error in registration: {str(e)}")
        db.session.rollback()
        return jsonify({"error": "Internal server error"}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({"error": "Email and password required"}), 400

        user = User.query.filter_by(email=data['email']).first()
        
        if not user:
            print(f"User not found: {data['email']}")
            return jsonify({"error": "Invalid email or password"}), 401

        # Check password
        if not check_password_hash(user.password, data['password']):
            print(f"Invalid password for: {data['email']}")
            return jsonify({"error": "Invalid email or password"}), 401

        print(f"Login successful for: {data['email']}, Type: {user.type}")
        return jsonify({
            "message": "Login successful",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "type": user.type  # Include user type in response
            }
        }), 200

    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500