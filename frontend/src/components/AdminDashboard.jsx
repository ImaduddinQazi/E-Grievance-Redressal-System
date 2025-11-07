import React, { useState, useEffect } from "react";
import { 
  Container, Row, Col, Card, Table, Button, Badge, 
  Form, Modal, Alert, Navbar, Nav, InputGroup 
} from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import HeatMap from './HeatMap';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState("reports"); 
  const [analyticsData, setAnalyticsData] = useState(null);
  const navigate = useNavigate();

  // Calculate analytics data
  useEffect(() => {
    if (reports.length > 0) {
      const analytics = calculateAnalytics(reports);
      setAnalyticsData(analytics);
    }
  }, [reports]);

  const calculateAnalytics = (reportsData) => {
    // Department-wise statistics
    const departmentStats = {};
    const statusCounts = { 'Pending': 0, 'In Progress': 0, 'Resolved': 0 };
    const monthlyTrends = {};
    const locationStats = {};
    
    let totalResolved = 0;
    let totalInProgress = 0;
    let totalPending = 0;

    reportsData.forEach(report => {
      // Department statistics
      if (!departmentStats[report.department]) {
        departmentStats[report.department] = {
          total: 0,
          resolved: 0,
          in_progress: 0,
          pending: 0,
          color: getRandomColor()
        };
      }
      departmentStats[report.department].total++;
      
      // Status counts
      statusCounts[report.status]++;
      
      // Update department status counts
      if (report.status === 'Resolved') {
        departmentStats[report.department].resolved++;
        totalResolved++;
      } else if (report.status === 'In Progress') {
        departmentStats[report.department].in_progress++;
        totalInProgress++;
      } else {
        departmentStats[report.department].pending++;
        totalPending++;
      }

      // Monthly trends
      const month = new Date(report.date_created).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (!monthlyTrends[month]) {
        monthlyTrends[month] = 0;
      }
      monthlyTrends[month]++;

      // Location statistics
      if (report.location) {
        if (!locationStats[report.location]) {
          locationStats[report.location] = 0;
        }
        locationStats[report.location]++;
      }
    });

    // Calculate resolution rates
    Object.keys(departmentStats).forEach(dept => {
      const stats = departmentStats[dept];
      stats.resolutionRate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;
    });

    // Sort departments by total reports
    const sortedDepartments = Object.entries(departmentStats)
      .sort(([,a], [,b]) => b.total - a.total);

    // Top locations
    const topLocations = Object.entries(locationStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    return {
      departmentStats,
      statusCounts,
      monthlyTrends,
      locationStats: topLocations,
      totals: {
        total: reportsData.length,
        resolved: totalResolved,
        in_progress: totalInProgress,
        pending: totalPending,
        resolutionRate: Math.round((totalResolved / reportsData.length) * 100) || 0
      },
      sortedDepartments
    };
  };

  const getRandomColor = () => {
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', 
      '#FF9F40', '#FF6384', '#C9CBCF', '#7CFFB2', '#F770FF'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Chart data configurations
  const departmentChartData = {
    labels: analyticsData ? Object.keys(analyticsData.departmentStats) : [],
    datasets: [
      {
        data: analyticsData ? Object.values(analyticsData.departmentStats).map(dept => dept.total) : [],
        backgroundColor: analyticsData ? Object.values(analyticsData.departmentStats).map(dept => dept.color) : [],
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const statusChartData = {
    labels: ['Resolved', 'In Progress', 'Pending'],
    datasets: [
      {
        data: analyticsData ? [
          analyticsData.totals.resolved,
          analyticsData.totals.in_progress,
          analyticsData.totals.pending
        ] : [0, 0, 0],
        backgroundColor: ['#43e97b', '#fee140', '#a8edea'],
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const trendChartData = {
    labels: analyticsData ? Object.keys(analyticsData.monthlyTrends) : [],
    datasets: [
      {
        label: 'Reports per Month',
        data: analyticsData ? Object.values(analyticsData.monthlyTrends) : [],
        borderColor: '#36A2EB',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const departmentPerformanceData = {
    labels: analyticsData ? analyticsData.sortedDepartments.map(([dept]) => dept) : [],
    datasets: [
      {
        label: 'Resolution Rate (%)',
        data: analyticsData ? analyticsData.sortedDepartments.map(([, stats]) => stats.resolutionRate) : [],
        backgroundColor: '#4BC0C0',
        borderColor: '#4BC0C0',
        borderWidth: 1,
      },
      {
        label: 'Total Reports',
        data: analyticsData ? analyticsData.sortedDepartments.map(([, stats]) => stats.total) : [],
        backgroundColor: '#FF6384',
        borderColor: '#FF6384',
        borderWidth: 1,
        type: 'line',
        tension: 0.4,
        fill: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const fetchAllReports = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch('http://localhost:5000/api/admin/reports', {
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': user.id.toString()
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch reports: ${response.status}`);
      }

      const data = await response.json();
      setReports(data);
      setFilteredReports(data);
      
    } catch (error) {
      console.error("Error fetching admin reports:", error);
      setError('Failed to fetch reports. Please check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const updateReport = async (reportId, updates) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`http://localhost:5000/api/admin/reports/${reportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': user.id.toString()
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        setSuccess('Report updated successfully');
        fetchAllReports();
        setShowModal(false);
      } else {
        setError('Failed to update report');
      }
    } catch (error) {
      setError('Failed to update report');
    }
  };

  const downloadReportPDF = async (report) => {
    try {
      const pdfContent = `
        <html>
          <head>
            <title>Report: ${report.code}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; }
              .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
              .section { margin-bottom: 20px; }
              .label { font-weight: bold; color: #555; }
              .value { margin-bottom: 10px; }
              .footer { margin-top: 50px; text-align: center; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>E-Redressal System Report</h1>
              <h2>${report.code}</h2>
            </div>
            
            <div class="section">
              <div class="label">Report Details:</div>
              <div class="value"><strong>Title:</strong> ${report.title}</div>
              <div class="value"><strong>Description:</strong> ${report.description}</div>
              <div class="value"><strong>Department:</strong> ${report.department}</div>
              <div class="value"><strong>Status:</strong> ${report.status}</div>
              <div class="value"><strong>Location:</strong> ${report.location || 'N/A'}</div>
              <div class="value"><strong>Date Created:</strong> ${new Date(report.date_created).toLocaleDateString()}</div>
            </div>

            <div class="section">
              <div class="label">User Information:</div>
              <div class="value"><strong>Name:</strong> ${report.user?.name || 'Unknown'}</div>
              <div class="value"><strong>Email:</strong> ${report.user?.email || 'N/A'}</div>
            </div>

            ${report.image_url ? `
            <div class="section">
              <div class="label">Attached Image:</div>
              <div class="value">
                <img src="${report.image_url}" style="max-width: 300px; border: 1px solid #ddd; padding: 5px;" />
              </div>
            </div>
            ` : ''}

            <div class="footer">
              <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
              <p>E-Redressal System - Admin Dashboard</p>
            </div>
          </body>
        </html>
      `;

      const printWindow = window.open('', '_blank');
      printWindow.document.write(pdfContent);
      printWindow.document.close();
      
      printWindow.onload = function() {
        printWindow.print();
      };

    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF report');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'Pending': 'secondary',
      'In Progress': 'warning',
      'Resolved': 'success'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setFilteredReports(reports);
      return;
    }
    
    const filtered = reports.filter(report => 
      report.title.toLowerCase().includes(term.toLowerCase()) ||
      report.code.toLowerCase().includes(term.toLowerCase()) ||
      (report.user?.name && report.user.name.toLowerCase().includes(term.toLowerCase())) ||
      report.department.toLowerCase().includes(term.toLowerCase()) ||
      report.status.toLowerCase().includes(term.toLowerCase()) ||
      (report.location && report.location.toLowerCase().includes(term.toLowerCase()))
    );
    
    setFilteredReports(filtered);
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.type !== 'admin') {
      navigate('/login');
      return;
    }
    fetchAllReports();
  }, [navigate]);

  if (loading && view === "reports") {
    return (
      <Container fluid className="admin-dashboard">
        <div className="text-center mt-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading admin dashboard...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="admin-dashboard">
      {/* Navigation Bar */}
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Navbar.Brand> Admin Dashboard</Navbar.Brand>
        <Navbar.Toggle aria-controls="admin-navbar" />
        <Navbar.Collapse id="admin-navbar">
          <Nav className="me-auto">
            <Nav.Link 
              onClick={() => setView("reports")} 
              className={view === "reports" ? "active fw-bold" : ""}
            >
               Reports
            </Nav.Link>
            <Nav.Link 
              onClick={() => setView("analytics")} 
              className={view === "analytics" ? "active fw-bold" : ""}
            >
               Analytics
            </Nav.Link>
            <Nav.Link 
              onClick={() => setView("heatmap")} 
              className={view === "heatmap" ? "active fw-bold" : ""}
            >
              Heat Map
            </Nav.Link>
          </Nav>
          <Nav>
            <Navbar.Text className="me-3">
              Signed in as: <strong>{JSON.parse(localStorage.getItem('user'))?.name}</strong>
            </Navbar.Text>
            <Button variant="outline-light" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      {/* Dashboard Content */}
      <Row className="mb-4">
        <Col>
          <h2>
            {view === "reports" ? " Reports Management" : 
             view === "analytics" ? " Analytics Dashboard" : " Geographical Heat Map"}
          </h2>
          <p className="text-muted">
            {view === "reports" ? "Manage all user reports and system operations" : 
             view === "analytics" ? "Comprehensive analytics and insights" : 
             "Visualize report distribution across locations"}
          </p>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {view === "reports" ? (
        /* Reports Management View */
        <>
          <Row className="mb-3">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <i className="bi bi-search"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search reports by title, code, user, department, status, or location..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                {searchTerm && (
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => handleSearch('')}
                  >
                    Clear
                  </Button>
                )}
              </InputGroup>
            </Col>
            <Col md={6} className="d-flex justify-content-end">
              <Button variant="outline-primary" onClick={fetchAllReports}>
                Refresh Reports
              </Button>
            </Col>
          </Row>

          <Row>
            <Col>
              <Card className="shadow-sm">
                <Card.Header>
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0"> 
                      All Reports ({filteredReports.length})
                      {searchTerm && filteredReports.length !== reports.length && (
                        <span className="text-muted" style={{fontSize: '0.8rem'}}>
                          {' '}(filtered from {reports.length} total)
                        </span>
                      )}
                    </h5>
                  </div>
                </Card.Header>
                <Card.Body>
                  {filteredReports.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-muted">
                        {searchTerm ? 'No reports match your search' : 'No reports found'}
                      </p>
                    </div>
                  ) : (
                    <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                      <Table striped hover responsive>
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Title</th>
                            <th>User</th>
                            <th>Department</th>
                            <th>Status</th>
                            <th>Location</th>
                            <th>Date</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredReports.map((report) => (
                            <tr key={report.id}>
                              <td>{report.code}</td>
                              <td>{report.title}</td>
                              <td>{report.user?.name || 'Unknown'}</td>
                              <td>
                                <Badge bg="info">{report.department}</Badge>
                              </td>
                              <td>{getStatusBadge(report.status)}</td>
                              <td>{report.location || 'N/A'}</td>
                              <td>
                                {report.date_created 
                                  ? new Date(report.date_created).toLocaleDateString() 
                                  : 'N/A'
                                }
                              </td>
                              
                              <td>
                                <Button
                                  size="sm"
                                  variant="outline-primary"
                                  onClick={() => {
                                    setSelectedReport(report);
                                    setShowModal(true);
                                  }}
                                  className="me-2"
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline-success"
                                  onClick={() => downloadReportPDF(report)}
                                  title="Download PDF Report"
                                >
                                  PDF
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Edit Modal */}
          <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
            <Modal.Header closeButton>
              <Modal.Title>Edit Report: {selectedReport?.code}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {selectedReport && (
                <Form>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Status</Form.Label>
                        <Form.Select
                          value={selectedReport.status || ''}
                          onChange={(e) => setSelectedReport({
                            ...selectedReport,
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
                          value={selectedReport.department || ''}
                          onChange={(e) => setSelectedReport({
                            ...selectedReport,
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
                      value={selectedReport.title || ''}
                      onChange={(e) => setSelectedReport({
                        ...selectedReport,
                        title: e.target.value
                      })}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={selectedReport.description || ''}
                      onChange={(e) => setSelectedReport({
                        ...selectedReport,
                        description: e.target.value
                      })}
                    />
                  </Form.Group>
                </Form>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => {
                if (selectedReport) {
                  updateReport(selectedReport.id, {
                    status: selectedReport.status,
                    department: selectedReport.department,
                    title: selectedReport.title,
                    description: selectedReport.description
                  });
                }
              }}>
                Save Changes
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      ) : view === "analytics" ? (
        /* Analytics View */
        <>
          {/* Key Metrics */}
          <Row className="mb-4">
            <Col md={3}>
              <Card className="border-0 shadow-sm text-center">
                <Card.Body>
                  <div className="text-primary mb-2">
                    <i className="bi bi-file-text" style={{fontSize: '2rem'}}></i>
                  </div>
                  <h3 className="text-primary">{analyticsData?.totals.total || 0}</h3>
                  <p className="text-muted mb-0">Total Reports</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-0 shadow-sm text-center">
                <Card.Body>
                  <div className="text-success mb-2">
                    <i className="bi bi-check-circle" style={{fontSize: '2rem'}}></i>
                  </div>
                  <h3 className="text-success">{analyticsData?.totals.resolved || 0}</h3>
                  <p className="text-muted mb-0">Resolved</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-0 shadow-sm text-center">
                <Card.Body>
                  <div className="text-warning mb-2">
                    <i className="bi bi-clock" style={{fontSize: '2rem'}}></i>
                  </div>
                  <h3 className="text-warning">{analyticsData?.totals.in_progress || 0}</h3>
                  <p className="text-muted mb-0">In Progress</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-0 shadow-sm text-center">
                <Card.Body>
                  <div className="text-info mb-2">
                    <i className="bi bi-graph-up" style={{fontSize: '2rem'}}></i>
                  </div>
                  <h3 className="text-info">{analyticsData?.totals.resolutionRate || 0}%</h3>
                  <p className="text-muted mb-0">Resolution Rate</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Charts Row 1 */}
          <Row className="mb-4">
            <Col md={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Department Distribution</h5>
                </Card.Header>
                <Card.Body>
                  <Doughnut 
                    data={departmentChartData} 
                    options={chartOptions}
                    style={{ height: '300px' }}
                  />
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Status Overview</h5>
                </Card.Header>
                <Card.Body>
                  <Doughnut 
                    data={statusChartData} 
                    options={chartOptions}
                    style={{ height: '300px' }}
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Charts Row 2 */}
          <Row className="mb-4">
            <Col md={8}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Monthly Trends</h5>
                </Card.Header>
                <Card.Body>
                  <Line 
                    data={trendChartData} 
                    options={chartOptions}
                    style={{ height: '300px' }}
                  />
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Top Locations</h5>
                </Card.Header>
                <Card.Body>
                  <div style={{ height: '300px', overflowY: 'auto' }}>
                    {analyticsData?.locationStats.map(([location, count], index) => (
                      <div key={location} className="d-flex justify-content-between align-items-center mb-2 p-2 border-bottom">
                        <span className="text-truncate" title={location}>
                          {index + 1}. {location}
                        </span>
                        <Badge bg="primary">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Department Performance */}
          <Row>
            <Col>
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Department Performance</h5>
                </Card.Header>
                <Card.Body>
                  <Bar 
                    data={departmentPerformanceData} 
                    options={{
                      ...chartOptions,
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 100
                        }
                      }
                    }}
                    style={{ height: '400px' }}
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      ) : (
        /* Heatmap View */
        <Row>
          <Col>
            <Card className="shadow-sm">
              <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Geographical Heat Map</h5>
                  <Button variant="outline-primary" size="sm" onClick={fetchAllReports}>
                    Refresh Data
                  </Button>
                </div>
              </Card.Header>
              <Card.Body>
                <HeatMap 
                  reports={reports} 
                  onLocationClick={setSelectedReport}
                />
                {selectedReport && (
                  <div className="mt-3 p-3 bg-light rounded">
                    <h6> {selectedReport.location}</h6>
                    <p><strong>{selectedReport.count}</strong> reports at this location</p>
                    <p><strong>Departments:</strong> {Array.from(selectedReport.departments).join(', ')}</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default AdminDashboard;