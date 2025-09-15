import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Card, Form, Button, Alert, Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

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
    console.log("Submitting registration:", form);
    
    const res = await fetch("http://localhost:5000/register", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    console.log("Registration response:", data);

    if (res.ok) {
      setMessage("Registration successful! Redirecting to login...");
      // Wait a moment before redirecting so user can see the success message
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } else {
      setMessage(data.error || "Registration failed");
    }
  } catch (err) {
    console.error("Registration error:", err);
    setMessage("⚠️ Server error, please try again later.");
  }
};

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
      <Row className="w-100" style={{ maxWidth: "500px" }}>
        <Col>
          <Card className="shadow-sm">
            <Card.Body>
              <h2 className="text-center mb-4">Register</h2>
              {message && <Alert variant="danger">{message}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Password"
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="123 Main St"
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Pincode</Form.Label>
                  <Form.Control
                    type="number"
                    name="pincode"
                    value={form.pincode}
                    onChange={handleChange}
                    placeholder="560001"
                    required
                  />
                </Form.Group>
                <Button variant="primary" type="submit" className="w-100">
                  Register
                </Button>
              </Form>
              <div className="text-center mt-3">
                <p>
                  Already have an account?{" "}
                  <Button variant="link" onClick={() => navigate("/login")}>
                    Login
                  </Button>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}