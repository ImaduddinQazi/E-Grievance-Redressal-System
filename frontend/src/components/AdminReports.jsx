import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Form, Modal, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './AdminReports.css';

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [editForm, setEditForm] = useState({
    status: '',
    department: '',
    assigned_to: ''
  });

  // Departments list
  const departments = [
    'Water Department',
    'Electricity Department',
    'Road Maintenance',
    'Sanitation',
    'Public Works',
    'Health Department',
    'Education',
    'Transport'
  ];

  // Status options
  const statusOptions = [
    'Pending',
    'In Progress',
    'Completed',
    'Rejected'
  ];

  // Fetch all reports
  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/admin/reports', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }
      
      const data = await response.json();
      setReports(data.reports);
      setFilteredReports(data.reports);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Filter reports based on filters and search
  useEffect(() => {
    let filtered = reports;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(report => report.status === filterStatus);
    }

    // Filter by department
    if (filterDepartment !== 'all') {
      filtered = filtered.filter(report => report.department === filterDepartment);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.location_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredReports(filtered);
  }, [reports, filterStatus, filterDepartment, searchTerm]);

  // Handle status change
  const handleStatusChange = async (reportId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/admin/reports/${reportId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      // Update local state
      setReports(reports.map(report =>
        report.id === reportId ? { ...report, status: newStatus } : report
      ));

      setSuccess('Status updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle department change
  const handleDepartmentChange = async (reportId, newDepartment) => {
    try {
      const response = await fetch(`http://localhost:5000/admin/reports/${reportId}/department`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ department: newDepartment })
      });

      if (!response.ok) {
        throw new Error('Failed to update department');
      }

      // Update local state
      setReports(reports.map(report =>
        report.id === reportId ? { ...report, department: newDepartment } : report
      ));

      setSuccess('Department updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle delete report
  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:5000/admin/reports/${selectedReport.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to delete report');
      }

      // Remove from local state
      setReports(reports.filter(report => report.id !== selectedReport.id));
      setShowDeleteModal(false);
      setSuccess('Report deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  // Open edit modal
  const openEditModal = (report) => {
    setSelectedReport(report);
    setEditForm({
      status: report.status,
      department: report.department,
      assigned_to: report.assigned_to || ''
    });
    setShowEditModal(true);
  };

  // Handle edit form submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/admin/reports/${selectedReport.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(editForm)
      });

      if (!response.ok) {
        throw new Error('Failed to update report');
      }

      // Update local state
      setReports(reports.map(report =>
        report.id === selectedReport.id ? { ...report, ...editForm } : report
      ));

      setShowEditModal(false);
      setSuccess('Report updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  // Get status badge color
  // const getStatusColor = (status) => {
  //   switch (status) {
  //     case 'Completed': return 'success';
  //     case 'In Progress': return 'warning';
  //     case 'Rejected': return 'danger';
  //     default: return 'secondary';
  //   }
  // };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="text-center">
          <div className="spinner-border loading-spinner" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading reports...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="admin-reports-container">
      <Row>
        <Col>
          <div className="reports-header d-flex justify-content-between align-items-center">
            <h1 className="h2 mb-0">Complaint Management</h1>
            <Badge bg="primary" className="fs-6">
              Total: {filteredReports.length} reports
            </Badge>
          </div>

          {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
          {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

          {/* Filters and Search */}
          <Card className="filter-card">
            <Card.Body>
              <Row>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      {statusOptions.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Department</Form.Label>
                    <Form.Select
                      value={filterDepartment}
                      onChange={(e) => setFilterDepartment(e.target.value)}
                    >
                      <option value="all">All Departments</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Search</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Search by title, description, or location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Reports Table */}
          <Card className="reports-table-card">
            <Card.Body>
              <div className="table-responsive">
                <Table striped hover className="reports-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Title</th>
                      <th>Location</th>
                      <th>Department</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.map((report) => (
                      <tr key={report.id}>
                        <td>#{report.id}</td>
                        <td>
                          <div>
                            <strong>{report.title}</strong>
                            <br />
                            <small className="text-muted">
                              {report.description.length > 50 
                                ? `${report.description.substring(0, 50)}...` 
                                : report.description}
                            </small>
                          </div>
                        </td>
                        <td>{report.location_name}</td>
                        <td>
                          <Form.Select
                            size="sm"
                            value={report.department || ''}
                            onChange={(e) => handleDepartmentChange(report.id, e.target.value)}
                          >
                            <option value="">Select Department</option>
                            {departments.map(dept => (
                              <option key={dept} value={dept}>{dept}</option>
                            ))}
                          </Form.Select>
                        </td>
                        <td>
                          <Form.Select
                            size="sm"
                            value={report.status}
                            onChange={(e) => handleStatusChange(report.id, e.target.value)}
                          >
                            {statusOptions.map(status => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </Form.Select>
                        </td>
                        <td>
                          {new Date(report.date_created).toLocaleDateString()}
                          <br />
                          <small className="text-muted">
                            {new Date(report.date_created).toLocaleTimeString()}
                          </small>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <Button
                              size="sm"
                              variant="outline-primary"
                              className="action-btn btn-edit"
                              onClick={() => openEditModal(report)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              className="action-btn btn-delete"
                              onClick={() => {
                                setSelectedReport(report);
                                setShowDeleteModal(true);
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {filteredReports.length === 0 && (
                <div className="empty-state">
                  <p>No reports found matching your criteria</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} className="admin-modal">
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete report "{selectedReport?.title}"?
          This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete Report
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg" className="admin-modal">
        <Modal.Header closeButton>
          <Modal.Title>Edit Report #{selectedReport?.id}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Department</Form.Label>
                  <Form.Select
                    value={editForm.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Assigned To</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter assigned personnel"
                value={editForm.assigned_to}
                onChange={(e) => setEditForm({ ...editForm, assigned_to: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default AdminReports;