import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ currentRole, allowedRoles, children }) {
  if (!currentRole) {
    return <Navigate to="/login" replace />;
  }

  // Check if role matches case-insensitively
  const isAllowed = allowedRoles
    ? allowedRoles.some(role => role.toLowerCase() === currentRole.toLowerCase())
    : true;

  if (!isAllowed) {
    return <Navigate to="/pos" replace />;
  }

  return children;
}