import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar({ onLogout }) {
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
    <nav className="nav">
      <h3 className="site-title">E-grievance Redressal System</h3>
      <ul>
        <li>
          <Link 
            to="/dashboard" 
            className={location.pathname === '/dashboard' ? 'active' : ''}
          >
            Home
          </Link>
        </li>
        <li>
          <Link 
            to="/submit-report" 
            className={location.pathname === '/submit-report' ? 'active' : ''}
          >
            Submit Report
          </Link>
        </li>
        <li>
          <Link 
            to="/my-reports" 
            className={location.pathname === '/my-reports' ? 'active' : ''}
          >
            My Reports
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

export default Navbar;