import React from 'react';
import './AdminDashboard.css';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


const AdminDashboard = ({ user }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect regular users to user dashboard
    if (user && user.type === 'general') {
      navigate('/dashboard');
    }
  }, [user, navigate])
  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome to the E-Grievance Redressal System Administration Panel</p>
      </div>

      <div className="admin-content">
        <section className="about-section">
          <h2>About the Project</h2>
          <p>
            The E-Grievance Redressal System is a comprehensive platform designed to streamline 
            the process of reporting and resolving public grievances. Our system enables citizens 
            to easily submit complaints, track their status, and receive timely updates while 
            providing administrators with powerful tools to manage and analyze issues efficiently.
          </p>
        </section>

        <section className="features-section">
          <h2>System Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>📝 Complaint Management</h3>
              <p>View, categorize, and manage all submitted grievances with easy filtering options</p>
            </div>
            <div className="feature-card">
              <h3>🗺️ Heatmap Analytics</h3>
              <p>Visualize complaint distribution across regions with interactive heatmaps</p>
            </div>
            <div className="feature-card">
              <h3>👥 User Management</h3>
              <p>Manage user accounts, permissions, and access levels</p>
            </div>
            <div className="feature-card">
              <h3>📊 Reporting Tools</h3>
              <p>Generate detailed reports and analytics on complaint resolution</p>
            </div>
          </div>
        </section>

        <section className="how-to-use">
          <h2>How to Use the Admin Panel</h2>
          <div className="steps">
            <div className="step">
              <h3>1. Monitor Complaints</h3>
              <p>Regularly check the complaints dashboard for new submissions and prioritize urgent issues</p>
            </div>
            <div className="step">
              <h3>2. Assign Departments</h3>
              <p>Categorize complaints and assign them to appropriate departments for resolution</p>
            </div>
            <div className="step">
              <h3>3. Track Progress</h3>
              <p>Monitor the status of each complaint and ensure timely resolution</p>
            </div>
            <div className="step">
              <h3>4. Generate Reports</h3>
              <p>Use analytics tools to identify patterns and improve service delivery</p>
            </div>
          </div>
        </section>

        <section className="stats-section">
          <h2>Quick Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Complaints</h3>
              <p className="stat-number">1,247</p>
              <p className="stat-desc">Overall submissions</p>
            </div>
            <div className="stat-card">
              <h3>Pending Resolution</h3>
              <p className="stat-number">89</p>
              <p className="stat-desc">Awaiting action</p>
            </div>
            <div className="stat-card">
              <h3>Resolved Issues</h3>
              <p className="stat-number">958</p>
              <p className="stat-desc">Successfully closed</p>
            </div>
            <div className="stat-card">
              <h3>Active Users</h3>
              <p className="stat-number">524</p>
              <p className="stat-desc">Registered citizens</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;