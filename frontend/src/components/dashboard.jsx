import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = ({ user }) => {
  const navigate = useNavigate();

  return (
    <Container fluid className="dashboard-container">
      {/* Hero Section */}
      <Row className="dashboard-hero">
        <Col>
          <div className="hero-content">
            <h1 className="hero-title">Welcome to E-Grievance Redressal System</h1>
            <p className="hero-subtitle">Hello, {user?.name}! Report issues, track resolutions, and make your community better.</p>
            <Button 
              variant="primary" 
              size="lg" 
              onClick={() => navigate('/submit-report')}
              className="hero-btn"
            >
              Report an Issue
            </Button>
          </div>
        </Col>
      </Row>

      

      {/* Quick Actions Section */}
      <Row className="quick-actions-section">
        <Col>
          <h2 className="section-title">Quick Actions</h2>
          <Row>
            <Col md={4} className="action-col">
              <Card className="action-card" onClick={() => navigate('/submit-report')}>
                <Card.Body>
                  <div className="action-icon">➕</div>
                  <Card.Title>Submit New Report</Card.Title>
                  <Card.Text>Report a new issue in your area</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="action-col">
              <Card className="action-card" onClick={() => navigate('/my-reports')}>
                <Card.Body>
                  <div className="action-icon">📋</div>
                  <Card.Title>View My Reports</Card.Title>
                  <Card.Text>Check status of your submissions</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="action-col">
              <Card className="action-card" onClick={() => navigate('/heatmap')}>
                <Card.Body>
                  <div className="action-icon">🗺️</div>
                  <Card.Title>View Heatmap</Card.Title>
                  <Card.Text>See issues across your city</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* About Project Section */}
      <Row className="about-section">
        <Col md={10} className="mx-auto">
          <Card className="about-card">
            <Card.Body>
              <h2 className="section-title">About E-Grievance Redressal System</h2>
              <div className="about-content">
                <p>
                  Our platform is designed to empower citizens like you to report and track 
                  community issues efficiently. Whether it's road damage, water problems, 
                  electricity issues, or sanitation concerns, we provide a seamless way to 
                  get your voice heard by the relevant authorities.
                </p>
                <p>
                  The system automatically categorizes your reports and forwards them to the 
                  appropriate departments, ensuring quick response times and effective 
                  resolution of problems in your neighborhood.
                </p>
                <div className="features-list">
                  <h4>Key Features:</h4>
                  <ul>
                    <li>Easy issue reporting with photo uploads</li>
                    <li>Real-time status tracking</li>
                    <li>Interactive heatmap visualization</li>
                    <li>Direct communication with departments</li>
                    <li>Transparent resolution process</li>
                  </ul>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity Section */}
      <Row className="recent-activity-section">
        <Col>
          <h2 className="section-title">Recent Community Activity</h2>
          <Row>
            <Col md={6}>
              <Card className="activity-card">
                <Card.Body>
                  <Card.Title>🚧 Road Repair</Card.Title>
                  <Card.Text>Main Street potholes fixed within 48 hours</Card.Text>
                  <small className="text-muted">Completed yesterday</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="activity-card">
                <Card.Body>
                  <Card.Title>💧 Water Supply</Card.Title>
                  <Card.Text>Water logging issue in Sector 5 being addressed</Card.Text>
                  <small className="text-muted">In progress - 2 days ago</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;