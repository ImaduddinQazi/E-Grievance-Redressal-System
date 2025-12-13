import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Form, Button, Alert, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Auth.css";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    pincode: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Registration successful! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        setMessage(data.error || "Registration failed");
      }
    } catch (err) {
      setMessage("Server error, please try again later.");
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
                  <h1>Join E-Redressal</h1>
                  <p>Create your account and start reporting issues in your community efficiently</p>
                  <ul className="auth-hero-features">
                    <li>Easy complaint submission</li>
                    <li>Track resolution progress</li>
                    <li>Multiple department access</li>
                    <li>Priority support</li>
                  </ul>
                </div>
              </div>

              {/* Form Section */}
              <div className="auth-form-section">
                <Card className="auth-card border-0 shadow">
                  <Card.Body className="p-4">
                    <h2 className="text-center mb-1">Create Account</h2>
                    <p className="text-center text-muted mb-4">Sign up for a new account</p>
                    
                    {message && (
                      <Alert variant={message.includes("successful") ? "success" : "danger"} className="mb-3">
                        {message}
                      </Alert>
                    )}
                    
                    <Form onSubmit={handleSubmit}>
                      <Form.Group className="mb-3">
                        <Form.Label className="auth-form-label">Full Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          className="auth-form-control"
                          value={form.name}
                          onChange={handleChange}
                          placeholder="John Doe"
                          required
                        />
                      </Form.Group>
                      
                      <Form.Group className="mb-3">
                        <Form.Label className="auth-form-label">Email Address</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          className="auth-form-control"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="email@example.com"
                          required
                        />
                      </Form.Group>
                      
                      <Form.Group className="mb-3">
                        <Form.Label className="auth-form-label">Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="password"
                          className="auth-form-control"
                          value={form.password}
                          onChange={handleChange}
                          placeholder="Create a password"
                          required
                        />
                      </Form.Group>
                      
                      <Form.Group className="mb-3">
                        <Form.Label className="auth-form-label">Address</Form.Label>
                        <Form.Control
                          type="text"
                          name="address"
                          className="auth-form-control"
                          value={form.address}
                          onChange={handleChange}
                          placeholder="123 Main Street"
                          required
                        />
                      </Form.Group>
                      
                      <Form.Group className="mb-4">
                        <Form.Label className="auth-form-label">Pincode</Form.Label>
                        <Form.Control
                          type="number"
                          name="pincode"
                          className="auth-form-control"
                          value={form.pincode}
                          onChange={handleChange}
                          placeholder="560001"
                          required
                        />
                      </Form.Group>
                      
                      <Button 
                        type="submit" 
                        className="auth-btn-primary w-100 py-2"
                      >
                        Create Account
                      </Button>
                    </Form>
                    
                    <div className="auth-footer mt-4 pt-3">
                      <p className="text-center text-muted mb-2">Already have an account?</p>
                      <div className="text-center">
                        <Button 
                          variant="link" 
                          className="auth-btn-link p-0"
                          onClick={() => navigate("/login")}
                        >
                          Sign In
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