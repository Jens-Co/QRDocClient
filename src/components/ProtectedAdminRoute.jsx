import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedAdminRoute({ isAuthenticated, userRole, children }) {
  if (!isAuthenticated || userRole !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedAdminRoute;
