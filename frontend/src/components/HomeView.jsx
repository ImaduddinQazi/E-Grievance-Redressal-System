import React, { useState } from "react";
import { Row, Col, Card, Button, Badge } from "react-bootstrap";
import ReportDetailsModal from "./ReportDetailsModal";

const HomeView = ({ currentUser, reports, onNavigateToSubmit }) => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const getStatusBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved': return 'success';
      case 'in progress': return 'warning';
      case 'pending': return 'secondary';
      case 'forwarded': return 'primary';
      default: return 'secondary';
    }
  };

  const handleReportClick = (report) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  return (
    <div className="main-content">
      <Row className="mb-4">
        <Col>
          <h3>Welcome, {currentUser.name}</h3>
          <p className="text-muted">Recent community reports and updates</p>
        </Col>
      </Row>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="number">{reports.length}</div>
          <div className="label">Total Reports</div>
        </div>
        <div className="stat-card">
          <div className="number">
            {reports.filter(r => r.status === 'Resolved').length}
          </div>
          <div className="label">Resolved</div>
        </div>
        <div className="stat-card">
          <div className="number">
            {reports.filter(r => r.status === 'In Progress').length}
          </div>
          <div className="label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="number">
            {reports.filter(r => r.department === 'Road Maintenance').length}
          </div>
          <div className="label">Road Issues</div>
        </div>
      </div>

      {/* Recent Reports */}
      <Row className="mb-4">
        <Col>
          <div className="data-table">
            <div className="table-header">
              <h5>Recent Community Reports</h5>
            </div>
            <div className="card-body">
              {reports.length === 0 ? (
                <div className="empty-state">
                  <h5>No reports yet</h5>
                  <p className="text-muted">Be the first to submit a report in your community</p>
                  <Button onClick={onNavigateToSubmit} variant="primary">
                    Submit First Report
                  </Button>
                </div>
              ) : (
                <Row>
                  {reports.slice(0, 3).map((report) => (
                    <Col md={4} key={report.id} className="mb-3">
                      <Card 
                        className="report-card" 
                        onClick={() => handleReportClick(report)}
                      >
                        {report.image_url && (
                          <Card.Img 
                            variant="top" 
                            src={report.image_url}
                            style={{ height: '160px', objectFit: 'cover' }} 
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/300x160?text=No+Image';
                            }}
                          />
                        )}
                        <Card.Body>
                          <Card.Title>{report.title}</Card.Title>
                          <Card.Text className="text-muted">
                            {report.description.length > 100 
                              ? `${report.description.substring(0, 100)}...` 
                              : report.description
                            }
                          </Card.Text>
                          <div className="mt-auto">
                            <Badge className={`badge-${getStatusBadgeVariant(report.status)}`}>
                              {report.status || 'Pending'}
                            </Badge>
                            <small className="text-muted d-block mt-2">
                              Department: {report.department}
                            </small>
                            <small className="text-muted">Code: {report.code}</small>
                            <small className="d-block mt-2 text-primary">
                              Click to view details
                            </small>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </div>
          </div>
        </Col>
      </Row>

      <ReportDetailsModal 
        show={showModal}
        report={selectedReport}
        onHide={() => setShowModal(false)}
      />
    </div>
  );
};

export default HomeView;