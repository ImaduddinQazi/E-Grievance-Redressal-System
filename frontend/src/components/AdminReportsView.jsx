import React, { useState } from "react";
import { Row, Col, Card, Table, Button, Badge, InputGroup, Form } from "react-bootstrap";
import VerifyReportModal from "./VerifyReportModal";

const AdminReportsView = ({ 
  reports, 
  loading, 
  onRefresh, 
  onEditReport, 
  onDownloadPDF,
  onVerifyReport,
  searchTerm,
  onSearchChange 
}) => {
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const getStatusBadge = (status) => {
    const variants = {
      'Pending': 'secondary',
      'In Progress': 'warning',
      'Resolved': 'success',
      'Verified': 'info',
      'Forwarded': 'primary'
    };
    return <Badge className={`badge-${variants[status] || 'secondary'}`}>{status}</Badge>;
  };

  const handleVerifyClick = (report) => {
    setSelectedReport(report);
    setShowVerifyModal(true);
  };

  const handleVerify = async (reportId, verificationData) => {
    await onVerifyReport(reportId, verificationData);
    setShowVerifyModal(false);
  };

  const filteredReports = searchTerm 
    ? reports.filter(report => 
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (report.user?.name && report.user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        report.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (report.location && report.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (report.forwarded_to && report.forwarded_to.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : reports;

  return (
    <div className="main-content">
      <Row className="mb-4">
        <Col>
          <h2>Reports Management</h2>
          <p className="text-muted">Manage and monitor all user reports</p>
        </Col>
      </Row>

      {/* Search and Filters */}
      <div className="filters-section">
        <Row>
          <Col md={8}>
            <Form.Group>
              <Form.Label>Search Reports</Form.Label>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Search by title, code, user, department, status, or location..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
                {searchTerm && (
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => onSearchChange('')}
                  >
                    Clear
                  </Button>
                )}
              </InputGroup>
            </Form.Group>
          </Col>
          <Col md={4} className="d-flex align-items-end">
            <Button variant="outline-primary" onClick={onRefresh} className="w-100">
              Refresh Reports
            </Button>
          </Col>
        </Row>
      </div>

      {/* Reports Table */}
      <div className="data-table">
        <div className="table-header">
          <div className="d-flex justify-content-between align-items-center">
            <h5>
              All Reports ({filteredReports.length})
              {searchTerm && filteredReports.length !== reports.length && (
                <span className="text-muted" style={{fontSize: '0.8rem'}}>
                  {' '}(filtered from {reports.length} total)
                </span>
              )}
            </h5>
          </div>
        </div>
        
        <div className="card-body">
          {filteredReports.length === 0 ? (
            <div className="empty-state">
              <h5>
                {searchTerm ? 'No reports match your search' : 'No reports found'}
              </h5>
              <p className="text-muted">
                {searchTerm ? 'Try adjusting your search terms' : 'No reports have been submitted yet'}
              </p>
            </div>
          ) : (
            <div style={{ maxHeight: '600px', overflowY: 'auto' }} className="custom-scrollbar">
              <Table responsive>
                <thead>
                  <tr>
                    <th>Report ID</th>
                    <th>Title</th>
                    <th>Submitted By</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Location</th>
                    <th>Forwarded To</th>
                    <th>Date Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((report) => (
                    <tr key={report.id}>
                      <td>
                        <strong>{report.code}</strong>
                      </td>
                      <td>{report.title}</td>
                      <td>{report.user?.name || 'Unknown'}</td>
                      <td>
                        <Badge className="badge-info">{report.department}</Badge>
                      </td>
                      <td>{getStatusBadge(report.status)}</td>
                      <td>{report.location || 'Not specified'}</td>
                      <td>
                        {report.forwarded_to ? (
                          <Badge className="badge-primary">{report.forwarded_to}</Badge>
                        ) : (
                          <span className="text-muted">Not forwarded</span>
                        )}
                      </td>
                      <td>
                        {report.date_created 
                          ? new Date(report.date_created).toLocaleDateString() 
                          : 'N/A'
                        }
                      </td>
                      <td>
                        <div className="action-buttons">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => onEditReport(report)}
                            title="Edit Report"
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-success"
                            onClick={() => handleVerifyClick(report)}
                            title="Verify and Forward"
                            disabled={report.status === 'Forwarded' || report.status === 'Resolved'}
                          >
                            Verify
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-info"
                            onClick={() => onDownloadPDF(report)}
                            title="Download PDF Report"
                          >
                            PDF
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </div>
      </div>

      <VerifyReportModal
        show={showVerifyModal}
        report={selectedReport}
        onHide={() => setShowVerifyModal(false)}
        onVerify={handleVerify}
      />
    </div>
  );
};

export default AdminReportsView;