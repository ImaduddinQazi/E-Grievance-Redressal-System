import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Form, Navbar, Nav, Badge, Image, Alert, Spinner } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

// Error Boundary Component (should be defined outside main component)
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Dashboard error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container fluid className="dashboard-container">
          <Alert variant="danger">
            <h5>Something went wrong</h5>
            <p>Please refresh the page and try again.</p>
            <Button onClick={() => window.location.reload()} variant="outline-danger">
              Refresh Page
            </Button>
          </Alert>
        </Container>
      );
    }

    return this.props.children;
  }
}

const DashboardContent = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [newReport, setNewReport] = useState({ 
    title: "", 
    description: "", 
    department: "", 
    location: "",
    image: null 
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [view, setView] = useState("home");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const [heatmapData, setHeatmapData] = useState(null);
const [locationData, setLocationData] = useState([]);
const [heatmapFilter, setHeatmapFilter] = useState({
  department: '',
  status: ''
});
  

  // Auto-dismiss messages
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    navigate("/login");
  } else {
    setCurrentUser(user);
    
    // Fetch appropriate reports based on current view
    if (view === "home") {
      fetchReports(); // All reports for home page
    } else if (view === "myReports") {
      fetchMyReports(); // User's own reports for My Reports page
    } else if (view === "heatmap") {
      fetchHeatmapData();
    }
  }
}, [navigate, view]); // Added view as dependency

  const fetchReports = async () => {
  setLoading(true);
  setError("");
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    const response = await fetch('http://localhost:5000/api/reports', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-User-ID': user.id.toString()
      }
    });

    console.log("Fetch reports response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server error response:", errorText);
      throw new Error(`Failed to fetch reports: ${response.status}`);
    }

    const data = await response.json();
    console.log("Fetched all reports data:", data);
    
    setReports(data);
    
  } catch (error) {
    console.error("Error fetching reports:", error);
    setError("Failed to load reports. Please try again.");
  } finally {
    setLoading(false);
  }
};
const fetchMyReports = async () => {
  setLoading(true);
  setError("");
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    const response = await fetch('http://localhost:5000/api/my-reports', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-User-ID': user.id.toString()
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch my reports: ${response.status}`);
    }

    const data = await response.json();
    console.log("Fetched my reports data:", data);
    
    // Fix image URLs - ensure they have full server path
    const reportsWithFixedImages = data.map(report => ({
      ...report,
      image_url: report.image_url 
        ? (report.image_url.startsWith('http') 
            ? report.image_url 
            : `http://localhost:5000${report.image_url}`)
        : null
    }));
    
    setReports(reportsWithFixedImages);
    
  } catch (error) {
    console.error("Error fetching my reports:", error);
    setError("Failed to load your reports. Please try again.");
  } finally {
    setLoading(false);
  }
};

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        e.target.value = '';
        return;
      }
      
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp'];
      if (!validTypes.includes(file.type)) {
        setError("Please upload a valid image file (JPEG, PNG, GIF, BMP)");
        e.target.value = '';
        return;
      }
      
      setNewReport({ ...newReport, image: file });
      setError("");
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

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
      setSuccess(result.message || "Report submitted successfully!");
      setNewReport({ title: "", description: "", department: "", location: "", image: null });
      await fetchReports();
      setView("myReports");
      
    } catch (error) {
      console.error("Error submitting report:", error);
      setError(error.message || "Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved': return 'success';
      case 'in progress': return 'warning';
      case 'pending': return 'secondary';
      default: return 'secondary';
    }
  };
  const fetchHeatmapData = async () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    
    // Build query string with filters
    const params = new URLSearchParams();
    if (heatmapFilter.department) params.append('department', heatmapFilter.department);
    if (heatmapFilter.status) params.append('status', heatmapFilter.status);
    
    const queryString = params.toString();
    const url = queryString ? `http://localhost:5000/api/heatmap/data?${queryString}` : 'http://localhost:5000/api/heatmap/data';
    
    const response = await fetch(url, {
      headers: {
        'X-User-ID': user.id.toString()
      }
    });

    if (response.ok) {
      const data = await response.json();
      setHeatmapData(data);
    }
    
  } catch (error) {
    console.error("Error fetching heatmap data:", error);
  }
};
  

  if (loading && view === "home") {
    return (
      <Container fluid className="dashboard-container">
        <div className="text-center mt-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3">Loading dashboard...</p>
        </div>
      </Container>
    );
  }

  if (!currentUser) {
    return (
      <Container fluid className="dashboard-container">
        <div className="text-center mt-5">
          <Alert variant="warning">Not authorized. Redirecting to login...</Alert>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="dashboard-container">
      {/* Header Section */}
      <Row className="header-section mb-4">
        <Col>
          <h1 className="text-primary">E-Redressal System</h1>
          <p className="text-muted">Citizen Grievance Portal</p>
        </Col>
        <Col xs="auto">
          <div className="user-info text-end">
            <strong>{currentUser.name}</strong>
            <br />
            <small className="text-muted">Citizen</small>
          </div>
        </Col>
      </Row>

      {/* Navigation */}
      <Navbar bg="light" expand="lg" className="mb-4 shadow-sm">
        <Nav className="w-100 justify-content-between">
          <div className="d-flex">
            <Nav.Link onClick={() => {
  setView("home");
  fetchReports(); // Refresh with all reports
}} className={view === "home" ? "active-nav" : ""}>
  Home
</Nav.Link>
            <Nav.Link onClick={() => setView("submit")} className={view === "submit" ? "active-nav" : ""}>
              Submit Report
            </Nav.Link>
            <Nav.Link onClick={() => {
  setView("myReports"); 
  fetchMyReports(); // Refresh with user's reports only
}} className={view === "myReports" ? "active-nav" : ""}>
  My Reports
</Nav.Link>
            <Nav.Link onClick={() => {
  setView("heatmap");
  fetchHeatmapData();
}} className={view === "heatmap" ? "active-nav" : ""}>
  HeatMap
</Nav.Link>
          </div>
          <Button variant="outline-danger" size="sm" onClick={() => {
            localStorage.removeItem("user");
            navigate("/login");
          }}>
            Logout
          </Button>
        </Nav>
      </Navbar>

      {/* Auto-dismissing Alerts */}
      {error && (
        <Alert variant="danger" className="alert-dismissible fade show" role="alert">
          <strong>Error:</strong> {error}
          <button type="button" className="btn-close" onClick={() => setError("")}></button>
        </Alert>
      )}
      {success && (
        <Alert variant="success" className="alert-dismissible fade show" role="alert">
          <strong>Success!</strong> {success}
          <button type="button" className="btn-close" onClick={() => setSuccess("")}></button>
        </Alert>
      )}

      {/* Main Content */}
      {view === "home" && (
        <>
          <Row className="mb-4">
            <Col>
              <h3>Welcome, {currentUser.name}!</h3>
              <p className="text-muted">Recent community reports</p>
            </Col>
          </Row>
          {reports.length === 0 ? (
            <Card className="text-center py-5">
              <Card.Body>
                <h5>No reports yet</h5>
                <p className="text-muted">Be the first to submit a report!</p>
                <Button onClick={() => setView("submit")} variant="primary">
                  Submit First Report
                </Button>
              </Card.Body>
            </Card>
          ) : (
            <Row>
              {reports.slice(0, 3).map((report) => (
                <Col md={4} key={report.id} className="mb-3">
                  <Card className="report-card shadow-sm h-100">
                    {report.image_url && (
                      <Card.Img 
                        variant="top" 
                        src={report.image_url.startsWith('http') ? report.image_url : `http://localhost:5000${report.image_url}`}
                        style={{ height: '150px', objectFit: 'cover' }} 
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/150?text=Image+Not+Found';
                        }}
                      />
                    )}
                    <Card.Body className="d-flex flex-column">
                      <Card.Title className="h6">{report.title}</Card.Title>
                      <Card.Text className="flex-grow-1 small">{report.description}</Card.Text>
                      <div className="mt-auto">
                        <Badge bg={getStatusBadgeVariant(report.status)}>
                          {report.status || 'Pending'}
                        </Badge>
                        <small className="text-muted d-block mt-1">Dept: {report.department}</small>
                        <small className="text-muted">Code: {report.code}</small>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </>
      )}

      {view === "submit" && (
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
      )}

      {view === "myReports" && (
        <>
          <Row className="mb-4">
            <Col>
              <h4>My Reports</h4>
              <p className="text-muted">Your submitted grievance reports</p>
              <Button variant="outline-primary" size="sm" onClick={fetchReports} disabled={loading}>
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
                <Button onClick={() => setView("submit")} variant="primary">
                  Submit Report
                </Button>
              </Card.Body>
            </Card>
          ) : (
            <Row>
              {reports.map((report) => (
  <Col md={6} lg={4} key={report.id} className="mb-3">
    <Card className="report-card shadow-sm h-100">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <Card.Title className="h6 mb-0">{report.title}</Card.Title>
          <Badge bg={getStatusBadgeVariant(report.status)}>
            {report.status}
          </Badge>
        </div>
        
        {/* Show user info for all reports */}
        {view === "home" && report.user && (
          <div className="mb-2">
            <small className="text-muted">
              <strong>Submitted by:</strong> {report.user.name}
            </small>
          </div>
        )}
        
        <Card.Text className="small text-muted mb-2">
          {report.description}
        </Card.Text>
        
        {/* ... rest of your card content ... */}
      </Card.Body>
    </Card>
  </Col>
))}
            </Row>
          )}
        </>
      )}

      {view === "heatmap" && (
  <Row className="justify-content-center">
    <Col md={12}>
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0"> Analytics Dashboard</h4>
            <Badge bg="light" text="dark" pill>
               {new Date().toLocaleDateString()}
            </Badge>
          </div>
        </Card.Header>
        <Card.Body className="bg-light">
          
          {/* Filters */}
          <Row className="mb-4">
            <Col md={5}>
              <Form.Group>
                <Form.Label className="fw-bold"> Department</Form.Label>
                <Form.Select 
                  value={heatmapFilter.department} 
                  onChange={(e) => {
                    setHeatmapFilter({ ...heatmapFilter, department: e.target.value });
                    setTimeout(fetchHeatmapData, 100);
                  }}
                  className="border-primary"
                >
                  <option value="">All Departments</option>
                  <option value="Road Maintenance">🚧 Road Maintenance</option>
                  <option value="Sanitation"> Sanitation</option>
                  <option value="Electricity"> Electricity</option>
                  <option value="Water Supply"> Water Supply</option>
                  <option value="Public Works"> Public Works</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={5}>
              <Form.Group>
                <Form.Label className="fw-bold"> Status</Form.Label>
                <Form.Select 
                  value={heatmapFilter.status} 
                  onChange={(e) => {
                    setHeatmapFilter({ ...heatmapFilter, status: e.target.value });
                    setTimeout(fetchHeatmapData, 100);
                  }}
                  className="border-primary"
                >
                  <option value="">All Status</option>
                  <option value="Pending"> Pending</option>
                  <option value="In Progress"> In Progress</option>
                  <option value="Resolved"> Resolved</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2} className="d-flex align-items-end">
              <Button 
                variant="outline-primary" 
                onClick={() => {
                  setHeatmapFilter({ department: '', status: '' });
                  setTimeout(fetchHeatmapData, 100);
                }}
                className="w-100"
              >
                 Reset
              </Button>
            </Col>
          </Row>

          {/* Real-time Stats Cards */}
          <Row className="mb-4">
            {['Total', 'Resolved', 'In Progress', 'Pending'].map((stat, index) => {
              const stats = heatmapData ? Object.values(heatmapData).reduce(
                (acc, dept) => ({
                  total: acc.total + dept.total,
                  resolved: acc.resolved + dept.resolved,
                  in_progress: acc.in_progress + dept.in_progress,
                  pending: acc.pending + dept.pending
                }),
                { total: 0, resolved: 0, in_progress: 0, pending: 0 }
              ) : { total: 0, resolved: 0, in_progress: 0, pending: 0 };

              const values = {
                'Total': stats.total,
                'Resolved': stats.resolved,
                'In Progress': stats.in_progress,
                'Pending': stats.pending
              };

              const icons = {
                'Total': '',
                'Resolved': '',
                'In Progress': '',
                'Pending': ''
              };

              const colors = {
                'Total': 'linear-gradient(135deg, #102c45ff 0%)',
                'Resolved': 'linear-gradient(135deg, #115126ff 0%)',
                'In Progress': 'linear-gradient(135deg, #521124ff 0%)',
                'Pending': 'linear-gradient(135deg, #12534fff 0%)'
              };

              return (
                <Col md={3} key={stat} className="mb-3">
                  <Card className="text-center border-0 shadow-sm text-white" 
                        style={{ background: colors[stat] }}>
                    <Card.Body>
                      <h2 className="mb-1">{icons[stat]} {values[stat]}</h2>
                      <p className="mb-0">{stat}</p>
                      {stat !== 'Total' && (
                        <small>
                          {stats.total > 0 ? Math.round((values[stat] / stats.total) * 100) : 0}%
                        </small>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>

          {/* Pie Chart and Department Analysis */}
          <Row className="mb-4">
            <Col md={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-white">
                  <h5 className="mb-0"> Department Distribution</h5>
                </Card.Header>
                <Card.Body>
                  {heatmapData && Object.keys(heatmapData).length > 0 ? (
                    <Doughnut
                      data={{
                        labels: Object.keys(heatmapData),
                        datasets: [
                          {
                            data: Object.values(heatmapData).map(dept => dept.total),
                            backgroundColor: Object.values(heatmapData).map(dept => dept.color),
                            borderColor: '#ffffff',
                            borderWidth: 2,
                            hoverOffset: 15,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: {
                              padding: 20,
                              usePointStyle: true,
                            },
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                              }
                            }
                          }
                        },
                        cutout: '50%',
                      }}
                      style={{ height: '300px' }}
                    />
                  ) : (
                    <div className="text-center py-4">
                      <div className="text-muted">No data available</div>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-white">
                  <h5 className="mb-0"> Department Performance</h5>
                </Card.Header>
                <Card.Body>
                  {heatmapData && Object.keys(heatmapData).length > 0 ? (
                    <div style={{ height: '300px', overflowY: 'auto' }}>
                      {Object.entries(heatmapData).map(([dept, stats]) => {
                        const resolutionRate = stats.total > 0 
                          ? Math.round((stats.resolved / stats.total) * 100) 
                          : 0;
                        
                        return (
                          <div key={dept} className="mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <span className="fw-bold">{dept}</span>
                              <Badge bg="primary" pill>{stats.total}</Badge>
                            </div>
                            <div className="progress mb-1" style={{ height: '10px' }}>
                              <div 
                                className="progress-bar bg-success" 
                                style={{ width: `${(stats.resolved / stats.total) * 100}%` }}
                                title="Resolved"
                              ></div>
                              <div 
                                className="progress-bar bg-warning" 
                                style={{ width: `${(stats.in_progress / stats.total) * 100}%` }}
                                title="In Progress"
                              ></div>
                              <div 
                                className="progress-bar bg-secondary" 
                                style={{ width: `${(stats.pending / stats.total) * 100}%` }}
                                title="Pending"
                              ></div>
                            </div>
                            <div className="d-flex justify-content-between small text-muted">
                              <span> {stats.resolved}</span>
                              <span> {stats.in_progress}</span>
                              <span> {stats.pending}</span>
                              <span className="fw-bold"> {resolutionRate}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="text-muted">No data available</div>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Status Overview and Geographical Distribution */}
          <Row>
            <Col md={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-white">
                  <h5 className="mb-0"> Status Overview</h5>
                </Card.Header>
                <Card.Body>
                  {heatmapData && (
                    <Doughnut
                      data={{
                        labels: ['Resolved', 'In Progress', 'Pending'],
                        datasets: [
                          {
                            data: [
                              Object.values(heatmapData).reduce((sum, dept) => sum + dept.resolved, 0),
                              Object.values(heatmapData).reduce((sum, dept) => sum + dept.in_progress, 0),
                              Object.values(heatmapData).reduce((sum, dept) => sum + dept.pending, 0)
                            ],
                            backgroundColor: ['#43e97b', '#fee140', '#a8edea'],
                            borderColor: '#ffffff',
                            borderWidth: 2,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                          },
                        },
                        cutout: '50%',
                      }}
                      style={{ height: '250px' }}
                    />
                  )}
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-white">
                  <h5 className="mb-0"> Top Locations</h5>
                </Card.Header>
                <Card.Body>
                  {locationData && locationData.length > 0 ? (
                    <div style={{ height: '250px', overflowY: 'auto' }}>
                      {locationData.slice(0, 8).map((loc, index) => (
                        <div key={index} className="d-flex justify-content-between align-items-center border-bottom py-2">
                          <div className="flex-grow-1">
                            <div className="fw-bold">{loc.location}</div>
                            <div className="small text-muted">
                              <Badge bg="info" className="me-1">{loc.department}</Badge>
                              <Badge bg={loc.status === 'Resolved' ? 'success' : loc.status === 'In Progress' ? 'warning' : 'secondary'}>
                                {loc.status}
                              </Badge>
                            </div>
                          </div>
                          <Badge bg="primary" pill>{loc.count}</Badge>
                        </div>
                      ))}
                      {locationData.length > 8 && (
                        <div className="text-center mt-2">
                          <Badge bg="light" text="dark">
                            +{locationData.length - 8} more locations
                          </Badge>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="text-muted">No location data</div>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Col>
  </Row>
)}
    </Container>
  );
};


// Main Dashboard Component with Error Boundary
const Dashboard = () => (
  <ErrorBoundary>
    <DashboardContent />
  </ErrorBoundary>
);

export default Dashboard;