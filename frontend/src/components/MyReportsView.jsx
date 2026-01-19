import React, { useState } from "react";
import { Row, Col, Card, Button, Badge, Spinner } from "react-bootstrap";
import ReportDetailsModal from "./ReportDetailsModal";

const MyReportsView = ({ reports, loading, onRefresh, onNavigateToSubmit }) => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const getStatusBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved': return 'success';
      case 'in progress': return 'warning';
      case 'pending': return 'secondary';
      default: return 'secondary';
    }
  };

  const handleReportClick = (report) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  return (
    <>
      <Row className="mb-4">
        <Col>
          <h4>My Reports</h4>
          <p className="text-muted">Your submitted grievance reports</p>
          <Button variant="outline-primary" size="sm" onClick={onRefresh} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </Col>
      </Row>
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
          <p className="mt-2">Loading reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <h5>No reports submitted yet</h5>
            <p className="text-muted">Submit your first report to get started</p>
            <Button onClick={onNavigateToSubmit} variant="primary">
              Submit Report
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {reports.map((report) => (
            <Col md={6} lg={4} key={report.id} className="mb-3">
              <Card 
                className="report-card shadow-sm h-100" 
                style={{ cursor: 'pointer' }}
                onClick={() => handleReportClick(report)}
              >
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Card.Title className="h6 mb-0">{report.title}</Card.Title>
                    <Badge bg={getStatusBadgeVariant(report.status)}>
                      {report.status}
                    </Badge>
                  </div>
                  
                  <Card.Text className="small text-muted mb-2">
                    {report.description.length > 120 
                      ? `${report.description.substring(0, 120)}...` 
                      : report.description
                    }
                  </Card.Text>
                  
                  <div className="mt-auto">
                    <small className="text-muted d-block">Dept: {report.department}</small>
                    <small className="text-muted">Code: {report.code}</small>
                    {report.image_url && (
                      <div className="mt-2">
                        <img 
                          src={report.image_url} 
                          alt="Report" 
                          style={{ width: '100%', maxHeight: '150px', objectFit: 'cover', borderRadius: '5px' }}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/150?text=Image+Not+Found';
                          }}
                        />
                      </div>
                    )}
                    <small className="d-block mt-2 text-primary">
                      <em>Click to view full details</em>
                    </small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <ReportDetailsModal 
        show={showModal}
        report={selectedReport}
        onHide={() => setShowModal(false)}
      />
    </>
  );
};

export default MyReportsView;