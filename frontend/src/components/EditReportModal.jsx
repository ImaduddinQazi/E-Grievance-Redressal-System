import React from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";

const EditReportModal = ({ show, report, onHide, onSave }) => {
  const [editedReport, setEditedReport] = React.useState(report);

  React.useEffect(() => {
    setEditedReport(report);
  }, [report]);

  const handleSave = () => {
    if (editedReport) {
      onSave(editedReport.id, {
        status: editedReport.status,
        department: editedReport.department,
        title: editedReport.title,
        description: editedReport.description
      });
    }
  };

  if (!report) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Edit Report: {report?.code}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={editedReport?.status || ''}
                  onChange={(e) => setEditedReport({
                    ...editedReport,
                    status: e.target.value
                  })}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Department</Form.Label>
                <Form.Select
                  value={editedReport?.department || ''}
                  onChange={(e) => setEditedReport({
                    ...editedReport,
                    department: e.target.value
                  })}
                >
                  <option value="Road Maintenance">Road Maintenance</option>
                  <option value="Sanitation">Sanitation</option>
                  <option value="Electricity">Electricity</option>
                  <option value="Water Supply">Water Supply</option>
                  <option value="Public Works">Public Works</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              value={editedReport?.title || ''}
              onChange={(e) => setEditedReport({
                ...editedReport,
                title: e.target.value
              })}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={editedReport?.description || ''}
              onChange={(e) => setEditedReport({
                ...editedReport,
                description: e.target.value
              })}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditReportModal;