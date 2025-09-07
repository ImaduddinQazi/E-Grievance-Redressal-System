import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Alert, ProgressBar } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  
  const userStats = {
  
    complaintsSubmitted: 12,
    complaintsResolved: 8,
    recentActivity: [
      { id: 1, title: "Pothole complaint", status: "In Progress", date: "2023-05-15" },
      { id: 2, title: "Garbage collection", status: "Resolved", date: "2023-05-10" },
    ],
  };
  useEffect(() => {
    
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      navigate("/login");
    } else {
      setCurrentUser(user);
    }
  }, [navigate]);

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  const resolutionRate = Math.round((userStats.complaintsResolved / userStats.complaintsSubmitted) * 100);

  return (
    <Container fluid className="dashboard-container">
      <Row className="mb-4">
        <Col>
          <h2 className="dashboard-title">Welcome back, {currentUser.name}!</h2>
          <p className="text-muted">Here's what's happening with your complaints</p>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="shadow-sm stats-card">
            <Card.Body>
              <Card.Title>Total Complaints</Card.Title>
              <h2>{userStats.complaintsSubmitted}</h2>
              <Card.Text>All time submissions</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm stats-card">
            <Card.Body>
              <Card.Title>Resolved</Card.Title>
              <h2>{userStats.complaintsResolved}</h2>
              <Card.Text>Successfully closed</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm stats-card">
            <Card.Body>
              <Card.Title>Resolution Rate</Card.Title>
              <ProgressBar
                now={resolutionRate}
                label={`${resolutionRate}%`}
                variant={resolutionRate > 70 ? "success" : resolutionRate > 40 ? "warning" : "danger"}
              />
              <Card.Text className="mt-2">Overall success</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity */}
      <Row>
        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Recent Activity</Card.Title>
              <div className="activity-list">
                {userStats.recentActivity.map((item) => (
                  <div key={item.id} className="activity-item">
                    <div>
                      <strong>{item.title}</strong>
                      <div className="text-muted small">{item.date}</div>
                    </div>
                    <span className={`status-badge ${item.status.toLowerCase().replace(" ", "-")}`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
              <Button variant="outline-primary" className="mt-3">
                View All Complaints
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Quick Actions */}
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Quick Actions</Card.Title>
              <Button variant="primary" className="w-100 mb-2">
                New Complaint
              </Button>
              <Button variant="outline-secondary" className="w-100 mb-2">
                Edit Profile
              </Button>
              <Button variant="outline-danger" className="w-100">
                Logout
              </Button>

              <Alert variant="info" className="mt-4">
                <strong>Tip:</strong> You have 2 pending actions on your complaints.
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}