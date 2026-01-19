import React, { useState, useEffect } from "react";
import { Row, Col, Card, Form, Button, Badge, Table } from "react-bootstrap";
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title
);

const AdminAnalyticsView = ({ reports }) => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [timeRange, setTimeRange] = useState('all'); // all, week, month, year
  const [departmentFilter, setDepartmentFilter] = useState('all');

  // Process analytics data
  useEffect(() => {
    if (reports.length > 0) {
      processAnalyticsData();
    }
  }, [reports, timeRange, departmentFilter]);

  const processAnalyticsData = () => {
    // Filter reports based on time range and department
    let filteredReports = [...reports];
    
    // Apply time filter
    const now = new Date();
    if (timeRange === 'week') {
      const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));
      filteredReports = filteredReports.filter(report => 
        new Date(report.date_created) >= oneWeekAgo
      );
    } else if (timeRange === 'month') {
      const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
      filteredReports = filteredReports.filter(report => 
        new Date(report.date_created) >= oneMonthAgo
      );
    } else if (timeRange === 'year') {
      const oneYearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
      filteredReports = filteredReports.filter(report => 
        new Date(report.date_created) >= oneYearAgo
      );
    }
    
    // Apply department filter
    if (departmentFilter !== 'all') {
      filteredReports = filteredReports.filter(report => 
        report.department === departmentFilter
      );
    }

    // Calculate analytics
    const departmentStats = {};
    const statusStats = { Pending: 0, 'In Progress': 0, Resolved: 0 };
    const monthlyTrends = {};
    const resolutionTimeData = [];
    const userActivity = {};

    filteredReports.forEach(report => {
      // Department statistics
      if (!departmentStats[report.department]) {
        departmentStats[report.department] = {
          total: 0,
          resolved: 0,
          inProgress: 0,
          pending: 0
        };
      }
      departmentStats[report.department].total++;
      
      // Status statistics
      statusStats[report.status] = (statusStats[report.status] || 0) + 1;
      
      // Update department status counts
      if (report.status === 'Resolved') {
        departmentStats[report.department].resolved++;
      } else if (report.status === 'In Progress') {
        departmentStats[report.department].inProgress++;
      } else {
        departmentStats[report.department].pending++;
      }

      // Monthly trends
      const month = new Date(report.date_created).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
      monthlyTrends[month] = (monthlyTrends[month] || 0) + 1;

      // User activity
      if (report.user) {
        userActivity[report.user.id] = userActivity[report.user.id] || {
          name: report.user.name,
          count: 0
        };
        userActivity[report.user.id].count++;
      }
    });

    // Calculate resolution rates
    const departmentResolutionRates = {};
    Object.keys(departmentStats).forEach(dept => {
      const stats = departmentStats[dept];
      departmentResolutionRates[dept] = stats.total > 0 
        ? Math.round((stats.resolved / stats.total) * 100) 
        : 0;
    });

    setAnalyticsData({
      totalReports: filteredReports.length,
      departmentStats,
      statusStats,
      monthlyTrends,
      departmentResolutionRates,
      userActivity: Object.values(userActivity).sort((a, b) => b.count - a.count).slice(0, 10),
      filteredReports
    });
  };

  // Chart data generators
  const getDepartmentDistributionData = () => {
    if (!analyticsData) return null;
    
    const departments = Object.keys(analyticsData.departmentStats);
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
    
    return {
      labels: departments,
      datasets: [
        {
          data: departments.map(dept => analyticsData.departmentStats[dept].total),
          backgroundColor: departments.map((_, index) => colors[index % colors.length]),
          borderColor: '#ffffff',
          borderWidth: 2,
        },
      ],
    };
  };

  const getStatusDistributionData = () => {
    if (!analyticsData) return null;
    
    return {
      labels: Object.keys(analyticsData.statusStats),
      datasets: [
        {
          data: Object.values(analyticsData.statusStats),
          backgroundColor: ['#6C757D', '#FFC107', '#198754'],
          borderColor: '#ffffff',
          borderWidth: 2,
        },
      ],
    };
  };

  const getMonthlyTrendData = () => {
    if (!analyticsData) return null;
    
    const months = Object.keys(analyticsData.monthlyTrends);
    const counts = Object.values(analyticsData.monthlyTrends);
    
    return {
      labels: months,
      datasets: [
        {
          label: 'Reports per Month',
          data: counts,
          borderColor: '#4ECDC4',
          backgroundColor: 'rgba(78, 205, 196, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
      ],
    };
  };

  const getDepartmentPerformanceData = () => {
    if (!analyticsData) return null;
    
    const departments = Object.keys(analyticsData.departmentStats);
    
    return {
      labels: departments,
      datasets: [
        {
          label: 'Resolved',
          data: departments.map(dept => analyticsData.departmentStats[dept].resolved),
          backgroundColor: '#198754',
        },
        {
          label: 'In Progress',
          data: departments.map(dept => analyticsData.departmentStats[dept].inProgress),
          backgroundColor: '#FFC107',
        },
        {
          label: 'Pending',
          data: departments.map(dept => analyticsData.departmentStats[dept].pending),
          backgroundColor: '#6C757D',
        },
      ],
    };
  };

  const getTopDepartmentsData = () => {
    if (!analyticsData) return null;
    
    const departments = Object.entries(analyticsData.departmentStats)
      .sort(([,a], [,b]) => b.total - a.total)
      .slice(0, 5);
    
    return {
      labels: departments.map(([dept]) => dept),
      datasets: [
        {
          label: 'Total Reports',
          data: departments.map(([,stats]) => stats.total),
          backgroundColor: '#45B7D1',
        },
      ],
    };
  };

  if (!analyticsData) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading analytics...</span>
        </div>
        <p className="mt-3">Processing analytics data...</p>
      </div>
    );
  }

  return (
    <>
      <Row className="mb-4">
        <Col>
          <h2>Analytics Dashboard</h2>
          <p className="text-muted">Comprehensive analysis and insights</p>
        </Col>
      </Row>

      {/* Filters */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0"> Analytics Filters</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="fw-bold">Time Range</Form.Label>
                    <Form.Select 
                      value={timeRange} 
                      onChange={(e) => setTimeRange(e.target.value)}
                    >
                      <option value="all">All Time</option>
                      <option value="week">Last 7 Days</option>
                      <option value="month">Last 30 Days</option>
                      <option value="year">Last Year</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="fw-bold">Department</Form.Label>
                    <Form.Select 
                      value={departmentFilter} 
                      onChange={(e) => setDepartmentFilter(e.target.value)}
                    >
                      <option value="all">All Departments</option>
                      {Object.keys(analyticsData.departmentStats).map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4} className="d-flex align-items-end">
                  <Button 
                    variant="outline-primary" 
                    onClick={() => {
                      setTimeRange('all');
                      setDepartmentFilter('all');
                    }}
                    className="w-100"
                  >
                    Reset Filters
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Key Metrics */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm text-white bg-primary">
            <Card.Body>
              <h2 className="mb-1">{analyticsData.totalReports}</h2>
              <p className="mb-0">Total Reports</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm text-white bg-success">
            <Card.Body>
              <h2 className="mb-1">{analyticsData.statusStats.Resolved || 0}</h2>
              <p className="mb-0">Resolved</p>
              <small>
                {analyticsData.totalReports > 0 
                  ? Math.round(((analyticsData.statusStats.Resolved || 0) / analyticsData.totalReports) * 100) 
                  : 0}%
              </small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm text-white bg-warning">
            <Card.Body>
              <h2 className="mb-1">{analyticsData.statusStats['In Progress'] || 0}</h2>
              <p className="mb-0">In Progress</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm text-white bg-secondary">
            <Card.Body>
              <h2 className="mb-1">{analyticsData.statusStats.Pending || 0}</h2>
              <p className="mb-0">Pending</p>
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
              {getDepartmentDistributionData() && (
                <Doughnut
                  data={getDepartmentDistributionData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                    },
                  }}
                  style={{ height: '300px' }}
                />
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Status Overview</h5>
            </Card.Header>
            <Card.Body>
              {getStatusDistributionData() && (
                <Doughnut
                  data={getStatusDistributionData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                    },
                  }}
                  style={{ height: '300px' }}
                />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts Row 2 */}
      <Row className="mb-4">
        <Col md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white">
              <h5 className="mb-0"> Monthly Trends</h5>
            </Card.Header>
            <Card.Body>
              {getMonthlyTrendData() && (
                <Line
                  data={getMonthlyTrendData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                  style={{ height: '300px' }}
                />
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white">
              <h5 className="mb-0"> Top Departments</h5>
            </Card.Header>
            <Card.Body>
              {getTopDepartmentsData() && (
                <Bar
                  data={getTopDepartmentsData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                  style={{ height: '300px' }}
                />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts Row 3 */}
      <Row className="mb-4">
        <Col md={12}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white">
              <h5 className="mb-0"> Department Performance</h5>
            </Card.Header>
            <Card.Body>
              {getDepartmentPerformanceData() && (
                <Bar
                  data={getDepartmentPerformanceData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                    },
                    scales: {
                      x: {
                        stacked: true,
                      },
                      y: {
                        stacked: true,
                        beginAtZero: true,
                      },
                    },
                  }}
                  style={{ height: '400px' }}
                />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Data Tables */}
      <Row>
        <Col md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white">
              <h5 className="mb-0"> Department Performance</h5>
            </Card.Header>
            <Card.Body>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <Table striped hover responsive>
                  <thead>
                    <tr>
                      <th>Department</th>
                      <th>Total</th>
                      <th>Resolved</th>
                      <th>In Progress</th>
                      <th>Pending</th>
                      <th>Resolution Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(analyticsData.departmentStats)
                      .sort(([,a], [,b]) => b.total - a.total)
                      .map(([dept, stats]) => (
                        <tr key={dept}>
                          <td>
                            <strong>{dept}</strong>
                          </td>
                          <td>
                            <Badge bg="primary">{stats.total}</Badge>
                          </td>
                          <td>
                            <Badge bg="success">{stats.resolved}</Badge>
                          </td>
                          <td>
                            <Badge bg="warning">{stats.inProgress}</Badge>
                          </td>
                          <td>
                            <Badge bg="secondary">{stats.pending}</Badge>
                          </td>
                          <td>
                            <Badge bg={
                              analyticsData.departmentResolutionRates[dept] >= 80 ? 'success' :
                              analyticsData.departmentResolutionRates[dept] >= 60 ? 'warning' : 'danger'
                            }>
                              {analyticsData.departmentResolutionRates[dept]}%
                            </Badge>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white">
              <h5 className="mb-0">👥 Top Contributors</h5>
            </Card.Header>
            <Card.Body>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <Table striped hover responsive>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Reports Submitted</th>
                      <th>Contribution %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.userActivity.map((user, index) => (
                      <tr key={index}>
                        <td>
                          <strong>{user.name}</strong>
                        </td>
                        <td>
                          <Badge bg="info">{user.count}</Badge>
                        </td>
                        <td>
                          <Badge bg="primary">
                            {Math.round((user.count / analyticsData.totalReports) * 100)}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                    {analyticsData.userActivity.length === 0 && (
                      <tr>
                        <td colSpan="3" className="text-center text-muted">
                          No user data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default AdminAnalyticsView;