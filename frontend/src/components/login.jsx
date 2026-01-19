import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Form, Button, Alert, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Auth.css";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        
        if (data.user.type === 'admin') {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      } else {
        setMessage(`${data.error || "Login failed"}`);
      }
    } catch (err) {
      setMessage("Server error. Please check if backend is running.");
    }
  };

  return (
    <div className="auth-container">
      <Container fluid>
        <Row className="justify-content-center align-items-center min-vh-100">
          <Col xl={10}>
            <div className="auth-wrapper">
              {/* Hero Section */}
              <div className="auth-hero">
                <div className="auth-hero-content">
                  <h1>E-Redressal System</h1>
                  <p>Citizen Grievance Portal - Efficient complaint management and resolution platform</p>
                  <ul className="auth-hero-features">
                    <li>Quick complaint submission</li>
                    <li>Real-time status tracking</li>
                    <li>Multi-department support</li>
                    <li>Secure and reliable</li>
                  </ul>
                </div>
              </div>

              {/* Form Section */}
              <div className="auth-form-section">
                <Card className="auth-card border-0 shadow">
                  <Card.Body className="p-4">
                    <h2 className="text-center mb-1">Welcome Back</h2>
                    <p className="text-center text-muted mb-4">Sign in to your account</p>
                    
                    {message && (
                      <Alert variant="danger" className="mb-3">
                        {message}
                      </Alert>
                    )}
                    
                    <Form onSubmit={handleSubmit}>
                      <Form.Group className="mb-3">
                        <Form.Label className="auth-form-label">Email Address</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          className="auth-form-control"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="Enter your email"
                          required
                        />
                      </Form.Group>
                      
                      <Form.Group className="mb-4">
                        <Form.Label className="auth-form-label">Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="password"
                          className="auth-form-control"
                          value={form.password}
                          onChange={handleChange}
                          placeholder="Enter your password"
                          required
                        />
                      </Form.Group>
                      
                      <Button 
                        type="submit" 
                        className="auth-btn-primary w-100 py-2"
                      >
                        Sign In
                      </Button>
                    </Form>
                    
                    <div className="auth-footer mt-4 pt-3">
                      <p className="text-center text-muted mb-2">Don't have an account?</p>
                      <div className="text-center">
                        <Button 
                          variant="link" 
                          className="auth-btn-link p-0"
                          onClick={() => navigate("/register")}
                        >
                          Create Account
                        </Button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}