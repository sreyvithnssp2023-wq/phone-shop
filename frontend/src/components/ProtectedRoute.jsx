import React from 'react';
import { Navigate } from 'react-router-dom';
import { getAuthSession } from '../utils/auth';

export default function ProtectedRoute({ currentUser, currentRole, allowedRoles, children }) {
  const session = getAuthSession();
  const activeUser = currentUser || session.user;
  const activeRole = currentRole || session.role || activeUser?.role || activeUser?.roles;

  // 1. If not authenticated via props or cookies/session, redirect to Login
  if (!activeUser || !session.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. If allowedRoles specified, check if activeRole matches
  if (allowedRoles && allowedRoles.length > 0) {
    const roleStr = String(activeRole || '').toLowerCase();
    const isAllowed = allowedRoles.some((r) =>
      roleStr.includes(String(r).toLowerCase())
    );

    if (!isAllowed) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}
