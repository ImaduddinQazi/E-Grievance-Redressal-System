import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Alert, Badge, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./MyReports.css";
import { useNavigate } from "react-router-dom";

export default function MyReports() {
  const [currentUser, setCurrentUser] = useState(null);
  const [allComplaints, setAllComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("all"); // 'all' or 'my'
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      navigate("/login");
    } else {
      setCurrentUser(user);
      fetchAllComplaints();
    }
  }, [navigate]);

  // Fetch ALL complaints (for all users)
  const fetchAllComplaints = async () => {
    try {
      const response = await fetch('http://localhost:5000/all-complaints');
      const data = await response.json();

      if (response.ok) {
        setAllComplaints(data.complaints || []);
      } else {
        setError(data.error || "Failed to fetch complaints");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Filter complaints based on view mode
  useEffect(() => {
    if (viewMode === 'my' && currentUser) {
      // Show only current user's complaints
      const myComplaints = allComplaints.filter(complaint =>
        complaint.user_id === currentUser.id
      );
      setFilteredComplaints(myComplaints);
    } else {
      // Show all complaints
      setFilteredComplaints(allComplaints);
    }
  }, [allComplaints, viewMode, currentUser]);

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Solved': return 'success';
      case 'Completed': return 'success';
      case 'In Progress': return 'warning';
      case 'Pending': return 'secondary';
      default: return 'secondary';
    }
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <Container fluid className="myreports-container">
      <Row className="mb-4">
        <Col>
          <h2 className="myreports-title">Community Reports</h2>
          <p className="myreports-subtitle">View reports from the community or your own submissions</p>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}

      <div className="tab-style-buttons mb-4">
        <button
          className={`tab-button ${viewMode === 'all' ? 'active' : ''}`}
          onClick={() => setViewMode('all')}
        >
          All Reports
        </button>
        <button
          className={`tab-button ${viewMode === 'my' ? 'active' : ''}`}
          onClick={() => setViewMode('my')}
        >
          My Reports
        </button>
      </div>

      {loading ? (
        <div className="text-center">Loading reports...</div>
      ) : (
        <Row>
          <Col>
            {filteredComplaints.length === 0 ? (
              <Alert variant="info" className="text-center">
                <h5>No reports found!</h5>
                <p>
                  {viewMode === 'my'
                    ? "You haven't submitted any reports yet."
                    : "No community reports available yet."
                  }
                </p>
                {viewMode === 'my' && (
                  <Button variant="primary" onClick={() => navigate('/submit-report')}>
                    Submit Your First Report
                  </Button>
                )}
              </Alert>
            ) : (
              <Row>
                {filteredComplaints.map((complaint) => (
                  <Col key={complaint.id} md={6} lg={4} className="mb-4">
                    <Card className="complaint-card">
                      <Card.Body>
                        <Card.Title className="complaint-title">
                          {complaint.title}
                        </Card.Title>

                        {/* Show user name if viewing all reports */}
                        {viewMode === 'all' && complaint.user_name && (
                          <div className="complaint-user">
                            <strong>👤 Submitted by:</strong> {complaint.user_name}
                          </div>
                        )}

                        <div className="complaint-status">
                          <Badge bg={getStatusVariant(complaint.status)}>
                            {complaint.status}
                          </Badge>
                        </div>

                        <Card.Text className="complaint-description">
                          {complaint.description.length > 150
                            ? `${complaint.description.substring(0, 150)}...`
                            : complaint.description
                          }
                        </Card.Text>

                        <div className="complaint-details">
                          <div className="detail-item">
                            <strong>📍 Location:</strong> {complaint.location_name}
                          </div>
                          <div className="detail-item">
                            <strong>🏢 Department:</strong> {complaint.department || 'Not assigned'}
                          </div>
                          <div className="detail-item">
                            <strong>📅 Submitted:</strong> {new Date(complaint.date_created).toLocaleDateString()}
                          </div>
                          <div className="detail-item">
                            <strong>📌 Pincode:</strong> {complaint.pincode}
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Col>
        </Row>
      )}
    </Container>
  );
}