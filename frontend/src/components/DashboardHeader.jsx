import React from "react";
import { Row, Col } from "react-bootstrap";

const DashboardHeader = ({ currentUser }) => {
  return (
    <div className="header-section">
      <Row className="align-items-center">
        <Col>
          <h1>E-Redressal System</h1>
          <p className="subtitle">Citizen Grievance Portal</p>
        </Col>
        <Col xs="auto">
          <div className="user-info">
            <div><strong>{currentUser.name}</strong></div>
            <small>{currentUser.type === 'admin' ? 'Administrator' : 'Citizen'}</small>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardHeader;