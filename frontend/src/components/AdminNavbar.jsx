import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './AdminNavbar.css';

function AdminNavbar({ onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      // Fallback if onLogout prop isn't passed
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  return (
    <nav className="admin-nav">
      <h3 className="admin-site-title">Admin Panel</h3>
      <ul>
        <li>
          <Link 
            to="/admin-dashboard" 
            className={location.pathname === '/admin-dashboard' ? 'active' : ''}
          >
            Dashboard
          </Link>
        </li>
        <li>
          <Link 
            to="/admin-reports" 
            className={location.pathname === '/admin-reports' ? 'active' : ''}
          >
            Manage Reports
          </Link>
        </li>
        <li>
          <Link 
            to="/heatmap" 
            className={location.pathname === '/heatmap' ? 'active' : ''}
          >
            Heatmap
          </Link>
        </li>
        <li>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default AdminNavbar;