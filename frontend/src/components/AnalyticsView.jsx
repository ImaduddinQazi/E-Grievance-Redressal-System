import React, { useState, useEffect } from "react";
import { Row, Col, Card, Form, Button, Badge } from "react-bootstrap";
import HeatMap from './HeatMap';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const AnalyticsView = ({ reports, onError }) => {
  const [heatmapData, setHeatmapData] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [heatmapFilter, setHeatmapFilter] = useState({
    department: '',
    status: ''
  });

  const fetchHeatmapData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      
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
      onError("Failed to load heatmap data");
    }
  };

  useEffect(() => {
    fetchHeatmapData();
  }, [heatmapFilter]);

  // Calculate stats for the cards
  const stats = heatmapData ? Object.values(heatmapData).reduce(
    (acc, dept) => ({
      total: acc.total + dept.total,
      resolved: acc.resolved + dept.resolved,
      in_progress: acc.in_progress + dept.in_progress,
      pending: acc.pending + dept.pending
    }),
    { total: 0, resolved: 0, in_progress: 0, pending: 0 }
  ) : { total: 0, resolved: 0, in_progress: 0, pending: 0 };

  return (
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
            
            {/* Real World Map - MOVED TO TOP */}
            <Row className="mb-4">
              <Col>
                <Card className="border-0 shadow-sm">
                  <Card.Header className="bg-white">
                    <h5 className="mb-0">🗺️ Geographical Heat Map</h5>
                  </Card.Header>
                  <Card.Body>
                    <HeatMap 
                      reports={reports} 
                      onLocationClick={setSelectedLocation}
                    />
                    {selectedLocation && (
                      <div className="mt-3">
                        <h6> {selectedLocation.location}</h6>
                        <p><strong>{selectedLocation.count}</strong> reports at this location</p>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Filters - MOVED BELOW HEATMAP */}
            <Row className="mb-4">
              <Col>
                <Card className="border-0 shadow-sm">
                  <Card.Header className="bg-white">
                    <h5 className="mb-0">🔍 Filter Analytics Data</h5>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={5}>
                        <Form.Group>
                          <Form.Label className="fw-bold"> Department</Form.Label>
                          <Form.Select 
                            value={heatmapFilter.department} 
                            onChange={(e) => {
                              setHeatmapFilter({ ...heatmapFilter, department: e.target.value });
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
                          }}
                          className="w-100"
                        >
                          Reset
                        </Button>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Stats Cards */}
            <Row className="mb-4">
              {['Total', 'Resolved', 'In Progress', 'Pending'].map((stat, index) => {
                const values = {
                  'Total': stats.total,
                  'Resolved': stats.resolved,
                  'In Progress': stats.in_progress,
                  'Pending': stats.pending
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
                        <h2 className="mb-1">{values[stat]}</h2>
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

            {/* Department Distribution */}
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
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default AnalyticsView;