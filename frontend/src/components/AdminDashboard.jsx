import React, { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';

// Import components
import AdminHeader from "./AdminHeader";
import AdminReportsView from "./AdminReportsView";
import AdminHeatmapView from "./AdminHeatmapView";
import EditReportModal from "./EditReportModal";
import LoadingSpinner from "./LoadingSpinner";
import AdminAnalyticsView from "./AdminAnalyticsView";
import AlertMessage from "./AlertMessage";
import { downloadReportPDF } from "./PDFGenerator";

const AdminDashboard = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState("reports"); // "reports" or "heatmap"
  
  const [selectedLocation, setSelectedLocation] = useState(null);
  const navigate = useNavigate();

  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem('user'));

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };
  

  // Fetch all reports
  const fetchAllReports = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch('http://localhost:5000/api/admin/reports', {
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': user.id.toString()
        }
      });

      console.log("Admin fetch response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Admin fetch error:", errorText);
        throw new Error(`Failed to fetch reports: ${response.status}`);
      }

      const data = await response.json();
      console.log("Admin reports data:", data);
      setReports(data);
      
    } catch (error) {
      console.error("Error fetching admin reports:", error);
      setError('Failed to fetch reports. Please check console for details.');
    } finally {
      setLoading(false);
    }
  };

  // Update report
  const updateReport = async (reportId, updates) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`http://localhost:5000/api/admin/reports/${reportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': user.id.toString()
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        setSuccess('Report updated successfully');
        fetchAllReports();
        setShowModal(false);
      } else {
        setError('Failed to update report');
      }
    } catch (error) {
      setError('Failed to update report');
    }
  };

  // Handle PDF download
  const handleDownloadPDF = async (report) => {
    try {
      await downloadReportPDF(report);
    } catch (error) {
      setError('Failed to generate PDF report');
    }
  };

  // Handle navigation between views
  
   const handleNavigate = (newView) => {
    setView(newView);
    if (newView === "reports" || newView === "analytics") {
      fetchAllReports();
    }
  };

  // Handle edit report
  const handleEditReport = (report) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  // Handle search
  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  // useEffect for initial load
  useEffect(() => {
    if (!currentUser || currentUser.type !== 'admin') {
      navigate('/login');
      return;
    }
    fetchAllReports();
  }, [navigate, currentUser]);

  if (loading) {
    return <LoadingSpinner />;
  }
  // Add this new function for verification
const verifyReport = async (reportId, verificationData) => {
  try {
    console.log("🔍 Starting verification process...");
    console.log("Report ID:", reportId);
    console.log("Verification Data:", verificationData);

    const user = JSON.parse(localStorage.getItem('user'));
    const response = await fetch(`http://localhost:5000/api/admin/reports/${reportId}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-ID': user.id.toString()
      },
      body: JSON.stringify(verificationData)
    });

    console.log("Response status:", response.status);
    console.log("Response OK:", response.ok);

    if (response.ok) {
      const result = await response.json();
      console.log("✅ Verification successful:", result);
      setSuccess(`Report verified and forwarded to ${verificationData.authority_name}`);
      fetchAllReports(); // Refresh the reports list
      return result;
    } else {
      const errorText = await response.text();
      console.error(" Verification failed:", errorText);
      setError(`Failed to verify and forward report: ${errorText}`);
      throw new Error(errorText);
    }
  } catch (error) {
    console.error(" Verification error:", error);
    setError(`Failed to verify and forward report: ${error.message}`);
    throw error;
  }
};

  return (
    <Container fluid className="admin-dashboard">
      <AdminHeader 
        currentUser={currentUser}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
      />

      {/* Alert Messages */}
      <AlertMessage 
        variant="danger" 
        message={error} 
        onClose={() => setError('')} 
      />
      
      <AlertMessage 
        variant="success" 
        message={success} 
        onClose={() => setSuccess('')} 
      />

      {/* Main Content */}
      {view === "reports" ? (
        <AdminReportsView 
          reports={reports}
          loading={loading}
          onRefresh={fetchAllReports}
          onEditReport={handleEditReport}
          onDownloadPDF={handleDownloadPDF}
          onVerifyReport={verifyReport} // Pass the new function
          searchTerm={searchTerm}
          onSearchChange={handleSearch}
        />
      ) : view === "heatmap" ? (
        <AdminHeatmapView 
          reports={reports}
          selectedLocation={selectedLocation}
          onLocationClick={setSelectedLocation}
          onRefresh={fetchAllReports}
        />
      ) : (
        <AdminAnalyticsView 
          reports={reports}
        />
      )}

      {/* Edit Report Modal */}
      <EditReportModal 
        show={showModal}
        report={selectedReport}
        onHide={() => setShowModal(false)}
        onSave={updateReport}
      />
    </Container>
  );
};

export default AdminDashboard;