# 🏛️ E-Grievance Redressal System

A full-stack web application designed to digitize and streamline the grievance reporting and resolution process. This system bridges the gap between citizens and administrators by providing a transparent, efficient, and user-friendly platform for civic issue management.

---

## 📌 Table of Contents
- [Overview](#-overview)
- [Features](#-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [User Roles](#-user-roles)
- [Screenshots](#-screenshots)
- [Installation & Setup](#-installation--setup)
- [License](#-license)

---

## 📖 Overview

The **E-Grievance Redressal System** is a centralized digital platform that enables citizens to submit complaints related to civic issues and allows administrators to track, manage, and resolve them efficiently.

The system eliminates traditional paper-based processes and introduces:
- Real-time complaint tracking
- Community transparency
- Administrative analytics
- Geographic heatmap visualization

---

## ✨ Features

### 👤 Citizen Features
- User registration & login
- Submit grievances with images
- Track personal complaint status
- View all public complaints
- Interactive heatmap of complaint density

### 🛠️ Admin Features
- Secure admin login
- View & manage all complaints
- Update complaint status and departments
- Delete invalid or resolved complaints
- Analytics dashboard & heatmap insights

---

## 🏗️ System Architecture

The application follows a **three-tier architecture**:

1. **Frontend (Client Layer)**  
   - React.js SPA  
   - Handles UI, routing, and user interactions  

2. **Backend (Application Layer)**  
   - Flask REST API  
   - Authentication, business logic, role-based access  

3. **Database (Data Layer)**  
   - SQLite  
   - Stores users, complaints, and media metadata  

---

## 🧰 Tech Stack

### Frontend
- React.js
- React Router DOM
- Bootstrap

### Backend
- Python
- Flask
- Flask-SQLAlchemy
- Flask-JWT-Extended
- Flask-CORS
- Pillow (Image handling)

### Database
- SQLite3

### Tools
- VS Code
- Postman
- Git & GitHub

---

## 👥 User Roles

| Role | Capabilities |
|-----|-------------|
| **Citizen** | Submit complaints, upload images, track status |
| **Admin** | Manage complaints, update status, view analytics |

---

## 🖼️ Screenshots

- User Dashboard
- Submit Complaint Page
- Admin Reports Page
- Admin Analytics Dashboard
- Heatmap Visualization

---

## ⚙️ Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- Git

### Backend Setup
```bash
git clone https://github.com/ImaduddinQazi/E-Grievance-Redressal-System.git
cd backend
pip install -r requirements.txt
python app.py
```


## ⚙️ Frontend Setup

```bash
cd frontend
npm install
npm start
```

## 📜 License

This project is developed for academic purposes.
You are free to use, modify, and distribute it with proper attribution.
