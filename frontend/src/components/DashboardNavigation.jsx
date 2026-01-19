import React from "react";
import { Navbar, Nav, Button } from "react-bootstrap";

const DashboardNavigation = ({ currentView, onViewChange, navigate }) => {
  return (
    <Navbar className="navbar">
      <Nav className="w-100 justify-content-between">
        <div className="d-flex">
          <Nav.Link 
            onClick={() => onViewChange("home")} 
            className={currentView === "home" ? "active-nav" : ""}
          >
            Dashboard
          </Nav.Link>
          <Nav.Link 
            onClick={() => onViewChange("submit")} 
            className={currentView === "submit" ? "active-nav" : ""}
          >
            Submit Report
          </Nav.Link>
          <Nav.Link 
            onClick={() => onViewChange("myReports")} 
            className={currentView === "myReports" ? "active-nav" : ""}
          >
            My Reports
          </Nav.Link>
          <Nav.Link 
            onClick={() => onViewChange("heatmap")} 
            className={currentView === "heatmap" ? "active-nav" : ""}
          >
            Analytics
          </Nav.Link>
        </div>
        <Button 
          variant="outline-primary" 
          size="sm" 
          onClick={() => {
            localStorage.removeItem("user");
            navigate("/login");
          }}
        >
          Logout
        </Button>
      </Nav>
    </Navbar>
  );
};

export default DashboardNavigation;