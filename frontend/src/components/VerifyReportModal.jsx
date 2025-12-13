import React, { useState } from "react";
import { Modal, Form, Button, Row, Col, Alert } from "react-bootstrap";

const VerifyReportModal = ({ show, report, onHide, onVerify }) => {
  const [selectedAuthority, setSelectedAuthority] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const authorities = [
    { value: "municipal_corporation", label: "Municipal Corporation", category: "Local Government" },
    { value: "public_works_department", label: "Public Works Department (PWD)", category: "State Government" },
    { value: "electricity_board", label: "Electricity Board", category: "State Government" },
    { value: "water_supply_board", label: "Water Supply Board", category: "State Government" },
    { value: "urban_development", label: "Urban Development Authority", category: "State Government" },
    { value: "traffic_police", label: "Traffic Police Department", category: "Police" },
    { value: "environment_department", label: "Environment Department", category: "State Government" },
    { value: "health_department", label: "Health Department", category: "State Government" },
    { value: "education_department", label: "Education Department", category: "State Government" },
    { value: "revenue_department", label: "Revenue Department", category: "State Government" },
    { value: "forest_department", label: "Forest Department", category: "State Government" },
    { value: "transport_department", label: "Transport Department", category: "State Government" },
    { value: "central_ministry", label: "Central Ministry", category: "Central Government" },
    { value: "other", label: "Other Authority", category: "Other" }
  ];

  const groupedAuthorities = authorities.reduce((acc, authority) => {
    if (!acc[authority.category]) {
      acc[authority.category] = [];
    }
    acc[authority.category].push(authority);
    return acc;
  }, {});

  const handleVerify = async () => {
    if (!selectedAuthority) {
      setError("Please select an authority to forward this report");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onVerify(report.id, {
        authority: selectedAuthority,
        authority_name: authorities.find(a => a.value === selectedAuthority)?.label || selectedAuthority,
        notes: notes.trim(),
        verified_at: new Date().toISOString()
      });
      
      // Reset form
      setSelectedAuthority("");
      setNotes("");
      onHide();
    } catch (err) {
      setError("Failed to verify and forward report");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedAuthority("");
    setNotes("");
    setError("");
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Verify and Forward Report</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {report && (
          <>
            <Row className="mb-3">
              <Col>
                <h6>Report Details:</h6>
                <p className="mb-1"><strong>Title:</strong> {report.title}</p>
                <p className="mb-1"><strong>Department:</strong> {report.department}</p>
                <p className="mb-1"><strong>Current Status:</strong> {report.status}</p>
                <p className="mb-0"><strong>Report ID:</strong> {report.code}</p>
              </Col>
            </Row>

            <hr />

            {error && <Alert variant="danger">{error}</Alert>}

            <Form.Group className="mb-3">
              <Form.Label>
                <strong>Select Authority to Forward *</strong>
              </Form.Label>
              <Form.Select
                value={selectedAuthority}
                onChange={(e) => setSelectedAuthority(e.target.value)}
                required
              >
                <option value="">Choose an authority...</option>
                {Object.entries(groupedAuthorities).map(([category, auths]) => (
                  <optgroup key={category} label={category}>
                    {auths.map(auth => (
                      <option key={auth.value} value={auth.value}>
                        {auth.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                Select the appropriate authority to handle this report
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                <strong>Additional Notes (Optional)</strong>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Add any specific instructions or notes for the authority..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <Form.Text className="text-muted">
                These notes will be included when forwarding the report
              </Form.Text>
            </Form.Group>

            <div className="p-3 bg-light rounded">
              <h6>⚠️ Verification Action</h6>
              <p className="mb-2">
                <strong>This will:</strong>
              </p>
              <ul className="mb-0">
                <li>Mark the report as "Verified"</li>
                <li>Forward it to the selected authority</li>
                <li>Update the report status to "Forwarded"</li>
                <li>Notify the concerned department</li>
              </ul>
            </div>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          variant="success" 
          onClick={handleVerify}
          disabled={!selectedAuthority || loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Verifying...
            </>
          ) : (
            'Verify & Forward'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default VerifyReportModal;