import React from "react";
import { Row, Col, Navbar, Nav, Button } from "react-bootstrap";

const AdminHeader = ({ currentUser, onLogout, onNavigate }) => {
  return (
    <div className="header-section">
      <Row className="align-items-center">
        <Col>
          <h1>Admin Dashboard</h1>
          <p className="subtitle">System Administration Panel</p>
        </Col>
        <Col xs="auto">
          <div className="user-info">
            <div><strong>{currentUser?.name}</strong></div>
            <small>Administrator</small>
          </div>
        </Col>
      </Row>
      
      <Navbar className="navbar mt-3">
        <Nav>
          <Nav.Link 
            onClick={() => onNavigate("reports")} 
            className={window.location.pathname.includes('reports') ? "active-nav" : ""}
          >
            Reports Management
          </Nav.Link>
          <Nav.Link 
            onClick={() => onNavigate("heatmap")} 
            className={window.location.pathname.includes('heatmap') ? "active-nav" : ""}
          >
            Geographical View
          </Nav.Link>
          <Nav.Link 
            onClick={() => onNavigate("analytics")} 
            className={window.location.pathname.includes('analytics') ? "active-nav" : ""}
          >
            Analytics
          </Nav.Link>
        </Nav>
        <Button variant="outline-primary" size="sm" onClick={onLogout}>
          Logout
        </Button>
      </Navbar>
    </div>
  );
};

export default AdminHeader;