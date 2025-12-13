import React from "react";
import { Modal, Row, Col, Badge, Image } from "react-bootstrap";

const ReportDetailsModal = ({ show, report, onHide }) => {
  if (!report) return null;

  const getStatusBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved': return 'success';
      case 'in progress': return 'warning';
      case 'pending': return 'secondary';
      default: return 'secondary';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          Report Details: {report.code || `CMP-${report.id.toString().padStart(6, '0')}`}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="mb-3">
          <Col md={8}>
            <h5>{report.title}</h5>
            <p className="text-muted">{report.description}</p>
          </Col>
          <Col md={4} className="text-end">
            <Badge bg={getStatusBadgeVariant(report.status)} className="fs-6">
              {report.status || 'Pending'}
            </Badge>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <strong>Department:</strong>
            <br />
            <Badge bg="info" className="mt-1">{report.department}</Badge>
          </Col>
          <Col md={6}>
            <strong>Location:</strong>
            <br />
            <span className="text-muted">{report.location || 'Not specified'}</span>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <strong>Date Created:</strong>
            <br />
            <span className="text-muted">{formatDate(report.date_created)}</span>
          </Col>
          <Col md={6}>
            <strong>Report ID:</strong>
            <br />
            <span className="text-muted">{report.code || `CMP-${report.id.toString().padStart(6, '0')}`}</span>
          </Col>
        </Row>

        {report.user && (
          <Row className="mb-3">
            <Col>
              <strong>Submitted By:</strong>
              <br />
              <span className="text-muted">{report.user.name} ({report.user.email})</span>
            </Col>
          </Row>
        )}

        {report.image_url && (
          <Row className="mb-3">
            <Col>
              <strong>Attached Image:</strong>
              <br />
              <Image 
                src={report.image_url} 
                fluid 
                thumbnail 
                style={{ maxHeight: '300px', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                }}
              />
            </Col>
          </Row>
        )}

        {report.media_count > 0 && (
          <Row>
            <Col>
              <strong>Additional Media:</strong>
              <br />
              <span className="text-muted">{report.media_count} file(s) attached</span>
            </Col>
          </Row>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default ReportDetailsModal;