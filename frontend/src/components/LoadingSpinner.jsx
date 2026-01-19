import React from "react";
import { Container, Spinner } from "react-bootstrap";

const LoadingSpinner = ({ message = "Loading admin dashboard..." }) => {
  return (
    <Container fluid className="admin-dashboard">
      <div className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">{message}</p>
      </div>
    </Container>
  );
};

export default LoadingSpinner;