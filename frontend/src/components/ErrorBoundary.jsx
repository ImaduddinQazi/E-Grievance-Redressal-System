import React from "react";
import { Container, Alert, Button } from "react-bootstrap";

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

export default ErrorBoundary;