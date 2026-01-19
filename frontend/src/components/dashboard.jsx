import React, { useEffect, useState } from "react";
import { Container, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "./DashboardHeader";
import DashboardNavigation from "./DashboardNavigation";
import HomeView from "./HomeView";
import SubmitReportView from "./SubmitReportView";
import MyReportsView from "./MyReportsView";
import AnalyticsView from "./AnalyticsView";
import ErrorBoundary from "./ErrorBoundary";
import "./Dashboard.css";

const DashboardContent = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("home");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  // Auto-dismiss messages
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // FIXED: This useEffect now properly loads reports on initial render
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      navigate("/login");
    } else {
      setCurrentUser(user);
      // Load reports immediately when component mounts
      fetchReports();
    }
  }, [navigate]);

  const fetchReports = async () => {
    setLoading(true);
    setError("");
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const response = await fetch('http://localhost:5000/api/reports', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': user.id.toString()
        }
      });

      console.log("Fetch reports response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error response:", errorText);
        throw new Error(`Failed to fetch reports: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched all reports data:", data);
      setReports(data);
      
    } catch (error) {
      console.error("Error fetching reports:", error);
      setError("Failed to load reports. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyReports = async () => {
    setLoading(true);
    setError("");
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const response = await fetch('http://localhost:5000/api/my-reports', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': user.id.toString()
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch my reports: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched my reports data:", data);
      
      const reportsWithFixedImages = data.map(report => ({
        ...report,
        image_url: report.image_url 
          ? (report.image_url.startsWith('http') 
              ? report.image_url 
              : `http://localhost:5000${report.image_url}`)
          : null
      }));
      
      setReports(reportsWithFixedImages);
      
    } catch (error) {
      console.error("Error fetching my reports:", error);
      setError("Failed to load your reports. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewChange = (newView) => {
    setView(newView);
    if (newView === "home") {
      fetchReports();
    } else if (newView === "myReports") {
      fetchMyReports();
    }
  };

  // FIXED: Better loading state handling
  if (loading && view === "home" && reports.length === 0) {
    return (
      <Container fluid className="dashboard-container">
        <div className="text-center mt-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3">Loading dashboard...</p>
        </div>
      </Container>
    );
  }

  if (!currentUser) {
    return (
      <Container fluid className="dashboard-container">
        <div className="text-center mt-5">
          <Alert variant="warning">Not authorized. Redirecting to login...</Alert>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="dashboard-container">
      <DashboardHeader currentUser={currentUser} />
      <DashboardNavigation 
        currentView={view} 
        onViewChange={handleViewChange}
        navigate={navigate}
      />

      {/* Auto-dismissing Alerts */}
      {error && (
        <Alert variant="danger" className="alert-dismissible fade show" role="alert">
          <strong>Error:</strong> {error}
          <button type="button" className="btn-close" onClick={() => setError("")}></button>
        </Alert>
      )}
      {success && (
        <Alert variant="success" className="alert-dismissible fade show" role="alert">
          <strong>Success!</strong> {success}
          <button type="button" className="btn-close" onClick={() => setSuccess("")}></button>
        </Alert>
      )}

      {/* Main Content */}
      {view === "home" && (
        <HomeView 
          currentUser={currentUser}
          reports={reports}
          onNavigateToSubmit={() => handleViewChange("submit")}
        />
      )}

      {view === "submit" && (
        <SubmitReportView 
          onReportSubmitted={() => {
            setSuccess("Report submitted successfully!");
            handleViewChange("myReports");
          }}
          onError={setError}
        />
      )}

      {view === "myReports" && (
        <MyReportsView 
          reports={reports}
          loading={loading}
          onRefresh={fetchMyReports}
          onNavigateToSubmit={() => handleViewChange("submit")}
        />
      )}

      {view === "heatmap" && (
        <AnalyticsView 
          reports={reports}
          onError={setError}
        />
      )}
    </Container>
  );
};

// Main Dashboard Component with Error Boundary
const Dashboard = () => (
  <ErrorBoundary>
    <DashboardContent />
  </ErrorBoundary>
);

export default Dashboard;