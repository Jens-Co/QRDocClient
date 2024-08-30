import React, { useState } from "react";
import { Button, Form, Container, Alert, Spinner } from "react-bootstrap";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const backendHost = process.env.REACT_APP_BACKEND_HOST;
  const navigate = useNavigate();
  const location = useLocation();

  const login = async (username, password) => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.post(
        `${backendHost}/login`,
        { username, password },
        { withCredentials: true }
      );

      if (response.data.success) {
        await onLogin();
        const redirectPath =
          new URLSearchParams(location.search).get("redirect") || "/files";
        navigate(redirectPath, { replace: true });
      } else {
        setError(response.data.error || "Invalid username or password");
      }
    } catch (error) {
      if (error.response) {
        setError(
          error.response.data.error || "An error occurred. Please try again."
        );
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    login(username, password);
  };

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100 mt-5">
      <div className="login-container">
        <div className="text-center mb-4">
          <img src="/images/sitelogo.png" alt="Logo" className="login-logo" />
        </div>
        <div className="login-form border rounded p-4 shadow">
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="username">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
              />
            </Form.Group>
            <Form.Group controlId="password" className="mt-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
            </Form.Group>
            <Button
              variant="secondary"
              type="submit"
              className="mt-3 w-100"
              disabled={loading}
            >
              {loading ? (
                <span>
                  <Spinner animation="border" size="sm" /> Logging in...
                </span>
              ) : (
                "Login"
              )}
            </Button>
          </Form>
        </div>
      </div>
    </Container>
  );
}
