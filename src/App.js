import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from "react-router-dom";
import Files from "./components/Files";
import Login from "./components/Login";
import axios from "axios";
import './App.css';

function App() {

  const backendHost = "http://localhost:3001";
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get(`${backendHost}/check-auth`, { withCredentials: true });
      setIsAuthenticated(response.data.authenticated);
    } catch (error) {
      console.error("Error checking authentication status", error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <Navigate replace to="/files" /> : <Navigate replace to="/login" />}
        />
        <Route
          path="/files/*"
          element={<ProtectedRoute isAuthenticated={isAuthenticated} />}
        />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate replace to="/files" /> : <Login onLogin={checkAuthStatus} />}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

function ProtectedRoute({ isAuthenticated }) {
  const location = useLocation();

  return isAuthenticated ? (
    <Files />
  ) : (
    <Navigate replace to={`/login?redirect=${encodeURIComponent(location.pathname)}`} />
  );
}

const NotFound = () => (
  <div>
    <h2>Page not found</h2>
    <p>The page you are looking for does not exist.</p>
  </div>
);

export default App;