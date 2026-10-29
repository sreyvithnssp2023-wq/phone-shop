import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ currentRole, allowedRoles, children }) {
  const normalize = (str) => (str || '').toString().trim().toLowerCase();
  const userRole = normalize(currentRole);

  const isAllowed = allowedRoles.some((role) => {
    const norm = normalize(role);
    return norm === userRole || norm.includes(userRole) || userRole.includes(norm);
  });

  if (!isAllowed) {
    return <Navigate to="/pos" replace />;
  }

  return children;
}