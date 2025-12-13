import React from "react";
import { Row, Col, Card, Button } from "react-bootstrap";
import HeatMap from './HeatMap';

const AdminHeatmapView = ({ reports, selectedLocation, onLocationClick, onRefresh }) => {
  return (
    <>
      <Row className="mb-4">
        <Col>
          <h2>Geographical Heat Map</h2>
          <p className="text-muted">Visualize report distribution across locations</p>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Geographical Heat Map</h5>
                <Button variant="outline-primary" size="sm" onClick={onRefresh}>
                  Refresh Data
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <HeatMap 
                reports={reports} 
                onLocationClick={onLocationClick}
              />
              {selectedLocation && (
                <div className="mt-3 p-3 bg-light rounded">
                  <h6>📍 {selectedLocation.location}</h6>
                  <p><strong>{selectedLocation.count}</strong> reports at this location</p>
                  <p><strong>Departments:</strong> {Array.from(selectedLocation.departments).join(', ')}</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default AdminHeatmapView;