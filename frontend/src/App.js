import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, useNavigate } from "react-router-dom";
import Login from "./components/login";
import Register from "./components/register";
import Dashboard from "./components/dashboard";
import AdminDashboard from "./components/AdminDashboard"; // Create this
import SubmitReport from "./components/SubmitReport";
import MyReports from "./components/MyReports";
import Heatmap from "./components/Heatmap";
import Navbar from "./components/Navbar";
import AdminNavbar from "./components/AdminNavbar"; // Create this
import AdminReports from "./components/AdminReports";
import "./App.css";

function AppContent() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Check if user is logged in on app load
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Define routes where navbar should NOT be shown
  const hideNavbarRoutes = ['/', '/login', '/register'];
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

  // Function to handle login
  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Function to handle logout
  // In your AppContent component, make sure you have:
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="App">
      {shouldShowNavbar && user && (
        user.type === 'admin' ?
          <AdminNavbar onLogout={handleLogout} /> :
          <Navbar onLogout={handleLogout} />
      )}
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={user ? <Dashboard user={user} /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin-dashboard"
          element={user && user.type === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/submit-report"
          element={user ? <SubmitReport user={user} /> : <Navigate to="/login" />}
        />
        <Route
          path="/my-reports"
          element={user ? <MyReports user={user} /> : <Navigate to="/login" />}
        />
        <Route
          path="/heatmap"
          element={user ? <Heatmap user={user} /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin-reports"
          element={user && user.type === 'admin' ? <AdminReports /> : <Navigate to="/login" />}
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;