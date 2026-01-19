import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/login";
import Register from "./components/register";
import Dashboard from "./components/dashboard";
import AdminDashboard from './components/AdminDashboard';
import HeatMapView from './components/HeatMap';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        {/* <Route path="/heatmap" element={<Dashboard><HeatMapView /></Dashboard>} /> */}
      </Routes>
    </Router>
  );
}

export default App;
