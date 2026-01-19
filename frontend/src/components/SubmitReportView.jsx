import React, { useState } from "react";
import { Row, Col, Card, Form, Button, Badge, Spinner } from "react-bootstrap";

const SubmitReportView = ({ onReportSubmitted, onError }) => {
  const [newReport, setNewReport] = useState({ 
    title: "", 
    description: "", 
    department: "", 
    location: "",
    image: null 
  });
  const [submitting, setSubmitting] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        onError("File size must be less than 5MB");
        e.target.value = '';
        return;
      }
      
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp'];
      if (!validTypes.includes(file.type)) {
        onError("Please upload a valid image file (JPEG, PNG, GIF, BMP)");
        e.target.value = '';
        return;
      }
      
      setNewReport({ ...newReport, image: file });
      onError("");
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    onError("");

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.id) {
        throw new Error("User not authenticated");
      }

      const formData = new FormData();
      formData.append('title', newReport.title);
      formData.append('description', newReport.description);
      formData.append('department', newReport.department);
      formData.append('location', newReport.location || '');
      
      if (newReport.image) {
        formData.append('image', newReport.image);
      }

      const response = await fetch('http://localhost:5000/api/reports', {
        method: 'POST',
        headers: {
          'X-User-ID': user.id.toString()
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Server error: ${response.status}`);
      }

      const result = await response.json();
      setNewReport({ title: "", description: "", department: "", location: "", image: null });
      onReportSubmitted();
      
    } catch (error) {
      console.error("Error submitting report:", error);
      onError(error.message || "Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Row className="justify-content-center">
      <Col md={8}>
        <Card className="shadow-sm">
          <Card.Header>
            <h4 className="mb-0">Submit New Report</h4>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={handleSubmitReport}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Title *</Form.Label>
                    <Form.Control 
                      type="text" 
                      value={newReport.title} 
                      onChange={(e) => setNewReport({ ...newReport, title: e.target.value })} 
                      required 
                      placeholder="Enter report title"
                      disabled={submitting}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Department *</Form.Label>
                    <Form.Select 
                      value={newReport.department} 
                      onChange={(e) => setNewReport({ ...newReport, department: e.target.value })} 
                      required
                      disabled={submitting}
                    >
                      <option value="">Select Department</option>
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
                <Form.Label>Location</Form.Label>
                <Form.Control 
                  type="text" 
                  value={newReport.location} 
                  onChange={(e) => setNewReport({ ...newReport, location: e.target.value })} 
                  placeholder="Enter location (optional)"
                  disabled={submitting}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Description *</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={4} 
                  value={newReport.description} 
                  onChange={(e) => setNewReport({ ...newReport, description: e.target.value })} 
                  required 
                  placeholder="Describe the issue in detail..."
                  disabled={submitting}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Upload Image</Form.Label>
                <Form.Control 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={submitting}
                />
                <Form.Text className="text-muted">
                  Upload a clear photo of the issue (optional, max 5MB)
                </Form.Text>
                {newReport.image && (
                  <div className="mt-2">
                    <Badge bg="info">Selected: {newReport.image.name}</Badge>
                  </div>
                )}
              </Form.Group>
              
              <div className="d-grid gap-2">
                <Button 
                  type="submit" 
                  variant="primary" 
                  size="lg"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Report'
                  )}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default SubmitReportView;